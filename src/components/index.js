import React, { useState, useEffect } from 'react';
import { Button, Typography } from '@mui/material';
// import { PlaceHolder } from './placeholder';
import ValidateHeaderFields from './validateHeaderFields';
import ValidateItems from './validateItems';

/* eslint-disable */

function PayloadValidator() {
    const [payload, setPayload] = useState({ originalLoad: [], parseLoad: [] });
    const [errors, setErrors] = useState([]);
    const [validationMessage, setValidationMessage] = useState('');
    const [ header, setHeader] = useState({
        totalLevy: "",
        totalVat: "",
        totalAmount: "",
        saleType: "",
        discountType: "GENERAL",
        discountAmount: "",
    });
    const [itemlists, setItemLists] = useState({ items: []});
    const [load, setLoad] = useState(false);

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
    
    useEffect(() => {
        if (payload.parseLoad.items && itemlists.items) {
            performComputations(itemlists, payload.parseLoad);
            compareValues(payload.parseLoad.items, itemlists.items);
            setLoad(false);
        }
    }, [itemlists.items, payload.parseLoad]);
    
    // handle general and selective discount
    const handleDiscountSubtotal = (items) => {
        const { discountType } = payload.parseLoad;
        const { quantity, unitPrice, discountAmount } = items;
        let itemSubtotal;

        if (discountType === "GENERAL") {
            itemSubtotal = quantity * (unitPrice  - discountAmount);
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

    // handle inclusive VAT computations
    const handleInclusiveTaxes = (items) => {
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
                levyAmountA: twoDP(levyAmountA),
                levyAmountB: twoDP(levyAmountB),
                levyAmountC: twoDP(levyAmountC),
                levyAmountD: twoDP(levyAmountD),
                levyAmountE: twoDP(levyAmountE),
                totalLevy: twoDP(totalLevy),
                totalVat: twoDP(totalVat),
                discountAmount: twoDP(discountAmount),
                discountAmountHead: twoDP(quantity * discountAmount),
                totalAmount: twoDP(quantity * unitPrice),
            };
        });
        setItemLists((list) => ({
            ...list,
            items: updatedItems,
        }));
    };

    // handle Exclusive Taxes
    const handleExclusiveTaxes = (items) => {
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
                levyAmountA: twoDP(levyAmountA),
                levyAmountB: twoDP(levyAmountB),
                levyAmountC: twoDP(levyAmountC),
                levyAmountD: twoDP(levyAmountD),
                levyAmountE: twoDP(levyAmountE),
                totalLevy: twoDP(totalLevy),
                totalVat: twoDP(totalVat),
                discountAmount: twoDP(discountAmount),
                discountAmountHead: twoDP(quantity * discountAmount),
                totalAmount: twoDP(quantity * unitPrice),
            };
        });

        setItemLists((list) => ({
            ...list,
            items: updatedItems,
        }));
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
            (total, item) => total + parseFloat(item.discountAmountHead || 0), 0);
    
        setHeader((header) => ({
            ...header,
            totalLevy: totalLevy.toFixed(3),
            totalVat: totalVat.toFixed(3),
            totalAmount: totalAmount.toFixed(3),
            voucherAmount: voucherAmount.toFixed(3),
            discountAmount: (discountAmount).toFixed(3),
        }));
    };

    // Compare values
    function compareValues(arr1, arr2) {
        const itemErr = [];

        const { parseLoad } = payload;
        const { totalAmount, totalLevy, totalVat, discountAmount } = header;

        if (totalAmount !== null && Math.abs(totalAmount - parseLoad.totalAmount) > 0.0001) {
            itemErr.push(`${totalAmount} is the expected total amount instead of ${parseLoad.totalAmount}`);
        }
        if (totalLevy !== null && Math.abs(totalLevy - parseLoad.totalLevy) > 0.0001) {
            itemErr.push(`${totalLevy} is the expected total levy amount instead of ${parseLoad.totalLevy}`);
        }
        if (totalVat !== null && Math.abs(totalVat - parseLoad.totalVat) > 0.0001) {
            itemErr.push(`${totalVat} is the expected total VAT instead of ${parseLoad.totalVat}`);
        }
        if (discountAmount !== null && Math.abs(discountAmount - parseLoad.discountAmount) > 0.0001) {
            itemErr.push(`${discountAmount} is the expected total discount amount instead of ${parseLoad.discountAmount}`);
        }

        if (arr1 && arr1.length > 0) {
            arr1.forEach((obj1, index1) => {
                const obj2 = arr2.find(item => item.itemCode === obj1.itemCode);
                if (!obj2) {
                    // itemErr.push(`Object with itemCode ${obj1.itemCode} in the first array doesn't exist in the second array.`);
                    return;
                }
                // Compare items specific fields for correct LEVY values
                if (obj2.levyAmountA !== null && Math.abs(obj1.levyAmountA - obj2.levyAmountA) > 0.0001) {
                    itemErr.push(`${obj2.levyAmountA} is the expected levyAmountA amount in item ${index1 + 1} and not ${obj1.levyAmountA}`);
                }
                if (obj2.levyAmountB !== null && Math.abs(obj1.levyAmountB - obj2.levyAmountB) > 0.0001) {
                    itemErr.push(`Amt: ${obj2.levyAmountB} is the expected levyAmountB amount in item ${index1 + 1} and not ${obj1.levyAmountB}`);
                }
                if (obj2.levyAmountC !== null && Math.abs(obj1.levyAmountC - obj2.levyAmountC) > 0.0001) {
                    itemErr.push(`Amt: ${obj2.levyAmountC} is the expected levyAmountC amount in item ${index1 + 1} and not ${obj1.levyAmountC}`);
                }
                if (obj2.levyAmountD !== null && Math.abs(obj1.levyAmountD - obj2.levyAmountD) > 0.0001) {
                    itemErr.push(`Amt: ${obj2.levyAmountD} is the expected levyAmountD amount in item ${index1 + 1} and not ${obj1.levyAmountD}`);
                }
                if (obj2.levyAmountE !== null && Math.abs(obj1.levyAmountE - obj2.levyAmountE) > 0.0001) {
                    itemErr.push(`Amt: ${obj2.levyAmountE} is the expected levyAmountE amount in item ${index1 + 1} and not ${obj1.levyAmountE}`);
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

    return (
        <div style={{padding: "0 5%"}}>
            <Typography
                variant='h3'
                style={{ textDecoration: '3px dotted black underline' }}
                mb={2}
                color={'green'}
                align='center'
            >
                GRA E- VAT V8.2 Validator
            </Typography>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexItem: '1',
                    gap: '20px',
                }}
            >
                <span>
                    <textarea
                        type='text'
                        rows='40'
                        cols='60'
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
                </span>
                <span>
                    {errors ? (
                        errors.map((error, index) => (
                            <table key={index}>
                                <thead>
                                    <tr>
                                        <td>{`${index + 1}: ${error}`}</td>
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
                </span>
            </div>
            <div style={{
                    position: "fixed",
                    justifyContent: "center",
                    backgroundColor: "#F5927D",
                    margin: "10px",
                    padding: "5px",
                    right: "5%"
                }}
            >
                <strong>Use the Validate button in case computations are not done automatically</strong>
            </div>
        </div>
    );
}

export default PayloadValidator;