import React, { useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    Paper,
    DialogTitle,
    Button,
    DialogActions,
    DialogContent,
    Box,
    Snackbar,
    TableRow
} from '@mui/material';
import { writeText } from 'clipboard-polyfill';
import InvoiceTemplate from './printInvoice';

const ShowTable = ({ setShowTable, response, payload }) => {
    const [copied, setCopied] = useState(false);

    const {
        distributor_tin,
        message: {
            flag,
            num,
            ysdcid,
            ysdcrecnum,
            ysdcintdata,
            ysdcregsig,
            ysdcmrctim,
            ysdcitems
        },
        qr_code,
    } = response;

    // Copy Formatted Response to Clipboard
    const copyResponse = () => {
        const clipdata = JSON.stringify(response, null, 2);
        writeText(clipdata)
            .then(() => {
                setCopied(true);
                setTimeout(() => {
                    setCopied(false);
                }, 3000);
            })
            .catch((error) => {
                alert('Failed to copy!');
            });
    };

    // Print invoice
    const handlePrintIcon = () => {
        const data = {...response, ...payload}

        // setOpenPrintInvoice(false)
        const invoiceTemplateHTML = createInvoice(data);
        
        const printWindow = window.open('', '_blank');
        printWindow.document.body.innerHTML = invoiceTemplateHTML;
        printWindow.onload = () => {
            printWindow.print();

            setTimeout(() => {
                printWindow.onafterprint = () => {
                    printWindow.close();
                };
            }, 1000);
        };
    }

    const createInvoice = (row) => {
        const invoiceTemplate = ReactDOMServer.renderToStaticMarkup(< InvoiceTemplate data={row} />);
        return invoiceTemplate;
    };

    return (
        <>
            <Box sx={{ width: 500 }}>
                <Snackbar
                    open={copied}
                    message="Response copied to clipboard!"
                    autoHideDuration={3000}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    color='#1B50CB'
                />
            </Box>
            <DialogTitle color='darkblue' variant='h6'>Success Response From GRA Backend <hr /></DialogTitle>
            <DialogContent>
                <TableContainer component={Paper}>
                    <Table padding='checkbox'>
                        <TableBody>
                            <TableRow>
                                <TableCell>Supplier TIN</TableCell>
                                <TableCell>{distributor_tin}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>{flag} #</TableCell>
                                <TableCell>{num}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>SDC ID</TableCell>
                                <TableCell>{ysdcid}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Receipt #</TableCell>
                                <TableCell>{ysdcrecnum}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Internal Data</TableCell>
                                <TableCell>{ysdcintdata}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>{flag} Signature</TableCell>
                                <TableCell>{ysdcregsig}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Date & Time</TableCell>
                                <TableCell>{ysdcmrctim}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Flag</TableCell>
                                <TableCell>{flag}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Item Count</TableCell>
                                <TableCell>{ysdcitems}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>QR Code</TableCell>
                                <TableCell className="shortener">{encodeURIComponent(qr_code)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setShowTable(false)} variant='contained' color='error'>Close</Button>
                <Button onClick={copyResponse} variant='contained' color='inherit'>Copy Response</Button>
                <Button onClick={handlePrintIcon} variant='contained' color='primary'>Print Invoice</Button>
            </DialogActions>
        </>
    );
};

export default ShowTable;
