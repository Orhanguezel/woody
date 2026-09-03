// =============================================================
// FILE: src/modules/userActivity/router.ts
// "Bu kullanici ne yapti, nerede gezdi?" — /admin/users/:id/activity
//
// KIMLIK COZUMLEME
// audit_request_logs.user_id tarihsel olarak NULL (JWT yuku { sub } ile
// imzalaniyordu, logger ise user.id ariyordu — audit/service.ts'te
// duzeltildi, ama gecmis veri geriye donuk dolmaz). Ustelik woody'de
// alisverislerin cogu MISAFIR: kullanici hesabi checkout aninda aciliyor,
// hic giris yapilmiyor (last_sign_in_at NULL).
//
// Bu yuzden kimlik iki yoldan cozulur:
//   1) audit_request_logs.user_id = :id            (giris yapmis oturumlar)
//   2) Kullanicinin siparis ID'si istek YOLUNDA gecer —
//      /api/v1/checkout/orders/<order_id>/...      → o satirin IP'si
//      Bulunan IP'ler uzerinden misafir gezintisi de geri kazanilir.
//
// GEZINME IZI
// path = API ucu (ziyaret edilen sayfa DEGIL). Ziyaretcinin hangi sayfada
// oldugu `referer` basliginda: https://site/tr/store → /tr/store.
// Sayfa dokumu bu yuzden referer'dan turetilir.
//
// PERFORMANS
// Tablo milyonlarca satir. Tum sorgular indeksli kolonlardan gider
// (ip, user_id, path prefix, created_at). path aramasi ONEK eslesmesidir
// (LIKE 'sabit%'), bu sayede audit_request_logs_path_idx kullanilabilir —
// '%...%' seklinde ortadan arama tam tarama yapardi.
// =============================================================

import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { RowDataPacket } from 'mysql2';

import { pool } from '@/db/client';

type RangeKey = '7d' | '30d' | '90d' | 'all';

const RANGE_DAYS: Record<Exclude<RangeKey, 'all'>, number> = { '7d': 7, '30d': 30, '90d': 90 };

/** Kullanici basina taranacak azami istek satiri — kotu niyetli/bot IP'lerde tavan. */
const MAX_ROWS = 4000;
const MAX_IPS = 12;

function parseRange(req: FastifyRequest): RangeKey {
  const raw = String(((req.query ?? {}) as Record<string, unknown>).range ?? '30d');
  return raw === '7d' || raw === '90d' || raw === 'all' ? raw : '30d';
}

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function str(v: unknown): string {
  return v == null ? '' : String(v);
}

/** "https://site/tr/store?x=1" → "/tr/store" */
function refererToPage(referer: string): string | null {
  const raw = String(referer || '').trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    const p = u.pathname.replace(/\/+$/, '') || '/';
    return p;
  } catch {
    return null;
  }
}

/** Ham user-agent'tan okunabilir cihaz ozeti. */
function describeDevice(ua: string): string {
  const s = ua.toLowerCase();
  if (!s) return 'Bilinmiyor';
  const bot = /bot|crawler|spider|headless|curl|wget|python-requests/.test(s);
  if (bot) return 'Bot / tarayıcı değil';
  const mobile = /iphone|android|ipad|mobile/.test(s);
  let browser = 'Tarayıcı';
  if (s.includes('edg/')) browser = 'Edge';
  else if (s.includes('chrome/') && !s.includes('chromium')) browser = 'Chrome';
  else if (s.includes('safari/') && !s.includes('chrome')) browser = 'Safari';
  else if (s.includes('firefox/')) browser = 'Firefox';
  let os = '';
  if (s.includes('iphone') || s.includes('ipad')) os = 'iOS';
  else if (s.includes('android')) os = 'Android';
  else if (s.includes('windows')) os = 'Windows';
  else if (s.includes('mac os')) os = 'macOS';
  else if (s.includes('linux')) os = 'Linux';
  return `${browser}${os ? ` · ${os}` : ''}${mobile ? ' · Mobil' : ' · Masaüstü'}`;
}

async function q<T extends RowDataPacket>(sql: string, params: Array<string | number> = []): Promise<T[]> {
  const [rows] = await pool.query<T[]>(sql, params);
  return rows;
}

