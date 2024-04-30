import jwt from 'jsonwebtoken';

const checkIfUserLogged = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(400).json({ error: 'You need to be logged in!' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(400).json({ error: 'JWT Token is Invalid!' });
        }
        req.user = decoded;
        next();
    });
};

export default checkIfUserLogged;