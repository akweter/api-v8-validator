import React, { useState, useEffect } from 'react';
import { Button, Grid, Typography } from '@mui/material';
// import { PlaceHolder } from './placeholder';
import ValidateHeaderFields from './validateHeaderFields';
import ValidateItems from './validateItems';

/* eslint-disable */

function PayloadValidator() {
    const [payload, setPayload] = useState({ originalLoad: [], parseLoad: [] }); // Basket that store user pasted payload
    const [itemlists, setItemLists] = useState({ items: []}); // Basket where we make our computations
    const [ header, setHeader] = useState({
        totalLevy: "",
        totalVat: "",
        totalAmount: "",
        saleType: "",
        discountType: "GENERAL",
        discountAmount: "",
    }); // Basket that stores the payload header values
    const [errors, setErrors] = useState([]); // Basket that stores the errors
    const [load, setLoad] = useState(false);
    const [validationMessage, setValidationMessage] = useState('');

    // Check the user payload if it is valid and push the data into parseLoad basket
    useEffect(() => {
        const { originalLoad } = payload;
        if (originalLoad) {
            try {
                const parseLoad = JSON.parse(originalLoad);
                setPayload((oldState) => ({ ...oldState, parseLoad }));
            }
            catch (error) {
                setPayload({ parseLoad: '' });
            }
        }
    }, [payload.originalLoad]);
    
    // Perform automatic computation and compares tax calculations
    useEffect(() => {
        if (payload.parseLoad.items && itemlists.items) {
            performComputations(itemlists, payload.parseLoad);
            compareValues(payload.parseLoad.items, itemlists.items);
            setLoad(false);
        }
    }, [itemlists.items, payload.parseLoad]);
    
    // compute general and selective discount
    const handleDiscountSubtotal = (items) => {
        const { discountType } = payload.parseLoad;
        const { quantity, unitPrice, discountAmount } = items;
        let itemSubtotal;

        if (discountType === "GENERAL") {
            itemSubtotal = (quantity * unitPrice)  - discountAmount;
            return itemSubtotal;
        } else if (discountType === "SELECTIVE"){
            itemSubtotal = (quantity * unitPrice);
            return itemSubtotal;
        } else{
            return itemSubtotal = 0;
        }
    }

    // Round the values to two decimal place
    function twoDP(value) {
        if (typeof value === 'number' && !isNaN(value)) {
          let roundedValue = Math.round(value * 100) / 100;
          return roundedValue;
        } else {
          return value;
        }
    }

    // perform inclusive VAT computations
    const handleInclusiveTaxes = (items) => {
        if(items){
            const updatedItems = items.map((item) => {
                const { quantity, unitPrice, itemCategory, discountAmount } = item;
                const itemSubtotal = handleDiscountSubtotal(item);

                const graValue = itemSubtotal / 1.219;
                let levyAmountA, levyAmountB, levyAmountC, levyAmountD, levyAmountE, totalLevy, totalVat, vatableAmt;

                if (itemCategory === "") {
                    levyAmountA = levyAmountB = (2.5 / 100) * graValue;
                    levyAmountC = (1 / 100) * graValue;
                    levyAmountD = levyAmountE = "";
                    vatableAmt = graValue + levyAmountA + levyAmountB + levyAmountC + levyAmountD + levyAmountE;
                    totalVat = 0.15 * vatableAmt;
                    totalLevy = levyAmountA + levyAmountB + levyAmountC + levyAmountD + levyAmountE;
                }
                else if(itemCategory === "EXM"){
                    levyAmountA = levyAmountB = levyAmountC = levyAmountD = levyAmountE = totalVat = totalLevy = "";
                }
                else if(itemCategory === "TRSM"){
                    const graValueTRSM = itemSubtotal / 1.229;
                    
                    levyAmountA = levyAmountB = (2.5 / 100) * graValueTRSM;
                    levyAmountC = (1 / 100) * graValueTRSM;
                    levyAmountD = "";
                    levyAmountE = (1 / 100) * graValueTRSM;
                    vatableAmt = graValueTRSM + levyAmountA + levyAmountB + levyAmountC;
                    totalVat = (15 / 100) * vatableAmt;
                    totalLevy = levyAmountA + levyAmountB + levyAmountC + levyAmountD + levyAmountE;
                }
                else if(itemCategory === "CST"){
                    const graValueCST = itemSubtotal / 1.2765;
                    levyAmountA = levyAmountB = (2.5 / 100) * graValueCST;
                    levyAmountC = (1 / 100) * graValueCST;
                    levyAmountD = (5 / 100) * graValueCST;
                    levyAmountE = "";
                    vatableAmt = graValueCST + levyAmountA + levyAmountB + levyAmountC + levyAmountD;
                    totalVat = (15 / 100) * vatableAmt;
                    totalLevy = levyAmountA + levyAmountB + levyAmountC + levyAmountD + levyAmountE;
                }
                return {
                    ...item,
                    levyAmountA: levyAmountA.toFixed(5),
                    levyAmountB: levyAmountB.toFixed(5),
                    levyAmountC: levyAmountC.toFixed(5),
                    levyAmountD: levyAmountD,
                    levyAmountE: levyAmountE,
                    totalLevy: totalLevy,
                    totalVat: totalVat,
                    discountAmount: discountAmount.toFixed(5),
                    // discountAmountHead: (quantity * discountAmount),
                    totalAmount: (quantity * unitPrice).toFixed(5),
                };
            });
            setItemLists((list) => ({
                ...list,
                items: updatedItems,
            }));
        }
        else{
            return;
        }
    };

    // Perform Exclusive Taxes
    const handleExclusiveTaxes = (items) => {
        if(items){
            const updatedItems = items.map((item) => {
                const { quantity, unitPrice, itemCategory, discountAmount } = item;
                const itemSubtotal = handleDiscountSubtotal(item);

                let levyAmountA, levyAmountB, levyAmountC, levyAmountD, levyAmountE, totalLevy, totalVat, vatableAmt;

                if (itemCategory === "") {
                    levyAmountA = levyAmountB = (2.5 / 100) * itemSubtotal;
                    levyAmountC = (1 / 100) * itemSubtotal;
                    levyAmountD = levyAmountE = "";
                    vatableAmt = itemSubtotal + levyAmountA + levyAmountB + levyAmountC + levyAmountD + levyAmountE;
                    totalVat = 0.15 * vatableAmt;
                    totalLevy = levyAmountA + levyAmountB + levyAmountC + levyAmountD + levyAmountE;
                }
                else if(itemCategory === "EXM"){
                    levyAmountA = levyAmountB = levyAmountC = levyAmountD = levyAmountE = totalVat = totalLevy = "";
                }
                else if(itemCategory === "TRSM"){
                    levyAmountA = levyAmountB = (2.5 / 100) * itemSubtotal;
                    levyAmountC = (1 / 100) * itemSubtotal;
                    levyAmountD = "";
                    levyAmountE = (1 / 100) * itemSubtotal;
                    vatableAmt = itemSubtotal + levyAmountA + levyAmountB + levyAmountC;
                    totalVat = 0.15 * vatableAmt;
                    totalLevy = levyAmountA + levyAmountB + levyAmountC + levyAmountE;
                }
                else if(itemCategory === "CST"){
                    levyAmountA = levyAmountB = (2.5 / 100) * itemSubtotal;
                    levyAmountC = (1 / 100) * itemSubtotal;
                    levyAmountD = (5 / 100) * itemSubtotal;
                    levyAmountE = "";
                    vatableAmt = itemSubtotal + levyAmountA + levyAmountB + levyAmountC + levyAmountD;
                    totalVat = (15 / 100) * vatableAmt;
                    totalLevy = levyAmountA + levyAmountB + levyAmountC + levyAmountD + levyAmountE;
                }
                return {
                    ...item,
                    levyAmountA: levyAmountA.toFixed(5),
                    levyAmountB: levyAmountB.toFixed(5),
                    levyAmountC: levyAmountC.toFixed(5),
                    levyAmountD: levyAmountD,
                    levyAmountE: levyAmountE,
                    totalLevy: totalLevy,
                    totalVat: totalVat,
                    discountAmount: discountAmount.toFixed(5),
                    // discountAmountHead: (quantity * discountAmount),
                    totalAmount: (quantity * unitPrice).toFixed(5),
                };
            });
            setItemLists((list) => ({
                ...list,
                items: updatedItems,
            }));
        }
        else{
            return;
        }
    };

    const performComputations = (itemlists, parseLoad) => {
        const { items } = itemlists;
    
        const { calculationType } = parseLoad;
        // // Set Inclusive & Exclusive tax
        if (calculationType === "INCLUSIVE") {
            handleInclusiveTaxes(parseLoad.items);
        } else {
            handleExclusiveTaxes(parseLoad.items);
        }
    
        // Compute final/total taxes and levies
        const totalLevy = items.reduce((total, item) =>
            total +
            parseFloat(item.levyAmountA || 0) +
            parseFloat(item.levyAmountB || 0) +
            parseFloat(item.levyAmountC || 0) +
            parseFloat(item.levyAmountD || 0) +
            parseFloat(item.levyAmountE || 0),
            0);
    
        const totalVat = items.reduce(
            (total, item) => total + parseFloat(item.totalVat || 0), 0);
    
        const totalAmount = items.reduce(
            (total, item) => total + parseFloat(item.totalAmount || 0), 0);
    
        const voucherAmount = items.reduce(
            (total, item) => total + parseFloat(item.voucherAmount || 0), 0);
    
        const discountAmount = items.reduce(
            (total, item) => total + parseFloat(item.discountAmount || 0), 0);
    
        setHeader((header) => ({
            ...header,
            totalLevy: totalLevy.toFixed(4),
            totalVat: totalVat.toFixed(4),
            totalAmount: totalAmount.toFixed(4),
            voucherAmount: voucherAmount.toFixed(4),
            discountAmount: (discountAmount).toFixed(4),
        }));
    };

    // Compare values
    function compareValues(userPayload, ourPayload) {
        const itemErr = [];

        const { parseLoad } = payload;
        const { totalAmount, totalLevy, totalVat, discountAmount } = header;

        if (totalAmount !== null && Math.abs(totalAmount - parseLoad.totalAmount) > 0.0001) {
            itemErr.push(`¢${totalAmount} is the expected total amount instead of ¢${parseLoad.totalAmount}`);
        }
        if (totalLevy !== null && Math.abs(totalLevy - parseLoad.totalLevy) > 0.0001) {
            itemErr.push(`¢${totalLevy} is the expected total levy amount instead of ¢${parseLoad.totalLevy}`);
        }
        if (totalVat !== null && Math.abs(totalVat - parseLoad.totalVat) > 0.0001) {
            itemErr.push(`¢${totalVat} is the expected total VAT instead of ¢${parseLoad.totalVat}`);
        }
        if (discountAmount !== null && Math.abs(discountAmount - parseLoad.discountAmount) > 0.0001) {
            itemErr.push(`¢${discountAmount} is the expected total discount amount instead of ¢${parseLoad.discountAmount}`);
        }

        if (userPayload && userPayload.length > 0) {
            userPayload.forEach((obj1, index1) => {
                const obj2 = ourPayload.find(item => item.itemCode === obj1.itemCode);
                if (!obj2) {
                    // itemErr.push(`Object with itemCode ${obj1.itemCode} in the first array doesn't exist in the second array.`);
                    return;
                }
                // Compare items specific fields for correct LEVY values
                if (obj2.levyAmountA !== null && Math.abs(obj1.levyAmountA - obj2.levyAmountA) > 0.0001) {
                    itemErr.push(`${parseLoad.currency} ${obj2.levyAmountA} is the expected levyAmountA amount in item ${index1 + 1} and not ${parseLoad.currency} ${obj1.levyAmountA}`);
                }
                if (obj2.levyAmountB !== null && Math.abs(obj1.levyAmountB - obj2.levyAmountB) > 0.0001) {
                    itemErr.push(`${parseLoad.currency} ${obj2.levyAmountB} is the expected levyAmountB amount in item ${index1 + 1} and not ${parseLoad.currency} ${obj1.levyAmountB}`);
                }
                if (obj2.levyAmountC !== null && Math.abs(obj1.levyAmountC - obj2.levyAmountC) > 0.0001) {
                    itemErr.push(`${parseLoad.currency} ${obj2.levyAmountC} is the expected levyAmountC amount in item ${index1 + 1} and not ${parseLoad.currency} ${obj1.levyAmountC}`);
                }
                if (obj2.levyAmountD !== null && Math.abs(obj1.levyAmountD - obj2.levyAmountD) > 0.0001) {
                    itemErr.push(`${parseLoad.currency} ${obj2.levyAmountD} is the expected levyAmountD amount in item ${index1 + 1} and not ${parseLoad.currency} ${obj1.levyAmountD}`);
                }
                if (obj2.levyAmountE !== null && Math.abs(obj1.levyAmountE - obj2.levyAmountE) > 0.0001) {
                    itemErr.push(`${parseLoad.currency} ${obj2.levyAmountE} is the expected levyAmountE amount in item ${index1 + 1} and not ${parseLoad.currency} ${obj1.levyAmountE}`);
                }
                if (obj1.discountAmount !== null && (obj1.discountAmount > (obj1.quantity * obj1.unitPrice))) {
                    itemErr.push(`Discount ${parseLoad.currency} ${obj1.discountAmount} cannot exceed unitprice: ${parseLoad.currency} ${obj1.quantity * obj1.unitPrice} in item ${index1 + 1}`);
                }
            });
        }
        
        // Display errors only if there are more than zero errors
        if (itemErr.length > 0) {
            setErrors(itemErr);
        }
    }

    // Final validation after user click
    function handleValidation() {        
        const { parseLoad } = payload;
        const { items } = itemlists;

        if (typeof parseLoad !== 'string') {
            let headerErrors = ValidateHeaderFields(parseLoad);
            let itemErrors = ValidateItems(parseLoad);
            
            if (headerErrors === undefined) {
                headerErrors = [];
            }
            if (itemErrors === undefined) {
                itemErrors = [];
            }
            const inErrors = [...headerErrors, ...itemErrors];
            setErrors(inErrors);

            // Perform various computations
            performComputations(itemlists, parseLoad);            
            compareValues(parseLoad.items, items);

            if (inErrors.length === 0 && errors.length === 0) {
                setValidationMessage('EVERYTHING LOOKS GREAT!');
            } else {
                setValidationMessage('');
            }
            setLoad(false);
        }
        else {
            setErrors([]);
            alert('Not valid E-VAT JSON payload');
        }
    }

    // Return the viewer on the browser
    return (
        <div
          style={{
            padding: "0 5%",
            backgroundImage: 'url("https://www.freevector.com/uploads/vector/preview/8610/FreeVector-Vector-Background-With-Circles.jpg")',
            backgroundSize: 'cover',
            backgroundRepeat: 'repeat-y',
            minHeight: '100vh',
            margin: -8,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
                textAlign: 'center',
                justifyContent: 'center',
                backgroundColor: '#F5927D',
                justifyContent: 'space-between'
            }}
          >
            <i>Efficiency at work is the tool that turns effort into accomplishment.</i>
          </div>
          <Typography
            mb={2}
            color='#6D1693'
            align='center'
            p={3}
            fontSize={20}
          >
            GRA E-VAT API V8.2 Validator
          </Typography>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <Grid container spacing={2}
                style={{
                    background: '#FDF3FF ',
                    cursor: 'cell'
                }}
            >
                <Grid item xs={12} md={6}>
                    {errors ? (
                    errors.map((error, index) => (
                        <table key={index}>
                        <thead>
                            <tr>
                            <td>
                                <span
                                style={{
                                    fontFamily: 'inherit',
                                    textDecoration: 'none',
                                    fontSize: '17px',
                                    fontVariant: 'oldstyle-nums',
                                }}
                                >{`${index + 1}: ${error}`}</span>
                            </td>
                            </tr>
                        </thead>
                        </table>
                    ))
                    ) : null}
                    {validationMessage && (
                    <div style={{ color: 'blue', fontWeight: 'bold' }}>
                        {validationMessage}
                    </div>
                    )}
                </Grid>
                <Grid item xs={12} md={6} order={{ xs: 2, md: 1 }}>
                    <textarea
                        type='text'
                        rows='35'
                        style={{ width: '100%' }}
                        onChange={(e) =>
                            setPayload((oldState) => ({
                            ...oldState,
                            originalLoad: e.target.value,
                            }))
                        }
                        placeholder={'Paste GRA E-VAT Payload Here'}
                    />
                    <br />
                    <Button
                    variant='outlined'
                    onClick={handleValidation}
                    style={{
                        background: '#F0FFFE',
                        color: 'green',
                        fontWeight: 'bold',
                        fontSize: '20px',
                        marginRight: '20px',
                    }}
                    >
                    Validate
                    </Button>
                    <Button
                    variant='outlined'
                    onClick={() => {
                        window.location.reload();
                    }}
                    style={{
                        background: '#F0FFFE',
                        color: 'red',
                        fontWeight: 'bold',
                        fontSize: '20px',
                    }}
                    >
                    Clear Data
                    </Button>
                </Grid>
            </Grid>
          </div>
        </div>
    );   
}

export default PayloadValidator;
