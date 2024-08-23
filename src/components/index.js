import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GRA_ENDPOINT, GRA_KEY, PROXY_ENDPOINT } from './auth/origins';
import {
    Button,
    Grid,
    Typography,
    Box,
    Snackbar,
    Dialog,
    DialogContent,
    Backdrop,
    CircularProgress} from '@mui/material';
import ValidateHeaderFields from './validateHeaderFields';
import ValidateItems from './validateItems';
import { performComputations } from './computations/taxes';
import DateTimeSecondsDisplay from './utilities/time';
import { writeText } from 'clipboard-polyfill';
import ShowTable from './showTable';

/* eslint-disable */

function PayloadValidator() {
    const [ready, setReady] = useState(false);
    const [copied, setCopied] = useState(false);
    const [payload, setPayload] = useState({ originalLoad: [], parseLoad: [] }); // Basket for user payload
    const [ourPayload, setOurPayload] = useState([]); // Basket for our computed payload
    const [errors, setErrors] = useState([]); // Basket for errors
    const [data, setData] = useState([]);
    const [showTable, setShowTable] = useState(false);
    const [send, setSend] = useState(false);

    // Check the user payload if it is valid and push the data into parseLoad basket
    useEffect(() => {
        const { originalLoad } = payload;
        if (originalLoad) {
            try {
                const parsedLoad = JSON.parse(originalLoad);
                setPayload((oldState) => ({ ...oldState, parseLoad: parsedLoad }));
            } catch (error) {
                setPayload({ parseLoad: '' });
            }
        }
    }, [payload.originalLoad]);

    // Final validation after user click
    function handleValidation() {
        const { parseLoad } = payload;
        if (!parseLoad || parseLoad.length < 1) {
            setOurPayload([]);
            setErrors([]);
            setReady(false);
            window.alert('Invalid E-VAT API');
        } else {
            const headerErr = ValidateHeaderFields(payload.parseLoad);
            const itemErr = ValidateItems(payload.parseLoad);
            if (headerErr || itemErr) {
                let mergedErrs = [];
                if (headerErr) {
                    mergedErrs = [...mergedErrs, ...headerErr];
                }
                if (itemErr) {
                    mergedErrs = [...mergedErrs, ...itemErr];
                }
                setErrors(mergedErrs);
            } else {
                setErrors([]);
                performComputations(payload.parseLoad, setOurPayload, setReady);
            }
        }
    }

    // Copy Formatted payload to Clipboard
    const copyToClipboard = () => {
        const payloadText = JSON.stringify(ourPayload, null, 2);
        writeText(payloadText)
            .then(() => {
                setCopied(true);
                setTimeout(() => {
                    setCopied(false);
                }, 3000);
            })
            .catch((error) => { alert('Failed to copy!')});
    };

    // Submit payload to GRA backend
    const handleSubmitPayload = async () => {
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
            console.log('error',error);
            if (error.response && error.response.data && error.response.data.message) {
                const { response: { data: { message } } } = error;
                alert(JSON.stringify(message, null, 2));
            } else {
                alert("Error sending payload to GRA");
            }
            setData([]);
        }
        setSend(false);
    };

    // Return the viewer on the browser
    return (
        <div id='maniBody'>
            <div id='headerQuote'>
                <i><strong>Validate INVOICE | REFUND | PURCHASE | PARTIAL_REFUND</strong></i>
            </div>
            <Backdrop color='secondary' sx={{zIndex: (theme) => theme.zIndex.drawer + 1 }} open={send}>
                <CircularProgress size={35} color="inherit" />
            </Backdrop>

            <Typography color='#1B50CB' align='center' p={1} fontSize={30}>
                GRA E-VAT API V8.2 Validator
            </Typography>

            <div id='subBody1'>
                <Grid container spacing={2} sx={{ background: '#FDF3FF ', cursor: 'text', paddingBottom: 1 }} justifyContent='revert'>
                    <Grid item xs={12} md={6}>
                        {ready && errors.length < 1 ? (
                            <Box>
                                <Box sx={{ width: 500 }}>
                                    <Snackbar
                                        open={copied}
                                        message="Copied to clipboard!"
                                        autoHideDuration={3000}
                                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                                        color='#1B50CB'
                                    />
                                </Box>
                                <Grid container justifyContent='center'>
                                    <Grid item sx={8} sm={6}>
                                        <Typography
                                            variant='caption'
                                            color='ActiveCaption'
                                            fontFamily='cursive'
                                            fontSize={16}
                                        >
                                            Your payload is formatted
                                        </Typography>
                                    </Grid>
                                    <Grid item sx={4} sm={3}>
                                        <Button
                                            variant='contained'
                                            color='inherit'
                                            size='small'
                                            onClick={copyToClipboard}
                                            title='Copy'
                                        >
                                            Copy Payload
                                        </Button>
                                    </Grid>
                                    <Grid item sx={4} sm={3}>
                                        <Button
                                            variant='contained'
                                            color='primary'
                                            size='small'
                                            onClick={handleSubmitPayload}
                                            title='Send Payload to GRA'
                                        >
                                            Submit Payload
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
                            onChange={(e) =>
                                setPayload((oldState) => ({
                                    ...oldState,
                                    originalLoad: e.target.value,
                                }))
                            }
                            placeholder={'Format GRA eVAT Payload and paste it here'}
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

            <i style={{ textAlign: 'center' }}><strong>{DateTimeSecondsDisplay()}</strong></i>

            {showTable && (
                <Dialog open={showTable}>
                    <DialogContent>
                        <ShowTable setShowTable={setShowTable} response={data} payload={ourPayload}/>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}

export default PayloadValidator;
