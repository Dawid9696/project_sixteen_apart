/** @format */

var passport = require("passport");
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
// var FacebookStrategy = require("passport-facebook").Strategy;
const { googleAuthUser } = require("../models/user.model");
require("dotenv").config();

passport.serializeUser((userGoogle, done) => {
	done(null, userGoogle._id);
});

passport.deserializeUser((id, done) => {
	googleAuthUser.findById(id).then((userGoogle) => {
		done(null, userGoogle.id);
	});
});

passport.use(
	"google",
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: "/Apart/Profile/users",
		},
		async (accessToken, refreshToken, profile, done) => {
			googleAuthUser.findOne({ googleId: profile.id }).then((currentUser, err) => {
				if (!currentUser) {
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
		}
	)
);

// passport.use(
// 	new FacebookStrategy(
// 		{
// 			clientID: process.env.FACEBOOK_APP_ID,
// 			clientSecret: process.env.FACEBOOK_APP_SECRET,
// 			callbackURL: "http://localhost:3000/auth/facebook/callback",
// 		},
// 		function (accessToken, refreshToken, profile, cb) {
// 			User.findOrCreate({ facebookId: profile.id }, function (err, user) {
// 				return cb(err, user);
// 			});
// 		}
// 	)
// );

// var passport = require("passport");
// var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
// var FacebookStrategy = require("passport-facebook").Strategy;
// const googleAuthUser = require("../models/googleAuthUser.model");
// const FacebookUser = require("../models/facebookUser.model");
// require("dotenv").config();
// // Use the GoogleStrategy within Passport.
// //   Strategies in Passport require a `verify` function, which accept
// //   credentials (in this case, an accessToken, refreshToken, and Google
// //   profile), and invoke a callback with a user object.
// passport.serializeUser((userGoogle, done) => {
// 	done(null, userGoogle._id);
// });

// passport.deserializeUser((id, done) => {
// 	console.log("xxx");
// 	console.log(id);
// 	console.log("xxx");
// 	googleAuthUser.findById(id).then((userGoogle) => {
// 		done(null, userGoogle.id);
// 	});
// });

// passport.use(
// 	new GoogleStrategy(
// 		{
// 			clientID: process.env.GOOGLE_CLIENT_ID,
// 			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
// 			callbackURL: "/Boots/newWatchesAuth",
// 		},
// 		async (accessToken, refreshToken, profile, done) => {
// 			googleAuthUser.findOne({ googleId: profile.id }).then((currentUser, err) => {
// 				if (!currentUser) {
// 					new googleAuthUser({
// 						name: profile.displayName,
// 						googleId: profile.id,
// 					})
// 						.save()
// 						.then((newUser) => {
// 							done(null, newUser);
// 						});
// 				} else {
// 					done(null, currentUser);
// 				}
// 			});
// 		}
// 	)
// );

// passport.use(
// 	"facebook",
// 	new FacebookStrategy(
// 		{
// 			clientID: process.env.FACEBOOK_APP_ID,
// 			clientSecret: process.env.FACEBOOK_APP_SECRET,
// 			callbackURL: "/Boots/auth/facebook/callback",
// 		},
// 		function (accessToken, refreshToken, profile, doneCb) {
// 			console.log(profile);
// 			// FacebookUser.findOne({ facebookId: profile.id }).then((currentUser, err) => {
// 			// 	if (!currentUser) {
// 			// 		console.log("Nowy user");
// 			// 		new FacebookUser({
// 			// 			name: profile.displayName,
// 			// 			facebookId: profile.id,
// 			// 		})
// 			// 			.save()
// 			// 			.then((newUser) => {
// 			// 				doneCb(null, newUser);
// 			// 			});
// 			// 	} else {
// 			// 		console.log("Istniejący user");
// 			// 		doneCb(null, currentUser);
// 			// 	}
// 			// });
// 		}
// 	)
// );
