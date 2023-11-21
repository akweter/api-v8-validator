import React, { useState, useEffect } from 'react';
import { Button, Typography } from '@mui/material';
import { PlaceHolder } from './placeholder';
import ValidateHeaderFields from './validateHeaderFields';
import ValidateItems from './validateItems';

function PayloadValidator() {
    const [payload, setPayload] = useState({originalLoad: ([]), parseLoad: ([])});
    const [errors, setErrors] = useState([]);

    useEffect(()=> {
        const { originalLoad } = payload;
        if (originalLoad) {
            try {
                const parseLoad = JSON.parse(originalLoad);
                setPayload((oldState) => ({...oldState, parseLoad: parseLoad}));
            } catch (error) {
                setPayload({parseLoad: ''});
            }
        }
    }, [payload.originalLoad]);

    function handleValidation(){
        const { parseLoad } = payload;
        if (typeof parseLoad !== "string") {
            let headerErrors = ValidateHeaderFields(parseLoad);
            let itemErrors = ValidateItems(parseLoad);

            if (headerErrors === undefined) {
                headerErrors = [];
            }        
            if (itemErrors === undefined) {
                itemErrors = [];
            }        
            const errors = [...headerErrors, ...itemErrors];
            setErrors(errors);
        }
        else{
            alert('Not valid JSON load');
        }
    }

    return (<>
        <Typography
            variant='h3' 
            style={{textDecoration: '3px dotted black underline'}} 
            mb={2} 
            color={'red'} 
            align='center'>GRA E-<span style={{color: 'yellow'}}>VAT V8.2</span><span style={{color: 'green'}}> Validator</span>
        </Typography>
        <div style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            flexItem: '1', 
            gap: '20px'
        }}>
            <span>
                <textarea 
                    type='text' 
                    rows="40" 
                    cols="60" 
                    onChange={(e) => setPayload((oldState) => ({...oldState, originalLoad: e.target.value}))}
                    placeholder={PlaceHolder.value}
                /><br />
                <Button 
                    variant='outlined' 
                    onClick={handleValidation}
                    style={{ 
                        background: '#F0FFFE', 
                        color: 'green', 
                        fontWeight: 'bold', 
                        fontSize: '20px', 
                        marginRight: '20px'
                    }}>Validate
                </Button>
                <Button
                    variant='outlined'
                    onClick={()=>{window.location.reload()}}
                    style={{ 
                        background: '#F0FFFE', 
                        color: 'red', 
                        fontWeight: 'bold', 
                        fontSize: '20px' 
                    }}
                >Clear Data
                </Button>
            </span>
            <span>
                {errors.map((error, index) => (
                <table key={index}>
                    <thead>
                        <tr>
                            <td>{`Error ${index + 1}: ${error}`}</td>
                        </tr>
                    </thead>
                </table>
                ))}
            </span>
        </div>
    </>);
}

export default PayloadValidator;
