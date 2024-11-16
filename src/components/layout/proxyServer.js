import { Button, Typography } from '@mui/material';

export default function ProxyServer() {
    return (
        <Button sx={{ minWidth: 200 }} variant='contained' color='success' onClick={() => window.location.href="https://cors.proxy.jamesakweter.tech/CORSProxy.exe"}>
            <Typography>CORS Proxy</Typography>
        </Button>
    );
}