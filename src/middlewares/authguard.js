const { Request, Response } = require("express");
const { clearSignedCookieAndSession } = require("../utils/cookie");
const { TokenType, PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

const REFRESH_TOKEN_KEY = process.env.JWT_REFRESH_KEY;
const ACCESS_TOKEN_KEY = process.env.JWT_ACCESS_KEY;

/**
 * Middleware to check user's authentication.
 * @param {Request} req - Request HTTP
 * @param {Response} res - Response HTTP
 * @param {NextFunction} next - Next stage of the request
 */
module.exports.authguard = async (req, res, next) => {
    if (req.session && req.session.accessToken) {
        try {
            const accessToken = jwt.verify(req.session.accessToken, ACCESS_TOKEN_KEY);
            const user = await prisma.user.findUnique({
                where: {
                    id: accessToken.userId
                },
            });
            if (!user) throw "Invalid id in access token";
            req.user = user;
            return next();
        } catch (err) {
            console.error(err);
        }
    }

    if (req.signedCookies && req.signedCookies.refreshToken) {
        try {

            const refreshToken = jwt.verify(req.signedCookies.refreshToken, REFRESH_TOKEN_KEY);
            const refreshTokenInDatabase = await prisma.token.findFirst({
                where: {
                    token: refreshToken.key,
                    type: TokenType.REFRESH_TOKEN
                },
                include: {
                    user: true
                }
            });

            if (!refreshTokenInDatabase) {
                throw { message: "Invalid refresh token", user: refreshTokenInDatabase.user }
            };
            if (refreshTokenInDatabase.expiresAt < new Date()) {
                throw { message: "Refresh token expired", user: refreshTokenInDatabase.user }
            };

            const newAccessToken = jwt.sign({ userId: refreshTokenInDatabase.userId }, ACCESS_TOKEN_KEY, { expiresIn: "15m" });
            req.session.accessToken = newAccessToken;
            req.user = refreshTokenInDatabase.user;
            return next();
        } catch (err) {
            console.error(err.message);
            clearSignedCookieAndSession(req, res, "refreshToken");
        }
    }
    res.redirect("/");



};