//API-based - Mailgun HTTP API
const Mailgun = require('mailgun.js');
const FormData = require('form-data');

const mailgun = new Mailgun(FormData);

const client = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY,
    url: process.env.MAILGUN_BASE_URL
});

const sendEmail = async ({to, subject, text, html}) => {
    await client.messages.create(process.env.MAILGUN_DOMAIN, {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        text,
        html
    });
};

module.exports = sendEmail;