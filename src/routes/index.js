const authRouter = require('./auth');
const locationRouter = require('./location');
function route(app) {
    app.use('/api/auth', authRouter);
    app.use('/api/location', locationRouter);
}

module.exports = route;
