const allowedOrigins = require('./allowedOrigins');
const corsConfig = {
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // credentials can be config seperately in middleware
};

module.exports = corsConfig;
