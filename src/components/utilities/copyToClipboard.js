import { writeText } from "clipboard-polyfill";

// Copy Formatted payload to Clipboard
export const copyToClipboard = (data, setCopied) => {
    const payloadText = JSON.stringify(data, null, 2);
    writeText(payloadText)
        .then(() => {
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 3000);
        })
        .catch((error) => { alert('Failed to copy!') });
};
