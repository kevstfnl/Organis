const { Request, Response } = require("express");
const { PrismaClient, Role } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Get events
 * @param {Request} req - Request HTTP
 * @param {Response} res - Response HTTP
 **/
async function getEvents(req, res) {
    const user = req.user;
    let events;
    if (user.role = Role.ADMIN) {
        try {
            events = await prisma.event.findMany({
                where: {
                    entreprise: {
                        id: user.enterpriseId
                    }
                }
            });
        } catch (err) {
            console.error(err);
        }
    } else {
        try {
            events = await prisma.event.findMany({
                where: {
                    userId: user.id
                }
            });
        } catch (err) {
            console.error(err);
        }
    }
    res.json(events);
}


/**
 * Get events
 * @param {Request} req - Request HTTP
 * @param {Response} res - Response HTTP
 **/
async function addEvent(req, res) {
    const user = req.user;

    if (user.role = Role.ADMIN) {
        const { title, start, startTime, end, endTime } = req.body;
        const userId = req.params.userId;

        if (!title || !start) {
            return res.render("pages/dashboard/addevent.html.twig", { user: user, userId: userId, error: "Les champs date de debut et title sont requis !" });
        }

        const startDate = new Date(`${start}T${startTime}:00`);
        const endDate = new Date(`${end}T${endTime}:00`);

        try {
            await prisma.event.create({
                data: {
                    title,
                    start: startDate,
                    end: endDate,
                    user: {
                        connect: {
                            id: parseInt(userId)
                        }
                    },
                    entreprise: {
                        connect: {
                            id: user.enterpriseId
                        }
                    }
                }
            })
        } catch (err) {
            console.error(err);
            res.render("pages/dashboard/addevent.html.twig", { user: user, userId: req.params.userID, error: err });
        }
    }
    res.redirect("/");
}

module.exports = { getEvents, addEvent }