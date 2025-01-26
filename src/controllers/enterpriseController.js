const { Request, Response } = require("express");
const { Role, TokenType, PrismaClient } = require("@prisma/client");
const { sendMailValidation } = require("../utils/mail");

const crypto = require('crypto');
const jwt = require("jsonwebtoken");
const hashPassword = require("../middlewares/hashPassword");
const prisma = new PrismaClient().$extends(hashPassword);

/**
 * Handle enterprise register with administrator account.
 * @param {Request} req - Request HTTP
 * @param {Response} res - Response HTTP
 **/
module.exports.register = async (req, res) => {
    const { name, reason, siret, lastName, firstName, mail, password, confirmPassword } = req.body;
    if (!name || !reason || !siret || !lastName || !firstName || !mail || !password || !confirmPassword) {
        return res.status(400).render('pages/register.html.twig', { error: 'Tout les champs sont requis !' });
    }
    if (siret.match(!/^[0-9]{14}$/)) {
        return res.status(400).render('pages/register.html.twig', { error: 'Le SIRET doit contenir 14 chiffres !' });
    }
    if (mail.match(!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
        return res.status(400).render('pages/register.html.twig', { error: 'L\'adresse email n\'est pas valide !' });
    }
    if (password !== confirmPassword) {
        return res.status(400).render('pages/register.html.twig', { error: 'Les mots de passe ne correspondent pas !' });
    }

    try {
        const enterprise = await prisma.enterprise.create({
            data: {
                name,
                reason,
                siret: parseInt(siret)
            }
        });
        const user = await prisma.user.create({
            data: {
                firstName,
                lastName,
                role: Role.ADMIN,
                mail,
                password,
                enterprise: {
                    connect: { id: enterprise.id }
                }
            }
        });

        const random = crypto.randomBytes(32).toString("hex");
        await prisma.token.create({
            data: {
                type: TokenType.EMAIL_VERIFICATION,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
                token: random,
                userId: user.id
            }
        });
        const token = jwt.sign({data: random}, process.env.JWT_VERIFICATION_KEY, { expiresIn: "15m" } );
        sendMailValidation(user, token);
        res.render("pages/mails/unverified.html.twig", { user });
    } catch (error) {
        console.log(error);
        return res.status(500).render('pages/register.html.twig', error);
    }
};
