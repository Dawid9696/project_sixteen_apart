/** @format */

const router = require("express").Router();
const createExcel = require("../Helpers/CreateExcel");
const fs = require("fs");

//HELPERS
const Authentication = require("../Helpers/Authentication");

const multer = require("multer");
const sharp = require("sharp");
const redis = require("redis");
const util = require("util");
const redisUrl = "redis://127.0.0.1:6379";
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);

let { Product } = require("../models/product.model");

//PRODUCTS
router.get("/Product/:type", async (req, res) => {
	let query = Object.keys(req.query).reduce((mappedQuery, key) => {
		let param = req.query[key];
		if (param && key != "page") {
			mappedQuery[key] = param;
		}
		return mappedQuery;
	}, {});

	const Products = await Product.find(query)
		.where({ productType: req.params.type })
		.skip(req.query.page * 8)
		.limit(8)
		.exec();

	const key = JSON.stringify(req.query);
	const cachedProducts = await client.get(key);

	if (cachedProducts) {
		console.log("cache");
		const currentDataLength = JSON.parse(cachedProducts).length;
		const incomingDataLegth = Products.length;
		if (currentDataLength != incomingDataLegth) {
			return client.flushall();
		}
		return res.send(JSON.parse(cachedProducts));
	}
	client.set(key, JSON.stringify(Products), "EX", 180);

	res.send(Products);
});

router.get("/Search", async (req, res) => {
	try {
		const Product = await Product.findProducts(req.query.title)
			.skip(req.query.page * 8)
			.limit(8);
		const key = JSON.stringify(req.query);
		const cachedProducts = await client.get(key);

		if (cachedProducts) {
			const currentDataLength = JSON.parse(cachedProducts).length;
			const incomingDataLegth = Product.length;
			if (currentDataLength != incomingDataLegth) {
				return client.flushall();
			}
			return res.send(JSON.parse(cachedProducts));
		}
		client.set(key, JSON.stringify(Product), "EX", 180);
		res.send(Product);
	} catch (err) {
		throw new Error(err);
	}
});

router.get("/:type/:id", async (req, res) => {
	try {
		const key = JSON.stringify(req.originalUrl);
		const cachedMyProduct = await client.get(key);

		if (cachedMyProduct) {
			return res.send(JSON.parse(cachedMyProduct));
		}
		const MyProduct = await Product.findById(req.params.id).where({ productType: req.params.type });
		client.set(key, JSON.stringify(MyProduct), "EX", 180);

		res.send(MyProduct);
	} catch (err) {
		throw new Error(err);
	}
});

router.get("/newProducts/:productType", async (req, res) => {
	const { productType } = req.params;
	try {
		const key = JSON.stringify(req.originalUrl);
		const cachedMyProduct = await client.get(key);

		if (cachedMyProduct) {
			return res.send(JSON.parse(cachedMyProduct));
		}
		const newProducts = await Product.findNewProducts().where({ productType });
		client.set(key, JSON.stringify(newProducts), "EX", 180);

		res.send(newProducts);
	} catch (err) {
		throw new Error(err);
	}
});

router.post("/addProduct", Authentication, async (req, res) => {
	if (!req.user.admin) throw new Error("You have not permission to add new Product!");
	const newProduct = new Product(req.body);
	await newProduct
		.save()
		.then(() => {
			res.send(newProduct);
		})
		.catch((err) => {
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

//DELETE BOOK ROUTER
router.delete("/deleteProduct/:id", Authentication, async (req, res) => {
	try {
		if (!req.user.admin) throw new Error("You have not permission to delete Product!");
		await Product.findByIdAndDelete(req.params.id);
		res.send("Deleted");
	} catch (err) {
		throw new Error(err);
	}
});

//UPDATE BOOK ROUTER
router.patch("/updateProduct/:id", Authentication, async (req, res) => {
	try {
		if (!req.user.admin) throw new Error("You have not permission to update Product!");
		const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body);
		res.send(updatedProduct);
	} catch (err) {
		throw new Error(err);
	}
});

//ADD COMMENT ROUTER
router.post("/addComment/:Product", Authentication, async (req, res) => {
	const MyProduct = await Product.findById(req.params.Product);
	const newComment = {
		postedBy: req.user.id,
		comment: req.body.comment,
	};
	MyProduct.comments.push(newComment);
	await MyProduct.save()
		.then((Product) => res.send(Product))
		.catch((err) => res.status(400).json("Error: " + err));
});

//DELETE COMMENT ROUTER
router.post("/deleteComment/:Product/comment/:Comment", Authentication, async (req, res) => {
	const { Product, Comment } = req.params;
	const MyProduct = await Product.findById(Product);
	const CommentToDelete = MyProduct.comments.find((comment) => {
		return comment._id == Comment;
	});
	if (CommentToDelete.postedBy == req.user.id) throw new Error("You can not delete comment!");
	MyProduct.comments = MyProduct.comments.filter((comment) => {
		return comment._id != Comment;
	});
	await MyProduct.save()
		.then((Product) => res.send(Product))
		.catch((err) => res.status(400).json("Error: " + err));
});

const upload = multer({
	limits: {
		fileSize: 1000000,
	},
	fileFilter(req, file, cb) {
		if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
			return cb(new Error("Please upload an image"));
		}

		cb(undefined, true);
	},
});

router.post(
	"/product/photo/:id",
	Authentication,
	upload.single("product"),
	async (req, res) => {
		if (req.user.admin) throw new Error("You can not add photo");
		const product = await Product.findById(req.params.id);
		const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
		product.photo = buffer;
		await product.save();
		res.send("Photo to product added");
	},
	(error, req, res, next) => {
		res.status(400).send({ error: error.message });
	}
);

router.delete("/product/photo/:id", Authentication, async (req, res) => {
	if (req.user.admin) throw new Error("You can not add photo");
	const product = await Product.findById(req.params.id);
	product.photo = undefined;
	await product.save();
	res.send("Photo deleted");
});

router.get("/product/photo/:id", async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);

		if (!product || !product.photo) {
			throw new Error();
		}

		res.set("Content-Type", "image/png");
		res.send(ring.photo);
	} catch (e) {
		res.status(404).send();
	}
});

module.exports = router;
