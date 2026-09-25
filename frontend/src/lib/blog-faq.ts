// =============================================================
// FILE: src/lib/blog-faq.ts
// Yazının GÖRÜNÜR "Sıkça Sorulan Sorular" bölümünden FAQPage öğeleri çıkarır.
// Google yapılandırılmış veri kuralı: işaretlenen soru-cevap sayfada görünmeli.
// Bu yüzden sabit/jenerik SSS şeması basılmaz; bölüm yoksa şema da yoktur.
// Beklenen yapı: <h2>…SSS başlığı…</h2> ardından <h3>soru</h3><p>cevap</p> çiftleri,
// bir sonraki <h2>'ye kadar.
// =============================================================

const FAQ_HEADING = /s[ıi]k[çc]a sorulan|s[ıi]k sorulan|\bsss\b|\bfaq\b|frequently asked|häufig gestellte|questions fréquentes|preguntas frecuentes|domande frequenti|veelgestelde|perguntas frequentes|часто задаваемые|الأسئلة الشائعة/i;

function textOf(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&hellip;/g, '…')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractVisibleFaq(html: string | null | undefined, max = 10): Array<{ question: string; answer: string }> {
  if (!html) return [];
  const h2 = /<h2\b[^>]*>([\s\S]*?)<\/h2>/gi;
  let match: RegExpExecArray | null;
  let start = -1;
  while ((match = h2.exec(html))) {
    if (FAQ_HEADING.test(textOf(match[1]))) {
      start = match.index + match[0].length;
      break;
    }
  }
  if (start < 0) return [];
  const rest = html.slice(start);
  const nextH2 = rest.search(/<h2\b/i);
  const section = nextH2 >= 0 ? rest.slice(0, nextH2) : rest;

  const items: Array<{ question: string; answer: string }> = [];
  const pair = /<h3\b[^>]*>([\s\S]*?)<\/h3>\s*((?:<p\b[^>]*>[\s\S]*?<\/p>\s*)+)/gi;
  while ((match = pair.exec(section)) && items.length < max) {
    const question = textOf(match[1]);
    // Yalnız ilk paragraf cevaptır; sonrasındaki CTA paragrafı şemaya girmez.
    const firstP = /<p\b[^>]*>([\s\S]*?)<\/p>/i.exec(match[2]);
    const answer = firstP ? textOf(firstP[1]) : '';
    if (question && answer) items.push({ question, answer });
  }
  return items;
}
