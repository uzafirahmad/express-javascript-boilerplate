import jwt from 'jsonwebtoken'

const fetchUser = (req, res, next) => {
    try {
        const JWT_SECRET = process.env.JWT_SECRET;

        // Extract the bearer token from the request
        const token = req.header("Authorization").split(" ")[1];

        if (!token) {
            return res.status(401).send({ error: "Please authenticate using a valid token" });
        }
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data;
        next();

    } catch (error) {
        return res.status(401).send({ error: "Please authenticate using a valid token" });
    }
};

export default fetchUser