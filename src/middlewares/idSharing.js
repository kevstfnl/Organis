const { Request, Response } = require("express");
const jwt = require("jsonwebtoken");

/**
 * Middleware to uncrypt with jwt id contained in url.
 * @param {Request} req - Request HTTP
 * @param {Response} res - Response HTTP
 * @param {NextFunction} next - Next stage of the request
 */
module.exports.uncryptIds = (req, res, next) => {
    const cryptedId = req.params.id;
    if (!cryptedId) res.redirect("/");
    try {
        const data = jwt.verify(cryptedId, process.env.JWT_SHARING_ID);
        if (!data) throw "unkown id";
        req.params.id = data.id;
        next();
    } catch (err) {
        res.redirect("/");
    }
}