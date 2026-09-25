// =============================================================
// AI görünürlük planı (2026-09-25) Faz 2 — altı öncelikli TR rehberin
// alıntılanabilirlik düzeltmeleri. Saf dönüşüm: DB'ye dokunmaz; betik
// (applyWoodyGeoCitability.ts) ve test aynı fonksiyonu kullanır.
//
// Her yazıda:
//  A. H1 altında 40-80 kelimelik doğrudan cevap (yoksa).
//  B. Eksikse karar/konu tablosu (müfredat, 6 yaş).
//  D. "Kaynaklar ve sınırlar": resmî çerçeveye bağlamsal bağlantı; kurumun
//     yaklaşımı onayladığı İDDİA EDİLMEZ; yazıya özgü sınır cümlesi.
// Birinci el sınıf kanıtı (C) burada YOK: ölçülmemiş sonuç yazılmaz, gerçek
// vaka müşteriden gelince eklenir.
// Idempotent: eklenen blok zaten varsa o adım atlanır. Çapa metni tam 1 kez
// geçmezse yazı değişmeden bırakılır ve hata raporlanır.
// =============================================================

export const SOURCE_URLS = {
  meb: 'https://tegm.meb.gov.tr/www/guncellenen-turkiye-yuzyili-maarif-modeli-okul-oncesi-egitim-programi-yayimlandi/icerik/1325/tr',
  cefr: 'https://www.coe.int/en/web/common-european-framework-reference-languages',
  cambridgeYl: 'https://www.cambridgeenglish.org/exams-and-tests/qualifications/young-learners/',
} as const;

const SOURCES_MARKER = '<h2>Kaynaklar ve sınırlar</h2>';

type Insert = { before: string; html: string; marker: string };

export type CitabilityOp = {
  slug: string;
  /** İçeriğin başına eklenen doğrudan cevap paragrafı (işaretçi: kendisi). */
  directAnswer?: string;
  inserts?: Insert[];
  /** "Kaynaklar ve sınırlar" bölümünün önüne ekleneceği çapa (SSS başlığı). */
  faqAnchor: string;
  includeCambridge?: boolean;
  limit: string;
};

function sourcesSection(op: CitabilityOp): string {
  const items = [
    `<li><a href="${SOURCE_URLS.meb}" target="_blank" rel="noopener">Millî Eğitim Bakanlığı — Türkiye Yüzyılı Maarif Modeli Okul Öncesi Eğitim Programı</a>: okul öncesi kazanım ve gelişim alanlarının resmî çerçevesi.</li>`,
    `<li><a href="${SOURCE_URLS.cefr}" target="_blank" rel="noopener">Avrupa Konseyi — Avrupa Dilleri Ortak Çerçevesi (CEFR)</a>: dil düzeylerini tanımlayan uluslararası referans. Okul öncesinde düzey sınavı için değil, ilerlemeyi ortak bir dille anlatmak için kullanılır.</li>`,
    ...(op.includeCambridge
      ? [
          `<li><a href="${SOURCE_URLS.cambridgeYl}" target="_blank" rel="noopener">Cambridge English — Young Learners sınavları</a>: ilkokul çağındaki çocuklar için tasarlanmıştır. Okul öncesinde hedef sınav değil, dinleme ve kısa kalıp kullanımıdır.</li>`,
        ]
      : []),
  ];
  return [
    SOURCES_MARKER,
    '<p>Bu rehberdeki yaş, süre ve konu önerileri okul öncesi sınıf uygulamasına ve aşağıdaki resmî çerçevelere dayanır. Bağlantı vermek, bu kurumların Woody and Friends yaklaşımını onayladığı anlamına gelmez. Kaynak bağlantıları Eylül 2026\'da kontrol edildi.</p>',
    `<ul>${items.join('')}</ul>`,
    `<p><strong>Sınır:</strong> ${op.limit} Önerilen süre ve kelime sayıları sınıfın düzeyine, grup büyüklüğüne ve çocuğun gelişimine göre değişebilir; ölçülmemiş bir öğrenme sonucu vaat edilmez.</p>`,
  ].join('');
}

