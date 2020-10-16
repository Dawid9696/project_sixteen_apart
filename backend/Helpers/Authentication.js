/** @format */

const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// const googleAuth = (req, res, next) => {
// 	if (!req.user) {
// 		req.locals = false;
// 	} else {
// 		req.locals = true;
// 	}
// 	next();
// };

const Authentication = async (req, res, next) => {
	// if (req.locals) {
	// 	return next();
	// }
	try {
		const token = req.header("Authorization").replace("Bearer ", "");
		const decoded = jwt.verify(token, "thisis");
		const user = await User.authUser.findOne({ _id: decoded._id, "tokens.token": token });
		if (!user) {
			throw new Error("No user found!");
		}
		req.token = token;
		req.user = user;
		next();
	} catch (e) {
		res.status(401).send({ error: "Please authenticate" });
	}
};

// module.exports = { googleAuth, Authentication };
module.exports = Authentication;
