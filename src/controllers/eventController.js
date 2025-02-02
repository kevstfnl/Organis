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
            events = events.map(e => ({
                ...e,
                backgroundColor: e.finish ? "#1a771a" : "#a31f1f"
            }));
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
            events = events.map(e => ({
                ...e,
                backgroundColor: e.finish ? "#1a771a" : "#a31f1f"
            }));
            console.log(events);
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
        const { title, start, startTime } = req.body;
        const userId = req.params.userId;

        if (!title || !start) {
            return res.render("pages/dashboard/addevent.html.twig", { user: user, userId: userId, error: "Les champs date de debut et title sont requis !" });
        }

        const startDate = new Date(`${start}T${startTime}:00`);

        try {
            await prisma.event.create({
                data: {
                    title,
                    start: startDate,
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
            return res.render("pages/dashboard/addevent.html.twig", { user: user, userId: req.params.userID, error: err });
        }
    }
    res.redirect("/");
}

/**
 * Edit events
 * @param {Request} req - Request HTTP
 * @param {Response} res - Response HTTP
 **/
async function editEvent(req, res) {
    const user = req.user;
    if (user.role != Role.ADMIN) return res.redirect("/");


    const eventId = parseInt(req.params.id); // Convertit l'ID en entier
    const { title, start, startTime, finish, userId } = req.body;

    let startDate = new Date(start);

    if (startTime) {
        startDate = new Date(`${start}T${startTime}:00`);
    }
    
    try {
        await prisma.event.update({
            where: {
                id: eventId
            },
            data: {
                title: title || undefined,
                start: startDate || undefined,
                finish: finish ? true : false,
                user: userId ? { connect: { id: parseInt(userId) } } : undefined
            }
        });
    } catch (err) {
        console.error(err);
    }
    res.redirect("/");
}


/**
 * Remove events
 * @param {Request} req - Request HTTP
 * @param {Response} res - Response HTTP
 **/
async function removeEvent(req, res) {
    const user = req.user;
    if (user.role != Role.ADMIN) return res.redirect("/");
    const id = req.params.id

    if (user.role = Role.ADMIN) {
        try {
            await prisma.event.delete({
                where: {
                    id: parseInt(id)
                }
            })
        } catch (err) {
            console.error(err);
        }
    }
    res.redirect("/");
}

module.exports = { getEvents, addEvent, editEvent, removeEvent }