const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const cookieParser = require('cookie-parser');
const corsConfig = require('./config/cors/corsConfig');
const credentials = require('./middleware/credentials');
require('dotenv').config();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(credentials);
app.use(cors(corsConfig));
app.use(cookieParser());
const db = require('./config/db');
db.connect();

const route = require('./routes');
const { debugPort } = require('process');

app.use(express.json());
app.get('/', (req, res) => {
    res.status(200).send('sended');
});
app.post('/search', (req, res) => {
    console.log(req.body);
    res.send('');
});
route(app);
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
