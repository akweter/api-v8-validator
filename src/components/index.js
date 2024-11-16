import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Container,
    Box,
} from '@mui/material';
import ValidatorPage from './layout/validatorPage';
import TaxpayerTIN from './layout/tinValidator';
import DateTimeSecondsDisplay from './utilities/time.js';
import { PayloadGenerator } from './layout/payloadGenerator';
import APIButton from './layout/postmanAPI.js';
import ProxyServer from './layout/proxyServer.js';

export default function PayloadValidator() {
    return (
        <html>
            <AppBar sx={{ backgroundColor: '#55139a', position: 'relative' }}>
                <Toolbar sx={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '10px',
                            justifyContent: 'flex-end',
                            width: '100%',
                            marginTop: 1
                        }}
                    >
                        <Typography color='#FFFFFF' fontSize={30} sx={{ flexGrow: 1 }}>
                            GRA E-VAT API V8.2 Validator
                        </Typography>
                        < TaxpayerTIN />
                        < PayloadGenerator />
                        < ProxyServer />
                        < APIButton />
                        {DateTimeSecondsDisplay()}
                    </Box>
                </Toolbar>
            </AppBar>

            <Container sx={{ paddingTop: 2 }}>
                <ValidatorPage />
            </Container>
        </html>
    );
}
