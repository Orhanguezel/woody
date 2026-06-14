export type StoreProduct = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  image?: string;
  alt?: string;
  price: number;
  currency: string;
  categorySlug?: string;
  categoryName?: string;
  seriesSlug?: string;
  seriesName?: string;
  levelSlug?: string;
  levelName?: string;
  levelRank?: number | null;
  purchaseMode?: 'online' | 'quote';
  isFree?: boolean;
  accessDurationDays?: number | null;
  hasPhysical?: boolean;
  stock_quantity?: number;
  product_code?: string;
  meta_title?: string;
  meta_description?: string;
  contents?: StoreProductContent[];
};

export type StoreProductContent = {
  id: string;
  kind: 'digital' | 'physical';
  mediaType?: 'video' | 'pdf' | 'audio' | 'image' | 'other' | null;
  title: string;
  description?: string;
  isPreview: boolean;
  displayOrder: number;
};

export type StoreTaxonomyItem = {
  id: string;
  code?: string;
  slug: string;
  name: string;
  order?: number;
  rank?: number;
};

export type StoreTaxonomy = {
  categories: StoreTaxonomyItem[];
  series: StoreTaxonomyItem[];
  levels: StoreTaxonomyItem[];
};

export type StoreProductFilters = {
  category?: string;
  series?: string;
  level?: string;
  isFree?: boolean;
};

export type StoreUiCopy = Partial<Record<
  | 'addToCart'
  | 'address'
  | 'all'
  | 'back'
  | 'backToLibrary'
  | 'cart'
  | 'cartEmpty'
  | 'checkoutBusy'
  | 'checkoutFailed'
  | 'checkoutFailureDescription'
  | 'checkoutFailureTitle'
  | 'checkoutReturnToStore'
  | 'checkoutSuccessDescription'
  | 'checkoutSuccessTitle'
  | 'city'
  | 'classroomNote'
  | 'comingSoon'
  | 'content'
  | 'contents'
  | 'country'
  | 'digital'
  | 'district'
  | 'email'
  | 'free'
  | 'freeAddFailed'
  | 'freeAdding'
  | 'freeAdded'
  | 'freeWatch'
  | 'goToLibrary'
  | 'goToSeries'
  | 'goToStore'
  | 'heroSubtitle'
  | 'libraryDescription'
  | 'libraryEmpty'
  | 'libraryTitle'
  | 'loading'
  | 'locked'
  | 'login'
  | 'loginRequired'
  | 'name'
  | 'newTab'
  | 'notes'
  | 'open'
  | 'orderCreated'
  | 'orderReceivedIyzicoDisabled'
  | 'orderReceivedPaymentFailed'
  | 'payWithIyzico'
  | 'phone'
  | 'physical'
  | 'physicalShippingNote'
  | 'postalCode'
  | 'preview'
  | 'productDetail'
  | 'quoteCta'
  | 'refresh'
  | 'remainingDays'
  | 'requestQuote'
  | 'shippingAddressRequired'
  | 'shippingFieldsRequired'
  | 'storeEyebrow'
  | 'teacherSetNote'
  | 'termsAccept'
  | 'termsContract'
  | 'termsInfo'
  | 'termsKvkk'
  | 'termsKvkkAccept'
  | 'total'
  | 'unlimited'
  | 'unlimitedAccess'
  | 'viewerAudio'
  | 'viewerPdf'
  | 'viewerVideo',
  string
>>;
