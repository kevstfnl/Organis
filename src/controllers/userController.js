const { Request, Response } = require("express");
const { TokenType, PrismaClient, Role } = require("@prisma/client");
const { setSignedCookie } = require("../utils/cookie");

const hashPassword = require("../middlewares/hashPassword");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendMailChangePassword } = require("../utils/mail");
const prisma = new PrismaClient().$extends(hashPassword);

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
        if (!await bcrypt.compare(password, user.password)) throw "Le mot de passe n'est pas valide !"

        req.session.accessToken = jwt.sign({ userId: user.id }, process.env.JWT_ACCESS_KEY, { expiresIn: "15m" });
        await prisma.token.deleteMany({
            where: {
                userId: user.id
            }
        });

        if (req.body.save === "on") {
            const refresh = crypto.randomBytes(16).toString("hex");
            const refreshToken = jwt.sign({ key: refresh }, process.env.JWT_REFRESH_KEY, { expiresIn: "7d" });
            setSignedCookie(res, "refreshToken", refreshToken, (7 * 24 * 60 * 60 * 1000));

            await prisma.token.create({
                data: {
                    type: TokenType.REFRESH_TOKEN,
                    token: refresh,
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

/**
 * Update user information.
 * @param {Request} req - Request HTTP
 * @param {Response} res - Response HTTP
 */
async function update(req, res) {
    const { mail, lastName, firstName, age, genre, phone } = req.body;

    const lastUser = req.user;
    let verified = true;

    if (mail !== lastUser.mail) {
        if (mail.match(!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
            return res.render("pages/profile/profile.html.twig", { user: req.user, error: "Email invalide !" });
        }
        verified = false;
    }

    const user = await prisma.user.update({
        where: {
            id: lastUser.id
        },
        data: {
            mail,
            verified,
            lastName,
            firstName,
            ...(age && age !== '' && { age }),
            ...(genre && genre !== '' && { genre }),
            ...(phone && phone !== '' && { phone })
        }
    });
    if (!user.verified) {
        sendPassMail(user);
        return res.redirect("/dashboard");
    }
    res.render("pages/profile/profile.html.twig", { user: user });
}


/**
 * Send a request to change user's password
 * @param {Request} req - Request HTTP
 * @param {Response} res - Response HTTP
 */
async function sendForgotPasswordRequest(req, res) {
    const mail = req.body.mail;
    if (mail.match(!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
        return res.status(400).render("pages/mails/forgotpass.html.twig", { error: "Email invalide !" });
    }
    try {
        const user = await prisma.user.findUnique({
            where: {
                mail: mail,
                verified: true
            }
        });
        if (!user) throw "Compte non trouvé";
        await prisma.token.deleteMany({
            where: {
                userId: user.id,
                type: TokenType.PASSWORD_RESET
            }
        });
        sendPassMail(user);
        return res.redirect("/");

    } catch (err) {
        console.error(err);
        return res.status(500).render("pages/mails/forgotpass.html.twig", { error: err });
    }
}

/**
 * Update user forgotten password.
 * @param {Request} req - Request HTTP
 * @param {Response} res - Response HTTP
 */
async function updateForgotPassword(req, res) {
    const cryptedToken = req.params.token;
    if (!cryptedToken) return res.redirect("/");

    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).render("pages/mails/changeforgotpass.html.twig", { error: 'Les mots de passe ne correspondent pas !' })
    }
    try {
        const token = jwt.verify(cryptedToken, process.env.JWT_VERIFICATION_KEY);

        const tokenInDatabase = await prisma.token.findFirst({
            where: {
                token: token.data,
                type: TokenType.PASSWORD_RESET
            },
            include: {
                user: true
            }
        });
        if (!tokenInDatabase) throw "Token invalide";
        const user = await prisma.user.update({
            where: {
                id: tokenInDatabase.user.id
            },
            data: {
                password: password
            }
        });
        await prisma.token.deleteMany({
            where: {
                userId: user.id,
            }
        });
        res.redirect("/login");
    } catch (err) {
        console.error(err);
        res.status(500).redirect("/");
    }
}

/**
 * Update user password.
 * @param {Request} req - Request HTTP
 * @param {Response} res - Response HTTP
 */
async function sendUpdatePasswordRequest(req, res) {
    const { oldPassword, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
        return res.render("pages/mails/changepass.html.twig", { error: 'Les mots de passe ne correspondent pas !' });
    }
    if (!await bcrypt.compare(oldPassword, req.user.password)) {
        return res.render("pages/mails/changepass.html.twig", { error: 'Ancien mot de passe incorrecte !' });
    }
    try {
        await prisma.user.update({
            where: {
                id: req.user.id
            },
            data: {
                password: password
            }
        });
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.render("pages/mails/changepass.html.twig", { error: err });
    }
}

/**
 * Function to generate token and send this by mail
 */
async function sendPassMail(user) {
    const random = crypto.randomBytes(32).toString("hex");
    await prisma.token.create({
        data: {
            type: TokenType.PASSWORD_RESET,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            token: random,
            userId: user.id
        }
    });
    const token = jwt.sign({ data: random }, process.env.JWT_VERIFICATION_KEY, { expiresIn: "15m" });
    sendMailChangePassword(user, token);
}

/**
 * Update user password.
 * @param {Request} req - Request HTTP
 * @param {Response} res - Response HTTP
 */
async function displayDashboard(req, res) {
    const user = req.user;
    try {
        const enterprise = await prisma.enterprise.findUnique({
            where: {
                id: user.enterpriseId
            },
            include: {
                users: true,
                materials: true
            }
        });

        enterprise.users.forEach((user) => {
            user.id = jwt.sign({ id: user.id }, process.env.JWT_SHARING_ID, { expiresIn: "15m" });
        });

        if (!enterprise) throw "Entreprise non trouvé";

        res.render("pages/dashboard.html.twig", { user: req.user, users: enterprise.users, materials: enterprise.materials });
    } catch (err) {
        console.log(err);
        res.redirect("/");
    }
}

module.exports = { login, update, sendForgotPasswordRequest, updateForgotPassword, sendUpdatePasswordRequest, displayDashboard };