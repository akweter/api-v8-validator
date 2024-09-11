import React, { useEffect, useState } from "react";
import { Chip } from '@mui/material'

function DateTimeSecondsDisplay() {
    const [formattedDateTime, setFormattedDateTime] = useState('');

    const getFormattedDateTime = () => {
        const options = {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true,
        };

        const currentDate = new Date();
        const formattedDate = new Intl.DateTimeFormat('en-US', options).format(currentDate);
        const daySuffix = (() => {
            const day = currentDate.getDate();
            if (day >= 11 && day <= 13) {
                return 'th';
            }
            switch (day % 10) {
                case 1:
                    return 'st';
                case 2:
                    return 'nd';
                case 3:
                    return 'rd';
                default:
                    return 'th';
            }
        })();

        const fds = formattedDate.replace(/(\d+)(th|st|nd|rd)/, `$1${ daySuffix }`);
        return fds;
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            setFormattedDateTime(getFormattedDateTime());
        }, 1000);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <>
            <Chip sx={{ minWidth: 200, padding: 2.5 }} label={formattedDateTime} color="warning" variant="filled" size='medium'/>
        </>
    );
};

export default DateTimeSecondsDisplay; 