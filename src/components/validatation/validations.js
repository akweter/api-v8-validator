/* eslint-disable */

export function vldtCurrency(currency) {
  if (typeof currency === 'string' && currency.length > 2) {
    const regex = /^(AED|CAD|CNY|EUR|GBP|GHS|HKD|INR|JPY|LRD|NGN|USD|ZAR)$/;
    return regex.test(currency);
  }
  return false;
}

export function vldtExchangeRate(exchangeRate) {
  const regex = /^\d+(\.\d+)?$/;
  return regex.test(exchangeRate);
}

export function vldtInvoiceNumber(invoiceNumber) {
  if (invoiceNumber.length > 3) {
    const regex = /^[\w\d!@#$%^&*()_+-=]+$/;
    return regex.test(invoiceNumber);
  }
  return false;
}

export function vldtTotalLevy(totalLevy) {
  if (typeof totalLevy === 'number' && !isNaN(totalLevy)) {
    const regex = /^\d+(\.\d+)?$/;
    return regex.test(totalLevy.toString());
  }
  return false;
}

export function vldtUserName(userName) {
  const regex = /^[a-zA-Z0-9\s]{3,}$/;
  return regex.test(userName);
}

export function vldtFlag(flag) {
  const regex = /^(INVOICE|REFUND|REFUND_CANCELATION|PURCHASE|PURCHASE_CANCELATION|PARTIAL_REFUND)$/;
  return regex.test(flag);
}

export function vldtCalculationType(calculationType) {
  const regex = /^(INCLUSIVE|EXCLUSIVE)$/;
  return regex.test(calculationType);
}

export function vldtTotalVat(totalVat) {
  const regex = /^\d+(\.\d+)?$/;
  return regex.test(totalVat);
}

export function vldtTransactionDate(transactionDate) {
  const regex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}Z)?$/;
  return regex.test(transactionDate);
}

export function vldtTotalAmount(totalAmount) {
  const regex = /^\d+(\.\d+)?$/;
  return regex.test(totalAmount);
}

export function vldtVoucherAmount(voucherAmount) {
  const regex = /^(\d+(\.\d+)?)?$/;
  return regex.test(voucherAmount);
}

export function vldtBusinessPartnerName(businessPartnerName) {
  const regex = /^[\w\s!@#$%^&*()_+|~=`{}[\]:";'<>?,./-]{3,}$/;
  return regex.test(businessPartnerName);
}

export function vldtBusinessPartnerTin(businessPartnerTin) {
  const regex = /^(?:C000|GHA-|P000|V000|G000)[0-9xX]{7}(?:[0-9xX]{4})?$/;
  return regex.test(businessPartnerTin);
}

export function vldtSaleType(saleType) {
  const regex = /^(NORMAL|RENT)$/;
  return regex.test(saleType);
}

export function vldtDiscountType(discountType) {
  const regex = /^(GENERAL|SELECTIVE)$/;
  return regex.test(discountType);
}

export function vldtDiscountAmount(discountAmount) {
  const regex = /^\d+(\.\d+)?$/;
  return regex.test(discountAmount);
}
