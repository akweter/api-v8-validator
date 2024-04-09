/* eslint-disable */

const isValidNumber = (value) => {
    return !isNaN(Number(value));
};

const ValidateItems = (payload) => {
    let errors = [];
    const itemCodes = new Set();
    const descriptions = new Set();

    const keyValues = [
        "itemCode",
        "itemCategory",
        "expireDate",
        "description",
        "quantity",
        "levyAmountA",
        "levyAmountB",
        "levyAmountC",
        "levyAmountD",
        "levyAmountE",
        "discountAmount",
        "batchCode",
        "unitPrice"
    ];

    if (payload && payload.items) {
        payload.items.forEach((item, index) => {
            const missingFields = keyValues.filter(key => !Object.keys(item).includes(key));

            if (missingFields.length > 0) {
                return errors.push(`Missing field (${missingFields.join(', ')}) in item line ${index + 1} \n`);
            }
            if (itemCodes.has(item.itemCode)) {
                errors.push(`Item code (${item.itemCode}) is not unique in item line ${index + 1}`);
            }
            else {
                if (!item.itemCode) {
                    errors.push(`Item code cannot be empty in item ${index + 1}`);
                }
                if (/\s/.test(item.itemCode)) {
                    errors.push(`Whitespaces in the Item code (${item.itemCode}) in item line ${index + 1} is not allowed`);
                }
                return itemCodes.add(item.itemCode);
            }
            if (/\s/.test(item.itemCategory)) {
                errors.push(`Whitespaces in the Item itemCategory (${item.itemCategory}) in item line ${index + 1} are not allowed`);
            }
            if (!isNaN(item.itemCategory)) {
                errors.push(`Item itemCategory (${item.itemCategory}) should not be numeric in item line ${index + 1}`);
            }
            if (descriptions.has(item.description)) {
                errors.push(`Description (${item.description}) is duplicated in item line ${index + 1}`);
            } else {
                return descriptions.add(item.description);
            }
            if (!item.unitPrice) {
                errors.push(`Empty unit price is not allowed in item ${index + 1}`);
            }
            if (!item.quantity) {
                errors.push(`Empty Quantity is not allowed in item ${index + 1}`);
            }
            if (!isValidNumber(item.quantity)) {
                errors.push(`Quantity must be a valid number at item ${index + 1}`);
            }
            if (!isValidNumber(item.unitPrice)) {
                errors.push(`Unit price must be a valid number at item ${index + 1}`);
            }
        });
    }

    if (errors.length > 0) {
        return errors;
    }
}

export default ValidateItems;
