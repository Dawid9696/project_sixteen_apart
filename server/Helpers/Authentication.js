/** @format */

const jwt = require("jsonwebtoken");
const { authUser } = require("../../server/models/user.model");

const Authentication = async (req, res, next) => {
	if (req.locals) {
		return next();
	}
	try {
		if (!req.cookies.auth) return res.status(401).send({ error: "Please authenticate" });
		const decoded = jwt.verify(req.cookies.auth, process.env.JWT);
		const user = await authUser.findOne({
			_id: decoded._id,
			"tokens.token": req.cookies.auth,
		});
		if (!user) {
			throw new Error("No user found!");
		}
		req.token = req.cookies.auth;
		req.user = user;
		next();
	} catch (e) {
		res.status(401).send({ error: "Please authenticate" });
	}
};

module.exports = Authentication;
