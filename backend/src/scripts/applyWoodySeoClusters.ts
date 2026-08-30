// =============================================================
// Tanitio 5 SEO niyet kümesinin içerik/DB ayağı (2026-08-30):
// TR blog yazılarına küme iç bağlantıları + niyet-cevaplayan giriş
// cümleleri + kümeye uygun CTA; page_preschool (tr) title/H1/giriş/CTA
// "anaokulu İngilizce sistemi" niyetine çevrilir (set niyeti store'da kalır).
//
// Varsayılan DRY-RUN: yalnız planlanan değişiklikleri yazdırır.
// Uygula: bun src/scripts/applyWoodySeoClusters.ts --apply
// Her replace hedefi içerikte TAM 1 kez geçmek zorundadır; aksi halde o
// yazı atlanır (idempotent: ikinci koşuda eklenenler bulunup 0 eşleşme verir).
// =============================================================
import 'dotenv/config';

import mysql from 'mysql2/promise';

const APPLY = process.argv.includes('--apply');

function databaseConfig() {
  for (const key of ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']) {
    if (!String(process.env[key] || '').trim()) throw new Error(`Missing database environment: ${key}`);
  }
  return {
    host: process.env.DB_HOST as string,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_NAME as string,
    charset: 'utf8mb4',
  };
}

type PostOp = { slug: string; replaces: Array<[string, string]>; appendHtml?: string };

const LINKPARA =
  'Bu konuyu okul düzeyinde planlamak için <a href="/tr/preschool">Woody Okul Serisi</a> sayfasını, sınıf dışı tekrar ve dijital destek için <a href="/tr/digital-content">Woody Dijital içeriklerini</a> inceleyebilirsiniz.';

