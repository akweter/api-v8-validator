import React, { useState, useEffect } from 'react';
import {
    vldtBusinessPartnerName,
    vldtCalculationType,
    vldtBusinessPartnerTin,
    vldtCurrency,
    // vldtDescription,
    vldtDiscountAmount,
    // vldtDiscountAmountItem,
    vldtDiscountType,
    vldtExchangeRate,
    // vldtExpireDate,
    vldtFlag,
    vldtGroupReferenceId,
    vldtInvoiceNumber,
    // vldtItemCategory,
    vldtItemCode,
    // vldtLevyAmountA,
    // vldtLevyAmountB,
    // vldtLevyAmountC,
    // vldtLevyAmountD,
    // vldtLevyAmountE,
    vldtPurchaseOrderReference,
    // vldtQuantity,
    vldtReference,
    vldtSaleType,
    vldtTotalAmount,
    vldtTotalLevy,
    vldtTotalVat,
    vldtTransactionDate,
    vldtUserName,
    vldtVoucherAmount
} from './validations';
import { Button, Typography } from '@mui/material';
import { PlaceHolder } from './placeholder';

function PayloadValidator() {
    const [payload, setPayload] = useState([]);
    const [load, setLoad] = useState([]);
    const [validationErrors, setValidationErrors] = useState([]);

    useEffect(()=> {
        const errors = [];
        try {
            if (payload !== null) {
              const newPayload = JSON.parse(payload);
              if (typeof newPayload === 'object' && !Array.isArray(newPayload)) {
                setLoad(newPayload);
              } else {
                errors.push(<h1 style={{color: 'blue'}}>Payload invalid yet</h1>);
                return;
              }
            }
          } catch (error) {
            errors.push(<h1 style={{color: 'red'}}>Invalid Load</h1>);
            return;
          }
    }, [payload]);

    const allFields = [
        "currency", "exchangeRate", "invoiceNumber", "totalLevy", "userName", "flag",
        "calculationType", "totalVat", "transactionDate", "totalAmount", "voucherAmount",
        "businessPartnerName", "businessPartnerTin", "saleType", "discountType", "discountAmount",
        "reference", "groupReferenceId", "purchaseOrderReference", "items"
    ];
    
    function handleValidation(){
        const errors = [];
        
        if(validationErrors.length > 0){
            if (payload.length > 0) {
                // Currency
                if (vldtCurrency(load.currency) === true) {
                    errors.push( <div style={{color: 'blue'}}>Currency: <span style={{color: 'green'}}>Correct</span></div>);
                } else {
                    errors.push(<div style={{color: 'blue'}}>Allowed Currencies are: <span style={{color: 'red'}}>"GHS", "EUR", "GBP", "USD"</span></div>);
                }

                // Exchange Rate
                if (vldtExchangeRate(load.exchangeRate) === true) {
                    errors.push( <div style={{color: 'blue'}}>Exchange Rate: <span style={{color: 'green'}}> Correct</span></div>);
                } else {
                    errors.push(<div style={{color: 'blue'}}>Exchange Rate: <span style={{color: 'red'}}>Should be number and null value is not allow</span></div>);
                }

                // Invoice Numver
                if (vldtInvoiceNumber(load.invoiceNumber) === true) {
                    errors.push( <div style={{color: 'blue'}}>Invoice N0: <span style={{color: 'green'}}> Correct</span></div>);
                } else {
                    errors.push(<div style={{color: 'blue'}}>Invoice N0: <span style={{color: 'red'}}>Should be more than 4 chars || no spaces allowed betweeen</span></div>);
                }

                // Total Levy
                if (vldtTotalLevy(load.totalLevy) === true) {
                    errors.push( <div style={{color: 'blue'}}>Total Levy:<span style={{color: 'green'}}> Correct</span></div>);
                } else {
                    errors.push(<div style={{color: 'blue'}}>Total Levy:<span style={{color: 'red'}}> Incorrect and Invalid</span></div>);
                }
                
                // Username
                if (vldtUserName(load.userName) === true) {
                    errors.push( <div style={{color: 'blue'}}>Username:<span style={{color: 'green'}}> Correct</span></div>);
                } else {
                    errors.push(<div style={{color: 'blue'}}>Username:<span style={{color: 'red'}}> cannot have symbols</span></div>);
                }

                // flag
                if (vldtFlag(load.flag) === true) {
                    errors.push( <div style={{color: 'blue'}}>Flag:<span style={{color: 'green'}}> Correct</span></div>);
                } else {
                    errors.push(<div style={{color: 'blue'}}>Flag:<span style={{color: 'red'}}> Invalid Flag. It only be INVOICE, REFUND, REFUND_CANCELATION, PURCHASE, PURCHASE_CANCELATION</span></div>);
                }

                // Calculation Type
                if (vldtCalculationType(load.calculationType) === true) {
                    errors.push( <div style={{color: 'blue'}}>CalculationType:<span style={{color: 'green'}}> Correct</span></div>);
                } else {
                    errors.push(<div style={{color: 'blue'}}>CalculationType:<span style={{color: 'red'}}> Invalid Type: It can only be INCLUSIVE or EXCLUSIVE without <strong>WHITESPACE</strong></span></div>);
                }

                // Total VAT
                if (vldtTotalVat(load.totalVat) === true) {
                    errors.push( <div style={{color: 'blue'}}>Total VAT:<span style={{color: 'green'}}> Correct</span></div>);
                } else {
                    errors.push(<div style={{color: 'blue'}}>Total VAT:<span style={{color: 'red'}}> Invalid VAt value</span></div>);
                }

                // Transaction Date
                if (vldtTransactionDate(load.transactionDate) === true) {
                    errors.push( <div style={{color: 'blue'}}>Transaction Date:<span style={{color: 'green'}}> Correct</span></div>);
                } else {
                    errors.push(<div style={{color: 'blue'}}>Transaction Date:<span style={{color: 'red'}}> Date format can only be (yyyy-mm-dd) or (UTC time)</span></div>);
                }

                // Total Amount
                if (vldtTotalAmount(load.totalAmount) === true) {
                    errors.push( <div style={{color: 'blue'}}>Total Amount:<span style={{color: 'green'}}> Correct</span></div>);
                } else {
                    errors.push(<div style={{color: 'blue'}}>Total Amount:<span style={{color: 'red'}}> The Total Amount should be: <strong>0.0</strong> </span></div>);
                }

                // Voucher Amount
                if (vldtVoucherAmount(load.voucherAmount) === true) {
                    errors.push( <div style={{color: 'blue'}}>Voucher Amount:<span style={{color: 'green'}}> Correct</span></div>);
                } else {
                    errors.push(<div style={{color: 'blue'}}>Voucher Amount:<span style={{color: 'red'}}> Incorrect Pattern</span></div>);
                }

                // Business Partner Name
                if (vldtBusinessPartnerName(load.businessPartnerName) === true) {
                    errors.push( <div style={{color: 'blue'}}>B. Partner Name:<span style={{color: 'green'}}> Correct</span></div>);
                } else {
                    errors.push(<div style={{color: 'blue'}}>B. Partner Name:<span style={{color: 'red'}}> Incorrect Values</span></div>);
                }

                // Business Partner Tin
                if (vldtBusinessPartnerTin(load.businessPartnerTin) === true) {
                    errors.push( <div style={{color: 'blue'}}>B. Partner Tin:<span style={{color: 'green'}}> Correct</span></div>);
                } else {
                    errors.push(<div style={{color: 'blue'}}>B. Partner Tin:<span style={{color: 'red'}}> Can only be 11 or 15 chars without space</span></div>);
                }

                // Sales Type
                if (vldtSaleType(load.saleType) === true) {
                    errors.push( <div style={{color: 'blue'}}>Sale Type:<span style={{color: 'green'}}> Correct</span></div>);
                } else {
                    errors.push(<div style={{color: 'blue'}}>Sale Type:<span style={{color: 'red'}}> Invalid Sales Type. Allowed value are NORMAL, EXPORT, EXEMPTED</span></div>);
                }

                // Discount Type
                if (vldtDiscountType(load.discountType) === true) {
                    errors.push( <div style={{color: 'blue'}}>Discount Type:<span style={{color: 'green'}}> Correct</span></div>);
                } else {
                    errors.push(<div style={{color: 'blue'}}>Discount Type:<span style={{color: 'red'}}> Invalid Discount Type. Allowed values are GENERAL, SELECTIVE</span></div>);
                }

                // Discount Amount
                if (vldtDiscountAmount(load.discountAmount) === true) {
                    errors.push( <div style={{color: 'blue'}}>Discount Amount:<span style={{color: 'green'}}> Correct</span></div>);
                } else {
                    errors.push(<div style={{color: 'blue'}}>Discount Amount:<span style={{color: 'red'}}> Should be number</span></div>);
                }

                // Reference
                if (vldtReference(load.reference) === true) {
                    errors.push( <div style={{color: 'blue'}}>Reference:<span style={{color: 'green'}}> Correct</span></div>);
                } else {
                    errors.push(<div style={{color: 'blue'}}>Reference:<span style={{color: 'red'}}> Cannot be empty or null and it should be unique per every request</span></div>);
                }

                // Group Reference
                if (vldtGroupReferenceId(load.groupReferenceId) === true) {
                    errors.push( <div style={{color: 'blue'}}>Group Reference:<span style={{color: 'green'}}> Correct</span></div>);
                } else {
                    errors.push(<div style={{color: 'blue'}}>Group Reference:<span style={{color: 'red'}}> Can only be <strong>Numeric</strong></span></div>);
                }

                // Purchase Order Reference
                if (vldtPurchaseOrderReference(load.purchaseOrderReference) === true) {
                    errors.push( <div style={{color: 'blue'}}>Purchase Order Reference:<span style={{color: 'green'}}> Correct</span></div>);
                } else {
                    errors.push(<div style={{color: 'blue'}}>Purchase Order Reference:<span style={{color: 'red'}}> Can only be <strong>Numeric</strong></span></div>);
                }

                const itemMap = {};
                for (const item of load.items) {
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
            } else { 
                errors.push(<h1 style={{color: 'red'}}>Cannot Validate empty payload</h1>);
            }
        }

        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        } else {}
    }
    handleValidation(load);
    
    return (<>
        <Typography
            variant='h3' 
            style={{textDecoration: '3px dotted black underline'}} 
            mb={2} 
            color={'red'} 
            align='center'>GRA E-<span style={{color: 'yellow'}}>VAT V8.2</span><span style={{color: 'green'}}> Validator</span>
        </Typography>
        <div style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            flexItem: '1', 
            gap: '20px'
        }}>
            <span>
                <textarea 
                    type='text' 
                    rows="40" 
                    cols="60" 
                    onChange={(e) => setPayload(e.target.value)}
                    placeholder={PlaceHolder.value}
                /><br />
                <Button 
                    variant='outlined' 
                    onClick={handleValidation}
                    style={{ 
                        background: '#F0FFFE', 
                        color: 'green', 
                        fontWeight: 'bold', 
                        fontSize: '20px', 
                        marginRight: '20px'
                    }}>Validate
                </Button>
                <Button
                    variant='outlined'
                    href='/'
                    style={{ 
                        background: '#F0FFFE', 
                        color: 'red', 
                        fontWeight: 'bold', 
                        fontSize: '20px' 
                    }}
                >Clear Data
                </Button>
            </span>
            <span>
                {validationErrors.map((error, index) => (
                <table key={index}>
                    <thead>
                        <tr>
                            <td>{error}</td>
                        </tr>
                    </thead>
                </table>
                ))}
            </span>
        </div>
    </>);
}

export default PayloadValidator;
