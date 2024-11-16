// /* eslint-disable */

const DiscountType = (item, header) => {
    const { discountType } = header;
    const { quantity, unitPrice, discountAmount } = item;
    return discountType === 'GENERAL' ? (quantity * unitPrice) - discountAmount : (quantity * unitPrice);
};

const trimPayloadItems = (item) => {
    const { 
        totalVat, 
        itemSubtotal, 
        totalLevy, 
        exchangeRate, 
        businessPartnerTin, 
        userName,
        voucherAmount,
        businessPartnerName,
        groupReferenceId,
        purchaseOrderReference,
        currency,
        totalAmount,
        saleType,
        calculationType,
        flag,
        ...rest 
    } = item;
    return rest;
};

// Compute Export invoice
export const Export = (item, header) =>{
    if (item && header) {
        const { quantity, unitPrice, discountAmount, voucherAmount } = item;
        const { saleType} = header;
        if (!quantity || !unitPrice) { return item; }
        if (saleType === "EXPORT") {
            return {
                ...item,
                levyAmountA: 0,
                levyAmountB: 0,
                levyAmountC: 0,
                levyAmountD: 0,
                levyAmountE: 0,
                totalVat: 0,
                totalAmount: (quantity * unitPrice),
                discountAmount: discountAmount,
                voucherAmount: voucherAmount,
            }
        }
    }
}

// Calculate levy amounts and total VAT based on item category for exclusive tax
const LevyAndVat = (itemCategory, itemSubtotal, vatableAmount = 1, levyMapping) => {
    const exclusiveAmt = itemSubtotal / vatableAmount;
    // console.log(`levyMapping`, levyMapping);
    
    const levy = {
        levyAmountA: "",
        levyAmountB: "",
        levyAmountC: "",
        levyAmountD: "",
        levyAmountE: "",
        totalVat: 0,
        vatableAmt: 0
    };

    const levyPercentages = {
        nhil: 0.025,
        getfund: 0.025,
        covid: 0.01,
        cst: 0.05,
        tourism: 0.01
    };

    switch (itemCategory) {
        case "EXM":
            break;
        case "TRSM":
            if (levyMapping.tourism) levy.levyAmountA = levyPercentages.nhil * exclusiveAmt;
            if (levyMapping.cst) levy.levyAmountB = levyPercentages.getfund * exclusiveAmt;
            if (levyMapping.covid) levy.levyAmountC = levyPercentages.covid * exclusiveAmt;
            if (levyMapping.tourism) levy.levyAmountE = levyPercentages.tourism * exclusiveAmt;
            levy.vatableAmt = exclusiveAmt + levy.levyAmountA + levy.levyAmountB + levy.levyAmountC + levy.levyAmountE;
            levy.totalVat = (levyMapping.vatValue * 0.01) * levy.vatableAmt;
            break;
        case "CST":
            if (levyMapping.nhil) levy.levyAmountA = levyPercentages.nhil * exclusiveAmt;
            if (levyMapping.getfund) levy.levyAmountB = levyPercentages.getfund * exclusiveAmt;
            if (levyMapping.covid) levy.levyAmountC = levyPercentages.covid * exclusiveAmt;
            if (levyMapping.cst) levy.levyAmountD = levyPercentages.cst * exclusiveAmt;
            levy.vatableAmt = exclusiveAmt + levy.levyAmountA + levy.levyAmountB + levy.levyAmountC + levy.levyAmountD;
            levy.totalVat = (levyMapping.vatValue * 0.01) * levy.vatableAmt;
            break;
        case "RNT":
            if (levyMapping.covid) levy.levyAmountC = levyPercentages.covid * exclusiveAmt;
            levy.vatableAmt = exclusiveAmt;// + levy.levyAmountC;
            levy.totalVat = (levyMapping.vatValue * 0.01) * levy.vatableAmt;
            break;
        default:
            if (levyMapping.nhil) levy.levyAmountA = levyPercentages.nhil * exclusiveAmt;
            if (levyMapping.getfund) levy.levyAmountB = levyPercentages.getfund * exclusiveAmt;
            if (levyMapping.covid) levy.levyAmountC = levyPercentages.covid * exclusiveAmt;
            levy.vatableAmt = exclusiveAmt + levy.levyAmountA + levy.levyAmountB + levy.levyAmountC;
            levy.totalVat = (levyMapping.vatValue * 0.01) * levy.vatableAmt;
        break;
    }
    return levy;
};

// Calculate GRA vatable amount based on the category
const graVatable = (itemCategory) => {
    switch (itemCategory) {
        case "TRSM":
            return 1.229;
        case "CST":
            return 1.2765;
        case "RNT":
            return 1.0605;
        default:
            return 1.219;
    }
};

const InclusiveAndExclusive = (item, header, inclusiveVAT) => {
    if (!item || !header) return item;

    const { levyMapping } = header;
    const { quantity, unitPrice, discountAmount } = item;
    if (!quantity || !unitPrice) return item;

    const itemSubtotal = DiscountType(item, header);
    const vatableAmount = graVatable(levyMapping.itemCategory);
    
    const vatType = inclusiveVAT ? [levyMapping.itemCategory, itemSubtotal, vatableAmount, levyMapping] : [levyMapping.itemCategory, itemSubtotal, '', levyMapping];
    const { levyAmountA, levyAmountB, levyAmountC, levyAmountD, levyAmountE, totalVat } = LevyAndVat(...vatType);

    return {
        ...item,
        levyAmountA,
        levyAmountB,
        levyAmountC,
        levyAmountD,
        levyAmountE,
        totalVat,
        totalAmount: quantity * unitPrice,
        discountAmount,
    };
};

// Handle refund inclusive tax scenario
export const InclusiveTax = (item, header) => {
    return InclusiveAndExclusive(item, header, true);
};

// Handle refund exclusive tax scenario
export const ExclusiveTax = (item, header) => {
    return InclusiveAndExclusive(item, header, false);
};

// Compute taxes, levies in the header level of the payload
export const computeStandardTaxes = (header) => {
    const { calculationType, items, saleType } = header;
    let updatedItems;

    if(saleType === "EXPORT") {
            updatedItems = items.map(item => Export(item, header));
    } else {
        updatedItems =  calculationType === 'EXCLUSIVE' ?
        items.map(item => ExclusiveTax(item, header)) :
        items.map(item => InclusiveTax(item, header));
    }

    const totalLevy = updatedItems.reduce((total, item) =>
        total +
        parseFloat(item.levyAmountA || 0) +
        parseFloat(item.levyAmountB || 0) +
        parseFloat(item.levyAmountC || 0) +
        parseFloat(item.levyAmountD || 0) +
        parseFloat(item.levyAmountE || 0),
    0);
    const totalVat = updatedItems.reduce((total, item) => total + parseFloat(item.totalVat || 0), 0);
    const totalAmount = updatedItems.reduce((total, item) => total + parseFloat(item.totalAmount || 0), 0);
    const discountAmount = updatedItems.reduce((total, item) => total + parseFloat(item.discountAmount || 0), 0);
    
    const payload = {
        totalLevy: totalLevy.toFixed(2),
        totalVat: totalVat.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        discountAmount: (discountAmount).toFixed(2),
        items: updatedItems.map(trimPayloadItems),
    }
    return payload;
}
