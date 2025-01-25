const { Request, Response } = require("express");
const { PrismaClient } = require("@prisma/client");
const { setSignedCookie } = require("../utils/cookie");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const hashPassword = require("../middlewares/hashPassword");
const prisma = new PrismaClient().$extend(hashPassword);

/**
 * Handle user's login request.
 * @param {Request} req - Request HTTP
 * @param {Response} res - Response HTTP
 */
module.exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).render('pages/login.html.twig', { error: 'Tout les champs sont requis !' });
    }
    if (email.match(!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
        return res.status(400).render('pages/login.html.twig', { error: 'L\'adresse email n\'est pas valide !' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        if (!user) throw "Email incorrecte";
        if (!await bcrypt.compare(password, user.password)) throw "Mot de passe incorrecte";
        if (req.body.save === "on") {
            const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_KEY, { expiresIn: "7d" });
            setSignedCookie(res, "refreshToken", refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
            req.session.accessToken = jwt.sign({ userId: user.id }, process.env.JWT_ACCESS_KEY, { expiresIn: "15m" });
        }
        
    } catch (error) {
        return res.status(500).render('pages/login.html.twig', error);
    }
    res.redirect("/");

};