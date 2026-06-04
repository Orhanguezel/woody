import Image from 'next/image';

import { CERTIFICATE_IMAGES } from './home-copy';

export default function CertificationSection({ locale }: { locale: string }) {
  return (
    <section className="w-full bg-white pb-0 pt-6">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="flex flex-col items-center justify-center text-center">
          <h2 className="max-w-[800px] text-[24px] font-bold leading-tight text-text-secondary md:text-[32px] lg:text-[36px]">
            {locale === 'tr'
              ? 'Woody ile Cambridge English Sertifika Sistemine Geçiş'
              : 'Transition to the Cambridge English Certificate System with Woody'}
          </h2>
          <p className="mt-2 max-w-[650px] text-[12px] leading-relaxed text-gray-600 md:text-[13px]">
            {locale === 'tr'
              ? 'Çocukları erken yaşta uluslararası standartta İngilizce eğitimle buluşturan, yapılandırılmış ve oyun temelli öğrenme modeli.'
              : 'A structured, play-based learning model that introduces children to international-standard English education early.'}
          </p>
          <div className="mt-6 flex flex-nowrap items-center justify-center gap-5">
            {CERTIFICATE_IMAGES.map((image) => (
              <div key={image.src} className="relative h-[120px] w-[96px] md:h-[180px] md:w-[144px] lg:h-[240px] lg:w-[192px]">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 768px) 96px, (max-width: 1024px) 144px, 192px"
                  className="object-contain opacity-90 transition-opacity hover:opacity-100"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
