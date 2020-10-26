/** @format */

const express = require("express");
const next = require("next");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app
	.prepare()
	.then(() => {
		const server = express();
		const showRoutes = require("./routes/index.js");

		server.use("/api", showRoutes(server));

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
		const { connection } = mongoose;
		const connectionDB = connection;
		connectionDB.once("open", () => {
			console.log("MongoDB database connection established successfully !");
		});

		server.listen(PORT, (err) => {
			if (err) throw err;
			console.log(`> Ready on ${PORT}`);
		});
	})
	.catch((ex) => {
		console.error(ex.stack);
		process.exit(1);
	});
