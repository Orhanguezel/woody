// =============================================================
// FILE: src/components/woody/AnswerIntro.tsx
// Sayfanın ana sorusuna 40-80 kelimelik doğrudan cevap (AI alıntılanabilirliği).
// Metin veriden gelir (DB page_* / config yedeği); değer yoksa hiçbir şey basılmaz.
// Sabit header nedeniyle sayfanın İLK bölümü olamaz — banner/hero'nun altına konur.
// =============================================================
type AnswerIntroProps = {
  text?: string | null;
  links?: Array<{ href: string; label: string }>;
  className?: string;
};

export default function AnswerIntro({ text, links, className }: AnswerIntroProps) {
  const body = String(text ?? '').trim();
  if (!body) return null;
  return (
    <section className={className ?? 'mx-auto max-w-[820px] px-6 pt-6'}>
      <p data-answer-intro className="text-base leading-8 text-[#46525c] md:text-[17px]">
        {body}
      </p>
      {links?.length ? (
        <p className="mt-2 text-sm font-semibold text-[#5f6871]">
          {links.map((link, index) => (
            <span key={link.href}>
              {index ? ' · ' : null}
              <a href={link.href} className="underline decoration-[#f58220]/40 hover:decoration-[#f58220]">
                {link.label}
              </a>
            </span>
          ))}
        </p>
      ) : null}
    </section>
  );
}
