// Magaza guvence satiri (teslimat / iade / odeme) — checkout ve urun detayinda ortak.
// Sayfa hedefleri CMS custom_pages (module_key shipping / refund); metin 10 dil.
export type StoreAssurance = { shipping: string; returns: string; payment: string };

export const STORE_ASSURANCE: Record<string, StoreAssurance> = {
  tr: { shipping: 'Teslimat ve kargo bilgileri', returns: 'İptal, iade ve geri ödeme', payment: 'PayTR ile güvenli kart ödemesi' },
  en: { shipping: 'Delivery and shipping information', returns: 'Cancellation, returns and refunds', payment: 'Secure card payment with PayTR' },
  de: { shipping: 'Liefer- und Versandinformationen', returns: 'Widerruf, Rückgabe und Erstattung', payment: 'Sichere Kartenzahlung mit PayTR' },
  ar: { shipping: 'معلومات الشحن والتسليم', returns: 'الإلغاء والإرجاع واسترداد الأموال', payment: 'دفع آمن بالبطاقة عبر PayTR' },
  fr: { shipping: 'Informations de livraison et d’expédition', returns: 'Annulation, retours et remboursements', payment: 'Paiement sécurisé par carte avec PayTR' },
  ru: { shipping: 'Информация о доставке', returns: 'Отмена, возврат и возмещение', payment: 'Безопасная оплата картой через PayTR' },
  es: { shipping: 'Información de entrega y envío', returns: 'Cancelaciones, devoluciones y reembolsos', payment: 'Pago seguro con tarjeta mediante PayTR' },
  it: { shipping: 'Informazioni su consegna e spedizione', returns: 'Annullamenti, resi e rimborsi', payment: 'Pagamento sicuro con carta tramite PayTR' },
  nl: { shipping: 'Informatie over levering en verzending', returns: 'Annulering, retouren en terugbetaling', payment: 'Veilige kaartbetaling via PayTR' },
  'pt-br': { shipping: 'Informações de entrega e envio', returns: 'Cancelamentos, devoluções e reembolsos', payment: 'Pagamento seguro com cartão via PayTR' },
};

export function storeAssurance(locale: string): StoreAssurance {
  return STORE_ASSURANCE[String(locale || '').toLowerCase()] || STORE_ASSURANCE.en;
}

/** CMS yasal sayfa yollari (custom_pages slug'lari tum dillerde ayni). */
export function assuranceHrefs(locale: string) {
  return { shipping: `/${locale}/teslimat-ve-kargo`, returns: `/${locale}/iade-cayma` };
}
