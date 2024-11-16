import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Button,
    Grid,
    Typography,
    Box,
    Snackbar,
    Dialog,
    DialogContent,
    Backdrop,
    CircularProgress,
    Container,
    DialogTitle,
    TextField,
    FormControl,
} from '@mui/material';
import ValidateHeaderFields from '../validatation/validateHeaderFields';
import ValidateItems from '../validatation/validateItems';
import { GRA_ENDPOINT, GRA_KEY, PROXY_ENDPOINT, PROXY_ON_PREM_ENDPOINT } from '../auth/origins';
import ShowTable from './showTable';
import { writeText } from 'clipboard-polyfill';
import { GeneralCatchError } from '../utilities/errorHandler';
import { computeStandardTaxes } from '../computations/allTaxes';
import { Close, PostAdd } from '@mui/icons-material';

// /* eslint-disable */

export default function ValidatorPage() {
    const [userPayload, setUserPayload] = useState([]); // Basket for user userPayload
    const [ourPayload, setOurPayload] = useState([]); // Basket for our ourPayload
    const [errors, setErrors] = useState([]); // Basket for errors
    const [data, setData] = useState([]);
    const [copied, setCopied] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const [send, setSend] = useState(false);
    const [open, setOpen] = useState(false);
    const [response, showResponse] = useState(false);
    const [alert, setAlert] = useState({ color: "", message: "", header: "" });
    const [onprem, setOnprem] = useState(false);
    const [key, setKey] = useState({ key: null, TpReference: null });

    // Check the user userPayload if it is valid and push the data into ourPayload basket
    useEffect(() => {
        if (userPayload) {
            try {
                const parsedLoad = JSON.parse(userPayload);
                setOurPayload(parsedLoad);
            } catch (error) {
                setOurPayload('');
            }
        }
    }, [userPayload]);

    // Final validation after user click
    const handleValidation = () => {
        if (!ourPayload || ourPayload.length < 1) {
            setErrors([]);
            setAlert((e) => ({ ...e, message: `Invalid E-VAT API \n\n Format json load at https://jsonlint.com`, color: 'error', header: "Invalid Operation" }));
            setOpen(true);
        }
        else {
            const headerErr = ValidateHeaderFields(ourPayload);
            const itemErr = ValidateItems(ourPayload);

            if (headerErr || itemErr) {
                let mergedErrs = [];
                if (headerErr) { mergedErrs = [...mergedErrs, ...headerErr] }
                if (itemErr) { mergedErrs = [...mergedErrs, ...itemErr] }
                setErrors(mergedErrs);
            }
            else {
                setErrors([]);
                showResponse(true);
                const result = computeStandardTaxes(ourPayload);
                const { totalLevy, totalAmount, discountAmount, items, totalVat, } = result;
                setOurPayload((state) => ({
                    ...state,
                    totalLevy: totalLevy,
                    totalVat: totalVat,
                    items: items,
                    discountAmount: discountAmount,
                    totalAmount: totalAmount,
                }));
            }
        }

        // Retrieve taxpayer key details from localStorage and update state
        const storedKey = window.localStorage.getItem('security_key');
        const storedTpReference = window.localStorage.getItem('taxpayer_ref');
        if (storedKey) {
            setKey(prevState => ({ ...prevState, key: storedKey }));
        }
        if (storedTpReference) {
            setKey(prevState => ({ ...prevState, TpReference: storedTpReference }));
        }
    }

    // Copy Formatted userPayload to Clipboard
    const copyToClipboard = (data) => {
        const userPayloadText = JSON.stringify(ourPayload, null, 2);
        writeText(userPayloadText)
            .then(() => {
                setCopied(true);
                setTimeout(() => {
                    setCopied(false);
                }, 3000);
            })
            .catch((error) => { alert('Failed to copy!') });
    };

    const setValue = (e) => { setUserPayload(e.target.value); showResponse(false); setOurPayload([]) };

    // handle taxpyer key onchange
    const handleKeyChange = (event) => {
        const { name, value } = event.target;
        setKey({ ...key, [name]: value });
    };

    // Open dialog for on-prem Security Key Form
    const OpenOnprem = () => {
        setOnprem(true);
    }

    // Submit payload to On Prem VSDC
    const sendPayloadToOnprem = async () => {
        window.localStorage.setItem('security_key', key.key);
        window.localStorage.setItem('taxpayer_ref', key.TpReference);
        setOnprem(false);
        try {
            setSend(true);
            const output = await axios.post(`${PROXY_ON_PREM_ENDPOINT}/invoice`, ourPayload, {
                headers: {
                    'Content-Type': 'application/json',
                    'endpoint': `http://localhost:8888/api/v1/taxpayer/${key.TpReference}`,
                    'security_key': key.key
                }
            });
            const response = output.data.response;
            setData(response);
            setShowTable(true);
        }
        catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                const { response: { data: { message } } } = error;
                const err = JSON.stringify(message, null, 2);
                setAlert((e) => ({ ...e, message: err, color: 'error' }));
            } else {
                setAlert((e) => ({ ...e, message: "Error sending payload to GRA", color: 'error', header: "Request To GRA Failed!" }));
            }
            setOpen(true);
            setData([]);
        }
        setSend(false);
    }

    // Submit userPayload to GRA backend
    const handleSubmituserPayload = async () => {
        try {
            setSend(true);
            const output = await axios.post(`${PROXY_ENDPOINT}/invoice`, ourPayload, {
                headers: {
                    'Content-Type': 'application/json',
                    'endpoint': GRA_ENDPOINT,
                    'security_key': GRA_KEY
                }
            });
            const response = output.data.response;
            setData(response);
            setShowTable(true);
        }
        catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                const { response: { data: { message } } } = error;
                const err = JSON.stringify(message, null, 2);
                setAlert((e) => ({ ...e, message: err, color: 'error' }));
            } else {
                setAlert((e) => ({ ...e, message: "Error sending userPayload to GRA", color: 'error', header: "Request To GRA Failed!" }));
            }
            setOpen(true);
            setData([]);
        }
        setSend(false);
    };
    const handleClose = (event, reason) => { if (reason === 'clickaway') { return; } setOpen(false) };

    // Return the viewer on the browser
    return (
        <>
            <Backdrop color='secondary' xs={{ zIndex: (theme) => theme.zIndex.drawer + 1 }} open={send}>
                <CircularProgress size={35} color="inherit" />
            </Backdrop>
            {alert.message ? <GeneralCatchError alert={alert} handleClose={handleClose} open={open} /> : null}

            <Grid container spacing={2} sx={{ background: '#FDF3FF', cursor: 'text' }} justifyContent='revert'>
                <Grid item xs={12} md={6}>
                    {response && errors.length < 1 && Object.keys(ourPayload).length > 0 ? (
                        <Box>
                            <Box xs={{ width: 500 }}>
                                <Snackbar
                                    open={copied}
                                    message="Copied to clipboard!"
                                    autoHideDuration={3000}
                                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                                    color='#1B50CB'
                                />
                            </Box>
                            <Grid container justifyContent='center' spacing={1}>
                                <Grid item xs={8} sm={12}>
                                    <Typography
                                        variant='caption'
                                        color='ActiveCaption'
                                        fontFamily='cursive'
                                        fontSize={16}
                                    >
                                        Your Payload is formatted
                                    </Typography>
                                </Grid>
                                <Grid item xs={4} md={4}>
                                    <Button
                                        fullWidth
                                        variant='contained'
                                        color='inherit'
                                        size='small'
                                        onClick={copyToClipboard}
                                        title='Copy'
                                    >
                                        Copy Payload
                                    </Button>
                                </Grid>
                                <Grid item xs={6} md={4}>
                                    <Button
                                        fullWidth
                                        variant='contained'
                                        color='primary'
                                        size='medium'
                                        onClick={handleSubmituserPayload}
                                        title='Send userPayload to GRA'
                                    >
                                        Post To GRA
                                    </Button>
                                </Grid>
                                <Grid item xs={6} md={4}>
                                    <Button
                                        fullWidth
                                        variant='contained'
                                        color='secondary'
                                        size='medium'
                                        onClick={OpenOnprem}
                                        title='Send userPayload to GRA'
                                    >
                                        Post To On-Prem
                                    </Button>
                                </Grid>
                                <Grid item xs={12} sx={{
                                    width: 550,
                                    height: 510,
                                    background: '#F7FDFE',
                                    overflowY: 'scroll'
                                }}>
                                    <pre>{JSON.stringify(ourPayload, null, 2)}</pre>
                                </Grid>
                            </Grid>
                        </Box>
                    ) : null}

                    {errors.length > 0 ? (
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
                </Grid>
                <Grid item xs={12} md={6} order={{ xs: 2, md: 1 }} pt={0}>
                    <textarea
                        type='text'
                        rows='35'
                        style={{ width: '98%' }}
                        onChange={setValue}
                        placeholder={'Format GRA eVAT Payload and paste it here'}
                    />
                    <br />
                    <Container xs={{ padding: 1 }}>
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
                            onClick={() => { window.location.reload(); }}
                            style={{
                                background: '#F0FFFE',
                                color: 'red',
                                fontWeight: 'bold',
                                fontSize: '20px',
                            }}
                        >
                            Clear Data
                        </Button>
                    </Container>
                </Grid>
            </Grid>

            <div>
                <Dialog open={onprem}>
                    <DialogTitle>
                        <Typography variant='h5' color='darkblue'>GRA VSDC Security KEY</Typography>
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} py={3}>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <TextField
                                        label="Security Key"
                                        value={key.key}
                                        size='small'
                                        name='key'
                                        onChange={handleKeyChange}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <TextField
                                        label="Reference"
                                        value={key.TpReference}
                                        size='small'
                                        name='TpReference'
                                        placeholder='C000000000X-001'
                                        onChange={handleKeyChange}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <Button
                                        onClick={sendPayloadToOnprem}
                                        fullWidth
                                        color='secondary'
                                        variant="contained"
                                        size='medium'
                                        startIcon={<PostAdd />}
                                    >
                                        Post
                                    </Button>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <Button
                                        onClick={() => setOnprem(false)}
                                        fullWidth
                                        color='error'
                                        variant="contained"
                                        size='medium'
                                        startIcon={<Close />}
                                    >
                                        Cancel
                                    </Button>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </DialogContent>
                </Dialog>
            </div>

            {showTable && (
                <Dialog open={showTable}>
                    <DialogContent>
                        <ShowTable setShowTable={setShowTable} response={data} payload={ourPayload} />
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
