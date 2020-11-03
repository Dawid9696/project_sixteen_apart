/** @format */

const express = require("express");
const router = express.Router();
const { authUser, googleAuthUser, facebookAuthUser } = require("../models/user.model");
const Post = require("..//models/post.model");
const fs = require("fs");
const passport = require("passport");
const multer = require("multer");
const sharp = require("sharp");
const cookie = require("cookie");
const redis = require("redis");
const util = require("util");
const { sendWelcomeEmail, sendCancelationEmail, sendForgottenPassword } = require("../emails/account");
const Authentication = require("../Helpers/Authentication");
const createExcel = require("../Helpers/CreateExcel");
const UserApprovment = require("../Helpers/UserApprovment");
const redisUrl = "redis://127.0.0.1:6379";
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);

const { Product } = require("../models/product.model");

function routes(app) {
	const shopp = [
		{ price: "price_1HREFgHl6hRsIXPjbZ6BYgJB", quantity: 2 },
		{
			price_data: {
				currency: "pln",
				product_data: {
					name: "T-shirt",
				},
				unit_amount: 3000,
			},
			quantity: 1,
		},
		{
			price_data: {
				currency: "pln",
				product_data: {
					name: "Phone",
				},
				unit_amount: 30000,
			},
			quantity: 1,
		},
	];

	router.post("/store", Authentication, async (req, res) => {
		const session = await stripe.checkout.sessions.create({
			success_url: "http://localhost:3000",
			cancel_url: "http://localhost:3000",
			// customer_email: req.user.email,
			payment_method_types: ["card", "p24"],
			line_items: shopp,
			mode: "payment",
		});
		// res.json({ id: session.id });
		res.send(session);
	});

	router.get("/facebook", passport.authenticate("facebook"));

	router.get("/facebook/authenticated", passport.authenticate("facebook", { failureRedirect: "/login" }), (req, res) => {
		res.redirect(`${req.baseUrl}/users`);
	});

	router.get("/google", passport.authenticate("google", { scope: ["profile"] }));

	router.get("/authenticated", passport.authenticate("google"), async (req, res) => {
		res.redirect(`${req.baseUrl}/users`);
	});

	router.get("/users", async (req, res) => {
		const users = await authUser.find();
		const googleUsers = await googleAuthUser.find();
		const facebookUsers = await facebookAuthUser.find();
		const allUsers = [...users, ...googleUsers, ...facebookUsers];
		res.send(allUsers);
	});

	router.get("/hey", async (req, res) => {
		res.send("Dziala");
	});
	router.get("/users", async (req, res) => {
		const users = await authUser.find();
		const googleUsers = await googleAuthUser.find();
		const facebookUsers = await facebookAuthUser.find();
		const allUsers = [...users, ...googleUsers, ...facebookUsers];
		res.setHeader("Set-Cookie", "Dawid");
		res.send(allUsers);
	});

	router.get("/profile", Authentication, async (req, res) => {
		await req.user
			.populate({
				path: "MyPosts",
				select: "postOwner postText",
			})
			.populate("numOfPosts")
			.execPopulate()
			.then((user) => {
				res.send(user);
			})
			.catch((err) => res.status(400).json(err));
	});

	const uploadAvatar = multer({
		limits: {
			fileSize: 1000000,
		},
		fileFilter(req, file, cb) {
			if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
				return cb(new Error("Please upload an image"));
			}

			return cb(undefined, true);
		},
	});

	router.post(
		"/users/me/avatar",
		Authentication,
		uploadAvatar.single("avatar"),
		async (req, res) => {
			const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
			req.user.avatar = buffer;
			await req.user.save();
			res.send();
		},
		(error, req, res) => {
			res.status(400).send({ error: error.message });
		}
	);

	router.delete("/users/me/avatar", Authentication, async (req, res) => {
		req.user.avatar = undefined;
		await req.user.save();
		res.send("Photo deleted");
	});

	router.get("/users/:id/avatar", async (req, res) => {
		try {
			const user = await authUser.findById(req.params.id);
			if (!user || !user.avatar) {
				throw new Error();
			}
			res.set("Content-Type", "image/png");
			res.send(user.avatar);
		} catch (e) {
			res.status(404).send();
		}
	});

	router.post("/register", async (req, res) => {
		// eslint-disable-next-line new-cap
		const newUser = new authUser(req.body);
		await newUser.save().then((response) => {
			sendWelcomeEmail(response.email, response.name);
			res.status(201).send("Witam!");
		});
	});

	router.post("/login", async (req, res) => {
		try {
			const user = await authUser.findByCredentials(req.body.email, req.body.password);
			const token = await user.generateAuthToken();
			function roleChoice() {
				if (user.admin) {
					return "admin";
				} else {
					return "user";
				}
			}

			const role = roleChoice();

			res.setHeader(
				"Set-Cookie",
				cookie.serialize("auth", token, {
					httpOnly: true,
					secure: process.env.NODE_ENV !== "development",
					sameSite: "strict",
					maxAge: 3600,
					path: "/",
				})
			);

			res.status(201).send({ token, role });
		} catch (err) {
			res.status(400).json(err);
		}
	});

	router.post("/logoutAll", Authentication, async (req, res) => {
		try {
			req.user.tokens = [];
			res.clearCookie("auth", { path: "/" });
			req.user
				.save()
				.then(() => {
					res.status(201).send("Logget Out");
				})
				.catch((err) => res.status(400).json(err));
		} catch (err) {
			throw new Error(err);
		}
	});

	router.post("/logout", Authentication, async (req, res) => {
		try {
			req.user.tokens = req.user.tokens.filter((token) => {
				return token.token !== req.token;
			});
			await req.user.save();

			res.status(201).redirect("https://www.google.com/");
		} catch (e) {
			res.status(500).send();
		}
	});

	router.post("/forgetPassword", async (req, res) => {
		await authUser.find({ email: req.body.email }).then((response) => {
			sendForgottenPassword(response[0].email, response[0].name, response[0].password);
		});
		res.status(201).redirect("https://www.google.com/");
	});

	router.patch("/changePassword", UserApprovment, async (req, res) => {
		req.user.password = req.body.newpassword;
		req.user
			.save()
			.then((user) => res.send(user))
			.catch((err) => res.status(400).json(err));
	});

	router.patch("/changeProfileData", Authentication, async (req, res) => {
		await authUser
			.findByIdAndUpdate(req.user.id, req.body)
			.then(() => {
				res.send("User updated!");
			})
			.catch((err) => {
				res.status(400).send(err);
			});
	});

	router.post("/deleteProfile", UserApprovment, async (req, res) => {
		sendCancelationEmail(req.user.email, req.user.name);
		req.user.remove();
		res.status(201).redirect("https://www.google.com/");
	});

	router.get("/newProducts/:productType", async (req, res) => {
		const key = JSON.stringify({ path: req.path, type: req.params.productType });
		const cachedMyProduct = await client.get(key);
		const { productType } = req.params;
		if (cachedMyProduct) {
			return res.send(JSON.parse(cachedMyProduct));
		}
		const newProducts = await Product.findNewProducts().where({ productType });
		client.set(key, JSON.stringify(newProducts), "EX", 180);

		return res.send(newProducts);
	});

	router.get("/Products/:type", async (req, res) => {
		const query = Object.keys(req.query).reduce((mappedQuery, key) => {
			const param = req.query[key];
			if (param && key !== "page") {
				// eslint-disable-next-line no-param-reassign
				mappedQuery[key] = param;
			}
			return mappedQuery;
		}, {});

		// eslint-disable-next-line node/no-unsupported-features/es-syntax
		const key = JSON.stringify({ type: req.params.type, ...req.query });
		const cachedProducts = await client.get(key);
		if (cachedProducts) {
			return res.send(JSON.parse(cachedProducts));
		}

		const Products = await Product.find(query)
			.where({ productType: req.params.type })
			.skip(req.query.page * 8)
			.limit(8)
			.exec();
		client.set(key, JSON.stringify(Products), "EX", 180);

		res.send(Products);
	});

	router.get("/Productsids", async (req, res) => {
		// eslint-disable-next-line node/no-unsupported-features/es-syntax
		const key = JSON.stringify({ type: req.path });
		const cachedProducts = await client.get(key);
		if (cachedProducts) {
			return res.send(JSON.parse(cachedProducts));
		}
		const ProductsIds = await Product.find().select("_id").exec();
		client.set(key, JSON.stringify(ProductsIds), "EX", 180);
		res.send(ProductsIds);
	});

	router.get("/Search", async (req, res) => {
		// eslint-disable-next-line node/no-unsupported-features/es-syntax
		const key = JSON.stringify({ path: req.path, ...req.query });
		const cachedProducts = await client.get(key);

		if (cachedProducts) {
			return res.send(JSON.parse(cachedProducts));
		}
		const SearchedProduct = await Product.findProducts(req.query.title)
			.skip(req.query.page * 8)
			.limit(8);

		client.set(key, JSON.stringify(SearchedProduct), "EX", 180);
		return res.send(SearchedProduct);
	});

	// type
	router.get("/Detail/:type/item/:id", async (req, res) => {
		const key = JSON.stringify({ type: req.params.type, id: req.params.id });
		const cachedMyProduct = await client.get(key);

		if (cachedMyProduct) {
			return res.send(JSON.parse(cachedMyProduct));
		}
		const MyProduct = await Product.findById(req.params.id).where({ productType: req.params.type });
		client.set(key, JSON.stringify(MyProduct), "EX", 180);

		return res.send(MyProduct);
	});

	router.get("/newProducts/:productType", async (req, res) => {
		const key = JSON.stringify({ path: req.path, type: req.params.productType });
		const cachedMyProduct = await client.get(key);
		const { productType } = req.params;
		if (cachedMyProduct) {
			return res.send(JSON.parse(cachedMyProduct));
		}
		const newProducts = await Product.findNewProducts().where({ productType });
		client.set(key, JSON.stringify(newProducts), "EX", 180);

		return res.send(newProducts);
	});

	router.post("/addProduct", Authentication, async (req, res) => {
		if (!req.user.admin) throw new Error("You have not permission to add new Product!");
		const newProduct = new Product(req.body);
		console.log("przeszedlem auth");
		console.log(newProduct);
		await newProduct
			.save()
			.then(() => {
				console.log("robie save to musi byc validacja");
				client.keys("*type*", (err, keys) => {
					keys.forEach((item) => {
						client.del(item);
					});
				});
				res.send(newProduct);
			})
			.catch((err) => {
				console.log(err);
				res.status(400).send(err);
			});
	});

	router.get("/listOfProducts", Authentication, async (req, res) => {
		if (!req.user.admin) throw new Error("You have not permission to download list!");
		res.download("Excel.xlsx");
	});

	router.get("/updateListOfProducts", async (req, res) => {
		try {
			const products = await Product.find().select("productName productPrice");
			if (fs.existsSync("Excel.xlsx")) fs.unlinkSync("Excel.xlsx");
			createExcel(products);
			res.send("List has been updated !");
		} catch (err) {
			res.status(400).send(err);
		}
	});

	router.delete("/deleteProduct/:id", Authentication, async (req, res) => {
		try {
			if (!req.user.admin) throw new Error("You have not permission to delete Product!");
			await Product.findByIdAndDelete(req.params.id);
			client.keys("*type*", (err, keys) => {
				keys.forEach((item) => {
					client.del(item);
				});
			});
			res.send("Deleted");
		} catch (err) {
			throw new Error(err);
		}
	});

	router.patch("/updateProduct/:id", Authentication, async (req, res) => {
		try {
			if (!req.user.admin) throw new Error("You have not permission to update Product!");
			const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body);
			client.keys("*type*", (err, keys) => {
				keys.forEach((item) => {
					client.del(item);
				});
			});
			res.send(updatedProduct);
		} catch (err) {
			throw new Error(err);
		}
	});

	router.post("/addComment/:Product", Authentication, async (req, res) => {
		const MyProduct = await Product.findById(req.params.Product);
		const newComment = {
			postedBy: req.user.id,
			comment: req.body.comment,
		};
		MyProduct.comments.push(newComment);
		await MyProduct.save()
			.then((response) => {
				const key = JSON.stringify({ type: response.productType, id: req.params.Product });
				client.del(key);
				res.send(response);
			})
			.catch((err) => res.status(400).json(err));
	});

	router.post("/deleteComment/:ProductId/comment/:Comment", Authentication, async (req, res) => {
		const { ProductId, Comment } = req.params;
		const MyProduct = await Product.findById(ProductId);
		const CommentToDelete = MyProduct.comments.find((comment) => {
			return comment.id === Comment;
		});
		if (CommentToDelete.postedBy === req.user.id) throw new Error("You can not delete comment!");
		MyProduct.comments = MyProduct.comments.filter((comment) => {
			return comment.id !== Comment;
		});
		await MyProduct.save()
			.then((response) => {
				const key = JSON.stringify({ type: response.productType, id: req.params.ProductId });
				client.del(key);
				res.send(response);
			})
			.catch((err) => res.status(400).json(err));
	});

	const upload = multer({
		limits: {
			fileSize: 1000000,
		},
		fileFilter(req, file, cb) {
			if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
				return cb(new Error("Please upload an image"));
			}

			return cb(undefined, true);
		},
	});

	router.post(
		"/product/photo/:id",
		Authentication,
		upload.array("product", 3),
		async (req, res) => {
			if (!req.user.admin) throw new Error("You can not add photo");
			const product = await Product.findById(req.params.id);
			const bufferArray = req.files.map(async (file) => {
				return await sharp(file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
			});
			const arrPromise = await Promise.all(bufferArray);
			product.productPhotos = arrPromise;
			await product.save();
			res.send("Photo to product added");
		},
		(error, req, res) => {
			res.status(400).send({ error: error.message });
		}
	);

	router.delete("/product/photo/:id", Authentication, async (req, res) => {
		if (req.user.admin) throw new Error("You can not add photo");
		const product = await Product.findById(req.params.id);
		product.productPhotos = undefined;
		await product.save();
		res.send("Photo deleted");
	});

	router.get("/product/photo/:id/item/:number", async (req, res) => {
		const product = await Product.findById(req.params.id);
		if (!product || !product.productPhotos) {
			throw new Error();
		}
		res.set("Content-Type", "image/png");
		res.send(product.productPhotos[req.params.number]);
	});

	router.get("/Posts", async (req, res) => {
		// const key = JSON.stringify(Object.assign({}, { path: req.path }, req.query));
		// eslint-disable-next-line node/no-unsupported-features/es-syntax
		const key = JSON.stringify({ path: req.path, ...req.query });
		const cachedProducts = await client.get(key);

		if (cachedProducts) {
			return res.send(JSON.parse(cachedProducts));
		}

		const posts = await Post.ShowPosts(req.query.title)
			.skip(req.query.page * 8)
			.limit(8);

		client.set(key, JSON.stringify(posts), "EX", 180);
		return res.send(posts);
	});

	router.get("/Post/:id", async (req, res) => {
		try {
			const key = JSON.stringify(req.originalUrl);
			const cachedMyProduct = await client.get(key);

			if (cachedMyProduct) {
				return res.send(JSON.parse(cachedMyProduct));
			}
			const MyPost = await Post.findById(req.params.id);
			client.set(key, JSON.stringify(MyPost), "EX", 180);

			return res.send(MyPost);
		} catch (err) {
			throw new Error(err);
		}
	});

	router.post("/addPost", Authentication, async (req, res) => {
		const newPost = new Post({
			postTitle: req.body.postTitle,
			postText: req.body.postText,
			postOwner: req.user.id,
		});
		newPost
			.save()
			.then(() => {
				client.keys("*Posts*", (err, keys) => {
					keys.forEach((item) => {
						client.del(item);
					});
				});
				res.send(newPost);
			})
			.catch((err) => {
				res.status(400).send(err);
			});
	});

	router.delete("/deletePost/:id", Authentication, async (req, res) => {
		try {
			if (!req.user.admin) throw new Error("You have not permission to delete Product!");
			const deletedPost = await Post.findByIdAndDelete(req.params.id);
			client.keys("*Posts*", (err, keys) => {
				keys.forEach((item) => {
					client.del(item);
				});
			});
			res.send(deletedPost);
		} catch (err) {
			throw new Error(err);
		}
	});

	router.patch("/updatePost/:id", Authentication, async (req, res) => {
		try {
			if (!req.user.admin) throw new Error("You have not permission to update Product!");
			const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body);
			client.keys(`*${req.params.id}*`, (err, keys) => {
				keys.forEach((item) => {
					client.del(item);
				});
			});
			res.send(updatedPost);
		} catch (err) {
			throw new Error(err);
		}
	});

	// ADD COMMENT ROUTER
	router.post("/addComment/:Post", Authentication, async (req, res) => {
		const MyPost = await Post.findById(req.params.Post);
		const newComment = {
			postedBy: req.user.id,
			comment: req.body.comment,
		};
		MyPost.comments.push(newComment);
		await MyPost.save()
			.then(() => {
				client.keys(`*${req.params.Post}*`, (err, keys) => {
					keys.forEach((item) => {
						client.del(item);
					});
				});
				res.send(Post);
			})
			.catch((err) => res.status(400).json(err));
	});

	router.post("/deleteComment/:Product/comment/:Comment", Authentication, async (req, res) => {
		const MyProduct = await Post.findById(req.params.Product);
		const commentToDelete = MyProduct.comments.find((comment) => {
			return comment.id === req.params.Comment;
		});
		if (commentToDelete.postedBy !== req.user.id) throw new Error("You can not delete comment");
		MyProduct.comments = MyProduct.comments.filter((comment) => {
			return comment.id !== req.param.Comment;
		});
		await MyProduct.save()
			.then((Product) => {
				client.keys(`*${req.params.Product}*`, (err, keys) => {
					keys.forEach((item) => {
						client.del(item);
					});
				});
				res.send(Product);
			})
			.catch((err) => res.status(400).json(err));
	});

	return router;
}

module.exports = routes;
