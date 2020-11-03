/** @format */

const express = require("express");
const cacheableResponse = require("cacheable-response");
const next = require("next");
const mongoose = require("mongoose");
const cors = require("cors");
const PORT = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const passport = require("passport");
const cookieParser = require("cookie-parser");

const chalk = require("chalk");
const app = next({ dev });
const handle = app.getRequestHandler();

const ssrCache = cacheableResponse({
	ttl: 1000 * 60 * 60, // 1hour
	get: async ({ req, res }) => {
		const rawResEnd = res.end;
		const data = await new Promise((resolve) => {
			res.end = (payload) => {
				if (res.statusCode === 200) {
					resolve(payload);
				} else {
					resolve();
				}
			};
			app.render(req, res, req.path, {
				...req.query,
				...req.params,
			});
		});
		res.end = rawResEnd;
		return { data };
	},
	send: ({ data, res }) => res.send(data),
});

app
	.prepare()
	.then(() => {
		const server = express();
		server.use(express.json());
		server.use(express.urlencoded({ extended: true }));
		server.use(cookieParser());
		server.use(cors());
		server.use(passport.initialize());
		server.use(passport.session());
		const showRoutes = require("./routes/index.js");
		server.use("/api", showRoutes(server));
		server.get("/", (req, res) => ssrCache({ req, res }));
		server.get("/Profile", (req, res) => {
			return ssrCache({ req, res });
		});
		server.get("/Cart", (req, res) => {
			return ssrCache({ req, res });
		});
		server.get("/WishList", (req, res) => {
			return ssrCache({ req, res });
		});
		server.all("*", (req, res) => {
			return handle(req, res);
		});
		console.log(process.env.TEST_VARIABLE);
		mongoose
			.connect(process.env.ATLAS_URI, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
				useCreateIndex: true,
				useFindAndModify: false,
				dbName: "Apart",
			})
			.catch((error) => console.log(error));

		const connectionDB = mongoose.connection;
		connectionDB.once("open", () => {
			console.log(chalk.yellowBright("MongoDB database connection " + chalk.greenBright.underline.bold("established successfully !")));
		});
		server.use(
			session({
				resave: false,
				saveUninitialized: false,
				secret: "secretss",
				cookie: {
					maxAge: 3600000 * 24 * 14,
					secure: false,
				},
				store: new MongoStore({
					mongooseConnection: connectionDB,
					collection: "sessions",
					dbName: "Apart",
				}),
			})
		);

		server.listen(3000, (err) => {
			if (err) throw err;
			console.log(`Server is running on: ${chalk.blue(`http://localhost:${PORT}`)}`);
		});
	})
	.catch((ex) => {
		console.error(ex.stack);
		process.exit(1);
	});
