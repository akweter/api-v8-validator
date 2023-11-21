import {
    vldtItemCode,
    vldtItemCategory,
    vldtExpireDate,
    vldtDescription,
    vldtQuantity,
    vldtLevyAmountA,
    vldtLevyAmountB,
    vldtLevyAmountC,
    vldtLevyAmountD,
    vldtLevyAmountE,
    vldtDiscountAmount,
} from './validations';

const ValidateItems = (payload) => {
    let errors = [];

    if (payload.items) {
        const {
            itemCode,
            itemCategory,
            expireDate,
            description,
            quantity,
            levyAmountA,
            levyAmountB,
            levyAmountC,
            levyAmountD,
            levyAmountE,
            discountAmount,
            batchCode,
            unitPrice
        } = payload.items;

        // Validate item code
        if (vldtItemCode(itemCode) === false) {
            errors.push('Invalid item code.');
        }
        
        if(vldtItemCategory(itemCategory) === false){
            errors.push('Invalid item category.');
        }
        
        if(vldtExpireDate(expireDate) === false){
            errors.push('Invalid item expireDate.');
        }
        
        if(vldtDescription(description) === false){
            errors.push('Invalid item description.');
        }
        
        if(vldtQuantity(quantity) === false){
            errors.push('Invalid item quantity.');
        }
        
        if(vldtLevyAmountA(levyAmountA) === false){
            errors.push('Invalid item levyAmountA.');
        }
        
        if(vldtLevyAmountB(levyAmountB) === false){
            errors.push('Invalid item levyAmountB.');
        }
        
        if(vldtLevyAmountC(levyAmountC) === false){
            errors.push('Invalid item levyAmountC.');
        }
        
        if(vldtLevyAmountD(levyAmountD) === false){
            errors.push('Invalid item levyAmountD.');
        }
        
        if(vldtLevyAmountE(levyAmountE) === false){
            errors.push('Invalid item levyAmountE.');
        }
        
        if(vldtDiscountAmount(discountAmount) === false){
            errors.push('Invalid item discountAmount.');
        }
    }
    else {
        errors.push('Cannot validate items array')
    }
    // ValidateHeaderFields
    if (errors.length > 0) {
        return errors;
    }
}

export default ValidateItems;