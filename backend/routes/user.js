/** @format */

const router = require("express").Router();

//HELPERS
const Authentication = require("../Helpers/Authentication");
const passportAuth = require("../Helpers/GoogleAuth");
const UserApprovment = require("../Helpers/UserApprovment");

const passport = require("passport");
const { sendWelcomeEmail, sendCancelationEmail, sendForgottenPassword } = require("../emails/account");
const multer = require("multer");
const sharp = require("sharp");
const redis = require("redis");
const util = require("util");
const redisUrl = "redis://127.0.0.1:6379";
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);
let { authUser, googleAuthUser, facebookAuthUser } = require("../models/user.model");

router.post("/store", Authentication, async (req, res) => {
	const session = await stripe.checkout.sessions.create({
		success_url: "http://localhost:3000",
		cancel_url: "http://localhost:3000",
		// customer_email: req.user.email,
		payment_method_types: ["card", "p24"],
		line_items: shopp,
		mode: "payment",
	});
	// res.json({ id: session.id });
	res.send(session);
});

router.get("/facebook", passport.authenticate("facebook"));

router.get("/facebook/authenticated", passport.authenticate("facebook", { failureRedirect: "/login" }), function (req, res) {
	res.redirect(`${req.baseUrl}/users`);
});

router.get("/google", passport.authenticate("google", { scope: ["profile"] }));

router.get("/authenticated", passport.authenticate("google"), async (req, res) => {
	res.redirect(`${req.baseUrl}/users`);
});

router.get("/users", passportAuth, Authentication, async (req, res) => {
	const users = await authUser.find();
	const googleUsers = await googleAuthUser.find();
	const facebookUsers = await facebookAuthUser.find();
	const allUsers = [...users, ...googleUsers, ...facebookUsers];
	res.send(allUsers);
});

//PROFILE
router.get("/profile", Authentication, async (req, res) => {
	await req.user
		.populate({
			path: "MyPosts",
			select: "postOwner postText",
		})
		.populate("numOfPosts")
		.execPopulate()
		.then((user) => {
			res.send(user);
		})
		.catch((err) => res.status(400).json("Error: " + err));
});

const upload = multer({
	limits: {
		fileSize: 1000000,
	},
	fileFilter(req, file, cb) {
		if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
			return cb(new Error("Please upload an image"));
		}

		cb(undefined, true);
	},
});

router.post(
	"/users/me/avatar",
	Authentication,
	upload.single("avatar"),
	async (req, res) => {
		const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
		req.user.avatar = buffer;
		await req.user.save();
		res.send();
	},
	(error, req, res, next) => {
		res.status(400).send({ error: error.message });
	}
);

router.delete("/users/me/avatar", Authentication, async (req, res) => {
	req.user.avatar = undefined;
	await req.user.save();
	res.send("Photo deleted");
});

router.get("/users/:id/avatar", async (req, res) => {
	try {
		const user = await authUser.findById(req.params.id);
		if (!user || !user.avatar) {
			throw new Error();
		}
		res.set("Content-Type", "image/png");
		res.send(user.avatar);
	} catch (e) {
		res.status(404).send();
	}
});

//REJESTRACJA UZYTKOWNIKA
router.post("/register", async (req, res) => {
	const newUser = new authUser(req.body);
	try {
		await newUser.save().then((res) => {
			res.generateAuthToken();
			sendWelcomeEmail(res.email, res.name);
			res.status(201).redirect("https://www.google.com/");
		});
	} catch (err) {
		res.status(400).send(err);
	}
});

//LOGOWANIE UZYTKOWNIKA
router.post("/login", async (req, res) => {
	try {
		const user = await authUser.findByCredentials(req.body.email, req.body.password);
		const token = await user.generateAuthToken();
		res.status(201).redirect("https://www.google.com/");
	} catch (err) {
		res.status(400).json("Error: " + err);
	}
});

//WYLOGOWANIE UZYTKOWNIKA
router.post("/logoutAll", Authentication, async (req, res) => {
	try {
		req.user.tokens = [];
		req.user
			.save()
			.then((user) => res.status(201).redirect("https://www.google.com/"))
			.catch((err) => res.status(400).json("Error: " + err));
	} catch (err) {
		throw new Error(err);
	}
});

router.post("/logout", Authentication, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter((token) => {
			return token.token !== req.token;
		});
		await req.user.save();

		res.status(201).redirect("https://www.google.com/");
	} catch (e) {
		res.status(500).send();
	}
});

//Przypomnienie hasla
router.post("/forgetPassword", async (req, res) => {
	await authUser.find({ email: req.body.email }).then((res) => {
		sendForgottenPassword(res[0].email, res[0].name, res[0].password);
	});
	res.status(201).redirect("https://www.google.com/");
});

//ZMIANA HASŁA
router.patch("/changePassword", UserApprovment, async (req, res) => {
	req.user.password = req.body.newpassword;
	req.user
		.save()
		.then((user) => res.send(user))
		.catch((err) => res.status(400).json("Error: " + err));
});

//CHANGE PROFILE DATA
router.patch("/changeProfileData", Authentication, async (req, res) => {
	await authUser
		.findByIdAndUpdate(req.user.id, req.body)
		.then(() => {
			res.send("User updated!");
		})
		.catch((err) => {
			res.status(400).send(err);
		});
});

//DELETE PROFILE
router.post("/deleteProfile", UserApprovment, async (req, res) => {
	sendCancelationEmail(req.user.email, req.user.name);
	req.user.remove();
	res.status(201).redirect("https://www.google.com/");
});
module.exports = router;
