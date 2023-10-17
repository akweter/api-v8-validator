const handleValidation = () => {
    const errors = [];
    
    const validateString = (value, fieldName, minLength) => {
        if (typeof value !== 'string' || value.length < minLength) {
            errors.push(`Invalid ${fieldName}. It should be a string with a minimum length of ${minLength}.`);
        }
    };

    const validateNumber = (value, fieldName) => {
        if (isNaN(value) || value === '') {
            errors.push(`Invalid ${fieldName}. It should be a number.`);
        }
        alert(fieldName+" "+value);
    };

    const validateEnum = (value, fieldName, allowedValues) => {
        if (!allowedValues.includes(value)) {
            errors.push(`Invalid ${fieldName}. Allowed values are: ${allowedValues.join(', ')}.`);
        }
    };

    // Payload Object
    const payload = {
      currency: 'GHS',
      exchangeRate: 1.0,
      invoiceNumber: 'NS230818-9X00001',
      // Add other payload fields here
    };

    // Validate Payload
    validateEnum(payload.currency, 'currency', ['GHS', 'EURO', 'GBP']);
    validateNumber(payload.exchangeRate, 'exchangeRate');
    validateString(payload.invoiceNumber, 'invoiceNumber', 4);

    // Add validation for other payload fields here

    // Check for Errors
    if (errors.length > 0) {
    setValidationErrors(errors);
    } else {
    // Handle valid payload
    }
}
