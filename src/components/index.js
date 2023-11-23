import React, { useState, useEffect } from 'react';
import { Button, Typography } from '@mui/material';
import { PlaceHolder } from './placeholder';
import ValidateHeaderFields from './validateHeaderFields';
import ValidateItems from './validateItems';

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
        nhil: "",
        getfund: "",
        covid: "",
        cst: "",
        tourism: "",
        Subtotal: "",
    });
    const [itemlists, setItemLists] = useState({
        items: [],
    });

    useEffect(() => {
        const { originalLoad } = payload;
        if (originalLoad) {
            try {
                const parseLoad = JSON.parse(originalLoad);
                setPayload((oldState) => ({ ...oldState, parseLoad: parseLoad }));
            } catch (error) {
                setPayload({ parseLoad: '' });
            }
        }
    }, [payload.originalLoad]);

    useEffect(() => {
        if (itemlists.items.length > 0) {
            compareValues(payload.parseLoad);
        }
    }, [itemlists.items, payload.parseLoad]);
    

    function handleValidation() {
        const { parseLoad } = payload;
        if (typeof parseLoad !== 'string') {
            let headerErrors = ValidateHeaderFields(parseLoad);
            let itemErrors = ValidateItems(parseLoad);
            if (headerErrors === undefined) {
                headerErrors = [];
            }
            if (itemErrors === undefined) {
                itemErrors = [];
            }
            const errors = [...headerErrors, ...itemErrors];
            setErrors(errors);

            // Check if there are no errors
            if (errors.length === 0) {
                performComputations(parseLoad);
                compareValues(parseLoad);
                setValidationMessage('EVERYTHING LOOKS GREAT!');
            }
            else {
                setValidationMessage('');
            }
        } else {
            setErrors([]);
            setValidationMessage('Not valid E-VAT JSON payload');
            // alert('Not valid E-VAT JSON payload');
        }
    }

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
                itemSubtotal: twoDP(itemSubtotal),
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
                itemSubtotal: twoDP(itemSubtotal - discountAmount),
                totalAmount: twoDP(quantity * unitPrice),
            };
        });

        setItemLists((list) => ({
            ...list,
            items: updatedItems,
        }));
    };

    const performComputations = (parsedPayload) => {
        const { calculationType, items } = parsedPayload;
    
        // Set Inclusive & Exclusive tax
        if (calculationType === "INCLUSIVE") {
            handleInclusiveTaxes(items);
        } else {
            handleExclusiveTaxes(items);
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
    
        const subTotal = items.reduce(
            (total, item) => total + parseFloat(item.itemSubtotal || 0), 0);
    
        const totalAmount = items.reduce(
            (total, item) => total + parseFloat(item.totalAmount || 0), 0);
    
        const voucherAmount = items.reduce(
            (total, item) => total + parseFloat(item.voucherAmount || 0), 0);
    
        const discountAmount = items.reduce(
            (total, item) => total + parseFloat(item.discountAmountHead || 0), 0);
    
        const nhil = items.reduce(
            (total, item) => total + parseFloat(item.levyAmountA || 0), 0);
    
        const getfund = items.reduce(
            (total, item) => total + parseFloat(item.levyAmountB || 0), 0);
    
        const covid = items.reduce(
            (total, item) => total + parseFloat(item.levyAmountC || 0), 0);
    
        const cst = items.reduce(
            (total, item) => total + parseFloat(item.levyAmountD || 0), 0);
    
        const tourism = items.reduce(
            (total, item) => total + parseFloat(item.levyAmountE || 0), 0);
    
        setHeader((header) => ({
            ...header,
            totalLevy: totalLevy,
            totalVat: totalVat,
            totalAmount: totalAmount.toFixed(2),
            voucherAmount: voucherAmount.toFixed(2),
            discountAmount: (discountAmount).toFixed(2),
            nhil: nhil.toFixed(2),
            getfund: getfund.toFixed(2),
            covid: covid.toFixed(2),
            cst: cst.toFixed(2),
            tourism: tourism.toFixed(2),
            Subtotal: subTotal.toFixed(2),
        }));
    };
    
    const compareValues = (userPayload) => {
        const { items } = userPayload;
        let errors = [];
    
        // Compare each item's levy values
        items.forEach((userItem, index) => {
            const myItem = itemlists.items[index];

            console.log('from the user', items);
            console.log('from my end', myItem);
    
            // Check if myItem is defined before accessing properties
            if (myItem) {
                // Compare levy values
                const levyErrors = [];
                if (userItem.levyAmountA !== myItem.levyAmountA) {
                    levyErrors.push('A');
                }
                if (userItem.levyAmountB !== myItem.levyAmountB) {
                    levyErrors.push('B');
                }
                if (userItem.levyAmountC !== myItem.levyAmountC) {
                    levyErrors.push('C');
                }
                if (userItem.levyAmountD !== myItem.levyAmountD) {
                    levyErrors.push('D');
                }
                if (userItem.levyAmountE !== myItem.levyAmountE) {
                    levyErrors.push('E');
                }
    
                if (levyErrors.length > 0) {
                    errors.push(`Error in item ${index + 1}: Levy values (${levyErrors.join(', ')}) are incorrect`);
                }
            }
        });
    
        // Compare total values
        if (userPayload.totalAmount !== header.totalAmount) {
            errors.push('Error: Total Amount is incorrect');
        }
        if (userPayload.totalLevy !== header.totalLevy) {
            errors.push('Error: Total Levy is incorrect');
        }
        if (userPayload.totalDiscount !== header.discountAmount) {
            errors.push('Error: Total Discount is incorrect');
        }
        if (userPayload.totalVAT !== header.totalVat) {
            errors.push('Error: Total VAT is incorrect');
        }
    
        // Set the validation message based on the errors
        if (errors.length > 0) {
            setValidationMessage(errors.join('\n'));
        } else {
            setValidationMessage('EVERYTHING LOOKS GREAT!');
        }
    };
    
    return (
        <>
            <Typography
                variant='h3'
                style={{ textDecoration: '3px dotted black underline' }}
                mb={2}
                color={'red'}
                align='center'
            >
                GRA E-<span style={{ color: 'yellow' }}>VAT V8.2</span>
                <span style={{ color: 'green' }}> Validator</span>
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
                        placeholder={PlaceHolder.value}
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
        </>
    );
}

export default PayloadValidator;
