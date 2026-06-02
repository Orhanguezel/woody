import type { FastifyInstance } from 'fastify';
import { registerAuth, registerUserAdmin } from '@shared/shared-backend/modules/auth';
import { registerStorage, registerStorageAdmin } from '@shared/shared-backend/modules/storage';
import { registerProfiles } from '@shared/shared-backend/modules/profiles';
import { registerSiteSettings, registerSiteSettingsAdmin } from '@shared/shared-backend/modules/siteSettings';
import { registerMenuItems, registerMenuItemsAdmin } from '@shared/shared-backend/modules/menuItems';
import { registerUserRoles } from '@shared/shared-backend/modules/userRoles';
import { registerTheme, registerThemeAdmin } from '@shared/shared-backend/modules/theme';
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
}

export async function registerSharedAdmin(adminApi: FastifyInstance) {
  await registerSiteSettingsAdmin(adminApi);
  await registerMenuItemsAdmin(adminApi);
  await registerUserAdmin(adminApi);
  await registerStorageAdmin(adminApi);
  await registerThemeAdmin(adminApi);
}