export const CITABILITY_OPS: CitabilityOp[] = [
  {
    slug: 'anaokulu-ingilizce-konulari',
    // İlk paragraf zaten doğrudan cevap (soru + liste); yalnız kaynak/sınır.
    faqAnchor: '<h2>Sıkça Sorulan Sorular</h2>',
    limit: 'Anaokulu İngilizce konuları listesi tek başına program değildir; hangi hafta hangi kazanımın işleneceğini müfredat ve ders planı belirler.',
  },
  {
    slug: 'anaokulu-ingilizce-mufredati-nasil-hazirlanir',
    directAnswer:
      '<p><strong>Anaokulu İngilizce müfredatı nasıl hazırlanır?</strong> Önce yaş grubu ve haftalık ders sayısı belirlenir. Ardından yıl tema bloklarına bölünür; çoğu kurumda ayda bir ana tema yeterlidir. Her haftaya tek kazanım, birkaç kelime ve bir kısa kalıp verilir; her kazanım bir materyal ve oyunla eşleştirilir, dönem sonunda gözlem listesiyle kontrol edilir. Müfredat yılın çerçevesidir; günlük akışı ders planı belirler.</p>',
    inserts: [
      {
        before: '<h2>Tekrar döngüsü nasıl kurulmalı?</h2>',
        marker: '<h3>Örnek yıllık müfredat tablosu</h3>',
        html:
          '<h3>Örnek yıllık müfredat tablosu</h3>' +
          '<table><thead><tr><th>Dönem</th><th>Tema</th><th>Kazanım</th><th>Materyal</th><th>Ölçme</th></tr></thead><tbody>' +
          '<tr><td>Eylül–Ekim</td><td>Selamlaşma, sınıf rutini, renkler</td><td>Selamlaşır, basit yönergeye uyar, rengi gösterir</td><td>Flashcard, selamlaşma şarkısı</td><td>Yönergeye doğru tepki gözlemi</td></tr>' +
          '<tr><td>Kasım–Aralık</td><td>Sayılar, oyuncaklar, aile</td><td>Sayar, oyuncak ve aile bireylerini adlandırır</td><td>Sayı kartları, aile resmi, kısa hikâye</td><td>Kartı gösterip adını söyleme</td></tr>' +
          '<tr><td>Ocak–Şubat</td><td>Hayvanlar, vücut ve duygular</td><td>Hayvan sesini ve hareketini eşleştirir, duygusunu söyler</td><td>Hikâye kitabı, hareket oyunu</td><td>Oyun sırasında kelimeyi kullanma</td></tr>' +
          '<tr><td>Mart–Nisan</td><td>Yiyecekler, hava ve kıyafet</td><td>"I like…" kalıbıyla tercihini belirtir, havaya uygun seçim yapar</td><td>Şarkı, eşleştirme kartları, çalışma sayfası</td><td>Kalıbı kendiliğinden kullanma</td></tr>' +
          '<tr><td>Mayıs–Haziran</td><td>Doğa, ulaşım, yıl tekrarı</td><td>Kısa soruya tek kelime veya kalıpla cevap verir</td><td>Yıl boyu kartlar, gösteri etkinliği</td><td>Yıl sonu gözlem listesi, veli paylaşımı</td></tr>' +
          '</tbody></table>' +
          '<p>Tablo, anaokulu İngilizce konuları sırasıyla uyumlu bir örnektir; tema sırası kullandığınız setin ünite sırasına ve okulunuzun takvimine göre uyarlanır.</p>',
      },
    ],
    faqAnchor: '<h2>Sıkça Sorulan Sorular</h2>',
    limit: 'Tablodaki tema sırası örnektir; müfredat, okulun takvimine ve kullanılan setin ünite sırasına göre uyarlanmalıdır.',
  },
  {
    slug: 'anaokulu-ingilizce-ders-plani-nasil-hazirlanir',
    directAnswer:
      '<p><strong>Anaokulu İngilizce ders planı nasıl hazırlanır?</strong> Haftanın tek kazanımı seçilir ve 20-30 dakikalık ders beş adıma bölünür: selamlaşma rutini, kartla kelime tanıtımı, hareketli oyun, şarkı veya hikâyeyle tekrar ve kısa gözlemle kapanış. Her adım için materyal ve çocuktan beklenen tepki önceden yazılır. Yıllık konu sırası müfredattan, günlük akış ise bu plandan gelir.</p>',
    faqAnchor: '<h2>Sıkça Sorulan Sorular</h2>',
    limit: 'Ders süresi ve adım sayısı grubun dikkat süresine göre kısaltılabilir; kalabalık gruplarda plan iki kısa bölüme ayrılabilir.',
  },
  {
    slug: '5-yas-ingilizce-ders-programi',
    // İlk paragraf zaten doğrudan cevap (soru + süre + akış).
    faqAnchor: '<h2>Sıkça Sorulan Sorular</h2>',
    limit: '20-25 dakika çoğu 5 yaş grubu için bir başlangıç önerisidir; dikkat süresi kısa gruplarda ders iki kısa bölüme ayrılabilir.',
  },
  {
    slug: '6-yas-ingilizce-egitimi',
    directAnswer:
      '<p><strong>6 yaş İngilizce eğitimi nasıl planlanmalı?</strong> Sınıfta 25-30 dakikalık derslerle, evde ise günde 15-20 dakikalık kısa tekrarlarla ilerlenir. Her hafta tek tema, birkaç yeni kelime ve bir-iki kısa kalıp hedeflenir. Altı yaşındaki çocuk kısa soru-cevaba, iki adımlı yönergeye ve hikâyeyi takip etmeye hazırdır. Okuma-yazma ve dilbilgisi kuralı hedef değildir; ilerleme, çocuğun kalıbı oyunda kendiliğinden kullanmasıyla gözlenir.</p>',
    inserts: [
      {
        before: '<h2>6 Yaş İçin Etkili Öğretim Yöntemleri</h2>',
        marker: '<h3>6 yaş için tema, kalıp ve gözlenebilir çıktı tablosu</h3>',
        html:
          '<h3>6 yaş için tema, kalıp ve gözlenebilir çıktı tablosu</h3>' +
          '<table><thead><tr><th>Tema</th><th>Örnek kelimeler</th><th>Hedef kalıp</th><th>Gözlenebilir çıktı</th></tr></thead><tbody>' +
          '<tr><td>Selamlaşma ve kendini tanıtma</td><td>hello, name, friend</td><td>"My name is… I am six."</td><td>Kendini iki kısa cümleyle tanıtır</td></tr>' +
          '<tr><td>Renkler ve sayılar</td><td>red, blue, one–twenty</td><td>"How many…? Five."</td><td>Nesneleri sayar ve rengini söyler</td></tr>' +
          '<tr><td>Aile ve vücut</td><td>mother, brother, hand, head</td><td>"This is my…"</td><td>Resim üzerinde aile üyelerini tanıtır</td></tr>' +
          '<tr><td>Hayvanlar ve yiyecekler</td><td>rabbit, fish, apple, milk</td><td>"I like… / I don\'t like…"</td><td>Tercihini kalıpla söyler</td></tr>' +
          '<tr><td>Duygular ve hava durumu</td><td>happy, sad, sunny, rainy</td><td>"How are you? I\'m…"</td><td>Soruya duygu kelimesiyle cevap verir</td></tr>' +
          '<tr><td>Sınıf ve okul nesneleri</td><td>pencil, book, bag</td><td>"Give me the…, please."</td><td>İki adımlı yönergeyi yerine getirir</td></tr>' +
          '</tbody></table>' +
          '<p>6 Yaş İngilizce Eğitimi planında bu tablo, konu listesinin hangi kalıpla ve hangi gözlemle işleneceğini gösterir; kelime sayısı grubun düzeyine göre azaltılabilir.</p>',
      },
    ],
    faqAnchor: '<h2>Sıkça Sorulan Sorular (FAQ)</h2>',
    includeCambridge: true,
    limit: 'Okuma-yazma ve dilbilgisi kuralı bu yaşın hedefi değildir; ilkokula geçişte beklenen, dinlediğini anlama ve kısa kalıpları kullanabilmektir.',
  },
  {
    slug: 'anaokulu-ingilizce-egitim-seti-nasil-secilir',
    directAnswer:
      '<p><strong>Anaokulu İngilizce eğitim seti nasıl seçilir?</strong> Beş ölçüte bakın: seviyelerin 3-6 yaşa göre kademelenmesi, hazır öğretmen planı, kitap, kart, oyun, şarkı ve hikâyenin aynı kazanıma bağlanması, sınıf dışında da kullanılabilen dijital tekrar içeriği ve öğretmen seti, öğrenci seti ile dijital erişimi kapsayan toplam maliyet. Yalnız kitap veren set öğretmene ders akışı bırakmaz; setleri aynı ölçütlerle karşılaştırın.</p>',
    faqAnchor: '<h2>Sıkça Sorulan Sorular</h2>',
    limit: 'Bu ölçütler set karşılaştırması içindir; fiyat ve içerik için güncel ürün sayfasını veya kurum teklifini esas alın.',
  },
];

