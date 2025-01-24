const { Request, Response } = require("express");

/**
 * Handle the register of an enterprise.
 * @param {Request} req - La requête HTTP
 * @param {Response} res - La réponse HTTP
 */
module.exports.login = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).render('pages/login.html.twig', { error: 'Tout les champs sont requis !' });
    }
    if (email.match(!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
        return res.status(400).render('pages/login.html.twig', { error: 'L\'adresse email n\'est pas valide !' });
    }

    try {
        
    } catch (error) {
        return res.status(500).render('pages/login.html.twig', error);
    }
};