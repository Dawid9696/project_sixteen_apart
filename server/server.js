/** @format */

const express = require("express");
const cacheableResponse = require("cacheable-response");
const next = require("next");
const mongoose = require("mongoose");
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

const configureApp = (server) => {
	server.use(
		session({
			secret:
				"Kuxo9R4E1W+fzC9a/aJohGnCCJcRlnXA1VXhUNxiYzLWtDt1xamoQh/2E68gFUycrNa674Q3gHhbaKilVz07VSA/DZcjJ6LoEUTpuWHNAbKgILA26o2YyuN1PafG/ZzsNdPCfmf9IRrUEBupUHGpZcOje5p6yy0GjLkVBg71XEQ=",
			resave: true,
			saveUninitialized: true,
		})
	);

	// security settings
	// server.use(lusca({
	//   csrf: true,
	//   csp: {
	// 	styleNonce: true,
	// 	scriptNonce: true,
	// 	policy: {
	// 	  'default-src': env === 'dev' ? "'unsafe-eval' 'self'" : "'self'",
	// 	},
	//   },
	//   xframe: 'SAMEORIGIN',
	//   hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
	//   xssProtection: true,
	//   nosniff: true,
	//   referrerPolicy: 'same-origin',
	// }));

	server.use(handler);

	return server;
};

app
	.prepare()
	.then(() => {
		const server = express();
		server.use(express.json());
		server.use(express.urlencoded({ extended: true }));
		server.use(cookieParser());
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
		mongoose
			.connect("mongodb+srv://dawid:dawid@cluster0.hjd9s.mongodb.net/apart?retryWrites=true&w=majority", {
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

		server.listen(PORT, (err) => {
			if (err) throw err;
			console.log(`Server is running on: ${chalk.blue(`http://localhost:${PORT}`)}`);
		});
	})
	.catch((ex) => {
		console.error(ex.stack);
		process.exit(1);
	});
