const router = require('express').Router();

const passport = require('passport');

const multer = require('multer');
const sharp = require('sharp');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const redis = require('redis');
const util = require('util');
const Authentication = require('../Helpers/Authentication');
const passportAuth = require('../Helpers/GoogleAuth');
const UserApprovment = require('../Helpers/UserApprovment');
const {
	sendWelcomeEmail,
	sendCancelationEmail,
	sendForgottenPassword,
} = require('../emails/account');

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);
const {
	authUser,
	googleAuthUser,
	facebookAuthUser,
} = require('../models/user.model');

const shopp = [
	{ price: 'price_1HREFgHl6hRsIXPjbZ6BYgJB', quantity: 2 },
	{
		price_data: {
			currency: 'pln',
			product_data: {
				name: 'T-shirt',
			},
			unit_amount: 3000,
		},
		quantity: 1,
	},
	{
		price_data: {
			currency: 'pln',
			product_data: {
				name: 'Phone',
			},
			unit_amount: 30000,
		},
		quantity: 1,
	},
];

router.post('/store', Authentication, async (req, res) => {
	const session = await stripe.checkout.sessions.create({
		success_url: 'http://localhost:3000',
		cancel_url: 'http://localhost:3000',
		// customer_email: req.user.email,
		payment_method_types: ['card', 'p24'],
		line_items: shopp,
		mode: 'payment',
	});
	// res.json({ id: session.id });
	res.send(session);
});

router.get('/facebook', passport.authenticate('facebook'));

router.get('/facebook/authenticated', passport.authenticate('facebook', { failureRedirect: '/login' }), (req, res) => {
	res.redirect(`${req.baseUrl}/users`);
});

router.get('/google', passport.authenticate('google', { scope: ['profile'] }));

router.get('/authenticated', passport.authenticate('google'), async (req, res) => {
	res.redirect(`${req.baseUrl}/users`);
});

router.get('/users', async (req, res) => {
	const users = await authUser.find();
	const googleUsers = await googleAuthUser.find();
	const facebookUsers = await facebookAuthUser.find();
	const allUsers = [...users, ...googleUsers, ...facebookUsers];
	res.setHeader('Set-Cookie','Dawid');
	res.send(allUsers);
});

router.get('/hey', async (req, res) => {

	res.send('Dziala');
});

router.get('/profile', Authentication, async (req, res) => {
	await req.user
		.populate({
			path: 'MyPosts',
			select: 'postOwner postText',
		})
		.populate('numOfPosts')
		.execPopulate()
		.then((user) => {
			res.send(user);
		})
		.catch((err) => res.status(400).json(err));
});

const upload = multer({
	limits: {
		fileSize: 1000000,
	},
	fileFilter(req, file, cb) {
		if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
			return cb(new Error('Please upload an image'));
		}

		return cb(undefined, true);
	},
});

router.post(
	'/users/me/avatar',
	Authentication,
	upload.single('avatar'),
	async (req, res) => {
		const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
		req.user.avatar = buffer;
		await req.user.save();
		res.send();
	},
	(error, req, res) => {
		res.status(400).send({ error: error.message });
	}
);

router.delete('/users/me/avatar', Authentication, async (req, res) => {
	req.user.avatar = undefined;
	await req.user.save();
	res.send('Photo deleted');
});

router.get('/users/:id/avatar', async (req, res) => {
	try {
		const user = await authUser.findById(req.params.id);
		if (!user || !user.avatar) {
			throw new Error();
		}
		res.set('Content-Type', 'image/png');
		res.send(user.avatar);
	} catch (e) {
		res.status(404).send();
	}
});

router.post('/register', async (req, res) => {
	// eslint-disable-next-line new-cap
	const newUser = new authUser(req.body);
	try {
		await newUser.save().then((response) => {
			response.generateAuthToken();
			sendWelcomeEmail(response.email, response.name);
			res.status(201).redirect('https://www.google.com/');
		});
	} catch (err) {
		res.status(400).send(err);
	}
});

router.post('/login', async (req, res) => {
	try {
		const user = await authUser.findByCredentials(req.body.email, req.body.password);
		const token = await user.generateAuthToken();
		const role = user.admin;
		res.status(201).send({token,role});
	} catch (err) {
		res.status(400).json(err);
	}
});

router.post('/logoutAll', Authentication, async (req, res) => {
		console.log('asdasd')
		req.user.tokens = [];
		req.user
			.save()
			.then(() => res.status(201).send('Logget Out'))
			.catch((err) => res.status(400).json(err));
	// } catch (err) {
	// 	throw new Error(err);
	// }
});

router.post('/logout', Authentication, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter((token) => {
			return token.token !== req.token;
		});
		await req.user.save();

		res.status(201).redirect('https://www.google.com/');
	} catch (e) {
		res.status(500).send();
	}
});

router.post('/forgetPassword', async (req, res) => {
	await authUser.find({ email: req.body.email }).then((response) => {
		sendForgottenPassword(response[0].email, response[0].name, response[0].password);
	});
	res.status(201).redirect('https://www.google.com/');
});

router.patch('/changePassword', UserApprovment, async (req, res) => {
	req.user.password = req.body.newpassword;
	req.user
		.save()
		.then((user) => res.send(user))
		.catch((err) => res.status(400).json(err));
});

router.patch('/changeProfileData', Authentication, async (req, res) => {
	await authUser
		.findByIdAndUpdate(req.user.id, req.body)
		.then(() => {
			res.send('User updated!');
		})
		.catch((err) => {
			res.status(400).send(err);
		});
});

router.post('/deleteProfile', UserApprovment, async (req, res) => {
	sendCancelationEmail(req.user.email, req.user.name);
	req.user.remove();
	res.status(201).redirect('https://www.google.com/');
});
module.exports = router;
