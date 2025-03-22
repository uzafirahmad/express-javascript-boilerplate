import { validationResult, matchedData } from 'express-validator';

const validateDTO = (validations) => {
    return [
        ...validations,
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const errorMessages = errors.array().map(err => `${err.msg}`).join(', ');

                return res.status(400).json({
                    status: 'error',
                    message: errorMessages,
                    // errors: errors.array().map(err => ({
                    //     field: err.param,
                    //     message: err.msg
                    // }))
                });
            }

            req.data = matchedData(req, { locations: ['body', 'query', 'params', 'cookies', 'headers'] });
            next();
        }
    ];
};

export default validateDTO;