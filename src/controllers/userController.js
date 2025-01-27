const { Request, Response } = require("express");
const { TokenType, PrismaClient } = require("@prisma/client");

const hashPassword = require("../middlewares/hashPassword");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();
prisma.$extends(hashPassword);

/**
 * Handle user's login request.
 * @param {Request} req - Request HTTP
 * @param {Response} res - Response HTTP
 */
async function login(req, res) {
    const { mail, password } = req.body;
    if (!mail || !password) {
        return res.status(400).render('pages/login.html.twig', { error: 'Tout les champs sont requis !' });
    }
    if (mail.match(!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
        return res.status(400).render('pages/login.html.twig', { error: 'L\'adresse email n\'est pas valide !' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                mail: mail
            },
        });

        if (!user) throw "Email incorrecte";
        if (!await bcrypt.compare(password, user.password)) throw "Mot de passe incorrecte";

        req.session.accessToken = jwt.sign({ userId: user.id }, process.env.JWT_ACCESS_KEY, { expiresIn: "15m" });
        if (req.body.save === "on") {
            const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_KEY, { expiresIn: "7d" });
            setSignedCookie(res, "refreshToken", refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

            await prisma.token.create({
                data: {
                    type: TokenType.REFRESH_TOKEN,
                    token: refreshToken,
                    userId: user.id,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                }
            });
        }
        res.redirect("/dashboard");
    } catch (error) {
        console.log(error)
        return res.render('pages/login.html.twig', { error: error });
    }
};

module.exports = { login };