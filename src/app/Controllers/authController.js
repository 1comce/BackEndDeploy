const User = require('../Models/User');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
// @route GET api/auth
// @desc Check if user is logged in
// @access Public
const auth = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password -email -refreshToken');
        if (!user) return res.status(400).json({ success: false, message: 'User not found' });
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
// @route POST api/auth/register
// @desc Register user
// @access Public
const register = async (req, res) => {
    const { username, password, email } = req.body;
    //validation
    if (!username || !password || !email)
        return res.status(400).json({
            success: false,
            message: 'Missing username or password,email',
        });
    try {
        const user = await User.findOne({ username });
        if (user) return res.status(400).json({ success: false, message: 'Username already taken' });
        const emailChecked = await User.findOne({ email });
        if (emailChecked) return res.status(400).json({ success: false, message: 'Email already exist' });
        //all good
        const hashedPassword = await argon2.hash(password);
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });
        await newUser.save();
        // Return token
        const accessToken = jwt.sign({ userId: newUser._id }, process.env.ACCESS_TOKEN_SECRET);
        res.status(200).json({ success: true, message: 'User created successfully', accessToken });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
// @route GET api/auth/refresh
// @desc Refresh token
// @access Private
const refresh = async (req, res) => {
    //take refesh token from user
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(401).json({ success: false, message: 'Not Authenticated' });
    const refreshToken = cookies.jwt;
    //delete old refresh token
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    if (!refreshToken) return res.status(401).json('Not Authenticated');
    try {
        const user = await User.findOne({ refreshToken });
        // Detected refresh token reuse
        if (!user) {
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (error, payload) => {
                if (error) return res.status(403).json({ success: false, message: 'Forbidden' });
                const hackedUser = await User.findOne({ username: payload.username });
                hackedUser.refreshToken = [];
                await hackedUser.save();
            });
        }
        const newRefreshTokenArray = user.refreshToken.filter((rt) => rt !== refreshToken);
        //verify token
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (error, payload) => {
            if (error) {
                //expired token
                user.refreshToken = [...newRefreshTokenArray];
                await user.save();
            }
            if (error || user._id.valueOf() !== payload.userId)
                return res.status(403).json({ success: false, message: 'Forbidden' });
            // token valid
            const accessToken = jwt.sign(
                { userId: user._id, username: user.username },
                process.env.ACCESS_TOKEN_SECRET,
                {
                    expiresIn: '20s',
                },
            );
            //create new refresh token
            const newRefreshToken = jwt.sign(
                { userId: user._id, username: user.username },
                process.env.REFRESH_TOKEN_SECRET,
                {
                    expiresIn: '1d',
                },
            );
            user.refreshToken = [...newRefreshTokenArray, newRefreshToken];
            await user.save();
            res.cookie('jwt', newRefreshToken, {
                httpOnly: true,
                sameSite: 'None',
                secure: true,
                maxAge: 24 * 60 * 60 * 1000,
            });
            res.status(200).json({ accessToken, username: user.username });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
// @route POST api/auth/login
// @desc Login user
// @access Public
const login = async (req, res) => {
    const cookies = req.cookies;
    const { username, password } = req.body;
    //simpler validation
    if (!username || !password)
        return res.status(400).json({
            success: false,
            message: 'Missing username and/or password',
        });
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ success: false, message: 'Incorrect username or password' });
        // username found
        const passwordValid = await argon2.verify(user.password, password);
        if (!passwordValid) return res.status(400).json({ success: false, message: 'Incorrect username or password' });
        //All good
        const accessToken = jwt.sign({ userId: user._id, username: user.username }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '20s',
        });
        const newRefreshToken = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: '1d',
            },
        );
        let newRefreshTokenArray = !cookies?.jwt
            ? user.refreshToken
            : user.refreshToken.filter((rt) => rt !== cookies.jwt);
        if (cookies?.jwt) {
            //scenerio:
            // 1-user log-in but never use refresh token and does not log out
            // 2-refresh token is stolen
            // 3-if 1 and 2 then clear all refresh token upon login
            const refreshToken = cookies.jwt;
            const foundToken = await User.findOne({ refreshToken });
            //detected reuse token
            if (!foundToken) {
                //clear all previous refresh token
                newRefreshTokenArray = [];
            }
            res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
        }
        user.refreshToken = [...newRefreshTokenArray, newRefreshToken];
        await user.save();
        res.cookie('jwt', newRefreshToken, {
            httpOnly: true,
            sameSite: 'None',
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
        });
        return res.status(200).json({ success: true, message: 'Login successfully', accessToken });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
// @route GET api/auth/logout
// @desc Logout user
// @access Public
const logout = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(204);
    const refreshToken = cookies.jwt;
    try {
        const user = await User.findOne({ refreshToken });
        if (!user) {
            res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
            res.status(204);
        }
        //delete cookies
        user.refreshToken = user.refreshToken.filter((rt) => rt !== refreshToken);
        await user.save();
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
        res.status(200).json({ success: true, message: 'Logout success' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
module.exports = {
    auth,
    register,
    refresh,
    login,
    logout,
};
