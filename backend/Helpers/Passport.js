

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const {
	googleAuthUser,
	facebookAuthUser,
	User,
} = require('../../server/models/user.model');
require('dotenv').config();

passport.serializeUser((userGoogle, done) => {
	done(null, userGoogle.id);
});

passport.deserializeUser((id, done) => {
	User.findById(id).then((userGoogle) => {
		done(null, userGoogle.id);
	});
});

passport.use(
	'google',
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: '/Apart/Profile/authenticated',
		},
		async (accessToken, refreshToken, profile, done) => {
			console.log(accessToken);
			googleAuthUser
				.findOne({ googleId: profile.id })
				.then((currentUser, err) => {
					if (!currentUser) {
						// eslint-disable-next-line new-cap
						new googleAuthUser({
							name: profile.name.givenName,
							surname: profile.name.familyName,
							rules: true,
							googleId: profile.id,
						})
							.save()
							.then((newUser) => {
								done(null, newUser);
							});
					} else {
						done(null, currentUser);
					}
				});
		},
	),
);

passport.use(
	'facebook',
	new FacebookStrategy(
		{
			clientID: process.env.FACEBOOK_APP_ID,
			clientSecret: process.env.FACEBOOK_APP_SECRET,
			callbackURL: '/Apart/Profile/facebook/authenticated',
		},
		function (accessToken, refreshToken, profile, doneCb) {
			console.log(accessToken);
			facebookAuthUser.findOne({ facebookId: profile.id }).then((currentUser, err) => {
				if (!currentUser) {
					console.log('Nowy user');
					// eslint-disable-next-line new-cap
					new facebookAuthUser({
						name: 'user',
						surname: 'surname',
						facebookId: profile.id,
						phone: 564213879,
						rules: true,
					})
						.save()
						.then((newUser) => {
							doneCb(null, newUser);
						});
				} else {
					doneCb(null, currentUser);
				}
			});
		}
	)
);
