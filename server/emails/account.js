
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(
	'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',
);

const sendWelcomeEmail = (email, name) => {
	sgMail.send({
		to: email,
		from: 'dawid96.12mroczkowski@gmail.com',
		subject: 'Thanks for joining in!',
		text: `Welcome to the app, ${name}. Let me know how you get along with the app.`,
		html: `<strong>Witaj w aplikacji ${name} !</strong>`,
	});
};

const sendCancelationEmail = (email, name) => {
	sgMail.send({
		to: email,
		from: 'dawid96.12mroczkowski@gmail.com',
		subject: `Sorry to see you go ${name} !`,
		text: `Goodbye, ${name}. I hope to see you back sometime soon.`,
		html: `<strong>Zegnaj ${name} !</strong>`,
	});
};

const sendForgottenPassword = (email, name, password) => {
	sgMail.send({
		to: email,
		from: 'dawid96.12mroczkowski@gmail.com',
		subject: 'Here is you password!',
		text: `${name}. I hope you will not forget your password anymore.`,
		html: `<strong>${name} to jest twoje haslo:${password} </strong>`,
	});
};

module.exports = {
	sendWelcomeEmail,
	sendCancelationEmail,
	sendForgottenPassword,
};
