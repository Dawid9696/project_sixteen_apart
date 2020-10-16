/** @format */

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const passportSetup = require("./Helpers/Passport");
const cookieSession = require("cookie-session");
const session = require("express-session");
const passport = require("passport");
const MongoStore = require("connect-mongo")(session);

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;
const uri = process.env.ATLAS_URI;

mongoose
	.connect(uri, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
		useFindAndModify: false,
		dbName: "Apart",
	})
	.catch((error) => console.log(error));

const connection = mongoose.connection;
connection.once("open", () => {
	console.log("MongoDB database connection established successfully !");
});
const sessionStore = new MongoStore({ mongooseConnection: connection, collection: "sessions" });
app.use(
	session({
		secret: process.env.SECRET,
		resave: false,
		saveUninitialized: true,
		store: sessionStore,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24, // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
		},
	})
);
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + "/public"));

app.use(
	cookieSession({
		maxAge: 24 * 60 * 60 * 1000,
		keys: [process.env.COOKIE_KEY],
	})
);

app.use(passport.initialize());
app.use(passport.session());

// app.post("./pay", async (req, res) => {
// 	const { email } = req.body;
// 	const paymentIntent = await stripe.paymentIntents.create({
// 		amount: 5000,
// 		currency: "pln",
// 		// Verify your integration in this guide by including this parameter
// 		metadata: { integration_check: "accept_a_payment" },
// 		recepient_email: email,
// 	});
// 	res.json({ client_secret: paymentIntent["client_secret"] });
// });

const products = require("./routes/products");
const posts = require("./routes/posts");
const user = require("./routes/user");

app.use("/Apart/Shop", products);
app.use("/Apart/Posts", posts);
app.use("/Apart/Profile", user);

app.listen(port, () => {
	console.log(`Server is running on port: ${port}...`);
});
