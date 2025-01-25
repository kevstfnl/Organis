const { Request, Response } = require("express");
const jwt = require("jsonwebtoken");
const { clearSignedCookie } = require("../utils/cookie");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const REFRESH_TOKEN_KEY = process.env.JWT_REFRESH_KEY;
const ACCESS_TOKEN_KEY = process.env.JWT_ACCESS_KEY;

/**
 * Middleware to check user's authentication.
 * @param {Request} req - Request HTTP
 * @param {Response} res - Response HTTP
 * @param {NextFunction} next - Next stage of the request
 */
module.exports.verify = async (req, res, next) => {
    if (req.session && req.session.accessToken) {
        try {
            const accessData = jwt.verify(req.session.accessToken, ACCESS_TOKEN_KEY);
            const user = await prisma.user.findUnique({
                where: {
                    id: accessData.userId,
                },
            });
            if (!user) throw "User not found";
            req.user = user;
            return next();
        } catch (error) {
            const refreshToken = req.signedCookies.refreshToken;
            if (error.name === 'TokenExpiredError' && refreshToken) {
                try {
                    const refreshData = jwt.verify(refreshToken, REFRESH_TOKEN_KEY);
                    const userRefresh = await prisma.user.findUnique({
                        where: {
                            id: refreshData.userId,
                        },
                        include: {
                            tokens: true,
                        },
                    });
                    if (userRefresh && userRefresh.token === refreshToken && userRefresh.token.expiresAt > new Date()) {
                        const accessToken = jwt.sign(refreshData, ACCESS_TOKEN_KEY, { expiresIn: "15m" });
                        req.session.accessToken = accessToken;
                        req.user = userRefresh;
                        return next();
                    }
                    throw "Token falsified";
                } catch (error) {
                    console.error(error);
                    clearSignedCookie(res, "refreshToken");
                    res.session.destroy();
                }
            }
        }
    }
    res.redirect("/");
};