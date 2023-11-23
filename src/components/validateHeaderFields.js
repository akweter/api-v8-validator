import {
    vldtCurrency,
    vldtExchangeRate,
    vldtInvoiceNumber,
    vldtTotalLevy,
    vldtUserName,
    vldtFlag,
    vldtCalculationType,
    vldtTotalVat,
    vldtTransactionDate,
    vldtTotalAmount,
    vldtVoucherAmount,
    vldtBusinessPartnerName,
    vldtBusinessPartnerTin,
    vldtSaleType,
    vldtDiscountType,
    vldtDiscountAmount,
} from './validations';

const ValidateHeaderFields = (payload) =>{
    let errors = [];

    if (payload) {
        const {
            currency, 
            exchangeRate, 
            invoiceNumber, 
            totalLevy, 
            userName, 
            flag, 
            calculationType, 
            totalVat, 
            transactionDate, 
            totalAmount, 
            voucherAmount, 
            businessPartnerName, 
            businessPartnerTin, 
            saleType, 
            discountType, 
            discountAmount, 
        } = payload;

        const keyValues = ['currency', 'exchangeRate', 'invoiceNumber', 'totalLevy', 'userName', 'flag', 'calculationType', 'totalVat', 'transactionDate', 'totalAmount', 'voucherAmount', 'businessPartnerName', 'businessPartnerTin', 'saleType', 'discountType', 'discountAmount', 'reference', 'groupReferenceId', 'purchaseOrderReference', 'items'];
        const paylLoadFields = keyValues.filter(field => !(field in payload));

        if (paylLoadFields.length > 0) {
            errors.push(`Incorrect ${paylLoadFields.join(' ')} field`);
        }
        else {
            // Currency
            if (vldtCurrency(currency) === false) {
                errors.push(`Allowed Currencies are: "GHS", "EUR", "GBP", "USD"`);
            }
            // Exchange Rate
            if (vldtExchangeRate(exchangeRate) === false) {
                errors.push(`Exchange Rate: Should be number and non negative`);
            }
            // Invoice Numver
            if (vldtInvoiceNumber(invoiceNumber) === false) {
                errors.push(`Invoice N0: Should be more than 4 chars and no spaces allowed`);
            }
            // Total Levy
            if (vldtTotalLevy(totalLevy) === false) {
                errors.push(`Total Levy: Incorrect and Invalid`);
            }
            // Username
            if (vldtUserName(userName) === false) {
                errors.push(`Username: cannot have symbols`);
            }
            // flag
            if (vldtFlag(flag) === false) {
                errors.push('Invalid Flag. It only be INVOICE, REFUND, REFUND_CANCELATION, PURCHASE, PURCHASE_CANCELATION');
            }
            // Calculation Type
            if (vldtCalculationType(calculationType) === false) {
                errors.push(`CalculationType: Invalid Type: It can only be INCLUSIVE or EXCLUSIVE without WHITESPACE`);
            }
            // Total VAT
            if (vldtTotalVat(totalVat) === false) {
                errors.push(`Total VAT: Invalid VAt value`);
            }
            // Transaction Date
            if (vldtTransactionDate(transactionDate) === false) {
                errors.push(`Transaction Date: Date format can only be (yyyy-mm-dd) or (UTC time)`);
            }
            // Total Amount
            if (vldtTotalAmount(totalAmount) === false) {
                errors.push(`Total Amount: The Total Amount should be: 0.0 `);
            }
            // Voucher Amount
            if (vldtVoucherAmount(voucherAmount) === false) {
                errors.push(`Voucher Amount: Incorrect Pattern`);
            }
            // Business Partner Name
            if (vldtBusinessPartnerName(businessPartnerName) === false) {
                errors.push(`B. Partner Name: Incorrect Values`);
            }
            // Business Partner Tin
            if (vldtBusinessPartnerTin(businessPartnerTin) === false) {
                errors.push(`B. Partner Tin: Can only be 11 or 15 chars without space`);
            }
            // Sales Type
            if (vldtSaleType(saleType) === false) {
                errors.push(`Sale Type: Invalid Sales Type. Allowed value are NORMAL, EXPORT, EXEMPTED`);
            }
            // Discount Type
            if (vldtDiscountType(discountType) === false) {
                errors.push(`Discount Type: Invalid Discount Type. Allowed values are GENERAL, SELECTIVE`);
            }
            // Discount Amount
            if (vldtDiscountAmount(discountAmount) === false) {
                errors.push(`Discount Amount: Should be number`);
            }
        }
    }
    else {
        errors.push('Please provide valid payload');
    }
    // ValidateHeaderFields
    if (errors.length > 0) {
        return errors;
    }
}

export default ValidateHeaderFields;