const express = require('express');
const router = express.Router();
const locationController = require('../app/Controllers/locationController');
// @route POST api/location/geolocate
// @desc get lat and long through ip address
// @access Public
router.post('/geolocate', locationController.geolocate);
// @route POST api/location/reversegeo
// @desc get location through lat and long
// @access Public
router.post('/reversegeo', locationController.reversegeo);

module.exports = router;
