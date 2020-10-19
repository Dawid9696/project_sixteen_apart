/** @format */

const passportAuth = (req, res, next) => {
	if (!req.user) {
		req.locals = false;
	} else {
		req.locals = true;
	}
	next();
};

module.exports = passportAuth;
