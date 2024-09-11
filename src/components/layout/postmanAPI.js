import { Button, Typography } from '@mui/material';

export default function APIButton() {
    return (
        <Button sx={{ minWidth: 200 }} variant='contained' color='primary' onClick={() => window.open("https://documenter.getpostman.com/view/29596173/2s9YJgSKXe")}>
            <Typography>Test API</Typography>
        </Button>
    );
}