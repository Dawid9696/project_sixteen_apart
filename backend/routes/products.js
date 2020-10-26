const router = require('express').Router();

const fs = require('fs');

const multer = require('multer');
const sharp = require('sharp');
const redis = require('redis');
const util = require('util');
const Authentication = require('../Helpers/Authentication');
const createExcel = require('../Helpers/CreateExcel');

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);

const { Product } = require('../models/product.model');

// PRODUCTS //type
// eslint-disable-next-line consistent-return
router.get('/Products/:type', async (req, res) => {
	const query = Object.keys(req.query).reduce((mappedQuery, key) => {
		const param = req.query[key];
		if (param && key !== 'page') {
			// eslint-disable-next-line no-param-reassign
			mappedQuery[key] = param;
		}
		return mappedQuery;
	}, {});

	// eslint-disable-next-line node/no-unsupported-features/es-syntax
	const key = JSON.stringify({ type: req.params.type, ...req.query });
	const cachedProducts = await client.get(key);
	if (cachedProducts) {
		console.log('From Cache');
		return res.send(JSON.parse(cachedProducts));
	}

	const Products = await Product.find(query)
		.where({ productType: req.params.type })
		.skip(req.query.page * 8)
		.limit(8)
		.exec();
	client.set(key, JSON.stringify(Products), 'EX', 180);

	res.send(Products);
});

router.get('/Productsids', async (req, res) => {
	// eslint-disable-next-line node/no-unsupported-features/es-syntax
	const key = JSON.stringify({ type: req.path });
	const cachedProducts = await client.get(key);
	if (cachedProducts) {
		return res.send(JSON.parse(cachedProducts));
	}
	const ProductsIds = await Product.find().select('_id').exec();
	client.set(key, JSON.stringify(ProductsIds), 'EX', 180);
	res.send(ProductsIds);
});

router.get('/Search', async (req, res) => {
	// eslint-disable-next-line node/no-unsupported-features/es-syntax
	const key = JSON.stringify({ path: req.path, ...req.query });
	const cachedProducts = await client.get(key);
	console.log(key);
	if (cachedProducts) {
		console.log('From Cache');
		return res.send(JSON.parse(cachedProducts));
	}
	const SearchedProduct = await Product.findProducts(req.query.title)
		.skip(req.query.page * 8)
		.limit(8);

	client.set(key, JSON.stringify(SearchedProduct), 'EX', 180);
	return res.send(SearchedProduct);
});

// type
router.get('/Detail/:type/item/:id', async (req, res) => {
	const key = JSON.stringify({ type: req.params.type, id: req.params.id});
	const cachedMyProduct = await client.get(key);
	console.log(key);
	if (cachedMyProduct) {
		console.log('From Cache');
		return res.send(JSON.parse(cachedMyProduct));
	}
	const MyProduct = await Product.findById(req.params.id).where({ productType: req.params.type });
	client.set(key, JSON.stringify(MyProduct), 'EX', 180);

	return res.send(MyProduct);
});

router.get('/newProducts/:productType', async (req, res) => {
	const key = JSON.stringify({ path: req.path, type: req.params.productType});
	const cachedMyProduct = await client.get(key);
	const {productType} = req.params;
	if (cachedMyProduct) {
		console.log('From Cache');
		return res.send(JSON.parse(cachedMyProduct));
	}
	const newProducts = await Product.findNewProducts().where({ productType });
	client.set(key, JSON.stringify(newProducts), 'EX', 180);

	return res.send(newProducts);
});

router.post('/addProduct', Authentication, async (req, res) => {
	if (!req.user.admin) throw new Error('You have not permission to add new Product!');
	const newProduct = new Product(req.body);
	await newProduct
		.save()
		.then(() => {
			client.keys('*type*',(err, keys) => {
				keys.forEach((item) => {
					client.del(item);
				});
			});
			res.send(newProduct);
		})
		.catch((err) => {
			res.status(400).send(err);
		});
});

router.get('/listOfProducts', Authentication, async (req, res) => {
	if (!req.user.admin) throw new Error('You have not permission to download list!');
	res.download('Excel.xlsx');
});

router.get('/updateListOfProducts', async (req, res) => {
	try {
		const products = await Product.find().select('productName productPrice');
		if (fs.existsSync('Excel.xlsx')) fs.unlinkSync('Excel.xlsx');
		createExcel(products);
		res.send('List has been updated !');
	} catch (err) {
		res.status(400).send(err);
	}
});

router.delete('/deleteProduct/:id', Authentication, async (req, res) => {
	try {
		if (!req.user.admin) throw new Error('You have not permission to delete Product!');
		await Product.findByIdAndDelete(req.params.id);
		client.keys('*type*',  (err, keys) => {
			keys.forEach((item) => {
				client.del(item);
			});
		});
		res.send('Deleted');
	} catch (err) {
		throw new Error(err);
	}
});

router.patch('/updateProduct/:id', Authentication, async (req, res) => {
	try {
		if (!req.user.admin) throw new Error('You have not permission to update Product!');
		const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body);
		client.keys('*type*', (err, keys) => {
			keys.forEach((item) => {
				client.del(item);
			});
		});
		res.send(updatedProduct);
	} catch (err) {
		throw new Error(err);
	}
});

router.post('/addComment/:Product', Authentication, async (req, res) => {
	const MyProduct = await Product.findById(req.params.Product);
	const newComment = {
		postedBy: req.user.id,
		comment: req.body.comment,
	};
	MyProduct.comments.push(newComment);
	await MyProduct.save()
		.then((response) => {
			const key = JSON.stringify({ type: response.productType, id: req.params.Product});
			client.del(key);
			res.send(response);
		})
		.catch((err) => res.status(400).json(err));
});

router.post('/deleteComment/:ProductId/comment/:Comment', Authentication, async (req, res) => {
	const { ProductId, Comment } = req.params;
	const MyProduct = await Product.findById(ProductId);
	const CommentToDelete = MyProduct.comments.find((comment) => {
		return comment.id === Comment;
	});
	if (CommentToDelete.postedBy === req.user.id) throw new Error('You can not delete comment!');
	MyProduct.comments = MyProduct.comments.filter((comment) => {
		return comment.id !== Comment;
	});
	await MyProduct.save()
		.then((response) => {
			const key = JSON.stringify({ type: response.productType, id: req.params.ProductId});
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
			return cb(new Error('Please upload an image'));
		}

		return cb(undefined, true);
	},
});

router.post(
	'/product/photo/:id',
	Authentication,
	upload.single('product'),
	async (req, res) => {
		if (!req.user.admin) throw new Error('You can not add photo');
		const product = await Product.findById(req.params.id);
		const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
		product.productPhotos.push(buffer);
		await product.save();
		res.send('Photo to product added');
	},
	(error, req, res) => {
		res.status(400).send({ error: error.message });
	}
);

router.delete('/product/photo/:id', Authentication, async (req, res) => {
	if (req.user.admin) throw new Error('You can not add photo');
	const product = await Product.findById(req.params.id);
	product.productPhotos = undefined;
	await product.save();
	res.send('Photo deleted');
});

router.get('/product/photo/:id', async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);

		if (!product || !product.productPhotos) {
			throw new Error();
		}

		res.set('Content-Type', 'image/png');
		res.send(product.productPhotos[0]);
	} catch (e) {
		res.status(404).send();
	}
});

module.exports = router;
