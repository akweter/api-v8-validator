
import React, { useState, useEffect } from 'react';
import { Button, Grid, Typography, Box, Snackbar } from '@mui/material';
import ValidateHeaderFields from './validateHeaderFields';
import ValidateItems from './validateItems';
import { performComputations } from './computations/taxes';
import DateTimeSecondsDisplay from './utilities/time';
// import { PlaceHolder } from './placeholder';

/* eslint-disable */

function PayloadValidator() {
    const [ready, GetReady] = useState(false);
    const [copied, setCopied] = useState(false);
    const [payload, setPayload] = useState({ originalLoad: [], parseLoad: [] }); // Basket for user payload
    const [ourPayload, setOurPayload] = useState([]); // Basket for our computed payload
    const [errors, setErrors] = useState([]); // Basket for errors

    // Check the user payload if it is valid and push the data into parseLoad basket
    useEffect(() => {
        const { originalLoad } = payload;
        if (originalLoad) {
            try {
                const parsedLoad = JSON.parse(originalLoad);
                setPayload((oldState) => ({ ...oldState, parseLoad: parsedLoad }));
            }
            catch (error) {
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
            GetReady(false);
            window.alert('Invalid E-VAT API');
        }
        else {
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
            }
            else {
                setErrors([]);
                performComputations(payload.parseLoad, setOurPayload, GetReady);
            }
        }
    }

    // Copy Formatted payload to Clipboard
    const copyToClipboard = () => {
        navigator.clipboard.writeText(JSON.stringify(ourPayload, null, 2))
          .then(() => {
            setCopied(true);
            setTimeout(() => {
              setCopied(false);
            }, 3000);
          })
          .catch((error) => {
            alert('Falied to copy!');
            return null;
          });
    };    

    // Return the viewer on the browser
    return (
        <div id='maniBody'>

            <div id='headerQuote'>
                <i><strong>Validate INVOICE | REFUND | PURCHASE | PARTIAL_REFUND</strong></i>
            </div>

            <Typography color='#1B50CB' align='center' p={1} fontSize={30} >
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
                                            variant='outlined' 
                                            color='primary' 
                                            size='small'
                                            onClick={copyToClipboard}
                                            title='Copy'
                                        >
                                            Copy
                                        </Button>
                                    </Grid>
                                    <Grid item sx={4} sm={3}>
                                        <Button 
                                            variant='outlined' 
                                            color='primary' 
                                            size='small'
                                            onClick={() => alert("sent to GRA")}
                                            title='Send Payload to GRA'
                                        >
                                            Submit To GRA
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
                        ) : null }
                        
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
            
            <i style={{textAlign: 'center'}}><strong>{DateTimeSecondsDisplay()}</strong></i>
        </div>
    );
}

export default PayloadValidator;
