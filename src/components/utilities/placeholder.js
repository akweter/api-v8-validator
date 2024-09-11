export const PlaceHolder = {
    value: `
    {
        "currency": "GHS",
        "exchangeRate": 1.0,
        "invoiceNumber": "WG0012-32",
        "totalLevy": 63.99,
        "userName": "Yakubu James",
        "flag": "INVOICE",
        "calculationType": "INCLUSIVE",
        "totalVat": 169.57,
        "transactionDate": "2023-07-24T08:43:28Z",
        "totalAmount": 1300.0,
        "voucherAmount": 0.0,
        "businessPartnerName": "Stan(cash customer)",
        "businessPartnerTin": "C0000000000",
        "saleType": "NORMAL",
        "discountType": "GENERAL",
        "discountAmount": 0.0,
        "reference": "1234stan",
        "groupReferenceId": "",
        "purchaseOrderReference": "",
        "items": [
            {
                "itemCode": "FS023H",
                "itemCategory": "",
                "expireDate": "2025-01-01",
                "description": "EPS SHEET",
                "quantity": 10.0,
                "levyAmountA": 26.66,
                "levyAmountB": 26.66,
                "levyAmountC": 10.66,
                "levyAmountD": 0.0,
                "levyAmountE": 0.0,
                "discountAmount": 0.0,
                "batchCode": "",
                "unitPrice": 130.0
            }
        ]
    }
`}

// GRA header payload structure
export const payloadStructure = {
    currency: "GHS",
    exchangeRate: "1.0",
    invoiceNumber: "",
    totalLevy: "",
    userName: "",
    flag: "INVOICE",
    calculationType: "INCLUSIVE",
    totalVat: "",
    transactionDate: "",
    totalAmount: "",
    voucherAmount: "",
    businessPartnerName: "",
    businessPartnerTin: "",
    saleType: "NORMAL",
    discountType: "GENERAL",
    discountAmount: "",
    reference: "",
    groupReferenceId: "",
    purchaseOrderReference: "",
    items: []
}

// GRA Item payload structure
export const itemlistPayload = {
    itemCode: "",
    itemCategory: "",
    expireDate: "",
    description: "",
    quantity: "",
    levyAmountA: "",
    levyAmountB: "",
    levyAmountC: "",
    levyAmountD: "",
    levyAmountE: "",
    discountAmount: 0.00,
    batchCode: "",
    unitPrice: "",
    itemSubtotal: "",
    totalVat: "",
    totalLevy: "",
    totalAmount: ""
}
