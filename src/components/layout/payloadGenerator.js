import React, { useEffect, useState } from 'react';
import CancelSharpIcon from '@mui/icons-material/CancelSharp';
import {
    Button,
    Dialog,
    AppBar,
    Toolbar,
    Typography,
    Box,
    Container,
} from '@mui/material';
import Slide from '@mui/material/Slide';
import GeneratForm from './payloadForm';
import logo from '../../images/logo.png';

// /* eslint-disable */
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="down" ref={ref} {...props} />;
});

export function PayloadGenerator({ setSubmitted, status }){
    const [drop, setDrop] = useState(false);
    const [open, setOpen] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 600);

    useEffect(() => {
        const handleResize = () =>  setIsSmallScreen(window.innerWidth < 600);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleOpen = () => { setOpen(true); };
    const handleClose = () => { setOpen(false); };

    return (
        <div>
            <Button
                variant='contained'
                color='secondary'
                size='large'
                onClick={handleOpen}
            >
                <Typography sx={{ minWidth: 200 }} variant='body1' >Generate Payload</Typography>
            </Button>
            <Dialog
                fullWidth
                maxWidth="lg"
                open={open}
                TransitionComponent={Transition}
                transitionDuration={1000}
            >
                <AppBar style={{ backgroundColor: '#151B4D' }}>
                    <Toolbar sx={{ justifyContent: 'space-between' }}>
                        <img src={logo} width={60} height={60} alt='Logo' />
                        <Typography
                            variant = {isSmallScreen ? "body1" : "h5"}
                            sx={{
                                flex: 1,
                                textAlign: 'center',
                                color: 'white'
                            }}
                        >
                            Generate Sample Payload - eVAT API V8
                        </Typography>
                        <Box>
                            <Button onClick={handleClose} fullWidth color='error' variant="contained" size='small' startIcon={<CancelSharpIcon />}>
                                Cancel
                            </Button>
                        </Box>
                    </Toolbar>
                </AppBar>
                <Container style={{ marginTop: isSmallScreen ? 80 : 10 }}>
                    < GeneratForm setSubmitted={setSubmitted} setDrop={setDrop} drop={drop} BackdropOpen={setOpen}/>
                </Container>
            </Dialog>
        </div>
    );
}
