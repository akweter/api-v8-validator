import { Card, CardActions, CardContent, Container, IconButton, Slide, Snackbar, Typography } from "@mui/material";
import MuiAlert from '@mui/material/Alert';

export const AlertError = ({ alert, open, handleClose }) => {
    return (
        <Snackbar
            open={open}
            autoHideDuration={4000}
            onClose={handleClose}
            TransitionComponent={Slide}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
            <MuiAlert
                elevation={6}
                variant="filled"
                onClose={handleClose}
                severity={alert.color}
            >
                {alert.message}
            </MuiAlert>
        </Snackbar>
    );
}

export const GeneralCatchError = ({ alert, open, handleClose }) => {
    return (<>
        <Snackbar
            open={open}
            autoHideDuration={8000}
            onClose={handleClose}
            TransitionComponent={Slide}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transitionDuration={500}
        >
            <Card sx={{ minWidth: 350, minHeight: 200, backgroundColor: '#EA9282', padding: 2 }}>
                <Container sx={{ backgroundColor: 'darkred' }}>
                    <Typography variant='h5' color='lightblue' >{alert.header}</Typography>
                </Container>
                <CardContent sx={{ backgroundColor: '#F0F0F0' }}>
                    <Typography sx={{ fontSize: 14, paddingTop: 1, whiteSpace: 'pre-line' }}>
                        {alert.message}
                    </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', backgroundColor: 'lightblue' }} onClick={handleClose}>
                    <IconButton size="small" color='error' variant='contained'> Close </IconButton>
                </CardActions>
            </Card>
        </Snackbar>
    </>);
}
