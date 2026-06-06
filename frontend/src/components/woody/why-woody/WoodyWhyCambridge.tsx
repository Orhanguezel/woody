import Image from 'next/image';
import {
  Award,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FolderOpen,
  Gamepad2,
  LayoutGrid,
  MessageCircle,
  MonitorPlay,
  PlayCircle,
  Zap,
} from 'lucide-react';

import type { WoodyPageContent } from '../content-loader.server';
import { WHY_WOODY_BG_IMAGES, getWhyItems } from '../home/home-copy';

const icons = [
  Award,
  PlayCircle,
  MessageCircle,
  MonitorPlay,
  Gamepad2,
  CalendarDays,
  Zap,
  ClipboardCheck,
  CheckCircle2,
  BookOpen,
  FolderOpen,
  LayoutGrid,
];

export default function WoodyWhyCambridge({
  content,
  locale,
}: {
  content: WoodyPageContent | null;
  locale: string;
}) {
  const items = getWhyItems(content).slice(0, 12);
  const title = content?.eyebrow || (locale === 'tr' ? 'Neden Woody?' : 'Why Woody?');
  const image = content?.image || WHY_WOODY_BG_IMAGES[0];
  const imageAlt =
    content?.imageAlt || (locale === 'tr' ? 'Woody karakterleri' : 'Woody characters');

  return (
    <section className="w-full bg-white py-10 md:py-16">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <div className="flex flex-col items-center gap-8 md:flex-row md:gap-12">
          <div className="w-full md:w-1/2">
            <Image
              src={image}
              alt={imageAlt}
              width={900}
              height={700}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="h-auto w-full rounded-xl"
            />
          </div>

          <div className="flex w-full flex-col justify-center md:w-1/2">
            <h2 className="mb-6 text-center text-[24px] font-bold leading-tight text-gray-900 md:text-left md:text-[28px]">
              {title}
            </h2>

            <div className="space-y-4">
              {items.map((item, index) => {
                const Icon = icons[index % icons.length] || BadgeCheck;
                return (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-text-secondary text-white">
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[13px] font-bold leading-snug text-gray-900 md:text-[14px]">
                        {item.title}
                      </h3>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-gray-600 md:text-[12px]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