const POSTS: PostOp[] = [
  {
    // Küme 1: anaokulu İngilizce — girişte dört bileşen bütünlüğü, kurum CTA.
    slug: 'anaokulu-ingilizce-egitim-sistemi-nedir',
    replaces: [
      [
        'Bir sistem, tek tek materyallerin toplamından daha fazlasıdır.',
        'Bir sistem, tek tek materyallerin toplamından daha fazlasıdır: kitap, öğretmen planı, oyun ve StoryLand/MusicLand dijital tekrarı aynı kazanım çevresinde birleşir.',
      ],
      [
        LINKPARA,
        `${LINKPARA} Haftalık uygulama ayrıntısı için <a href="/tr/blog/anaokulu-ingilizce-ders-plani-nasil-hazirlanir">anaokulu İngilizce ders planı rehberine</a>, doğru seti seçmek için <a href="/tr/blog/anaokulu-ingilizce-egitim-seti-nasil-secilir">eğitim seti seçim rehberine</a> bakabilirsiniz.`,
      ],
    ],
    appendHtml:
      '<p>Kurumunuzda anaokulu İngilizce eğitim sistemini birlikte planlamak için <a href="/tr/contact">kurum görüşmesi talep edin</a>.</p>',
  },
  {
    // Küme 2: 4-5-6 yaş — store/preschool bağlantıları yaşa göre CTA ile.
    slug: '4-5-6-yas-ingilizce-egitimi',
    replaces: [
      [
        LINKPARA,
        `${LINKPARA} Yaşa uygun materyal ve set seçenekleri için <a href="/tr/store">Woody mağazasını</a> ziyaret edebilirsiniz.`,
      ],
    ],
    appendHtml:
      '<p>4, 5 ve 6 yaş için doğru başlangıç noktasını görmek isterseniz <a href="/tr/store">yaşa göre Woody setlerini inceleyin</a>; kurum uygulaması için <a href="/tr/preschool">Woody Okul Serisi</a> sayfasına göz atın.</p>',
  },
  {
    // Küme 3: ders planı — giriş haftalık kazanım + materyal sırasını cevaplar;
    // müfredat ve sistem yazılarına iç bağlantı; öğretmen planı CTA'sı.
    slug: 'anaokulu-ingilizce-ders-plani-nasil-hazirlanir',
    replaces: [
      [
        '2026 güncel okul öncesi İngilizce yaklaşımında anaokulu İngilizce ders planı, çocukların dili yalnızca duyması değil, sınıf içinde anlamlı biçimde kullanması için planlanmalıdır.',
        '2026 güncel yaklaşımda anaokulu İngilizce ders planı, haftalık tek kazanım çevresinde kurulur: kelime önce kartla tanıtılır, oyunla kullandırılır, şarkı ve hikâyeyle tekrar edilir, kısa gözlemle pekiştirilir.',
      ],
      [
        LINKPARA,
        `${LINKPARA} Yıllık yapıyı kurmak için <a href="/tr/blog/anaokulu-ingilizce-mufredati-nasil-hazirlanir">anaokulu İngilizce müfredatı rehberine</a>, sistemin bütününü görmek için <a href="/tr/blog/anaokulu-ingilizce-egitim-sistemi-nedir">eğitim sistemi rehberine</a> bakabilirsiniz.`,
      ],
    ],
    appendHtml:
      '<p>Hazır haftalık akış ve materyal sırası için <a href="/tr/preschool">Woody öğretmen planını keşfedin</a>.</p>',
  },
  {
    // Küme 4: müfredat — girişte yıllık tema+kazanım+tekrar çerçevesi;
    // ders planı ve yaş rehberine iç bağlantı; kurum müfredat görüşmesi CTA.
    slug: 'anaokulu-ingilizce-mufredati-nasil-hazirlanir',
    replaces: [
      [
        '2026 güncel okul öncesi İngilizce yaklaşımında anaokulu İngilizce müfredatı, çocukların dili yalnızca duyması değil, sınıf içinde anlamlı biçimde kullanması için planlanmalıdır.',
        '2026 güncel okul öncesi İngilizce yaklaşımında anaokulu İngilizce müfredatı, çocukların dili yalnızca duyması değil, sınıf içinde anlamlı biçimde kullanması için planlanmalıdır. İyi bir müfredat üç katmanı birleştirir: yıllık tema sırası, haftalık kazanımlar ve gözlenebilir tekrar noktaları.',
      ],
      [
        LINKPARA,
        `${LINKPARA} Haftalık uygulama tarafı için <a href="/tr/blog/anaokulu-ingilizce-ders-plani-nasil-hazirlanir">anaokulu İngilizce ders planı rehberini</a>, yaş gruplarına göre beklentiler için <a href="/tr/blog/4-5-6-yas-ingilizce-egitimi">4-5-6 yaş İngilizce rehberini</a> kullanabilirsiniz.`,
      ],
    ],
    appendHtml:
      '<p>Kurumunuzun yıllık İngilizce müfredatını birlikte yapılandırmak için <a href="/tr/contact">müfredat görüşmesi talep edin</a>.</p>',
  },
  {
    // Küme 5: eğitim seti — girişte fiziksel+dijital bileşen kanıtı;
    // rehberden store'a ve sistem yazısına bağlantı; yaşa uygun set CTA.
    slug: 'anaokulu-ingilizce-egitim-seti-nasil-secilir',
    replaces: [
      [
        '2026 güncel okul öncesi eğitim yaklaşımında anaokulu İngilizce eğitim seti seçmek, yalnızca renkli kitaplar veya birkaç flashcard almak anlamına gelmez.',
        "2026 güncel okul öncesi eğitim yaklaşımında anaokulu İngilizce eğitim seti seçmek, yalnızca renkli kitaplar veya birkaç flashcard almak anlamına gelmez. İyi bir set fiziksel ve dijital bileşenleri birlikte sunar: kitap, flashcard, oyun ve worksheet'in yanında StoryLand/MusicLand gibi dijital tekrar alanları da aynı kazanıma bağlanır.",
      ],
      [
        'Woody Dijital içeriklerini</a> de değerlendirebilir.',
        'Woody Dijital içeriklerini</a> de değerlendirebilir. Sistemin bütününü anlamak için <a href="/tr/blog/anaokulu-ingilizce-egitim-sistemi-nedir">anaokulu İngilizce eğitim sistemi rehberi</a> yol gösterir.',
      ],
    ],
    appendHtml:
      '<p>Çocuğunuzun yaşına ya da kurumunuzun sınıflarına göre <a href="/tr/store">yaşa uygun Woody setini inceleyin</a>.</p>',
  },
  {
    // Küme 3 desteği: öğretim yöntemi yazısından ders planına iç bağlantı.
    slug: 'anaokulunda-ingilizce-nasil-ogretilir',
    replaces: [
      [
        LINKPARA,
        `${LINKPARA} Haftalık akışı nasıl kuracağınızı <a href="/tr/blog/anaokulu-ingilizce-ders-plani-nasil-hazirlanir">anaokulu İngilizce ders planı rehberinde</a> görebilirsiniz.`,
      ],
    ],
  },
];

