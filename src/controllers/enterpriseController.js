const { Request, Response } = require("express");
const { Role, TokenType, PrismaClient } = require("@prisma/client");
const hashPassword = require("../middlewares/hashPassword");
const crypto = require("crypto");
const { sendMailToNewUser } = require("../utils/mail");

const prisma = new PrismaClient().$extends(hashPassword);

/**
 * Add member
 * @param {Request} req - Request HTTP
 * @param {Response} res - Response HTTP
 **/
async function addMember(req, res) {
    const { mail, lastName, firstName } = req.body;
    if (req.user.role != Role.ADMIN) res.redirect("/");

    if (!mail || !lastName || !firstName) {
        return res.status(400).render("pages/dashboard/addmember.html.twig", { error: 'Tout les champs sont requis !' });
    }
    if (mail.match(!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
        return res.status(400).render("pages/dashboard/addmember.html.twig", { error: 'L\'adresse email n\'est pas valide !' });
    }

    try {
        const enterprise = await prisma.enterprise.findUnique({
            where: {
                id: req.user.enterpriseId
            }
        });
        if (!enterprise) throw "Entreprise non trouvé !";
        const password = crypto.randomBytes(10).toString("hex");

        const user = await prisma.user.create({
            data: {
                firstName: firstName,
                lastName: lastName,
                mail: mail,
                verified: true,
                role: Role.EMPLOYEE,
                password: password,
                enterprise: {
                    connect: { id: enterprise.id }
                }

            }
        });
        if (!user) throw "User non créer !";
        sendMailToNewUser(user, enterprise.name, password);
        res.redirect("/");

    } catch (err) {
        console.error(err)
        return res.status(500).render("pages/dashboard/addmember.html.twig", { error: err });
    }
}

/**
 * @param {Request} req - Request HTTP
 * @param {Response} res - Response HTTP
 **/
async function displayEditMember(req, res) {
    try {
        const editUser = await prisma.user.findUnique({
            where: {
                id: parseInt(req.params.id)
            }
        });
        if (!editUser) throw "Utilisateur inconnu";

        res.render("pages/dashboard/editmember.html.twig", { user: req.user, edit: editUser });
    } catch (err) {
        console.error(err)
        res.redirect("/");
    }
}
/**
 * @param {Request} req - Request HTTP
 * @param {Response} res - Response HTTP
 **/
async function editMember(req, res) {
    const user = req.user;
    const editUserId = req.params.id;
    const { mail, lastName, firstName } = req.body;

    if (!mail || !lastName || !firstName) {
        return res.status(400).render("pages/dashboard/editmember.html.twig", { error: 'Tout les champs sont requis !' });
    }
    if (mail.match(!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
        return res.status(400).render("pages/dashboard/editmember.html.twig", { error: 'L\'adresse email n\'est pas valide !' });
    }

    try {
        await prisma.user.update({
            where: {
                id: parseInt(editUserId)
            },
            data: {
                mail, lastName, firstName
            }
        })

    } catch (err) {

    }
    res.redirect("/");
}

module.exports = { addMember, displayEditMember, editMember }