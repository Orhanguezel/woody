'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { ChevronLeft, Lock, Play, UserPlus, X } from 'lucide-react';

import { localizePath } from '@/integrations/shared';
import { FOCUS_RING } from '@/lib/a11y';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';
import {
  DIGITAL_PROTECTED_SECTIONS,
  DIGITAL_SECTIONS,
  DIGITAL_VALID_PASSWORDS,
  type DigitalContentCopy,
  type DigitalContentItem,
  getGeneratedItems,
  getLevelTitle,
  getSectionTitle,
} from './digital-content-data';

function PasswordModal({
  value,
  error,
  copy,
  onChange,
  onSubmit,
  onClose,
}: {
  value: string;
  error: string;
  copy?: DigitalContentCopy;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 p-4" data-testid="password-modal">
      <div className="relative w-full max-w-[400px] rounded-2xl bg-white p-8">
        <button
          type="button"
          onClick={onClose}
          className={`absolute right-4 top-4 text-gray-400 transition hover:text-gray-600 ${FOCUS_RING}`}
          aria-label={copy?.ui?.close}
        >
          <X className="h-6 w-6" aria-hidden />
        </button>
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
            <Lock className="h-10 w-10 text-white" aria-hidden />
          </div>
        </div>
        <h2 className="mb-2 text-center text-[24px] font-black text-gray-900 md:text-[28px]">
          {copy?.ui?.protectedTitle}
        </h2>
        <p className="mb-6 text-center text-[14px] text-gray-600">
          {copy?.ui?.protectedDescription}
        </p>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={value}
            onChange={(event) => onChange(event.target.value.replace(/\D/g, ''))}
            placeholder="****"
            aria-label={copy?.ui?.passwordLabel}
            className={`mb-4 w-full rounded-xl border-2 border-gray-300 px-4 py-4 text-center text-[32px] font-black tracking-[12px] transition focus:border-blue-500 ${FOCUS_RING}`}
            autoFocus
            data-testid="password-input"
          />
          {error ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3" role="alert">
              <p className="text-center text-[13px] font-bold text-red-600">{error}</p>
            </div>
          ) : null}
          <button
            type="submit"
            disabled={value.length !== 4}
            className={`w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 py-3.5 text-[16px] font-bold text-white transition hover:from-blue-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-400 ${FOCUS_RING}`}
          >
            {copy?.ui?.enter}
          </button>
        </form>
        <p className="mt-4 text-center text-[12px] text-gray-500">
          {copy?.ui?.passwordHelp}
        </p>
      </div>
    </div>
  );
}

