const { Request, Response } = require("express");
const { TokenType, Role, PrismaClient, } = require("@prisma/client");
const { sendMailValidation } = require("../utils/mail");

const hashPassword = require("../middlewares/hashPassword");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const prisma = new PrismaClient().$extends(hashPassword);

/**
 * Register new entreprise and user account and send mail validation.
 * @param {Request} req - Request HTTP
 * @param {Response} res - Response HTTP
 **/
async function register(req, res) {
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
        sendValidateMail(user);
        const cryptedId = jwt.sign({id: user.id}, process.env.JWT_SHARING_ID, { expiresIn: "15m" });
        res.render("pages/mails/unverified.html.twig", { userId: cryptedId });
    } catch (error) {
        console.log(error);
        return res.status(500).render('pages/register.html.twig', error);
    }
}

/**
 * Send a validation's mail to confirm account creation.
 * @param {Request} req - Request HTTP
 * @param {Response} res - Response HTTP
 **/
async function sendValidationMail(req, res) {
    const id = req.params.id;
    if (!id) res.status(400).res.redirect("/");

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: parseInt(id)
            }
        });
        
        if (!user) throw "Utilisateur non trouvé";
        if (!req.query.nosend) await sendValidateMail(user);
    
        const cryptedId = jwt.sign({id: user.id}, process.env.JWT_SHARING_ID, { expiresIn: "15m" });
        res.render("pages/mails/unverified.html.twig", { userId: cryptedId });
    } catch (err) {
        console.error(err);
        res.status(500).redirect("/");
    }
}

/**
 * Change mail before account confirmation.
 * @param {Request} req - Request HTTP
 * @param {Response} res - Response HTTP
 **/
async function requestChangeValidationMail(req, res) {
    const id = req.params.id;
    if (!id) res.status(400).res.redirect("/");
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: parseInt(id)
            }
        });
        if (!user) throw "Utilisateur non trouvé";
        if (user.verified) throw "Utilisateur déja vérifié";
        const cryptedId = jwt.sign({id: user.id}, process.env.JWT_SHARING_ID, { expiresIn: "15m" });
        res.render("pages/mails/changemail.html.twig", { userId: cryptedId});
    } catch (err) {
        console.error(err);
        res.status(500).redirect("/");
    }
}

/**
 * Change mail before account confirmation.
 * @param {Request} req - Request HTTP
 * @param {Response} res - Response HTTP
 **/
async function handleChangeValidationMail(req, res) {
    const id = req.params.id;
    if (!id) res.redirect("/");

    const { mail, password } = req.body;

    const cryptedId = jwt.sign({id: id}, process.env.JWT_SHARING_ID, { expiresIn: "15m" });
    if (mail.match(!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
        return res.status(400).render('pages/mails/changemail.html.twig', { userId: cryptedId, error: 'L\'adresse email n\'est pas valide !' });
    }

    try {
        let user = await prisma.user.findUnique({
            where: {
                id: parseInt(id)
            }
        });
        if (user.verified) throw "Utilisateur déja vérifié";
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(400).render('pages/mails/changemail.html.twig', {
                userId: cryptedId,
                error: "Le mot de passe n'est pas valide !"
            });
        }
        await prisma.token.deleteMany({
            where: {
                userId: parseInt(id),
                type: TokenType.EMAIL_VERIFICATION
            }
        });
        user = await prisma.user.update({
            where: {
                id: parseInt(id)
            },
            data: {
                mail: mail
            }
        });
        
        await sendValidateMail(user);
        
        res.render("pages/mails/unverified.html.twig", { userId: cryptedId });

    } catch (err) {
        console.error(err);
        res.status(500).redirect("/");
    }
}

/**
 * Change mail before account confirmation.
 * @param {Request} req - Request HTTP
 * @param {Response} res - Response HTTP
 **/
async function validateMail(req, res) {
    const token = req.params.token;
    if (!token) res.redirect("/");

    try {
        const verified = jwt.verify(token, process.env.JWT_VERIFICATION_KEY);
        const tokenInDb = await prisma.token.findFirst({
            where: {
                token: verified.data,
                type: TokenType.EMAIL_VERIFICATION,
            }
        });
        if (!tokenInDb) throw "Token invalide";
        const user = await prisma.user.update({
            where: {
                id: tokenInDb.userId
            },
            data: {
                verified: true
            }
        });
        await prisma.token.deleteMany({
            where: {
                userId: user.id,
                type: TokenType.EMAIL_VERIFICATION
            }
        });
        res.redirect("/login");
    } catch (err) {
        console.error(err);
        res.status(500).redirect("/");
    }
}


/**
 * Function to generate token and send this by mail
 */
async function sendValidateMail(user) {
    const random = crypto.randomBytes(32).toString("hex");
    await prisma.token.create({
        data: {
            type: TokenType.EMAIL_VERIFICATION,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            token: random,
            userId: user.id
        }
    });
    const token = jwt.sign({ data: random }, process.env.JWT_VERIFICATION_KEY, { expiresIn: "15m" });
    sendMailValidation(user, token);
}

module.exports = { sendMail: sendValidateMail, register, sendValidationMail, requestChangeValidationMail, handleChangeValidationMail, validateMail }