// page_preschool (tr): set niyeti store'a bırakılır; sistem niyeti + kurum CTA.
// hero.secondaryHref /fiyat 404'tü — /store'a çevrilir.
const PRESCHOOL_PATCH: Record<string, unknown> = {
  seo: {
    title: 'Anaokulu İngilizce Eğitim Sistemi',
    keywords:
      'anaokulu İngilizce eğitim sistemi, anaokulu İngilizce programı, okul öncesi İngilizce sistemi, kurumsal İngilizce eğitim modeli, Cambridge hazırlık anaokulu, 3-6 yaş İngilizce programı, anaokulu İngilizce müfredatı',
    description:
      '{{appName}} Okul Serisi; kitap, öğretmen planı, oyun ve StoryLand/MusicLand dijital içeriğini tek anaokulu İngilizce eğitim sistemi olarak birleştirir. Kurumunuz için görüşme talep edin.',
  },
  hero: {
    title: 'Anaokulu İngilizce Eğitim Sistemi',
    eyebrow: '{{appName}} OKUL SERİSİ',
    description:
      '{{appName}} Okul Serisi; kitap, öğretmen planı, oyun ve dijital içeriği (StoryLand, MusicLand) aynı kazanım çevresinde birleştiren bir anaokulu İngilizce eğitim sistemidir. Kurumunuzda sınıflar arasında ortak, sürdürülebilir bir uygulama omurgası kurar.',
    primaryCTA: 'Kurum Görüşmesi Talep Et',
    primaryHref: '/contact',
    secondaryCTA: 'Yaşa Göre Setleri İncele',
    secondaryHref: '/store',
  },
  description:
    '{{appName}} Okul Serisi; kitap, öğretmen planı, oyun ve dijital içeriği aynı kazanım çevresinde birleştiren bir anaokulu İngilizce eğitim sistemidir.',
};

function countOccurrences(haystack: string, needle: string): number {
  let count = 0;
  let idx = haystack.indexOf(needle);
  while (idx !== -1) {
    count += 1;
    idx = haystack.indexOf(needle, idx + needle.length);
  }
  return count;
}

async function main() {
  const connection = await mysql.createConnection(databaseConfig());
  let changed = 0;
  let skipped = 0;
  try {
    for (const post of POSTS) {
      const [rows] = await connection.query<mysql.RowDataPacket[]>(
        "SELECT bpi.blog_post_id, bpi.content FROM blog_posts_i18n bpi WHERE bpi.slug = ? AND bpi.locale = 'tr' LIMIT 1",
        [post.slug],
      );
      const row = rows[0];
      if (!row) {
        console.log(`SKIP ${post.slug}: tr satırı yok`);
        skipped += 1;
        continue;
      }
      let content = String(row.content);
      let ok = true;
      for (const [oldStr, newStr] of post.replaces) {
        const n = countOccurrences(content, oldStr);
        if (n !== 1) {
          console.log(`SKIP ${post.slug}: hedef ${n} kez geçiyor (1 bekleniyor): "${oldStr.slice(0, 60)}..."`);
          ok = false;
          break;
        }
        content = content.replace(oldStr, newStr);
      }
      if (!ok) {
        skipped += 1;
        continue;
      }
      if (post.appendHtml) {
        if (content.includes(post.appendHtml)) {
          console.log(`SKIP ${post.slug}: CTA zaten ekli`);
          skipped += 1;
          continue;
        }
        content = `${content}${post.appendHtml}`;
      }
      console.log(`${APPLY ? 'APPLY' : 'PLAN '} ${post.slug}: ${post.replaces.length} replace${post.appendHtml ? ' + CTA' : ''} (${String(row.content).length} → ${content.length} karakter)`);
      if (APPLY) {
        await connection.execute(
          "UPDATE blog_posts_i18n SET content = ? WHERE slug = ? AND locale = 'tr'",
          [content, post.slug],
        );
      }
      changed += 1;
    }

    // page_preschool (tr) — mevcut değer üzerine yalnız hedef anahtarlar yazılır.
    const [psRows] = await connection.query<mysql.RowDataPacket[]>(
      "SELECT id, value FROM site_settings WHERE `key` = 'page_preschool' AND locale = 'tr' LIMIT 1",
    );
    const psRow = psRows[0];
    if (!psRow) {
      console.log('SKIP page_preschool: tr satırı yok');
      skipped += 1;
    } else {
      const current = typeof psRow.value === 'string' ? JSON.parse(psRow.value) : psRow.value;
      const next = {
        ...current,
        ...PRESCHOOL_PATCH,
        seo: { ...(current.seo ?? {}), ...(PRESCHOOL_PATCH.seo as object) },
        hero: { ...(current.hero ?? {}), ...(PRESCHOOL_PATCH.hero as object) },
      };
      const before = JSON.stringify(current);
      const after = JSON.stringify(next);
      if (before === after) {
        console.log('SKIP page_preschool: değişiklik yok (idempotent)');
      } else {
        console.log(`${APPLY ? 'APPLY' : 'PLAN '} page_preschool(tr): seo.title "${current?.seo?.title}" → "${(PRESCHOOL_PATCH.seo as any).title}"; hero.title "${current?.hero?.title}" → "${(PRESCHOOL_PATCH.hero as any).title}"; secondaryHref "${current?.hero?.secondaryHref}" → "/store"`);
        if (APPLY) {
          await connection.execute("UPDATE site_settings SET value = ? WHERE id = ?", [after, psRow.id]);
        }
        changed += 1;
      }
    }

    console.log(`\n${APPLY ? 'Uygulandı' : 'Plan'}: ${changed} değişiklik, ${skipped} atlandı.`);
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
