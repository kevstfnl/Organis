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
const changePasswordTemplatePath = 'views/mail/changepass.html.twig';
const newMemberTemplatePath = 'views/mail/newuser.html.twig';

module.exports.sendMailValidation = (user, token) => {
    twig.renderFile(validationTemplatePath, {
        name: user.lastName + " " + user.firstName,
        url: `http://127.0.0.1:3000/validate/${token}`
    }, (err, res) => {
        if (err) return console.error(err);

        const mailOptions = {
            from: '"Organis" <noreply@organis.org>',
            to: user.mail,
            subject: 'Vérification du compte Organis',
            text: 'Veuillez confirmer votre email pour votre compte Organis',
            html: juice(res)
        };
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) return console.error('Erreur:', err);
            console.log('Email envoyé: ', info.response);
        });
    });
}

module.exports.sendMailChangePassword = (user, token) => {
    twig.renderFile(changePasswordTemplatePath, {
        name: user.lastName + " " + user.firstName,
        url: `http://127.0.0.1:3000/changepass/${token}`
    }, (err, res) => {
        if (err) return console.error(err);

        const mailOptions = {
            from: '"Organis" <noreply@organis.org>',
            to: user.mail,
            subject: 'Changement mot de passe Organis',
            text: 'Veuillez confirmer le changement de mot de passe du compte Organis.',
            html: juice(res)
        };
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) return console.error('Erreur:', err);
            console.log('Email envoyé: ', info.response);
        });
    });
}

module.exports.sendMailToNewUser = (user, entreprise, password) => {
    twig.renderFile(newMemberTemplatePath, {
        name: user.lastName + " " + user.firstName,
        url: `http://localhost:3000/login`,
        entreprise: entreprise,
        password: password

    }, (err, res) => {
        if (err) return console.error(err);

        const mailOptions = {
            from: '"Organis" <noreply@organis.org>',
            to: user.mail,
            subject: 'Access a votre panel',
            text: 'Voici votre access au dashboard de votre entreprise.',
            html: juice(res)
        };
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) return console.error('Erreur:', err);
            console.log('Email envoyé: ', info.response);
        });
    });
}