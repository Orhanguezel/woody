#!/usr/bin/env node

const BASE_URL = (process.env.SCHEMA_BASE_URL || 'http://localhost:3077').replace(/\/+$/, '');

const CASES = [
  {
    path: '/tr',
    types: ['Organization', 'WebSite', 'EducationalOrganization', 'BreadcrumbList'],
  },
  {
    path: '/tr/preschool',
    types: ['Organization', 'WebSite', 'EducationalOrganization', 'BreadcrumbList'],
  },
  {
    path: '/tr/store/1',
    types: ['Organization', 'WebSite', 'Product', 'BreadcrumbList'],
  },
  {
    path: '/tr/blog/anaokulu-ingilizce-ders-plani-nasil-hazirlanir',
    types: ['Organization', 'WebSite', 'Article', 'FAQPage', 'BreadcrumbList'],
  },
  {
    path: '/tr/faqs',
    types: ['Organization', 'WebSite', 'FAQPage', 'BreadcrumbList'],
  },
  {
    path: '/tr/contact',
    types: ['Organization', 'WebSite', 'LocalBusiness', 'BreadcrumbList'],
  },
];

function decodeHtml(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function extractJsonLd(html) {
  const scripts = [];
  const re = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = re.exec(html))) {
    const body = decodeHtml(match[1].trim());
    if (!body) continue;
    try {
      scripts.push(JSON.parse(body));
    } catch (error) {
      throw new Error(`JSON-LD parse error: ${error.message}`);
    }
  }
  return scripts;
}

function flattenNodes(value) {
  if (!value || typeof value !== 'object') return [];
  if (Array.isArray(value)) return value.flatMap(flattenNodes);
  const nodes = [value];
  if (Array.isArray(value['@graph'])) nodes.push(...value['@graph'].flatMap(flattenNodes));
  return nodes;
}

function hasType(node, type) {
  const raw = node?.['@type'];
  return Array.isArray(raw) ? raw.includes(type) : raw === type;
}

function present(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === 'object') return Object.keys(value).length > 0;
  return String(value ?? '').trim().length > 0;
}

function firstNode(nodes, type) {
  return nodes.find((node) => hasType(node, type));
}

const validators = {
  Organization(node) {
    return ['name', 'url', 'logo'].filter((key) => !present(node[key]));
  },
  WebSite(node) {
    return ['name', 'url', 'publisher'].filter((key) => !present(node[key]));
  },
  EducationalOrganization(node) {
    return ['name', 'url', 'provider'].filter((key) => !present(node[key]));
  },
  Product(node) {
    const missing = ['name', 'description', 'offers'].filter((key) => !present(node[key]));
    const offers = Array.isArray(node.offers) ? node.offers[0] : node.offers;
    if (offers && typeof offers === 'object') {
      for (const key of ['price', 'priceCurrency', 'availability', 'url']) {
        if (!present(offers[key])) missing.push(`offers.${key}`);
      }
    }
    return missing;
  },
  Article(node) {
    return ['headline', 'datePublished', 'author', 'publisher', 'mainEntityOfPage'].filter(
      (key) => !present(node[key]),
    );
  },
  FAQPage(node) {
    const missing = [];
    if (!Array.isArray(node.mainEntity) || node.mainEntity.length === 0) return ['mainEntity'];
    node.mainEntity.forEach((item, index) => {
      if (!present(item.name)) missing.push(`mainEntity[${index}].name`);
      if (!present(item.acceptedAnswer?.text)) missing.push(`mainEntity[${index}].acceptedAnswer.text`);
    });
    return missing;
  },
  LocalBusiness(node) {
    return ['name', 'description', 'url', 'logo'].filter((key) => !present(node[key]));
  },
  BreadcrumbList(node) {
    const missing = [];
    if (!Array.isArray(node.itemListElement) || node.itemListElement.length === 0) return ['itemListElement'];
    node.itemListElement.forEach((item, index) => {
      for (const key of ['position', 'name', 'item']) {
        if (!present(item[key])) missing.push(`itemListElement[${index}].${key}`);
      }
    });
    return missing;
  },
};

async function validateCase(testCase) {
  const url = `${BASE_URL}${testCase.path}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'schema-validator/1.0' } });
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);

  const html = await res.text();
  const nodes = extractJsonLd(html).flatMap(flattenNodes);
  if (nodes.length === 0) throw new Error(`${url} has no JSON-LD scripts`);

  const failures = [];
  for (const type of testCase.types) {
    const node = firstNode(nodes, type);
    if (!node) {
      failures.push(`${type}: missing node`);
      continue;
    }
    const missing = validators[type]?.(node) ?? [];
    if (missing.length) failures.push(`${type}: missing ${missing.join(', ')}`);
  }

  if (failures.length) throw new Error(`${url}\n  ${failures.join('\n  ')}`);
  console.log(`ok ${testCase.path} -> ${testCase.types.join(', ')}`);
}

for (const testCase of CASES) {
  await validateCase(testCase);
}

