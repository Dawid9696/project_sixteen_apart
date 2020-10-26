/** @format */

const express = require("express");
const router = express.Router();
const { authUser, googleAuthUser, facebookAuthUser } = require("../models/user.model");

function routes(app) {
	router.get("/users", async (req, res) => {
		const users = await authUser.find();
		const googleUsers = await googleAuthUser.find();
		const facebookUsers = await facebookAuthUser.find();
		const allUsers = [...users, ...googleUsers, ...facebookUsers];
		res.setHeader("Set-Cookie", "Dawid");
		res.send(allUsers);
	});

	router.get("/movies/:id", (req, res) => {
		return app.render(req, res, "/movies", { id: req.params.id });
	});

	return router;
}

module.exports = routes;
