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
module.exports.verify = async (req, res, next) => {
    // Check session is active
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
        } catch (err) {
            console.error(err)
        }
    }

    // If session not active check cookie to restaure session
    const refreshToken = req.signedCookies.refreshToken;
    if (refreshToken) {
        try {
            const refreshData = jwt.verify(refreshToken, REFRESH_TOKEN_KEY);
            const tokenDb = await prisma.token.findUnique({
                where: {
                    token: refreshData,
                    type: TokenType.REFRESH_TOKEN
                },
                include: {
                    user: true
                }
            });
            if (!tokenDb) throw "Token falsified";
            if (tokenDb.expiresAt  > new Date()) {
                const accessToken = jwt.sign({userId: tokenDb.userId}, ACCESS_TOKEN_KEY, { expiresIn: "15m" });
                req.session.accessToken = accessToken;
                req.user = tokenDb.user;
            }
        } catch (error) {
            console.error(error);
            clearSignedCookieAndSession(req, res, "refreshToken");
            res.session.destroy();
        }
    }
    
    res.redirect("/");
};