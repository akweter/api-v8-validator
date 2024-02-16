
const isValidNumber = (value) => {
    return !isNaN(Number(value));
};

const ValidateItems = (payload) => {
    let errors = [];

    if (payload) {
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
        const itemCodes = new Set();
        if (payload.items) {
            payload.items.forEach((item, index) => {
                const missingFields = keyValues.filter(key => !Object.keys(item).includes(key));
                if (missingFields.length > 0) {
                    errors.push(`Missing field (${missingFields.join(', ')}) in item line ${index + 1} \n`);
                }
                else{
                    if (itemCodes.has(item.itemCode)) {
                        errors.push(`Item code (${item.itemCode}) is not unique in item ${index + 1}`);
                    }
                    else {
                        if (item.itemCode === "" || item.itemCode === undefined) {
                            errors.push(`Item code cannot be empty in item ${index + 1}`);
                        } 
                        if (/\s/.test(item.itemCode)) {
                            errors.push(`Whitespaces in the Item code (${item.itemCode}) in item ${index + 1} is not allowed`);
                        }
                        itemCodes.add(item.itemCode);
                    }
                    if (!item.unitPrice) {
                        errors.push(`Empty unit price is not allowed in item ${index + 1}`);
                    }
                    if (!item.quantity) {
                        errors.push(`Empty Quantity is not allowed in item ${index + 1}`);
                    }
                    else{
                        if (!isValidNumber(item.quantity)) {
                            errors.push(`Quantity must be a valid number at item ${index + 1}`);
                        }
                        if (!isValidNumber(item.unitPrice)) {
                            errors.push(`Unit price must be a valid number at item ${index + 1}`);
                        }
                    }
                }
            });
        }
    }
    else {
        errors.push('Items validation failed')
    }
    // ValidateHeaderFields
    if (errors.length > 0) {
        return errors;
    }
}

export default ValidateItems;
