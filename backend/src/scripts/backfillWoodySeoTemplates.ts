import 'dotenv/config';

import mysql from 'mysql2/promise';
import {
  getWoodySeoPageDefinition,
  normalizeWoodyPageSeoConfig,
  WOODY_SEO_LOCALES,
  type WoodyPageSeoConfig,
} from '@shared/shared-types/woody-seo-catalog';

const APPLY = process.argv.includes('--apply');

const COPY: Record<string, {
  terms: [string, string];
  blog: [string, string];
  store: [string, string];
  digital: [string, string];
}> = {
  tr: {
    terms: ['Kullanım Şartları', 'Woody and Friends web sitesi ve hizmetlerinin kullanım şartlarını inceleyin.'],
    blog: ['{title} | Woody and Friends Blog', '{description}'],
    store: ['{title} | Woody and Friends Mağaza', '{description}'],
    digital: ['{title} | Woody Dijital İçerik', '{description}'],
  },
  en: {
    terms: ['Terms & Conditions', 'Review the terms governing the Woody and Friends website and services.'],
    blog: ['{title} | Woody and Friends Blog', '{description}'],
    store: ['{title} | Woody and Friends Store', '{description}'],
    digital: ['{title} | Woody Digital Content', '{description}'],
  },
  de: {
    terms: ['Nutzungsbedingungen', 'Lesen Sie die Bedingungen für die Website und Dienste von Woody and Friends.'],
    blog: ['{title} | Woody and Friends Blog', '{description}'],
    store: ['{title} | Woody and Friends Shop', '{description}'],
    digital: ['{title} | Woody Digitale Inhalte', '{description}'],
  },
  ar: {
    terms: ['الشروط والأحكام', 'راجع شروط استخدام موقع وخدمات Woody and Friends.'],
    blog: ['{title} | مدونة Woody and Friends', '{description}'],
    store: ['{title} | متجر Woody and Friends', '{description}'],
    digital: ['{title} | محتوى Woody الرقمي', '{description}'],
  },
  fr: {
    terms: ["Conditions d’utilisation", 'Consultez les conditions régissant le site et les services Woody and Friends.'],
    blog: ['{title} | Blog Woody and Friends', '{description}'],
    store: ['{title} | Boutique Woody and Friends', '{description}'],
    digital: ['{title} | Contenu numérique Woody', '{description}'],
  },
  ru: {
    terms: ['Условия использования', 'Ознакомьтесь с условиями использования сайта и сервисов Woody and Friends.'],
    blog: ['{title} | Блог Woody and Friends', '{description}'],
    store: ['{title} | Магазин Woody and Friends', '{description}'],
    digital: ['{title} | Цифровой контент Woody', '{description}'],
  },
  es: {
    terms: ['Términos y condiciones', 'Consulta los términos del sitio web y los servicios de Woody and Friends.'],
    blog: ['{title} | Blog Woody and Friends', '{description}'],
    store: ['{title} | Tienda Woody and Friends', '{description}'],
    digital: ['{title} | Contenido digital Woody', '{description}'],
  },
  it: {
    terms: ['Termini e condizioni', 'Consulta i termini del sito e dei servizi Woody and Friends.'],
    blog: ['{title} | Blog Woody and Friends', '{description}'],
    store: ['{title} | Negozio Woody and Friends', '{description}'],
    digital: ['{title} | Contenuti digitali Woody', '{description}'],
  },
  nl: {
    terms: ['Algemene voorwaarden', 'Bekijk de voorwaarden voor de website en diensten van Woody and Friends.'],
    blog: ['{title} | Woody and Friends Blog', '{description}'],
    store: ['{title} | Woody and Friends Winkel', '{description}'],
    digital: ['{title} | Digitale inhoud van Woody', '{description}'],
  },
  'pt-br': {
    terms: ['Termos e condições', 'Consulte os termos do site e dos serviços Woody and Friends.'],
    blog: ['{title} | Blog Woody and Friends', '{description}'],
    store: ['{title} | Loja Woody and Friends', '{description}'],
    digital: ['{title} | Conteúdo digital Woody', '{description}'],
  },
};

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
    charset: 'utf8mb4_unicode_ci',
  };
}

function parsePages(value: unknown): Record<string, unknown> {
  if (typeof value !== 'string') return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function dynamicConfig(key: string, title: string, description: string): WoodyPageSeoConfig {
  const definition = getWoodySeoPageDefinition(key);
  if (!definition) throw new Error(`Unknown SEO definition: ${key}`);
  return {
    title,
    description,
    keywords: '',
    canonical_path: '',
    no_index: false,
    og: {
      mode: 'content',
      title: '{title}',
      description: '{description}',
      eyebrow: 'Woody and Friends',
      template: definition.ogTemplate,
      background_image: '',
      foreground_image: '',
      generated_image: '',
      custom_image: '',
      alt: '{title}',
    },
  };
}

async function main() {
  const connection = await mysql.createConnection(databaseConfig());
  try {
    for (const locale of WOODY_SEO_LOCALES) {
      const [rows] = await connection.query<mysql.RowDataPacket[]>(
        "SELECT value FROM site_settings WHERE `key` = 'seo_pages' AND locale = ? LIMIT 1",
        [locale],
      );
      const pages = parsePages(rows[0]?.value);
      const copy = COPY[locale];

      const termsDefinition = getWoodySeoPageDefinition('terms')!;
      const terms = normalizeWoodyPageSeoConfig(pages.terms, termsDefinition);
      const brokenTermsTitle =
        !terms.title ||
        /^\*+.*\*+$/.test(terms.title) ||
        (locale === 'tr' && /^terms(?:\s*&\s*conditions)?$/i.test(terms.title));
      const genericTermsDescription =
        !terms.description ||
        /okul öncesi|preschool english|vorschulenglisch|atelier|digital content experience/i.test(
          terms.description,
        );
      pages.terms = {
        ...terms,
        title: brokenTermsTitle ? copy.terms[0] : terms.title,
        description: genericTermsDescription ? copy.terms[1] : terms.description,
        og: {
          ...terms.og,
          title: brokenTermsTitle || !terms.og.title ? copy.terms[0] : terms.og.title,
          description:
            genericTermsDescription || !terms.og.description
              ? copy.terms[1]
              : terms.og.description,
        },
      };

      const templates: Array<[string, [string, string]]> = [
        ['blog-post', copy.blog],
        ['store-product', copy.store],
        ['digital-product', copy.digital],
      ];
      for (const [key, values] of templates) {
        const definition = getWoodySeoPageDefinition(key)!;
        const existing = normalizeWoodyPageSeoConfig(pages[key], definition);
        pages[key] = existing.title && existing.description
          ? existing
          : dynamicConfig(key, values[0], values[1]);
      }

      console.log(`${locale}: terms + 3 dynamic SEO templates ready`);
      if (APPLY) {
        await connection.execute(
          `UPDATE site_settings
           SET value = ?, updated_at = CURRENT_TIMESTAMP(3)
           WHERE \`key\` = 'seo_pages' AND locale = ?`,
          [JSON.stringify(pages), locale],
        );
      }
    }
  } finally {
    await connection.end();
  }
  console.log(APPLY ? 'SEO templates backfilled.' : 'Dry run complete. Use --apply.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
