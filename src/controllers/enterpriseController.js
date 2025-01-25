const { Request, Response } = require("express");

/**
 * Handle enterprise register with administrator account.
 * @param {Request} req - Request HTTP
 * @param {Response} res - Response HTTP
 */
module.exports.register = (req, res) => {
    const { name, reason, siret, lastName, firstName, email, password, confirmPassword } = req.body;
    if (!name || !reason || !siret || !lastName || !firstName || !email || !password || !confirmPassword) {
        return res.status(400).render('pages/register.html.twig', { error: 'Tout les champs sont requis !' });
    }
    if (siret.match(!/^[0-9]{14}$/)) {
        return res.status(400).render('pages/register.html.twig', { error: 'Le SIRET doit contenir 14 chiffres !' });
    }
    if (email.match(!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
        return res.status(400).render('pages/register.html.twig', { error: 'L\'adresse email n\'est pas valide !' });
    }
    if (password !== confirmPassword) {
        return res.status(400).render('pages/register.html.twig', { error: 'Les mots de passe ne correspondent pas !' });
    }

    try {
        //TODO Register the enterprise in the database if not already exists
        
    } catch (error) {
        return res.status(500).render('pages/register.html.twig', error);
    }
};





/*
Register enterprise
Login enterprise

Add employee -> send mail
*/