function countOf(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

export type TransformResult = { html: string; changes: string[]; errors: string[] };

export function applyCitability(op: CitabilityOp, input: string): TransformResult {
  let html = input;
  const changes: string[] = [];
  const errors: string[] = [];

  if (op.directAnswer) {
    if (html.includes(op.directAnswer)) {
      // zaten uygulanmış
    } else {
      html = `${op.directAnswer}${html}`;
      changes.push('direct-answer');
    }
  }

  for (const insert of op.inserts ?? []) {
    if (html.includes(insert.marker)) continue;
    const n = countOf(html, insert.before);
    if (n !== 1) {
      errors.push(`anchor x${n}: ${insert.before}`);
      continue;
    }
    html = html.replace(insert.before, `${insert.html}${insert.before}`);
    changes.push(`insert:${insert.marker.replace(/<[^>]+>/g, '')}`);
  }

  if (!html.includes(SOURCES_MARKER)) {
    const n = countOf(html, op.faqAnchor);
    if (n !== 1) {
      errors.push(`faq anchor x${n}: ${op.faqAnchor}`);
    } else {
      html = html.replace(op.faqAnchor, `${sourcesSection(op)}${op.faqAnchor}`);
      changes.push('sources-and-limits');
    }
  }

  // Bir çapa hatası varsa yazı yarım değiştirilmez.
  return errors.length ? { html: input, changes: [], errors } : { html, changes, errors };
}
