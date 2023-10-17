  export function vldtCurrency(currency) {
    if (typeof currency === 'string' && currency.length > 2) {
      const regex = /^(GHS|EUR|GBP|USD)$/;
      return regex.test(currency);
    } else {
      return false;
    }
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
    if (totalLevy.length > 0 || typeof totalLevy === 'number' && !isNaN(totalLevy)) {
      const regex = /^\d+(\.\d+)?$/;
      return regex.test(totalLevy.toString());
    } else {
      return false; // Not a number
    }
  }
  
  export function vldtUserName(userName) {
    const regex = /^[a-zA-Z0-9\s]{3,}$/;
    return regex.test(userName);
  }
  
  export function vldtFlag(flag) {
    const regex = /^(INVOICE|REFUND|REFUND_CANCELATION|PURCHASE|PURCHASE_CANCELATION)$/;
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
    const regex = /^[\w\s!@#$%^&*()_+|~=`{}\[\]:";'<>?,.\/-]{3,}$/;
    return regex.test(businessPartnerName);
  }
  
  export function vldtBusinessPartnerTin(businessPartnerTin) {
    const regex = /^C[0-9xX]{10}(?:[0-9xX]{4})?$/;
    return regex.test(businessPartnerTin);
  }
  
  export function vldtSaleType(saleType) {
    const regex = /^(NORMAL|EXPORT|EXEMPTED)$/;
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
  
  export function vldtReference(reference) {
    return true; // Allow empty string
  }
  
  export function vldtGroupReferenceId(groupReferenceId) {
    return true; // Allow empty string
  }
  
  export function vldtPurchaseOrderReference(purchaseOrderReference) {
    return true; // Allow empty string
  }
  
  export function vldtItemCode(itemCode) {
    const regex = /^[\w\s\d!@#$%^&*()_+-=]+$/;
    return regex.test(itemCode) && !/\s/.test(itemCode);
  }
  
  export function vldtItemCategory(itemCategory) {
    const regex = /^(EXM||CST|TRSM)$/;
    return regex.test(itemCategory);
  }
  
  export function vldtExpireDate(expireDate) {
    return true; // Allow empty string
  }
  
  export function vldtDescription(description) {
    const regex = /^[\w\s\d!@#$%^&*()_+-=]+$/;
    return regex.test(description) && description.length >= 4;
  }
  
  export function vldtQuantity(quantity) {
    const regex = /^\d+$/;
    return regex.test(quantity);
  }
  
  export function vldtLevyAmountA(levyAmountA, subTotal) {
    const regex = /^\d+(\.\d+)?$/;
    return regex.test(levyAmountA) && Number(levyAmountA) === 0.025 * subTotal;
  }
  
  export function vldtLevyAmountB(levyAmountB, subTotal) {
    const regex = /^\d+(\.\d+)?$/;
    return regex.test(levyAmountB) && Number(levyAmountB) === 0.025 * subTotal;
  }
  
  export function vldtLevyAmountC(levyAmountC, subTotal) {
    const regex = /^\d+(\.\d+)?$/;
    return regex.test(levyAmountC) && Number(levyAmountC) === 0.01 * subTotal;
  }
  
  export function vldtLevyAmountD(levyAmountD, itemCategory, subTotal) {
    if (itemCategory === 'CST') {
      const regex = /^\d+(\.\d+)?$/;
      return regex.test(levyAmountD) && Number(levyAmountD) === 0.05 * subTotal;
    } else {
      return levyAmountD === '';
    }
  }
  
  export function vldtLevyAmountE(levyAmountE, itemCategory, subTotal) {
    if (itemCategory === 'TRSM') {
      const regex = /^\d+(\.\d+)?$/;
      return regex.test(levyAmountE) && Number(levyAmountE) === 0.01 * subTotal;
    } else {
      return levyAmountE === '';
    }
  }
  
  export function vldtDiscountAmountItem(discountAmountItem) {
    const regex = /^(\d+(\.\d+)?)?$/;
    // return regex.test(discount);
  }
