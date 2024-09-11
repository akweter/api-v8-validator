import React, { useState, useEffect } from 'react';
import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined';
import {
    FormControl,
    Grid,
    Paper,
    Box,
    Stack,
    TextField,
    Button,
    Autocomplete,
    CircularProgress,
    Select,
    InputLabel,
    MenuItem,
    ToggleButtonGroup,
    ToggleButton,
    FormControlLabel,
    Checkbox,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme, styled } from '@mui/material/styles';
import { ContentCopy } from '@mui/icons-material';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';

import { computeStandardTaxes } from '../computations/allTaxes';
import { itemlistPayload, payloadStructure } from '../utilities/placeholder';
import { AlertError } from '../utilities/errorHandler';
import { products } from '../api/products';
import { verifyTIN } from '../api/request';
import { writeText } from 'clipboard-polyfill';

const Item = styled(Paper)(({ theme }) => ({
    ...theme.typography.body2,
    color: theme.palette.text.secondary,
    padding: 20,
    display: 'flex',
    flexDirection: 'row',
}));
const lightTheme = createTheme({ palette: { mode: 'light' } });

/* eslint-disable */

export default function GeneratForm() {
    const [open, setOpen] = useState(false);
    const [load, setLoad] = useState(false);
    const [cashCustomer, setCashCustomer] = useState(false);
    const [header, setHeader] = useState(payloadStructure);
    const [itemlists, setItemLists] = useState(itemlistPayload);
    const [alert, setAlert] = useState({ message: '', color: 'success' });

    // disable customer cash && Update currency for Ghana cedis.
    useEffect(() => {      
        const { currency } = header;
        if (currency === 'GHS') {
            setHeader(state => ({ ...state, exchangeRate: '1.0' }));
        }
        if (cashCustomer === true) {
            setHeader(state => ({ ...state, businessPartnerTin: 'C0000000000' }));
        }
        // Insert random value to Invoice number
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            const rand = Math.floor(Math.random() * chars.length);
            result += chars[rand];
        }
        setHeader((state) => ({
            ...state,
            invoiceNumber: result
        }));
    }, [header.currency, header.exchangeRate, header.businessPartnerTin, cashCustomer]);

    useEffect(() => {
            const timer = setTimeout(() => {
                const { quantity, unitPrice, ...filter } = header;
                const result = computeStandardTaxes(filter);
                const {
                    totalLevy,
                    totalAmount,
                    discountAmount,
                    items,
                    totalVat,
                    flag,
                } = result;
                setHeader((state) => ({
                    ...state,
                    totalAmount: Number(totalAmount || 0.00),
                    discountAmount: Number(discountAmount || 0.00),
                    totalLevy: Number(totalLevy || 0.00),
                    totalVat: Number(totalVat || 0.00),
                    items: items,
                }));
                /* 
                    Fixing a spill over bug - Future update will solve this bug
                    quanity and unitPrice update in header state when onchange
                */
                setHeader((state) => {
                    const { quantity, unitPrice, ...fixBug } = state;
                    return fixBug;
                });
            }, 500);
            return () => clearTimeout(timer);
    }, [
        header.voucherAmount,
        header.discountType,
        header.saleType,
        header.calculationType,
        header.items,
    ]);
    
    // handle header onchange
    const handleMainChange = (event) => {
        const { name, value } = event.target;
        setHeader({ ...header, [name]: value });
        setItemLists({ ...itemlists, [name]: value });
    };

    // Reqquest Customer TIN
    const TinRequest = async () => {
        if (header.businessPartnerTin === "C0000000000" || "") { return; }
        setLoad(true);
        try {
            const response = await verifyTIN(header.businessPartnerTin);
            if (response.status === "SUCCESS") {
                setHeader(prevState => ({
                    ...prevState,
                    businessPartnerName: response.data.name
                }));                
            } else {
                setAlert((e) => ({ ...e, message: 'TIN not found', color: 'error' }));
                setCashCustomer(!cashCustomer);
            }
        } catch (error) {
            setAlert({color: 'error', message: 'TIN not found'});
        }
        setLoad(false);
    }

    // Discount Type onChnage
    const handleDiscountChange = (event) => {
        const isChecked = event.target.checked;
        const updatedDiscountType = isChecked ? 'SELECTIVE' : 'GENERAL';

        setHeader((prevHeader) => ({
            ...prevHeader,
            discountType: updatedDiscountType,
        }));
    };

    // Check cash customer info
    const CheckCashCustomer = () => {
        setCashCustomer(!cashCustomer);
        setHeader((state) => ({ ...state, businessPartnerName: "", businessPartnerTin: "" }));
    }

    // Generate Reference
    const generateRef = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            result += chars[randomIndex];
        }
        setHeader((state) => ({
            ...state,
            reference: result
        }));
    }

    // Show alert function.
    const showAlert = (message, color) => {
        setAlert({ message, color });
        setOpen(true);
    };

    const isPositiveNumber = (value) => !isNaN(value) && value > 0;

    // Add items to the basket
    const addToCart = () => {
        const { description, unitPrice, quantity, discountAmount } = itemlists;

        if (!isPositiveNumber(quantity)) {
            showAlert('Quantity must be a positive number', 'error');
            return;
        }
        else if (description === "" || description === null) {
            showAlert('Product name cannot be empty', 'error');
            return;
        }
        else if (!isPositiveNumber(unitPrice)) {
            showAlert('Unit price must be positive value', 'error');
            return;
        }
        else if (discountAmount >= (quantity * unitPrice)) {
            showAlert(`Disount should be less than the subtotal amount: ${quantity * unitPrice}`, 'error');
            return;
        }
        else {
            setHeader((prevHeader) => ({
                ...prevHeader,
                items: [...prevHeader.items, { ...itemlists }],
            }));
            setItemLists({
                ...itemlists,
                itemCode: "",
                itemCategory: null,
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
                totalAmount: "",
            });
        }
    }

    // Submit form to GRA
    const copyPayload = async () => {
        const mandatoryFields = [
            'currency',
            'calculationType',
            'transactionDate',
            'exchangeRate',
            'saleType',
            'businessPartnerName',
            'businessPartnerTin',
            'invoiceNumber',
            'userName',
            'flag',
            'totalAmount',
            'items'
        ];

        const emptyFields = mandatoryFields.filter(field => !header[field] || header[field] === '');
        if (emptyFields.length > 0) {
            const errorMessage = `${emptyFields.join(', ')} cannot be empty.`;
            setAlert((e) => ({ ...e, message: errorMessage, color: 'error' }));
            return setOpen(true);
        }
        try {
            const payloadText = JSON.stringify(header, null, 2);
            writeText(payloadText)
            .then(() => {
                setAlert((e) => ({ ...e, message: 'Copied to clipboard', color: 'success' }));
                setOpen(true);
            })
        }
        catch (error) {
            setAlert((e) => ({ ...e, message: "Failed to copy to clipboard!", color: 'error' }));
            setOpen(true);
        }
    };

    // handle alerts
    const handleClose = (event, reason) => { if (reason === 'clickaway') { return; } setOpen(false); };

    return (<>
        <ThemeProvider theme={lightTheme}>
            {alert.message ? <AlertError open={open} alert={alert} handleClose={handleClose} /> : null }
            <Box
                sx={{
                    borderRadius: 2,
                    bgcolor: 'background.default',
                    display: 'grid',
                    flexDirection: 'row',
                    gridTemplateColumns: { md: '1.2fr 1.8fr' },
                }}
            >
                <Item>
                    <Grid container spacing={2} py={3}>
                        <Grid item xs={3}>
                            <FormControl fullWidth>
                                <ToggleButtonGroup
                                    fullWidth
                                    size='small'
                                    color={'info'}
                                    value={header.businessPartnerName || ""}
                                    exclusive
                                    name="businessPartnerName"
                                    onChange={CheckCashCustomer}
                                >
                                    <ToggleButton color="primary">Cash</ToggleButton>
                                </ToggleButtonGroup>
                            </FormControl>
                        </Grid>
                        <Grid item xs={load ? 7 : 9 }>
                            <FormControl fullWidth>
                                <TextField
                                    label="Business Partner Name"
                                    value={header.businessPartnerName}
                                    name='businessPartnerName'
                                    disabled={!cashCustomer}
                                    size='small'
                                    onChange={handleMainChange}
                                />
                            </FormControl>
                        </Grid>
                        <>{load ? (<> <Grid item xs={load ? 2 : 0}><CircularProgress size={22} color='primary'/></Grid></>) : null }</>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <TextField
                                    label="Customer TIN"
                                    value={header.businessPartnerTin}
                                    name='businessPartnerTin'
                                    size='small'
                                    onChange={handleMainChange}
                                    onBlur={TinRequest}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <TextField
                                    label="User Name"
                                    value={header.userName}
                                    name='userName'
                                    size='small'
                                    onChange={handleMainChange}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="saleType">SaleType</InputLabel>
                                <Select
                                    labelId="saleType"
                                    id="saleType"
                                    label="saleType"
                                    name="saleType"
                                    disabled={true}
                                    value={header.saleType}
                                    onChange={handleMainChange}
                                    size='small'
                                >
                                    <MenuItem value='NORMAL'>Normal</MenuItem>
                                    {/* <MenuItem value='EXPORT'>Export</MenuItem> */}
                                    {/* <MenuItem value='RENT'>Real Estate</MenuItem> */}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="flag">Flag</InputLabel>
                                <Select
                                    labelId="flag"
                                    id="flag"
                                    label="flag"
                                    name="flag"
                                    value={header.flag}
                                    onChange={handleMainChange}
                                    size='small'
                                >
                                    <MenuItem value='INVOICE'>Invoice</MenuItem>
                                    <MenuItem value='PURCHASE'>Purchase</MenuItem>
                                    {/* <MenuItem value='FLT'>Flat Rate</MenuItem> */}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="calculationType">calculation Type</InputLabel>
                                <Select
                                    labelId="calculationType"
                                    id="calculationType"
                                    label="calculationType"
                                    name="calculationType"
                                    value={header.calculationType}
                                    onChange={handleMainChange}
                                    size='small'
                                >
                                    <MenuItem value='INCLUSIVE'>Inclusive</MenuItem>
                                    <MenuItem value='EXCLUSIVE'>Exclusive</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControlLabel
                                label="Selective Discount"
                                control={
                                    <Checkbox
                                        checked={header.discountType === 'SELECTIVE'}
                                        onChange={handleDiscountChange}
                                        color="secondary"
                                    />
                                }
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="currency">Currency</InputLabel>
                                <Select
                                    labelId="currency"
                                    id="currency"
                                    label="currency"
                                    name="currency"
                                    size='small'
                                    onChange={handleMainChange}
                                    value={header.currency}
                                >
                                    <MenuItem value='AED'>UAE Dirham (د.إ)</MenuItem>
                                    <MenuItem value='CAD'>Canadian Dollar (CA$)</MenuItem>
                                    <MenuItem value='CNY'>Chinese Yuan (CN¥)</MenuItem>
                                    <MenuItem value='EUR'>Euro (€)</MenuItem>
                                    <MenuItem value='GBP'>British Pound (£)</MenuItem>
                                    <MenuItem value='GHS'>Ghanaian Cedi (₵)</MenuItem>
                                    <MenuItem value='HKD'>Hong Kong Dollar (HK$)</MenuItem>
                                    <MenuItem value='INR'>Indian Rupee (₹)</MenuItem>
                                    <MenuItem value='JPY'>Japanese Yen (¥)</MenuItem>
                                    <MenuItem value='LRD'>Liberian Dollar (LRD)</MenuItem>
                                    <MenuItem value='NGN'>Nigerian Naira (₦)</MenuItem>
                                    <MenuItem value='USD'>US Dollar ($)</MenuItem>
                                    <MenuItem value='ZAR'>South African Rand (ZAR)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <TextField
                                    label="Exchange Rate"
                                    type="number"
                                    value={header.exchangeRate}
                                    disabled={header.currency === "GHS" ? true : false}
                                    name='exchangeRate'
                                    size='small'
                                    onChange={handleMainChange}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <TextField
                                    label="Group Reference ID"
                                    type="groupReferenceId"
                                    value={header.groupReferenceId}
                                    name='groupReferenceId'
                                    size='small'
                                    onChange={handleMainChange}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <DatePicker
                                    selected={header.transactionDate ? new Date(header.transactionDate) : null}
                                    onChange={(date) => {
                                        const selectedDate = date || new Date();
                                        setHeader({
                                            ...header,
                                            transactionDate: `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
                                        });
                                    }}
                                    value={header.transactionDate}
                                    dateFormat="yyyy-MM-dd"
                                    maxDate={new Date()}
                                    placeholderText="Transaction Date"
                                    className='formDate'
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <TextField
                                    label="Voucher Amount"
                                    type="number"
                                    value={header.voucherAmount}
                                    name='voucherAmount'
                                    size='small'
                                    onChange={handleMainChange}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <Button
                                    fullWidth
                                    onClick={generateRef}
                                    size='small'
                                    variant='contained'
                                    color='inherit'
                                >
                                    Generate Reference
                                </Button>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <Autocomplete
                                    id="product-search"
                                    options={products}
                                    getOptionLabel={(option) => option.title ? option.title : ''}
                                    disabled={header.calculationType ? false : true}
                                    onChange={(event, selectedProduct) => {
                                        if (selectedProduct) {
                                            setItemLists((oldValue) => ({
                                                ...oldValue,
                                                unitPrice: selectedProduct.price,
                                                description: selectedProduct.title,
                                                itemCode: selectedProduct.id,
                                                itemCategory: selectedProduct.category,
                                                quantity: 1,
                                            }));
                                        }
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Search product or service"
                                            variant="outlined"
                                            size="small"
                                            color="primary"
                                            fullWidth
                                            key={params.itemCode}
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <>
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                ),
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                            <FormControl fullWidth>
                                <TextField
                                    label="Price / Rate"
                                    type="number"
                                    value={itemlists.unitPrice}
                                    name='unitPrice'
                                    size='small'
                                    onChange={handleMainChange}
                                    disabled={itemlists.description ? false : true}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                            <FormControl fullWidth>
                                <TextField
                                    label="Quantity / Period"
                                    type="number"
                                    value={itemlists.quantity}
                                    name='quantity'
                                    size='small'
                                    onChange={handleMainChange}
                                    disabled={itemlists.description ? false : true}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                            <FormControl fullWidth>
                                <TextField
                                    label="Discount"
                                    type="number"
                                    value={itemlists.discountAmount}
                                    name='discountAmount'
                                    size='small'
                                    onChange={handleMainChange}
                                    disabled={itemlists.description ? false : true}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <Stack direction="row" spacing={2}>
                                    <Button onClick={addToCart} fullWidth color='primary' variant="contained" size='large' startIcon={<AddShoppingCartOutlinedIcon />}>
                                        Add Item
                                    </Button>
                                </Stack>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <Stack direction="row" spacing={2}>
                                    <Button onClick={copyPayload} fullWidth color='success' variant="contained" size='large' startIcon={<ContentCopy />}>
                                        Copy Payload
                                    </Button>
                                </Stack>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Item>
                <Item>
                    <Grid container>
                        <Grid item xs={12} sx={{
                            width: 550,
                            height: 510,
                            background: '#F7FDFE',
                            overflowY: 'scroll'
                        }}>
                            <textarea
                                type='text'
                                rows='33'
                                style={{ width: '85%' }}
                                value={JSON.stringify(header, null, 2)}
                            />
                        </Grid>
                    </Grid>
                </Item>
            </Box>
        </ThemeProvider>
    </>);
}
