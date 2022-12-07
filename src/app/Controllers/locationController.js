const axios = require('axios');
// @route POST api/location/geolocate
// @desc get lat and long through ip address
// @access Public
const geolocate = async (req, res) => {
    await axios
        .post(`https://www.googleapis.com/geolocation/v1/geolocate?key=${process.env.GOOGLE_API_KEY}`)
        .then((response) => res.send(response.data))
        .catch((error) => res.send(error));
};
// @route POST api/location/reversegeo
// @desc get location through lat and long
// @access Public
const reversegeo = async (req, res) => {
    const { latitude, longitude } = req.body;
    await axios
        .post(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.GOOGLE_API_KEY}`,
        )
        .then((response) => res.send(response.data))

        .catch((error) => res.send(error));
};
module.exports = {
    geolocate,
    reversegeo,
};
