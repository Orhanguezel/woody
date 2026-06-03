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
import { registerFooterSectionsPublic, registerPopupsPublicStub } from '@/modules/footerStub';

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
}
