

const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
require('./Helpers/Passport');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo')(session);

require('dotenv').config();

const app = express();
// app.use(cookieParser());
const port = process.env.PORT || 5000;
const uri = process.env.ATLAS_URI;
app.use(express.static(path.join(__dirname, 'out')));
mongoose
	.connect(uri, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
		useFindAndModify: false,
		dbName: 'Apart',
	})
	.catch((error) => console.log(error));
const { connection } = mongoose;
const connectionDB = connection;
connectionDB.once('open', () => {
	console.log('MongoDB database connection established successfully !');
});
const sessionStore = new MongoStore({
	mongooseConnection: connectionDB,
	collection: 'sessions',
});

app.use(
	session({
		secret: process.env.SECRET,
		resave: false,
		saveUninitialized: true,
		store: sessionStore,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24, // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
		},
	}),
);
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname,'/public')));

app.use(passport.initialize());
app.use(passport.session());

const products = require('./routes/products');
const posts = require('./routes/posts');
const user = require('./routes/user');

app.get('/ms', (req, res) => {
	res.sendFile(path.join(__dirname, 'out', 'index.html'));
  });
  app.get('/a', (req, res) => {
	res.sendFile(path.join(__dirname, 'out', 'a.html'));
  });

app.use('/Apart/Shop', products);
app.use('/Apart/Posts', posts);
app.use('/Apart/Profile', user);

app.listen(port, () => {
	console.log(`Server is running on port: ${port}...`);
});
