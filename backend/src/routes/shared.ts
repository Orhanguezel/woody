import type { FastifyInstance } from 'fastify';
import { registerAuth, registerUserAdmin } from '@shared/shared-backend/modules/auth';
import { registerStorage, registerStorageAdmin } from '@shared/shared-backend/modules/storage';
import { registerProfiles } from '@shared/shared-backend/modules/profiles';
import { registerSiteSettings, registerSiteSettingsAdmin } from '@shared/shared-backend/modules/siteSettings';
import { registerMenuItems, registerMenuItemsAdmin } from '@shared/shared-backend/modules/menuItems';
import { registerUserRoles } from '@shared/shared-backend/modules/userRoles';
import { registerTheme, registerThemeAdmin } from '@shared/shared-backend/modules/theme';
import { registerCategories, registerCategoriesAdmin } from '@shared/shared-backend/modules/categories';
import { registerOrders, registerOrdersAdmin } from '@shared/shared-backend/modules/orders';
import { registerBlog, registerBlogAdmin } from '@shared/shared-backend/modules/blog';
import { registerSubCategories } from '@shared/shared-backend/modules/subcategories/router';
import { registerSubCategoriesAdmin } from '@shared/shared-backend/modules/subcategories/admin.routes';
import { registerProducts } from '@shared/shared-backend/modules/products/router';
import { registerProductsAdmin } from '@shared/shared-backend/modules/products/admin.routes';
import { registerMail } from '@shared/shared-backend/modules/mail-api';
import { registerCustomPages, registerCustomPagesAdmin } from '@shared/shared-backend/modules/customPages';
import { registerFooterSectionsPublic, registerPopupsPublicStub } from '@/modules/footerStub';
// Sosyal medya & pazarlama entegrasyonları (yalnızca admin)
import { registerTwitterAdmin } from '@shared/shared-backend/modules/twitter';
import { registerGoogleAdsAdmin } from '@shared/shared-backend/modules/googleAds';
import { registerSearchConsoleAdmin } from '@shared/shared-backend/modules/searchConsole';
import { registerGa4Admin } from '@shared/shared-backend/modules/ga4';
import { registerGtmAdmin } from '@shared/shared-backend/modules/gtm';
import { registerGoogleConnectAdmin } from '@shared/shared-backend/modules/googleConnect';
import { registerMetaAdmin } from '@shared/shared-backend/modules/meta';

export async function registerSharedPublic(api: FastifyInstance) {
  await registerAuth(api);
  await registerStorage(api);
  await registerSiteSettings(api);
  await registerMenuItems(api);
  await registerFooterSectionsPublic(api);
  await registerPopupsPublicStub(api);
  await registerUserRoles(api);
  await registerTheme(api);
  await registerProfiles(api);
  await registerCategories(api);
  await registerSubCategories(api);
  await registerProducts(api);
  await registerOrders(api);
  await registerBlog(api);
  // POST /api/v1/mail/test + /mail/send — admin panel SMTP test/gonderim (requireAuth)
  await registerMail(api);
  // GET /api/v1/custom-pages — yasal metinler + kurumsal sayfalar (CMS, public)
  await registerCustomPages(api);
}

export async function registerSharedAdmin(adminApi: FastifyInstance) {
  await registerSiteSettingsAdmin(adminApi);
  await registerMenuItemsAdmin(adminApi);
  await registerUserAdmin(adminApi);
  await registerStorageAdmin(adminApi);
  await registerThemeAdmin(adminApi);
  await registerCategoriesAdmin(adminApi);
  await registerSubCategoriesAdmin(adminApi);
  await registerProductsAdmin(adminApi);
  await registerOrdersAdmin(adminApi);
  await registerBlogAdmin(adminApi);
  // CMS custom pages (yasal metinler + kurumsal sayfalar) — admin CRUD
  await registerCustomPagesAdmin(adminApi);
  // Sosyal medya & pazarlama entegrasyonları
  await registerTwitterAdmin(adminApi);
  await registerGoogleAdsAdmin(adminApi);
  await registerSearchConsoleAdmin(adminApi);
  await registerGa4Admin(adminApi);
  await registerGtmAdmin(adminApi);
  await registerGoogleConnectAdmin(adminApi);
  await registerMetaAdmin(adminApi);
}
