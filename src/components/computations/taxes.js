/* eslint-disable */

// compute general and selective discount
const handleDiscountSubtotal = (items, payload) => {
    const { discountType } = payload;
    const { quantity, unitPrice, discountAmount } = items;
    return discountType === "GENERAL" ? quantity * (unitPrice - discountAmount) : quantity * unitPrice;
}

// perform inclusive VAT computations
const handleInclusiveTaxes = (items, payload) => {
    if (items) {
        const updatedItems = items.map((item) => {
            const itemSubtotal = handleDiscountSubtotal(item, payload);
            const {
                itemCode,
                itemCategory, 
                expireDate,
                description,
                quantity,
                unitPrice, 
                batchCode,
                discountAmount,
            } = item;

            const graValue = itemSubtotal / 1.219;
            let levyAmountA, levyAmountB, levyAmountC, levyAmountD, levyAmountE, totalVat, vatableAmt;

            if (itemCategory === "") {
                levyAmountA = levyAmountB = (2.5 / 100) * graValue;
                levyAmountC = (1 / 100) * graValue;
                levyAmountD = levyAmountE = "";
                vatableAmt = graValue + levyAmountA + levyAmountB + levyAmountC + levyAmountD + levyAmountE;
                totalVat = 0.15 * vatableAmt;
            }
            else if (itemCategory === "EXM") {
                levyAmountA = levyAmountB = levyAmountC = levyAmountD = levyAmountE = totalVat = "";
            }
            else if (itemCategory === "TRSM") {
                const graValueTRSM = itemSubtotal / 1.229;
                levyAmountA = levyAmountB = (2.5 / 100) * graValueTRSM;
                levyAmountC = (1 / 100) * graValueTRSM;
                levyAmountD = "";
                levyAmountE = (1 / 100) * graValueTRSM;
                vatableAmt = graValueTRSM + levyAmountA + levyAmountB + levyAmountC;
                totalVat = (15 / 100) * vatableAmt;
            }
            else if (itemCategory === "CST") {
                const graValueCST = itemSubtotal / 1.2765;
                levyAmountA = levyAmountB = (2.5 / 100) * graValueCST;
                levyAmountC = (1 / 100) * graValueCST;
                levyAmountD = (5 / 100) * graValueCST;
                levyAmountE = "";
                vatableAmt = graValueCST + levyAmountA + levyAmountB + levyAmountC + levyAmountD;
                totalVat = (15 / 100) * vatableAmt;
            }
            return {
                ...item,
                itemCode,
                itemCategory,
                expireDate,
                description,
                quantity,
                levyAmountA: levyAmountA,
                levyAmountB: levyAmountB,
                levyAmountC: levyAmountC,
                levyAmountD: levyAmountD,
                levyAmountE: levyAmountE,
                vatValue: totalVat,
                unitPrice,
                discountAmount: discountAmount,
                batchCode,
            };
        });
        return updatedItems;
    }
};

// Perform Exclusive Taxes
const handleExclusiveTaxes = (items, payload) => {
    if (items) {
        const updatedItems = items.map((item) => {
            const itemSubtotal = handleDiscountSubtotal(item, payload);
            const {
                itemCode,
                itemCategory, 
                expireDate,
                description,
                quantity,
                unitPrice, 
                batchCode,
                discountAmount,
            } = item;

            let levyAmountA, levyAmountB, levyAmountC, levyAmountD, levyAmountE, totalVat, vatableAmt;

            if (itemCategory === "") {
                levyAmountA = levyAmountB = (2.5 / 100) * itemSubtotal;
                levyAmountC = (1 / 100) * itemSubtotal;
                levyAmountD = levyAmountE = "";
                vatableAmt = itemSubtotal + levyAmountA + levyAmountB + levyAmountC + levyAmountD + levyAmountE;
                totalVat = 0.15 * vatableAmt;
            }
            else if (itemCategory === "EXM") {
                levyAmountA = levyAmountB = levyAmountC = levyAmountD = levyAmountE = totalVat = "";
            }
            else if (itemCategory === "TRSM") {
                levyAmountA = levyAmountB = (2.5 / 100) * itemSubtotal;
                levyAmountC = (1 / 100) * itemSubtotal;
                levyAmountD = "";
                levyAmountE = (1 / 100) * itemSubtotal;
                vatableAmt = itemSubtotal + levyAmountA + levyAmountB + levyAmountC;
                totalVat = 0.15 * vatableAmt;
            }
            else if (itemCategory === "CST") {
                levyAmountA = levyAmountB = (2.5 / 100) * itemSubtotal;
                levyAmountC = (1 / 100) * itemSubtotal;
                levyAmountD = (5 / 100) * itemSubtotal;
                levyAmountE = "";
                vatableAmt = itemSubtotal + levyAmountA + levyAmountB + levyAmountC + levyAmountD;
                totalVat = 0.15 * vatableAmt;
            }
            return {
                ...item,
                itemCode,
                itemCategory,
                expireDate,
                description,
                quantity,
                levyAmountA: levyAmountA,
                levyAmountB: levyAmountB,
                levyAmountC: levyAmountC,
                levyAmountD: levyAmountD,
                levyAmountE: levyAmountE,
                vatValue: totalVat,
                unitPrice,
                discountAmount: discountAmount,
                batchCode,
            };
        });
        return updatedItems;
    }
};

// Perform final computation
export const performComputations = (payload, setOurPayload, GetReady) => {
    const {
        currency,
        exchangeRate,
        invoiceNumber,
        userName,
        flag,
        items,
        calculationType,
        businessPartnerName,
        businessPartnerTin,
        transactionDate,
        saleType,
        discountType,
        reference,
        groupReferenceId,
        purchaseOrderReference,
    } = payload;

    const Data = calculationType === "INCLUSIVE" ? handleInclusiveTaxes(items, payload) : handleExclusiveTaxes(items, payload);

    // Compute final/total taxes and levies
    const totalLevy = Data.reduce((total, item) =>
        total +
        parseFloat(item.levyAmountA || 0) +
        parseFloat(item.levyAmountB || 0) +
        parseFloat(item.levyAmountC || 0) +
        parseFloat(item.levyAmountD || 0) +
        parseFloat(item.levyAmountE || 0),
        0);

    const totalVat = Data.reduce(
        (total, item) => total + parseFloat(item.vatValue || 0), 0);

    const totalAmount = Data.reduce((total, item) => 
        total + 
        parseFloat(item.quantity || 0) * 
        parseFloat(item.unitPrice || 0),
        0);

    const voucherAmount = Data.reduce(
        (total, item) => total + parseFloat(item.voucherAmount || 0), 0);

    const discountAmount = Data.reduce(
        (total, item) => total + parseFloat(item.discountAmount || 0), 0);

    setOurPayload((state) => ({
        ...state,
        currency,
        exchangeRate,
        invoiceNumber,
        totalLevy: totalLevy.toFixed(4),
        userName,
        flag,
        calculationType,
        totalVat: totalVat.toFixed(4),
        transactionDate,
        totalAmount: totalAmount.toFixed(4),
        voucherAmount: voucherAmount.toFixed(4),
        businessPartnerName,
        businessPartnerTin,
        saleType,
        discountType,
        discountAmount: (discountAmount).toFixed(4),
        reference,
        groupReferenceId,
        purchaseOrderReference,
        items: Data
    }));
    GetReady(true);
};
