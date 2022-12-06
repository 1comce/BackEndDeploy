const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // const authHeader = req.header('Authorization');
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ success: false, message: 'Not Authenticated' });
    } else {
        const token = authHeader.split(' ')[1];
        if (!token) return res.status(400).json({ success: false, message: 'Token not found' });
        try {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, payload) => {
                if (error) {
                    throw new Error(error);
                }
                req.userId = payload.userId;
                next();
            });
        } catch (error) {
            res.status(403).json({ success: false, message: 'Invalid token' });
        }
    }
};
module.exports = verifyToken;
