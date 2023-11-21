
const itemMap = {};
for (const item of items) {
    const { itemCode } = item;
    if (itemCode.length > 4) {
        if (itemMap[itemCode] === undefined) {
            itemMap[itemCode] = [item];
        } else {
            itemMap[itemCode].push(item);
        }
    }
}
for (const itemCode in itemMap) {
    if (itemMap[itemCode].length > 1) {
        errors.push(<div style={{color: 'blue'}}>Item Code: <strong style={{color: 'brown'}}>{itemCode}</strong><span style={{color: 'red'}}> is duplicated {itemMap[itemCode].length} times</span></div>);
    } else {
        if (vldtItemCode(itemCode) === true) {
            errors.push(
                <div style={{color: 'blue'}}>Item Code: <strong style={{color: 'brown'}}>
                    {itemCode}
                    </strong><span style={{color: 'green'}}> is correct</span>
                </div>);
        } else {
            errors.push( <div style={{color: 'blue'}}>Item Code:<span style={{color: 'red'}}>Invalid</span></div>);
        }
    }
}

if (errors.length > 0) { setValidationErrors(errors); } else {}