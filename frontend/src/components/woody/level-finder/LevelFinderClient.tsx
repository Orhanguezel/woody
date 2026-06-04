'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { CheckCircle2, ChevronLeft, ChevronRight, Circle, ShoppingCart } from 'lucide-react';

import { FOCUS_RING } from '@/lib/a11y';

type BlockKey = 'A' | 'B' | 'C';
type LevelKey = 'basic' | 'junior' | 'senior';

const questions: Array<{ id: number; block: BlockKey; text: string; examples: string }> = [
  { id: 1, block: 'A', text: 'Sınıf komutlarını anlar ve uygular mı?', examples: 'Stand up, Sit down, Raise your hand, Come here, Go there' },
  { id: 2, block: 'A', text: 'Nesneleri, hayvanları ve meyve-sebzeleri tanıyıp isimlendirebilir mi?', examples: 'book, dog, apple, carrot vb.' },
  { id: 3, block: 'A', text: 'Renkleri ve sayıları doğru tanıyıp eşleştirebilir mi?', examples: 'red, blue / one, two vb.' },
  { id: 4, block: 'A', text: 'Araçları ve kıyafetleri tanıyıp doğru seçebilir mi?', examples: 'car, bus / t-shirt, shoes vb.' },
  { id: 5, block: 'A', text: '"What is this?" sorusuna doğru cevap verebilir mi?', examples: 'It is a ...' },
  { id: 6, block: 'A', text: 'Vücut bölümlerini tanıyıp gösterebilir mi?', examples: 'head, eyes, nose, arm vb.' },
  { id: 7, block: 'B', text: 'Günlük aksiyonları ifade edebilir mi?', examples: 'I draw, I run, I go to school, I eat' },
  { id: 8, block: 'B', text: 'Oda, oyuncak ve nesneleri tanıyıp cümle kurabilir mi?', examples: 'This is a..., These are...' },
  { id: 9, block: 'B', text: 'Renk, sayı ve sıfatları birlikte kullanabilir mi?', examples: 'red apple, two big balls' },
  { id: 10, block: 'B', text: 'Yiyecekler hakkında tercih belirtir mi?', examples: "I like..., I don't like..." },
  { id: 11, block: 'B', text: 'Vücut bakımı ile ilgili ifadeleri anlayıp uygular mı?', examples: 'Wash your hands, Brush your teeth' },
  { id: 12, block: 'B', text: 'Sokak, binalar ve yön ifadelerini anlayıp kullanabilir mi?', examples: 'school, hospital, park / Go straight, Turn left/right' },
  { id: 13, block: 'C', text: 'Günlük rutinleri cümle ile ifade edebilir mi?', examples: 'I wake up, I brush my teeth, I go to school' },
  { id: 14, block: 'C', text: 'Gün, zaman ve etkinlikleri birlikte ifade edebilir mi?', examples: "It is 9 o'clock, I go to sleep" },
  { id: 15, block: 'C', text: 'Meslekleri ve çalışma yerlerini birlikte söyleyebilir mi?', examples: 'He is a doctor, He works in a hospital' },
  { id: 16, block: 'C', text: 'Hava durumu ve duyguyu birlikte ifade edebilir mi?', examples: 'It is rainy and I feel sad' },
  { id: 17, block: 'C', text: 'Yapabildiği ve yapamadığı eylemleri ifade edebilir mi?', examples: "I can swim, I can't fly" },
  { id: 18, block: 'C', text: 'İstek, tercih ve ihtiyaçlarını cümle ile ifade edebilir mi?', examples: "I want pizza, I don't want milk, I'm hungry" },
];

const blocks: BlockKey[] = ['A', 'B', 'C'];
const blockLabels: Record<BlockKey, { name: string; color: string; icon: string }> = {
  A: { name: 'Temel Seviye', color: '#2196F3', icon: 'Basic' },
  B: { name: 'Junior Seviye', color: '#F5C518', icon: 'Junior' },
  C: { name: 'Senior Seviye', color: '#E91E90', icon: 'Senior' },
};

