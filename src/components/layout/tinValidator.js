import React, { useState } from 'react';
import {
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { verifyGhCardTIN, verifyTIN } from '../api/request';
import { vldtBusinessPartnerTin } from '../validatation/validations';
import { AlertError } from '../utilities/errorHandler';

const ValidationResultDialog = ({ open, res, handleClose }) => (
    <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        sx={{ '& .MuiPaper-root': { padding: '16px' } }}
    >
        <DialogTitle>
            <Button variant="outlined" color="error" onClick={handleClose}>
                Close
            </Button>
        </DialogTitle>
        <DialogContent>
            <Paper elevation={3}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <Typography variant="h5" color="darkred" textAlign="center">
                                    Result
                                </Typography>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {res?.status === 'SUCCESS' ? (
                                Object.entries(res.data).map(([key, value]) => (
                                    <TableRow key={key}>
                                        <TableCell>{key.replace(/_/g, ' ').toUpperCase()}</TableCell>
                                        <TableCell>{value || 'Unavailable'}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <Typography variant="body1" align="center" padding={10}>
                                    No details found!
                                </Typography>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </DialogContent>
    </Dialog>
);

export default function TaxpayerTIN() {
    const [res, setRes] = useState([]);
    const [data, setData] = useState('');
    const [tin, setTin] = useState('');
    const [loading, setLoading] = useState(false);
    const [tinData, setTinData] = useState(false);
    const [error, setError] = useState({ color: "", message: "" });

    const handleSubmit = async () => {
        // if (!vldtBusinessPartnerTin(data)) {
        //     setError({ color: 'error', message: `Invalid ${tin} format.` });
        //     return setTinData(false);            
        // }
        setLoading(true);
        try {
            const result = tin === 'Tin' ? await verifyTIN(data) : await verifyGhCardTIN(data);
            setRes(result);
            setTinData(true);
        } catch {
            setRes([]);
            setTinData(false); // Ensure dialog does not open on fetch error
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setTin('');
        setData('');
        setTinData(false);
    };

    return (
        <Box sx={{ minWidth: 200 }}>
            <AlertError open={Boolean(error.message)} alert={error} handleClose={() => setError({ color: "", message: "" })} />
            <Paper>
                {tin === '' ? (
                    <FormControl fullWidth>
                        <InputLabel id="tin_validator">Tin Validator</InputLabel>
                        <Select
                            labelId="tin_validator"
                            id="tin_validator"
                            label="Tin Validator"
                            value={tin}
                            onChange={(event) => setTin(event.target.value)}
                            size="small"
                        >
                            <MenuItem value="Tin">TIN</MenuItem>
                            <MenuItem value="Ghana Card">GH CARD</MenuItem>
                        </Select>
                    </FormControl>
                ) : (
                    <Paper style={{ display: 'flex', alignItems: 'center', padding: '2px' }}>
                        <TextField
                            label={`Validate ${tin}`}
                            type="search"
                            variant="outlined"
                            size="small"
                            style={{ flexGrow: 1, marginRight: 8 }}
                            value={data}
                            onChange={(e) => setData(e.target.value)}
                        />
                        <IconButton size="small" onClick={handleSubmit}>
                            {loading ? <CircularProgress size={23} /> : <Search />}
                        </IconButton>
                    </Paper>
                )}
            </Paper>

            <ValidationResultDialog
                open={tinData}
                res={res}
                handleClose={handleClose}
            />
        </Box>
    );
}