function LibrarySoon({
  copy,
  locale,
  level,
  section,
}: {
  copy?: DigitalContentCopy;
  locale: string;
  level: string;
  section: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const access = useSubscriptionAccess(section);
  const currentPath = localizePath(locale as any, `/digital-content/${level}/${section}`);
  const encodedNext = encodeURIComponent(currentPath);
  const placeholders = Array.from({ length: 8 }, (_, index) => index + 1);

  return (
    <section className="w-full py-12 md:py-16">
      <div className="container max-w-[1200px]">
        <div className="mb-10 rounded-lg border border-gray-200 bg-gray-50 px-6 py-10 text-center">
          <span className="inline-flex rounded-full bg-gray-200 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-700">
            {copy?.library?.badge}
          </span>
          <h2 className="mt-4 font-display text-[30px] font-black text-gray-700 md:text-[42px]">
            {copy?.library?.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 text-gray-500">
            {copy?.library?.description}
          </p>
          <Link
            href={localizePath(locale as any, '/me/library')}
            className={`mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--gm-primary)] px-5 text-[13px] font-bold text-white ${FOCUS_RING}`}
          >
            {copy?.library?.goToLibrary}
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {placeholders.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                if (!access.hasAccess) setModalOpen(true);
              }}
              className={`group relative aspect-[3/2] overflow-hidden rounded-lg border border-gray-200 bg-gray-100 p-4 text-left opacity-80 grayscale transition hover:-translate-y-0.5 hover:opacity-100 hover:shadow-lg ${FOCUS_RING}`}
            >
              <div className="absolute inset-0 bg-[linear-gradient(135deg,#f5f5f5,#d9d9d9)]" />
              <div className="relative flex h-full flex-col justify-between">
                <span className="w-fit rounded-full bg-white/80 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-gray-600">
                  {copy?.library?.badge}
                </span>
                <span className="text-[13px] font-bold text-gray-700">
                  {getSectionTitle(section, copy)} {id}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4">
          <div className="relative w-full max-w-[440px] rounded-lg bg-white p-7 shadow-2xl">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className={`absolute right-4 top-4 text-gray-400 transition hover:text-gray-700 ${FOCUS_RING}`}
              aria-label={copy?.ui?.close}
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-700">
              <UserPlus className="h-7 w-7" aria-hidden />
            </div>
            <h3 className="text-[24px] font-black text-gray-900">{copy?.library?.modalTitle}</h3>
            <p className="mt-3 text-[14px] leading-6 text-gray-600">{copy?.library?.modalDescription}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link
                href={`${localizePath(locale as any, '/register')}?next=${encodedNext}`}
                className={`inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--gm-primary)] px-4 text-[13px] font-bold text-white ${FOCUS_RING}`}
              >
                {copy?.library?.registerCta}
              </Link>
              <Link
                href={`${localizePath(locale as any, '/login')}?next=${encodedNext}`}
                className={`inline-flex min-h-11 items-center justify-center rounded-md border border-gray-200 px-4 text-[13px] font-bold text-gray-800 ${FOCUS_RING}`}
              >
                {copy?.library?.loginCta}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ContentGrid({
  items,
  sectionId,
  currentColor,
  currentTrack,
  isPlaying,
  onItemClick,
}: {
  items: DigitalContentItem[];
  sectionId: string;
  currentColor: string;
  currentTrack: DigitalContentItem | null;
  isPlaying: boolean;
  onItemClick: (item: DigitalContentItem) => void;
}) {
  return (
    <section className="w-full py-12 md:py-16" data-testid="content-grid">
      <div className="container max-w-[1400px]">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {items.map((item) => {
            const isCurrent = currentTrack?.id === item.id && isPlaying;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onItemClick(item)}
                className={`group relative aspect-[3/2] cursor-pointer overflow-hidden rounded-2xl transition hover:scale-105 ${FOCUS_RING}`}
                style={{
                  background: `linear-gradient(135deg, ${currentColor}20 0%, ${currentColor}10 100%)`,
                  border: `2px solid ${currentColor}60`,
                  boxShadow: `0 4px 16px 0 ${currentColor}20`,
                }}
                data-testid={`content-item-${item.id}`}
              >
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className={sectionId === 'musicland' ? 'object-fill' : 'object-cover opacity-60'}
                  unoptimized={item.thumbnail.startsWith('https://via.placeholder.com')}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/30">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: `${currentColor}90` }}>
                    {isCurrent ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="white" aria-hidden>
                        <rect x="6" y="6" width="12" height="12" />
                      </svg>
                    ) : (
                      <Play className="h-7 w-7 text-white" fill="white" aria-hidden />
                    )}
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <p className="text-center text-[13px] font-bold text-white md:text-[14px]">{item.title}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function VideoModal({
  video,
  copy,
  onClose,
}: {
  video: DigitalContentItem | null;
  copy?: DigitalContentCopy;
  onClose: () => void;
}) {
  if (!video) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4" onClick={onClose} data-testid="video-modal">
      <div className="relative w-full max-w-[900px] overflow-hidden rounded-2xl bg-black" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className={`absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30 ${FOCUS_RING}`}
          aria-label={copy?.ui?.close}
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
        <div className="flex aspect-video items-center justify-center bg-gray-900">
          {video.videoUrl ? (
            <video src={video.videoUrl} controls autoPlay className="h-full w-full" />
          ) : (
            <p className="text-[16px] text-white">
              {video.title} {copy?.ui?.videoMissing}
            </p>
          )}
        </div>
        <div className="bg-gray-900 p-4 text-white">
          <h3 className="text-[18px] font-bold">{video.title}</h3>
        </div>
      </div>
    </div>
  );
}

export default function DigitalContentDetailClient({
  locale,
  level,
  section,
  copy,
}: {
  locale: string;
  level: string;
  section: string;
  copy?: DigitalContentCopy;
}) {
  const sectionMeta = DIGITAL_SECTIONS.find((item) => item.id === section);
  const currentColor = sectionMeta?.color ?? 'var(--gm-text)';
  const [verified, setVerified] = useState(!DIGITAL_PROTECTED_SECTIONS.includes(section));
  const [showPassword, setShowPassword] = useState(DIGITAL_PROTECTED_SECTIONS.includes(section));
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<DigitalContentItem | null>(null);
  const [currentTrack, setCurrentTrack] = useState<DigitalContentItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const items = section === 'library' ? [] : getGeneratedItems(level, section, copy);

  useEffect(() => {
    if (!DIGITAL_PROTECTED_SECTIONS.includes(section)) {
      setVerified(true);
      setShowPassword(false);
      return;
    }
    const saved = window.sessionStorage.getItem('woody_digital_password');
    const ok = Boolean(saved && DIGITAL_VALID_PASSWORDS.includes(saved));
    setVerified(ok);
    setShowPassword(!ok);
  }, [section]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  function stopMusic() {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setCurrentTrack(null);
  }

  function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (DIGITAL_VALID_PASSWORDS.includes(password)) {
      window.sessionStorage.setItem('woody_digital_password', password);
      setVerified(true);
      setShowPassword(false);
      setPassword('');
      setPasswordError('');
      return;
    }
    setPassword('');
    setPasswordError(copy?.ui?.passwordError || '');
  }

  function handleItemClick(item: DigitalContentItem) {
    if (section === 'musicland') {
      if (currentTrack?.id === item.id && isPlaying) {
        stopMusic();
        return;
      }
      if (!item.audioUrl) return;
      audioRef.current?.pause();
      const audio = new Audio(item.audioUrl);
      audioRef.current = audio;
      setCurrentTrack(item);
      setIsPlaying(true);
      void audio.play();
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTrack(null);
      };
      return;
    }
    setSelectedVideo(item);
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {showPassword ? (
        <PasswordModal
          value={password}
          error={passwordError}
          copy={copy}
          onChange={(value) => {
            setPassword(value);
            setPasswordError('');
          }}
          onSubmit={handlePasswordSubmit}
          onClose={() => {
            setShowPassword(false);
            window.location.href = localizePath(locale as any, '/digital-content');
          }}
        />
      ) : null}

      {verified ? (
        <>
          <section className="w-full border-b border-gray-200 bg-gray-50 py-8">
            <div className="container flex max-w-[1200px] items-center gap-4">
              <Link
                href={localizePath(locale as any, '/digital-content')}
                className={`inline-flex items-center gap-2 text-gray-600 transition hover:text-gray-900 ${FOCUS_RING}`}
                data-testid="back-to-digital-content"
              >
                <ChevronLeft className="h-6 w-6" aria-hidden />
                <span className="text-[15px] font-bold">{copy?.ui?.back}</span>
              </Link>
              <div className="flex-1">
                <h1 className="font-display text-[28px] font-black md:text-[36px]" style={{ color: currentColor }}>
                  {getLevelTitle(level, copy)} - {getSectionTitle(section, copy)}
                </h1>
              </div>
            </div>
          </section>

          {section === 'musicland' ? (
            <section className="w-full bg-white pt-8" data-testid="musicland-seo-intro">
              <div className="container max-w-[1200px]">
                {copy?.musicland?.intro ? (
                  <p className="text-[15px] leading-relaxed text-gray-700 md:text-[16px]">{copy.musicland.intro}</p>
                ) : null}
                {items.some((item) => item.topic) ? (
                  <ul className="mt-3 flex flex-wrap gap-2" aria-label="Themes">
                    {items.filter((item) => item.topic).map((item) => (
                      <li key={item.id} className="rounded-full bg-gray-100 px-3 py-1 text-[12px] font-bold text-gray-600">
                        {item.topic}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ) : null}

          {section === 'library' ? (
            <LibrarySoon copy={copy} locale={locale} level={level} section={section} />
          ) : (
            <ContentGrid
              items={items}
              sectionId={section}
              currentColor={currentColor}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onItemClick={handleItemClick}
            />
          )}

          <VideoModal video={selectedVideo} copy={copy} onClose={() => setSelectedVideo(null)} />

          {section === 'musicland' && currentTrack ? (
            <div className="fixed inset-x-0 bottom-0 z-[9998] bg-gradient-to-r from-purple-900 to-purple-700 text-white shadow-2xl">
              <div className="container flex max-w-[1400px] items-center gap-4 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-[11px] text-purple-200">{copy?.ui?.nowPlaying}</p>
                  <p className="truncate text-[15px] font-bold">{currentTrack.title}</p>
                </div>
                <button
                  type="button"
                  onClick={stopMusic}
                  className={`flex h-12 w-12 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30 ${FOCUS_RING}`}
                  aria-label={copy?.ui?.stop}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden>
                    <rect x="6" y="6" width="12" height="12" />
                  </svg>
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </main>
  );
}