export async function registerUserActivityAdmin(adminApi: FastifyInstance) {
  adminApi.get('/users/:id/activity', async (req, reply) => {
    const userId = String((req.params as { id?: string })?.id ?? '').trim();
    if (!userId) return reply.code(400).send({ error: { message: 'user_id_required' } });

    const range = parseRange(req);
    const sinceSql =
      range === 'all' ? '' : `AND created_at >= DATE_SUB(NOW(), INTERVAL ${RANGE_DAYS[range]} DAY)`;

    // --- 1) Kullanici + siparisleri -------------------------------------
    const userRows = await q<RowDataPacket>(
      `SELECT id, email, full_name, phone, created_at, last_sign_in_at
         FROM users WHERE id = ? LIMIT 1`,
      [userId],
    );
    if (!userRows.length) return reply.code(404).send({ error: { message: 'user_not_found' } });
    const user = userRows[0];

    const orders = await q<RowDataPacket>(
      `SELECT id, total, status, payment_status, created_at
         FROM orders WHERE dealer_id = ? ORDER BY created_at DESC LIMIT 50`,
      [userId],
    );

    // --- 2) IP cozumleme -------------------------------------------------
    // (a) giris yapilmis satirlardan, (b) siparis ID'si gecen istek yolundan.
    const ipSet = new Set<string>();

    const byUser = await q<RowDataPacket>(
      `SELECT ip, COUNT(*) n FROM audit_request_logs
        WHERE user_id = ? AND ip IS NOT NULL AND ip <> ''
        GROUP BY ip ORDER BY n DESC LIMIT ?`,
      [userId, MAX_IPS],
    );
    byUser.forEach((r) => ipSet.add(str(r.ip)));

    for (const o of orders.slice(0, 10)) {
      if (ipSet.size >= MAX_IPS) break;
      // ONEK eslesmesi — indeks kullanilabilsin diye '%' yalnizca sonda.
      const rows = await q<RowDataPacket>(
        `SELECT DISTINCT ip FROM audit_request_logs
          WHERE path LIKE ? AND ip IS NOT NULL AND ip <> '' LIMIT 5`,
        [`/api/v1/checkout/orders/${str(o.id)}%`],
      );
      rows.forEach((r) => ipSet.add(str(r.ip)));
    }

    const ips = [...ipSet].filter(Boolean).slice(0, MAX_IPS);

    // Hic iz yoksa bos ama tutarli yanit don.
    if (!ips.length) {
      return {
        user: {
          id: str(user.id),
          email: str(user.email),
          full_name: str(user.full_name),
          created_at: str(user.created_at),
          last_sign_in_at: user.last_sign_in_at ? str(user.last_sign_in_at) : null,
        },
        range,
        resolvedBy: 'none',
        ips: [],
        summary: {
          orders_count: orders.length,
          total_spend: orders
            .filter((o) => str(o.payment_status) === 'paid')
            .reduce((a, o) => a + num(o.total), 0),
          requests: 0,
          pages_visited: 0,
          first_seen: null,
          last_seen: null,
          active_days: 0,
        },
        pages: [],
        timeline: [],
        devices: [],
        orders: orders.map((o) => ({
          id: str(o.id),
          order_number: `WD${str(o.id).replace(/-/g, '')}`,
          total: num(o.total),
          status: str(o.status),
          payment_status: str(o.payment_status),
          created_at: str(o.created_at),
        })),
      };
    }

    const ipPlaceholders = ips.map(() => '?').join(',');
    const identity = `(user_id = ? OR ip IN (${ipPlaceholders}))`;
    const identityParams: Array<string | number> = [userId, ...ips];

    // --- 3) Ozet ---------------------------------------------------------
    const [summaryRow] = await q<RowDataPacket>(
      `SELECT COUNT(*) requests,
              MIN(created_at) first_seen,
              MAX(created_at) last_seen,
              COUNT(DISTINCT DATE(created_at)) active_days
         FROM audit_request_logs
        WHERE ${identity} ${sinceSql}`,
      identityParams,
    );

    // --- 4) Gezilen sayfalar (referer'dan) --------------------------------
    const pageRows = await q<RowDataPacket>(
      `SELECT referer, COUNT(*) hits, MIN(created_at) first_at, MAX(created_at) last_at
         FROM audit_request_logs
        WHERE ${identity} ${sinceSql}
          AND referer IS NOT NULL AND referer <> ''
        GROUP BY referer
        ORDER BY last_at DESC
        LIMIT 400`,
      identityParams,
    );

    // Ayni sayfanin farkli query-string'leri tek satirda toplanir.
    const pageMap = new Map<string, { page: string; hits: number; first_at: string; last_at: string }>();
    for (const r of pageRows) {
      const page = refererToPage(str(r.referer));
      if (!page) continue;
      const prev = pageMap.get(page);
      const first = str(r.first_at);
      const last = str(r.last_at);
      if (prev) {
        prev.hits += num(r.hits);
        if (first < prev.first_at) prev.first_at = first;
        if (last > prev.last_at) prev.last_at = last;
      } else {
        pageMap.set(page, { page, hits: num(r.hits), first_at: first, last_at: last });
      }
    }
    const pages = [...pageMap.values()].sort((a, b) => (a.last_at < b.last_at ? 1 : -1));

    // --- 5) Zaman tuneli ---------------------------------------------------
    // Ham istekler cok gurultulu (tek sayfa acilisi onlarca API cagirir).
    // Ayni sayfada ardisik istekler tek "ziyaret" olarak katlanir.
    const rawTimeline = await q<RowDataPacket>(
      `SELECT created_at, method, path, status_code, referer, ip, user_agent
         FROM audit_request_logs
        WHERE ${identity} ${sinceSql}
        ORDER BY created_at DESC
        LIMIT ?`,
      [...identityParams, MAX_ROWS],
    );

    type Visit = {
      page: string | null;
      started_at: string;
      ended_at: string;
      requests: number;
      ip: string;
      actions: Array<{ at: string; method: string; path: string; status: number }>;
    };

    const chronological = [...rawTimeline].reverse(); // eskiden yeniye
    const visits: Visit[] = [];
    for (const r of chronological) {
      const page = refererToPage(str(r.referer));
      const at = str(r.created_at);
      const path = str(r.path);
      const method = str(r.method);
      const status = num(r.status_code);
      const last = visits[visits.length - 1];

      if (last && last.page === page) {
        last.ended_at = at;
        last.requests += 1;
      } else {
        visits.push({
          page,
          started_at: at,
          ended_at: at,
          requests: 1,
          ip: str(r.ip),
          actions: [],
        });
      }

      // Anlamli eylemler ayrica isaretlenir (site_settings gibi gurultu haric).
      const meaningful =
        /\/(checkout|orders|auth|quote-requests|contact|entitlements|waitlist|subscriptions)\b/.test(path) &&
        !path.includes('/site_settings');
      if (meaningful) {
        visits[visits.length - 1].actions.push({ at, method, path, status });
      }
    }

    const timeline = visits.reverse().slice(0, 120); // yeniden eskiye

    // --- 6) Cihazlar -------------------------------------------------------
    const deviceRows = await q<RowDataPacket>(
      `SELECT user_agent, ip, COUNT(*) hits, MAX(created_at) last_at,
              MAX(country) country, MAX(city) city
         FROM audit_request_logs
        WHERE ${identity} ${sinceSql}
        GROUP BY user_agent, ip
        ORDER BY hits DESC
        LIMIT 10`,
      identityParams,
    );

    return {
      user: {
        id: str(user.id),
        email: str(user.email),
        full_name: str(user.full_name),
        created_at: str(user.created_at),
        last_sign_in_at: user.last_sign_in_at ? str(user.last_sign_in_at) : null,
      },
      range,
      // Izin nasil bulundugu — arayuz misafir gezintisini boyle etiketler.
      resolvedBy: byUser.length ? 'user_id' : 'order_ip',
      ips,
      summary: {
        orders_count: orders.length,
        total_spend: orders
          .filter((o) => str(o.payment_status) === 'paid')
          .reduce((a, o) => a + num(o.total), 0),
        requests: num(summaryRow?.requests),
        pages_visited: pages.length,
        first_seen: summaryRow?.first_seen ? str(summaryRow.first_seen) : null,
        last_seen: summaryRow?.last_seen ? str(summaryRow.last_seen) : null,
        active_days: num(summaryRow?.active_days),
      },
      pages: pages.map((p) => ({
        page: p.page,
        hits: p.hits,
        first_at: p.first_at,
        last_at: p.last_at,
      })),
      timeline: timeline.map((v) => ({
        page: v.page,
        started_at: v.started_at,
        ended_at: v.ended_at,
        requests: v.requests,
        ip: v.ip,
        actions: v.actions.slice(0, 8),
      })),
      devices: deviceRows.map((d) => ({
        label: describeDevice(str(d.user_agent)),
        user_agent: str(d.user_agent).slice(0, 300),
        ip: str(d.ip),
        hits: num(d.hits),
        last_at: str(d.last_at),
        country: d.country ? str(d.country) : null,
        city: d.city ? str(d.city) : null,
      })),
      orders: orders.map((o) => ({
        id: str(o.id),
        order_number: `WD${str(o.id).replace(/-/g, '')}`,
        total: num(o.total),
        status: str(o.status),
        payment_status: str(o.payment_status),
        created_at: str(o.created_at),
      })),
    };
  });
}
