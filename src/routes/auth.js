const express = require('express');
const router = express.Router();
const authController = require('../app/Controllers/authController');
const verifyToken = require('../middleware/verifyJWT');
// @route GET api/auth
// @desc Check if user is logged in
// @access Public
router.get('/', verifyToken, authController.auth);
// @route GET api/auth/refresh
// @desc Refresh token
// @access Private
router.get('/refresh', authController.refresh);
// @route POST api/auth/register
// @desc Register user
// @access Public
router.post('/register', authController.register);
// @route POST api/auth/login
// @desc Login user
// @access Public
router.post('/login', authController.login);
// @route GET api/auth/logout
// @desc Logout user
// @access Public
router.get('/logout', authController.logout);
module.exports = router;
