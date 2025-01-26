const mailer = require('nodemailer');
const juice = require('juice');
const twig = require('twig');

const transporter = mailer.createTransport({
    host: 'smtp.gmail.com',
    service: 'gmail',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.GMAIL_PASSWORD
    },
});

const validationTemplatePath = 'views/mail/confirmation.html.twig';

module.exports.sendTestMail = () => {
    twig.renderFile(validationTemplatePath, {
        name: "Stefanelli Kevin",
        url: "http://127.0.0.1:3000"
    }, (err, res) => {
        if (err) return console.error(err);

        const mailOptions = {
            from: '"Kevin Stefanelli" <kevin.stefanelli.pro@gmail.com>',
            to: 'kevin.stefanelli.pro@gmail.com',
            subject: 'Vérification du compte Organis',
            text: 'Veuillez confirmer votre email pour votre compte Organis',
            html: juice(res)
        };
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) return console.error('Erreur:', err);
            console.log('Email envoyé:', info.response);
        });
    });
}

module.exports.sendMailValidation = (user, token) => {
    twig.renderFile(validationTemplatePath, {
        name: user.lastName + " " + user.firstName,
        url: `http://127.0.0.1:3000/validate/${token}`
    }, (err, res) => {
        if (err) return console.error(err);

        const mailOptions = {
            from: '"Kevin Stefanelli" <kevin.stefanelli.pro@gmail.com>',
            to: user.mail,
            subject: 'Vérification du compte Organis',
            text: 'Veuillez confirmer votre email pour votre compte Organis',
            html: juice(res)
        };
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) return console.error('Erreur:', err);
            console.log('Email envoyé:', info.response);
        });
    });
}