const levelResults: Record<LevelKey, { name: string; color: string; title: string; desc: string; image: string }> = {
  basic: {
    name: 'Basic Level',
    color: '#2196F3',
    title: 'Bu ürünü almanız gerekir',
    desc: 'Öğrenci temel seviye İngilizce eğitimine başlamalıdır. Woody Basic Set bu seviye için en uygun settir.',
    image: '/media/woody/reference/3jgyyil9_1.png',
  },
  junior: {
    name: 'Junior Level',
    color: '#F5C518',
    title: 'Bu sizin için uygun',
    desc: 'Öğrenci orta-alt seviye İngilizce eğitimine hazırdır. Woody Junior Set bu seviye için idealdir.',
    image: '/media/woody/reference/h5x59v59_3.png',
  },
  senior: {
    name: 'Senior Level',
    color: '#E91E90',
    title: 'Bu sizin için uygun',
    desc: 'Öğrenci ileri seviye İngilizce eğitimine geçebilir. Woody Senior Set ile süreç daha da güçlenir.',
    image: '/media/woody/reference/m4z26p5k_2.png',
  },
};

function nextResult(block: BlockKey, yesCount: number): LevelKey | null {
  if (block === 'A') return yesCount >= 4 ? null : 'basic';
  if (block === 'B') return yesCount >= 4 ? null : 'junior';
  return 'senior';
}

