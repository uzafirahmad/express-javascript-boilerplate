import { validationResult, matchedData } from 'express-validator';

const validateDTO = (validations) => {
    return [
        ...validations,
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    status: 'error',
                    errors: errors.array().map(err => ({
                        field: err.param,
                        message: err.msg
                    }))
                });
            }

            req.data = matchedData(req, { locations: ['body', 'query', 'params', 'cookies', 'headers'] });
            next();
        }
    ];
};

export default validateDTO;
