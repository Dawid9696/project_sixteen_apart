const jwt = require('jsonwebtoken');
const { authUser } = require('../models/user.model');
require('dotenv').config();

// eslint-disable-next-line consistent-return
const Authentication = async (req, res, next) => {
	console.log('Dawdid');
	if (req.locals) {
		return next();
	}
	// try {
	const token = req.header('Authorization').replace('Bearer ', '');
	const decoded = jwt.verify(token, process.env.JWT);
	console.log(decoded);
	const user = await authUser.findOne({
		_id: decoded._id,
		'tokens.token': token,
	});
	console.log(user);
	if (!user) {
		throw new Error('No user found!');
	}
	req.token = token;
	req.user = user;
	next();
	// } catch (e) {
	// 	res.status(401).send({ error: 'Please authenticate' });
	// }
};

module.exports = Authentication;
