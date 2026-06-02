import type { FastifyRequest, FastifyReply } from 'fastify';
import { findRandomQuestions, findQuestionsByIds } from '@/modules/questions/repository';
import {
  createSession, findSessionById, findUserSessions,
  completeSession, insertSessionAnswers, findSessionAnswers,
} from './repository';
import { startSessionBody, submitSessionBody } from './validation';
import {
  calculateXp, calculateScore, getUserStats,
  updateUserStats, updateTopicProgress, checkAndGrantAchievements,
} from './xp';

export async function startSession(req: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (req.user as { sub?: string }).sub ?? "";
    const parsed = startSessionBody.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ success: false, errors: parsed.error.flatten() });

    const { session_type, topic_id, subject_id, question_count } = parsed.data;

    const questions = await findRandomQuestions({
      topicId: topic_id,
      subjectId: subject_id,
      count: question_count,
    });

    if (!questions.length) {
      return reply.code(404).send({ success: false, message: 'no_questions_found' });
    }

    const sessionId = await createSession({
      userId,
      sessionType: session_type,
      topicId: topic_id,
      subjectId: subject_id,
      totalQuestions: questions.length,
    });

    const safeQuestions = questions.map(
      ({ correct_answer, ...rest }) => rest,
    );

    return reply.code(201).send({
      success: true,
      data: { session_id: sessionId, questions: safeQuestions },
    });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}

export async function submitSession(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  try {
    const userId = (req.user as { sub?: string }).sub ?? "";
    const sessionId = Number(req.params.id);

    const session = await findSessionById(sessionId);
    if (!session) return reply.code(404).send({ success: false, message: 'session_not_found' });
    if (session.userId !== userId) return reply.code(403).send({ success: false, message: 'forbidden' });
    if (session.status !== 'pending') return reply.code(400).send({ success: false, message: 'session_already_completed' });

    const parsed = submitSessionBody.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ success: false, errors: parsed.error.flatten() });

    const questionIds = Object.keys(parsed.data.answers).map(Number);
    const dbQuestions = await findQuestionsByIds(questionIds);
    const questionMap = new Map(
      dbQuestions.map(q => [Number(q.id), q]),
    );

    let correctCount = 0;
    const answerRows: Array<{
      sessionId: number; questionId: number;
      userAnswer: number | null; isCorrect: boolean;
    }> = [];

    for (const [qIdStr, userAnswer] of Object.entries(parsed.data.answers)) {
      const qId = Number(qIdStr);
      const q = questionMap.get(qId);
      const isCorrect = q ? userAnswer === Number(q.correct_answer) : false;
      if (isCorrect) correctCount++;

      answerRows.push({
        sessionId,
        questionId: qId,
        userAnswer: userAnswer,
        isCorrect,
      });
    }

    const totalQ = session.totalQuestions;
    const score = calculateScore(correctCount, totalQ);

    const existingStats = await getUserStats(userId);
    const streakDays = existingStats?.streak_days ?? 0;
    const xpEarned = calculateXp(correctCount, totalQ, streakDays);

    await insertSessionAnswers(answerRows);
    await completeSession(sessionId, { correct: correctCount, score, xpEarned });

    const updatedStats = await updateUserStats(userId, correctCount, totalQ, xpEarned);
    await updateTopicProgress(userId, session.topicId, session.subjectId, correctCount, totalQ, score);

    const newAchievements = await checkAndGrantAchievements(userId, updatedStats, score);

    return reply.send({
      success: true,
      data: {
        session_id: sessionId,
        correct: correctCount,
        total: totalQ,
        score,
        xp_earned: xpEarned,
        stats: updatedStats,
        new_achievements: newAchievements,
      },
    });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}

export async function getSession(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  try {
    const userId = (req.user as { sub?: string }).sub ?? "";
    const sessionId = Number(req.params.id);

    const session = await findSessionById(sessionId);
    if (!session) return reply.code(404).send({ success: false, message: 'not_found' });
    if (session.userId !== userId) return reply.code(403).send({ success: false, message: 'forbidden' });

    const answers = await findSessionAnswers(sessionId);
    return reply.send({ success: true, data: { ...session, answers } });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}

export async function getMySessions(req: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (req.user as { sub?: string }).sub ?? "";
    const sessions = await findUserSessions(userId, 20);
    return reply.send({ success: true, data: sessions });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}
