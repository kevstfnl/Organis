const { Request, Response } = require("express");
const { PrismaClient, MaterialType, Role } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const prisma = new PrismaClient();

/**
 * Add material
 * @param {Request} req - Request HTTP
 * @param {Response} res - Response HTTP
 **/
async function addmaterial(req, res) {
    const { mac, description } = req.body;
    const user = req.user;

    if (!mac || !description) {
        res.render(res.render("pages/dashboard/addmaterial.html.twig"), { error: "Tout les champs sont requis !" })
    }

    try {
        const materiel = await prisma.material.create({
            data: {
                description,
                mac,
                type: MaterialType.COMPUTER,
                enterprise: {
                    connect: { id: user.enterpriseId }
                }
            }

        });
        if (!materiel) throw "Une erreur est servenue";
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.render("pages/dashboard/addmaterial.html.twig"), { error: err };
    }
}

/**
 * Display edit material
 * @param {Request} req - Request HTTP
 * @param {Response} res - Response HTTP
 **/
async function displayEditmaterial(req, res) {
    const user = req.user;
    if (user.role != Role.ADMIN) res.redirect("/");

    const materialId = req.params.id;
    try {
        const materiel = await prisma.material.findUnique({
            where: {
                id: parseInt(materialId)
            }
        });
        if (!materiel) throw "Une erreur est servenue";
        res.render("pages/dashboard/editmaterial.html.twig", { material: materiel });
    } catch (err) {
        console.error(err);
        res.redirect("/")
    }
}

/**
 * Edit material
 * @param {Request} req - Request HTTP
 * @param {Response} res - Response HTTP
 **/
async function editmaterial(req, res) {
    const materialId = req.params.id;
    const { mac, description } = req.body;

    if (!mac || !description) {
        res.render(res.render("pages/dashboard/editmaterial.html.twig"), { error: "Tout les champs sont requis !" })
    }

    try {
        const materiel = await prisma.material.update({
            where: {
                id: parseInt(materialId)
            },
            data: {
                description,
                mac,
            }

        });
        if (!materiel) throw "Une erreur est servenue";
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.render("pages/dashboard/editmaterial.html.twig"), { error: err };
    }
}

/**
 * Delete material
 * @param {Request} req - Request HTTP
 * @param {Response} res - Response HTTP
 **/
async function deleteMaterial(req, res) {
    const materialId = req.params.id;

    try {
        await prisma.material.delete({
            where: {
                id: parseInt(materialId)
            }
        });
    } catch (err) {
        console.error(err);
    }
    res.redirect("/");
}


/**
 * Assign material
 * @param {Request} req - Request HTTP
 * @param {Response} res - Response HTTP
 **/
async function assignMaterial(req, res) {
    const user = req.user;
    if (user.role != Role.ADMIN) return res.redirect("/");

    const materialId = req.params.id;
    const { materialUser } = req.body;

    try {
        await prisma.material.update({
            where: {
                id: parseInt(materialId)
            },
            data: {
                user: {
                    connect: {
                        id: parseInt(materialUser)
                    }
                }
            }

        });

    } catch (err) {
        console.error(err);
    }
    res.redirect("/");
}

module.exports = { addmaterial, displayEditmaterial, editmaterial, deleteMaterial, assignMaterial }