export default function LevelFinderClient() {
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [currentBlock, setCurrentBlock] = useState<BlockKey>('A');
  const [result, setResult] = useState<LevelKey | null>(null);
  const [transition, setTransition] = useState('');

  const currentQuestions = useMemo(() => questions.filter((question) => question.block === currentBlock), [currentBlock]);
  const blockIndex = blocks.indexOf(currentBlock);
  const answered = Object.keys(answers).length;
  const progress = (answered / questions.length) * 100;
  const allBlockAnswered = currentQuestions.every((question) => answers[question.id] !== undefined);

  const handleNext = () => {
    const yesCount = currentQuestions.reduce((sum, question) => sum + (answers[question.id] === true ? 1 : 0), 0);
    const calculated = nextResult(currentBlock, yesCount);
    if (calculated) {
      setResult(calculated);
      return;
    }
    const nextBlock = blocks[blockIndex + 1];
    if (!nextBlock) {
      setResult('senior');
      return;
    }
    setTransition(nextBlock === 'B' ? 'Junior seviyeye geçiyoruz!' : 'Senior seviyeye geçiyoruz!');
    window.setTimeout(() => {
      setTransition('');
      setCurrentBlock(nextBlock);
    }, 1200);
  };

  if (result) {
    const item = levelResults[result];
    const message = `Merhaba, Woody Level Finder testini tamamladım ve ${item.name} önerildi. Ürün hakkında bilgi almak istiyorum.`;
    return (
      <main className="min-h-screen bg-white text-gray-900">
        <div className="pt-[72px]" />
        <section className="w-full py-16 md:py-24">
          <div className="mx-auto max-w-[900px] px-6 md:px-12">
            <div className="flex flex-col items-center gap-10 md:flex-row md:gap-16">
              <div className="w-full md:w-[40%]">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-xl">
                  <Image src={item.image} alt={item.name} fill sizes="(max-width: 768px) 100vw, 40vw" className="object-contain" />
                </div>
              </div>
              <div className="w-full text-center md:w-[60%] md:text-left">
                <span className="mb-5 inline-block rounded-full px-4 py-1.5 text-[13px] font-bold text-white" style={{ backgroundColor: item.color }}>
                  {item.title}
                </span>
                <h1 className="mb-4 font-display text-[36px] font-bold text-gray-900 md:text-[48px]">{item.name}</h1>
                <p className="mb-8 text-[15px] leading-[1.7] text-gray-500">{item.desc}</p>
                <div className="mb-6 rounded-xl border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 p-6 shadow-md">
                  <h2 className="mb-3 flex items-center justify-center gap-2 text-[18px] font-bold text-gray-800 md:justify-start">
                    <ShoppingCart className="size-6 text-yellow-600" aria-hidden />
                    Online Satış
                  </h2>
                  <p className="mb-4 text-[14px] text-gray-600">Bu seti hemen online olarak sipariş edebilirsiniz!</p>
                  <a
                    href={`https://wa.me/905331570373?text=${encodeURIComponent(message)}`}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-3 rounded-xl bg-green-500 px-6 py-3 text-[15px] font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-green-600 ${FOCUS_RING}`}
                  >
                    WhatsApp ile Sipariş Ver
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setAnswers({});
                    setCurrentBlock('A');
                  }}
                  className={`text-[14px] text-gray-500 underline hover:text-gray-700 ${FOCUS_RING}`}
                >
                  Testi tekrarla
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="pt-[72px]" />

      {transition ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 max-w-md rounded-3xl bg-white px-12 py-10 text-center shadow-2xl">
            <h2 className="mb-3 font-display text-[28px] font-bold text-gray-900 md:text-[32px]">{transition}</h2>
            <p className="text-[15px] text-gray-500">Yükleniyor...</p>
          </div>
        </div>
      ) : null}

      <div className="sticky top-[72px] z-40 h-[4px] w-full bg-gray-100">
        <div className="h-full bg-yellow-400 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>

      <section className="w-full py-10 md:py-16">
        <div className="mx-auto max-w-[800px] px-6 md:px-12">
          <div className="mb-10 text-center">
            <h1 className="mb-3 font-display text-[32px] font-bold text-gray-900 md:text-[42px]">Woody Level Finder</h1>
            <p className="text-[15px] text-gray-500">Öğrencinin seviyesini belirlemek için aşağıdaki soruları yanıtlayın.</p>
          </div>

          <div className="mb-10 flex items-center justify-center gap-3">
            {blocks.map((block, index) => (
              <div key={block} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentBlock(block)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                    currentBlock === block ? 'text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  } ${FOCUS_RING}`}
                  style={currentBlock === block ? { backgroundColor: blockLabels[block].color } : undefined}
                >
                  <span className="hidden sm:inline">{blockLabels[block].name}</span>
                  <span className="sm:hidden">Blok {block}</span>
                </button>
                {index < blocks.length - 1 ? <div className="h-[2px] w-6 bg-gray-200" /> : null}
              </div>
            ))}
          </div>

          <div>
            {currentQuestions.map((question) => (
              <div key={question.id} className="border-b border-gray-100 py-7 last:border-b-0">
                <div className="flex items-start gap-4">
                  <span className="mt-0.5 w-6 shrink-0 text-[14px] font-bold text-gray-300">{question.id}.</span>
                  <div className="flex-1">
                    <p className="mb-2 text-[16px] font-medium leading-relaxed text-gray-800 md:text-[17px]">{question.text}</p>
                    <p className="mb-5 text-[13px] italic text-gray-400">({question.examples})</p>
                    <div className="flex items-center gap-6">
                      {[
                        { label: 'Evet', value: true, color: 'green' },
                        { label: 'Hayır', value: false, color: 'red' },
                      ].map((option) => {
                        const active = answers[question.id] === option.value;
                        return (
                          <button
                            key={option.label}
                            type="button"
                            onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: option.value }))}
                            className={`flex items-center gap-2.5 rounded-xl border-2 px-5 py-2.5 text-[14px] font-semibold transition ${
                              active
                                ? option.color === 'green'
                                  ? 'border-green-500 bg-green-50 text-green-700'
                                  : 'border-red-400 bg-red-50 text-red-600'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                            } ${FOCUS_RING}`}
                          >
                            {active ? <CheckCircle2 className="size-[18px]" aria-hidden /> : <Circle className="size-[18px] text-gray-300" aria-hidden />}
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-between border-t border-gray-100 pt-6">
            <button
              type="button"
              onClick={() => setCurrentBlock(blocks[Math.max(0, blockIndex - 1)])}
              disabled={blockIndex === 0}
              className={`flex items-center gap-2 rounded-xl px-5 py-3 text-[14px] font-semibold transition ${
                blockIndex === 0 ? 'cursor-not-allowed bg-gray-100 text-gray-300' : `bg-gray-100 text-gray-700 hover:bg-gray-200 ${FOCUS_RING}`
              }`}
            >
              <ChevronLeft className="size-[18px]" aria-hidden />
              Önceki Blok
            </button>
            <span className="text-[13px] text-gray-400">{answered}/18 yanıtlandı</span>
            <button
              type="button"
              onClick={handleNext}
              disabled={!allBlockAnswered}
              className={`flex items-center gap-2 rounded-xl px-6 py-3 text-[14px] font-semibold transition ${
                allBlockAnswered ? `text-white shadow-md hover:scale-105 ${FOCUS_RING}` : 'cursor-not-allowed bg-gray-100 text-gray-300'
              }`}
              style={allBlockAnswered ? { backgroundColor: blockLabels[currentBlock].color } : undefined}
            >
              {currentBlock === 'C' ? 'Sonucu Gör' : 'Değerlendir'}
              <ChevronRight className="size-[18px]" aria-hidden />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
