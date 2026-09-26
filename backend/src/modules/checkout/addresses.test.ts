import { describe, expect, test } from 'bun:test';

import { AddressError, isValidTcIdentity, normalizeAddress, normalizeBilling } from './addresses';

const shippingInput = { name: 'Ada Yılmaz', phone: '0532 000 00 00', address: 'Akkent Mah. 7. Cadde No: 7', city: 'Mersin', district: 'Yenişehir' };

describe('checkout addresses', () => {
  test('TC kimlik kontrol hanesi doğrulanır', () => {
    expect(isValidTcIdentity('10000000146')).toBe(true);
    expect(isValidTcIdentity('10000000147')).toBe(false);
    expect(isValidTcIdentity('01234567890')).toBe(false);
    expect(isValidTcIdentity('123')).toBe(false);
  });

  test('fiziksel üründe teslimat adresi zorunlu, dijitalde değil', () => {
    expect(() => normalizeAddress({ name: 'A' }, true)).toThrow(AddressError);
    expect(normalizeAddress({}, false)).toBeNull();
    expect(normalizeAddress(shippingInput, true)?.country).toBe('TR');
  });

  test('fatura teslimat adresiyle aynı olabilir; TC isteğe bağlı ama girilirse geçerli olmalı', () => {
    const shipping = normalizeAddress(shippingInput, true);
    const billing = normalizeBilling({ sameAsShipping: true, invoiceType: 'individual' }, shipping);
    expect(billing.address).toBe(shippingInput.address);
    expect(billing.invoiceType).toBe('individual');
    expect(() => normalizeBilling({ sameAsShipping: true, identityNumber: '11111111112' }, shipping)).toThrow('billing_identity_invalid');
    expect(normalizeBilling({ sameAsShipping: true, identityNumber: '100 000 001 46' }, shipping).identityNumber).toBe('10000000146');
  });

  test('kurumsal fatura unvan, vergi dairesi ve 10 haneli vergi no ister', () => {
    const shipping = normalizeAddress(shippingInput, true);
    expect(() => normalizeBilling({ sameAsShipping: true, invoiceType: 'corporate', companyName: 'Okul Ltd' }, shipping)).toThrow('billing_company_required');
    expect(() => normalizeBilling({ sameAsShipping: true, invoiceType: 'corporate', companyName: 'Okul Ltd', taxOffice: 'Mersin', taxNumber: '123' }, shipping)).toThrow('billing_tax_number_invalid');
    const corp = normalizeBilling({ sameAsShipping: true, invoiceType: 'corporate', companyName: 'Okul Ltd', taxOffice: 'Mersin', taxNumber: '1234567890', identityNumber: '10000000146' }, shipping);
    expect(corp.taxNumber).toBe('1234567890');
    expect(corp.identityNumber).toBe('');
  });

  test('dijital siparişte fatura adresi ayrıca girilmeli', () => {
    expect(() => normalizeBilling({ sameAsShipping: true, name: 'Ada' }, null)).toThrow('billing_address_required');
    expect(normalizeBilling({ name: 'Ada', address: 'Adres', city: 'Mersin' }, null).fullName).toBe('Ada');
  });
});
