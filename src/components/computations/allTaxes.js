// /* eslint-disable */

const DiscountType = (item, header) => {
    const { discountType } = header;
    const { quantity, unitPrice, discountAmount } = item;
    return discountType === 'GENERAL' ? (quantity * unitPrice) - discountAmount : (quantity * unitPrice);
};

/* 
    Remove certain fields from the items array
    At the moment this is a bug that will be fixed in future
    There should not be document level field slipped into item 
    level array.
*/
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
const LevyAndVat = (itemCategory, itemSubtotal, vatableAmount = 1) => {
    const exclusiveAmt = itemSubtotal / vatableAmount;
    const levy = {
        levyAmountA: "",
        levyAmountB: "",
        levyAmountC: "",
        levyAmountD: "",
        levyAmountE: "",
        totalVat: 0,
        vatableAmt: 0
    };
    switch (itemCategory) {
        case "EXM":
            break;
        case "TRSM":
            levy.levyAmountA = 0.025 * exclusiveAmt;
            levy.levyAmountB = 0.025 * exclusiveAmt;
            levy.levyAmountC = 0.01 * exclusiveAmt;
            levy.levyAmountE = 0.01 * exclusiveAmt;
            levy.vatableAmt = exclusiveAmt + levy.levyAmountA + levy.levyAmountB + levy.levyAmountC;
            levy.totalVat = 0.15 * levy.vatableAmt;
            break;
        case "CST":
            levy.levyAmountA = 0.025 * exclusiveAmt;
            levy.levyAmountB = 0.025 * exclusiveAmt;
            levy.levyAmountC = 0.01 * exclusiveAmt;
            levy.levyAmountD = 0.05 * exclusiveAmt;
            levy.vatableAmt = exclusiveAmt + levy.levyAmountA + levy.levyAmountB + levy.levyAmountC + levy.levyAmountD;
            levy.totalVat = 0.15 * levy.vatableAmt;
            break;
        case "RNT":
            levy.levyAmountC = 0.01 * exclusiveAmt;
            levy.vatableAmt = exclusiveAmt + levy.levyAmountC;
            levy.totalVat = 0.05 * levy.vatableAmt;
            break;
        default:
            levy.levyAmountA = 0.025 * exclusiveAmt;
            levy.levyAmountB = 0.025 * exclusiveAmt;
            levy.levyAmountC = 0.01 * exclusiveAmt;
            levy.vatableAmt = exclusiveAmt + levy.levyAmountA + levy.levyAmountB + levy.levyAmountC;
            levy.totalVat = 0.15 * levy.vatableAmt;
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

// // handle refund inclusive tax scenario
// export const InclusiveTax = (item, header) => {
//     if (!item || !header) return item;

//     const { saleType } = header;
//     const { quantity, unitPrice, discountAmount, itemCategory } = item;

//     if (!quantity || !unitPrice) return item;

//     const itemSubtotal = DiscountType(item, header);
//     const vatableAmount = graVatable(itemCategory);
//     const { levyAmountA, levyAmountB, levyAmountC, levyAmountD, levyAmountE, totalVat } = LevyAndVat(itemCategory, itemSubtotal, vatableAmount);

//     return {
//         ...item,
//         levyAmountA: levyAmountA,
//         levyAmountB: levyAmountB,
//         levyAmountC: levyAmountC,
//         levyAmountD: levyAmountD,
//         levyAmountE: levyAmountE,
//         totalVat: totalVat,
//         totalAmount: quantity * unitPrice,
//         discountAmount: discountAmount,
//     };
// };

// // handle refund exclusive tax scenario
// export const ExclusiveTax = (item, header) => {
//     if (!item || !header) return item;

//     const { saleType } = header;
//     const { quantity, unitPrice, itemCategory, discountAmount } = item;

//     if (!quantity || !unitPrice) return item;

//     const itemSubtotal = DiscountType(item, header);
//     const { levyAmountA, levyAmountB, levyAmountC, levyAmountD, levyAmountE, totalVat } = LevyAndVat(itemCategory, itemSubtotal);

//     return {
//         ...item,
//         levyAmountA: levyAmountA,
//         levyAmountB: levyAmountB,
//         levyAmountC: levyAmountC,
//         levyAmountD: levyAmountD,
//         levyAmountE: levyAmountE,
//         totalVat: totalVat,
//         totalAmount: quantity * unitPrice,
//         discountAmount: discountAmount,
//     };
// };

const InclusiveAndExclusive = (item, header, inclusiveVAT) => {
    if (!item || !header) return item;

    const { quantity, unitPrice, itemCategory, discountAmount } = item;
    if (!quantity || !unitPrice) return item;

    const itemSubtotal = DiscountType(item, header);
    const vatableAmount = graVatable(itemCategory);
    
    const vatType = inclusiveVAT ? [itemCategory, itemSubtotal, vatableAmount] : [itemCategory, itemSubtotal];
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
