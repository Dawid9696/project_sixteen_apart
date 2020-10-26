const jwt = require('jsonwebtoken');
const { authUser } = require('../models/user.model');
require('dotenv').config();

const UserApprovment = async (req, res, next) => {
	try {
		const token = req.header('Authorization').replace('Bearer ', '');
		const decoded = jwt.verify(token, process.env.JWT);
		const user = await authUser.findOne({
			_id: decoded.id,
			'tokens.token': token,
		});
		const Approvment = await authUser.findByCredentials(
			req.body.email,
			req.body.password,
		);
		if (!user || !Approvment) {
			throw new Error();
		}
		req.token = token;
		req.user = user;
		next();
	} catch (e) {
		res.status(401).send({ error: 'Please authenticate' });
	}
};

module.exports = UserApprovment;
