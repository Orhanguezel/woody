/* theme_config.sql — Generic corporate site default theme */

SET NAMES utf8mb4;
SET time_zone = '+00:00';

DROP TABLE IF EXISTS `theme_config`;

CREATE TABLE `theme_config` (
  `id`         CHAR(36)     NOT NULL,
  `is_active`  TINYINT(1)   NOT NULL DEFAULT 1,
  `config`     MEDIUMTEXT   NOT NULL,
  `created_at` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `theme_config` (`id`, `is_active`, `config`, `created_at`, `updated_at`) VALUES (
  '00000000-0000-4000-8000-000000000001',
  1,
  '{
    "colors": {
      "primary":     "#006838",
      "secondary":   "#0A2B1E",
      "accent":      "#005230",
      "background":  "#F6FAF8",
      "foreground":  "#101E17",
      "muted":       "#ECF2EE",
      "mutedFg":     "#697A72",
      "border":      "#D4DDD8",
      "destructive": "#ef4444",
      "success":     "#22c55e",
      "navBg":       "#0A2B1E",
      "navFg":       "#FFFFFF",
      "footerBg":    "#0A2B1E",
      "footerFg":    "#E8EDEA"
    },
    "radius":     "0.5rem",
    "fontFamily": "DM Sans, sans-serif",
    "darkMode":   "light",

    "sections": [
      {
        "key":     "hero",
        "enabled": true,
        "order":   1,
        "label":   "Hero Bölümü",
        "colsLg":  1,
        "colsMd":  1,
        "colsSm":  1,
        "limit":   null,
        "variant": "static"
      },
      {
        "key":     "categories",
        "enabled": true,
        "order":   2,
        "label":   "Kategoriler",
        "colsLg":  6,
        "colsMd":  4,
        "colsSm":  3,
        "limit":   null,
        "variant": "scroll"
      },
      {
        "key":     "featured",
        "enabled": true,
        "order":   3,
        "label":   "Öne Çıkan Ürünler",
        "colsLg":  3,
        "colsMd":  2,
        "colsSm":  1,
        "limit":   6
      },
      {
        "key":     "recent",
        "enabled": true,
        "order":   4,
        "label":   "Son Ürünler",
        "colsLg":  3,
        "colsMd":  2,
        "colsSm":  1,
        "limit":   8
      },
      {
        "key":     "about_preview",
        "enabled": true,
        "order":   5,
        "label":   "Hakkımızda"
      },
      {
        "key":     "cta",
        "enabled": true,
        "order":   6,
        "label":   "İletişim CTA"
      }
    ],

    "pages": {
      "home": {
        "variant":   "default",
        "heroStyle": "static"
      },
      "products": {
        "variant":      "default",
        "defaultView":  "grid",
        "filtersStyle": "sidebar"
      },
      "product_detail": {
        "variant": "default"
      },
      "about":   { "variant": "centered" },
      "contact": { "variant": "default"  }
    }
  }',
  NOW(3),
  NOW(3)
);
