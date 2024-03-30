/* eslint-disable */

import {
    vldtCurrency,
    vldtExchangeRate,
    vldtInvoiceNumber,
    vldtTotalLevy,
    // vldtUserName,
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

const isTransactionDateValid = (transactionDate) => {
    const transactionDateTime = new Date(transactionDate);
    const currentDate = new Date();
    if (transactionDateTime > currentDate) {
        return false;
    }
    const diffMonths = (currentDate.getFullYear() - transactionDateTime.getFullYear()) * 12 + currentDate.getMonth() - transactionDateTime.getMonth();

    if (diffMonths > 6) {
        return false;
    }
};

const ValidateHeaderFields = (payload) => {
    let errors = [];

    if (payload) {
        const {
            currency,
            exchangeRate,
            invoiceNumber,
            totalLevy,
            // userName, 
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

        const keyValues = [
            'currency',
            'exchangeRate',
            'invoiceNumber',
            'totalLevy',
            'userName',
            'flag',
            'calculationType',
            'totalVat',
            'transactionDate',
            'totalAmount',
            'voucherAmount',
            'businessPartnerName',
            'businessPartnerTin',
            'saleType',
            'discountType',
            'discountAmount',
            'reference',
            'groupReferenceId',
            'purchaseOrderReference',
            'items'
        ];
        const paylLoadFields = keyValues.filter(field => !(field in payload));

        if (paylLoadFields.length > 0) {
            errors.push(`Missing field (${paylLoadFields.join(', ')}) in the header part of the payload`);
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
                errors.push(`Invoice number should be more than 4 characters and no spaces allowed`);
            }
            // Total Levy
            if (vldtTotalLevy(totalLevy) === false) {
                errors.push(`Total Levy should be numeric`);
            }
            // Username
            // if (vldtUserName(userName) === false) {
            //     errors.push(`Username should not have symbols or whitespace`);
            // }
            // flag
            if (vldtFlag(flag) === false) {
                errors.push('Flag should be either INVOICE, REFUND, REFUND_CANCELATION, PURCHASE, PURCHASE_CANCELATION');
            }
            // Calculation Type
            if (vldtCalculationType(calculationType) === false) {
                errors.push(`CalculationType should be either INCLUSIVE or EXCLUSIVE without WHITESPACE`);
            }
            // Total VAT
            if (vldtTotalVat(totalVat) === false) {
                errors.push(`Total VAT should be numeric`);
            }
            // Transaction Date
            if (vldtTransactionDate(transactionDate) === false) {
                errors.push(`Transaction Date format should be (yyyy-mm-dd) or (UTC) Eg. (2023-11-20) or (2023-01-20T08:43:28Z)`);
            }
            else {
                if (isTransactionDateValid(transactionDate) === false) {
                    errors.push(`Transaction date cannot be less than six month from now or greater than today's date`);
                }
            }

            // Total Amount
            if (vldtTotalAmount(totalAmount) === false) {
                errors.push(`Total amount should be numeric `);
            }
            // Voucher Amount
            if (vldtVoucherAmount(voucherAmount) === false) {
                errors.push(`Voucher amount should be numeric`);
            }
            // Business Partner Name
            if (vldtBusinessPartnerName(businessPartnerName) === false) {
                errors.push(`The pattern for Business Partner Name is incorrect`);
            }
            // Business Partner Tin
            if (vldtBusinessPartnerTin(businessPartnerTin) === false) {
                errors.push(`Business Partner Tin should only be 11 or 15 character long without space`);
            }
            // Sales Type
            if (vldtSaleType(saleType) === false) {
                errors.push(`Allowed Sale Type values are NORMAL, EXPORT, EXEMPTED`);
            }
            // Discount Type
            if (vldtDiscountType(discountType) === false) {
                errors.push(`Allowed Discount Type values are GENERAL, SELECTIVE`);
            }
            // Discount Amount
            if (vldtDiscountAmount(discountAmount) === false) {
                errors.push(`Discount Amount should be numeric`);
            }
        }
    }
    if (errors.length > 0) {
        return errors;
    }
}

export default ValidateHeaderFields;