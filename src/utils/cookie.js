const { Request, Response } = require("express");

/**
 * Créer un cookie signé
 * @param {Response} res - Response HTTP
 * @param {string} name - Le nom du cookie
 * @param {string} value - La valeur à stocker dans le cookie
 * @param {number} maxAge - Durée de vie du cookie en millisecondes (ex : 1 jour = 24 * 60 * 60 * 1000)
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
 * Supprimer un cookie signé
 * @param {Request} req - Request HTTP
 * @param {Response} res - Response HTTP
 * @param {string} name - Le nom du cookie à supprimer
 */
function clearSignedCookieAndSession(req, res, name) {
    req.session.destroy();
    res.clearCookie(name, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
    });
    res.redirect("/");
}

module.exports = { setSignedCookie, clearSignedCookieAndSession };