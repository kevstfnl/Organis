const { Request, Response } = require("express");

/**
 * Create a signed cookie
 * @param { Response } res - Response HTTP
 * @param { string } name - Name of cookie
 * @param { string } value - Cookie content
 * @param { number } maxAge - Life time of cookie
 */
function setSignedCookie(res, name, value, maxAge) {
    res.cookie(name, value, {
        signed: true,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: maxAge
    });
}

/**
 * Delete signed cookie and clear current user's session
 * @param { Request } req - Request HTTP
 * @param { Response } res - Response HTTP
 * @param { string } name - Name of cookie to delete
 */
function clearSignedCookieAndSession(req, res, name) {
    req.session.destroy();
    res.clearCookie(name, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
}

module.exports = { setSignedCookie, clearSignedCookieAndSession };