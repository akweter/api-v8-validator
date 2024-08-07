import axios from 'axios';
import { GRA_ENDPOINT, GRA_KEY, PROXY_ENDPOINT } from './auth/origins';

export const submitPayload = async (payload) => {
    JSON.stringify(payload);

    try {
        const response = await fetch(PROXY_ENDPOINT, {
            method: 'POST',
            headers: {
                'endpoint': GRA_ENDPOINT,
                'security_key': GRA_KEY
            },
            body: JSON.stringify(payload)
        });
    
        if (response.ok) {
            const data = await response.json();
            console.log("payload", payload);
            console.log("response", data);
        } else {
            console.log(`Error: ${response.status} ${response.statusText}`);
        }
        console.log('response raw', response);
    } catch (error) {
        console.log("Error sending payload:", error);
    }    
    return null;
}
