import React, { useState, useEffect } from 'react';
import { Button, Grid, Typography } from '@mui/material';
// import { PlaceHolder } from './placeholder';
import ValidateHeaderFields from './validateHeaderFields';
import ValidateItems from './validateItems';

/* eslint-disable */

const LEVY_RATES = {
    A: 2.5 / 100,
    B: 2.5 / 100,
    C: 1 / 100,
    D: 5 / 100,
    E: 1 / 100,
};

function PayloadValidator() {
    const [payload, setPayload] = useState({ originalLoad: [], parseLoad: [] }); // Basket that store user pasted payload
    const [itemlists, setItemLists] = useState({ items: [] }); // Basket where we make our computations
    const [header, setHeader] = useState({
        totalLevy: "",
        totalVat: "",
        totalAmount: "",
        saleType: "",
        discountType: "GENERAL",
        discountAmount: "",
    }); // Basket that stores the payload header values
    const [errors, setErrors] = useState([]); // Basket that stores the errors
    const [validationMessage, setValidationMessage] = useState(''); // Nasket for success remove // Will be remove on next updates

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
        }
    }, [itemlists.items, payload.parseLoad]);

    // compute general and selective discount
    const handleDiscountSubtotal = (items) => {
        const { discountType } = payload.parseLoad;
        const { quantity, unitPrice, discountAmount } = items;
        return discountType === 'GENERAL' ? quantity * unitPrice - discountAmount : quantity * unitPrice;
    };

    // Perform Taxes
    const handleTaxes = (items, isExclusive) => {
        if (items) {
            return items.map((item) => {
                const { quantity, unitPrice, itemCategory, discountAmount } = item;
                const itemSubtotal = handleDiscountSubtotal(item);
                const graValue = isExclusive ? itemSubtotal : itemSubtotal / 1.219;
                const levyAmount = itemCategory === 'EXM' ? 0 : Object.values(LEVY_RATES).reduce((total, rate) => total + rate * graValue, 0);
                const totalVat = isExclusive ? 0.15 * (graValue + levyAmount) : 0.15 * (graValue / 1.15 + levyAmount);
                const updatedItem = {
                    ...item,
                    ...Object.fromEntries(Object.entries(LEVY_RATES).map(([key, rate]) => [`levyAmount${key}`, rate * graValue])),
                    totalLevy: levyAmount,
                    totalVat,
                    discountAmount: discountAmount.toFixed(4),
                    totalAmount: (quantity * unitPrice).toFixed(4),
                };
                return updatedItem;
            });
        }
        return [];
    };

    const performComputations = (itemlists, parseLoad) => {
        const { calculationType } = parseLoad;
        const updatedItems = calculationType === 'INCLUSIVE' ? handleTaxes(parseLoad.items, false) : handleTaxes(parseLoad.items, true);
        const computedValues = updatedItems.reduce((acc, item) => ({
                totalLevy: acc.totalLevy + parseFloat(item.totalLevy || 0),
                totalVat: acc.totalVat + parseFloat(item.totalVat || 0),
                totalAmount: acc.totalAmount + parseFloat(item.totalAmount || 0),
                discountAmount: acc.discountAmount + parseFloat(item.discountAmount || 0),
        }),
            { totalLevy: 0, totalVat: 0, totalAmount: 0 }
        );
        setHeader({
            totalLevy: computedValues.totalLevy.toFixed(4),
            totalVat: computedValues.totalVat.toFixed(4),
            totalAmount: computedValues.totalAmount.toFixed(4),
            discountAmount: computedValues.discountAmount.toFixed(4),
        });
        setItemLists((list) => ({ ...list, items: updatedItems }));
    };

    // Compare values
    function compareValues(userPayload, ourPayload) {
        const itemErr = [];

        const { parseLoad } = payload;
        const { totalAmount, totalLevy, totalVat, discountAmount } = header;

        if ((totalAmount !== null || totalAmount !== undefined || totalAmount !== 0 || totalAmount !== "") && Math.abs(totalAmount - parseLoad.totalAmount) > 0.0001) {
            itemErr.push(`${parseLoad.currency}: ${totalAmount} is the expected total amount instead of ${parseLoad.currency}: ${parseLoad.totalAmount}`);
        }
        if ((totalLevy !== null || totalLevy !== undefined || totalLevy !== 0 || totalLevy !== "") && Math.abs(totalLevy - parseLoad.totalLevy) > 0.0001) {
            itemErr.push(`${parseLoad.currency}: ${totalLevy} is the expected total levy amount instead of ${parseLoad.currency}: ${parseLoad.totalLevy}`);
        }
        if ((totalVat !== null || totalVat !== undefined || totalVat !== 0 || totalVat !== "") && Math.abs(totalVat - parseLoad.totalVat) > 0.0001) {
            itemErr.push(`${parseLoad.currency}: ${totalVat} is the expected total VAT instead of ${parseLoad.currency}: ${parseLoad.totalVat}`);
        }
        if ((discountAmount !== null || discountAmount !== undefined || discountAmount !== 0 || discountAmount !== "") && Math.abs(discountAmount - parseLoad.discountAmount) > 0.0001) {
            itemErr.push(`${parseLoad.currency}: ${discountAmount} is the expected total discount amount instead of ${parseLoad.currency}: ${parseLoad.discountAmount}`);
        }

        if (userPayload && userPayload.length > 0) {
            userPayload.forEach((obj1, index1) => {
                const obj2 = ourPayload.find(item => item.itemCode === obj1.itemCode);
                if (!obj2) {
                    // itemErr.push(`Object with itemCode ${obj1.itemCode} in the first item doesn't exist in the second item.`);
                    return;
                }
                // Compare items specific fields for correct LEVY values
                if ((obj2.levyAmountA !== null || obj2.levyAmountA !== undefined || obj2.levyAmountA !== 0 || obj2.levyAmountA !== "") && Math.abs(obj1.levyAmountA - obj2.levyAmountA) > 0.0001) {
                    itemErr.push(`${parseLoad.currency}: ${obj2.levyAmountA} is the expected levyAmountA amount in item ${index1 + 1} and not ${parseLoad.currency}: ${obj1.levyAmountA}`);
                }
                if (((obj2.levyAmountB !== null || obj2.levyAmountB !== undefined || obj2.levyAmountB !== 0 || obj2.levyAmountB !== "")) && Math.abs(obj1.levyAmountB - obj2.levyAmountB) > 0.0001) {
                    itemErr.push(`${parseLoad.currency}: ${obj2.levyAmountB} is the expected levyAmountB amount in item ${index1 + 1} and not ${parseLoad.currency}: ${obj1.levyAmountB}`);
                }
                if (((obj2.levyAmountC !== null || obj2.levyAmountC !== undefined || obj2.levyAmountC !== 0 || obj2.levyAmountC !== "")) && Math.abs(obj1.levyAmountC - obj2.levyAmountC) > 0.0001) {
                    itemErr.push(`${parseLoad.currency}: ${obj2.levyAmountC} is the expected levyAmountC amount in item ${index1 + 1} and not ${parseLoad.currency}: ${obj1.levyAmountC}`);
                }
                if ((obj2.levyAmountD !== null || obj2.levyAmountD !== undefined || obj2.levyAmountD !== 0 || obj2.levyAmountD !== "") && Math.abs(obj1.levyAmountD - obj2.levyAmountD) > 0.0001) {
                    itemErr.push(`${parseLoad.currency}: ${obj2.levyAmountD} is the expected levyAmountD amount in item ${index1 + 1} and not ${parseLoad.currency}: ${obj1.levyAmountD}`);
                }
                if ((obj2.levyAmountE !== null || obj2.levyAmountE !== undefined || obj2.levyAmountE !== 0 || obj2.levyAmountE !== "") && Math.abs(obj1.levyAmountE - obj2.levyAmountE) > 0.0001) {
                    itemErr.push(`${parseLoad.currency}: ${obj2.levyAmountE} is the expected levyAmountE amount in item ${index1 + 1} and not ${parseLoad.currency}: ${obj1.levyAmountE}`);
                }
                if ((obj2.discountAmount !== null || obj2.discountAmount !== undefined || obj2.discountAmount !== 0 || obj2.discountAmount !== "") && (obj1.discountAmount > (obj1.quantity * obj1.unitPrice))) {
                    itemErr.push(`Discount ${parseLoad.currency}: ${obj1.discountAmount} cannot exceed unitprice: ${parseLoad.currency}: ${obj1.quantity * obj1.unitPrice} in item ${index1 + 1}`);
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
        } else {
            setErrors([]);
            alert('Not a valid E-VAT JSON payload');
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
                color='#1B50CB'
                align='center'
                p={3}
                fontSize={30}
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
                        {/* SHOW THE UPDATED PAYLOAD HERE WITH THE BOTH THE HEADER AND ITEMSLIST JOINED/MERGED */}
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
                        {/* <Button 
                            variant='outlined' 
                            color='info' 
                            sx={{mb: 2}}
                        >
                            Copy Payload
                        </Button>
                        <Typography variant='body1'>
                            {mergeHeaderNItems && mergeHeaderNItems.length > 0 && (
                                <pre>
                                    {mergeHeaderNItems.map((item, index) => (
                                        <div key={index}>
                                            {JSON.stringify(item, null, 2)}
                                        </div>
                                    ))}
                                </pre>
                            )}
                        </Typography> */}
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
                                color: '#1B50CB',
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
