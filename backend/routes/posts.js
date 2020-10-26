const router = require('express').Router();

const redis = require('redis');
const util = require('util');
const Authentication = require('../Helpers/Authentication');

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);

const Post = require('../models/post.model');

router.get('/Posts', async (req, res) => {
	// const key = JSON.stringify(Object.assign({}, { path: req.path }, req.query));
	// eslint-disable-next-line node/no-unsupported-features/es-syntax
	const key = JSON.stringify({ path: req.path, ...req.query });
	const cachedProducts = await client.get(key);
	console.log(key);
	if (cachedProducts) {
		return res.send(JSON.parse(cachedProducts));
	}

	const posts = await Post.ShowPosts(req.query.title)
		.skip(req.query.page * 8)
		.limit(8);

	client.set(key, JSON.stringify(posts), 'EX', 180);
	return res.send(posts);
});

router.get('/Post/:id', async (req, res) => {
	try {
		const key = JSON.stringify(req.originalUrl);
		const cachedMyProduct = await client.get(key);

		if (cachedMyProduct) {
			return res.send(JSON.parse(cachedMyProduct));
		}
		const MyPost = await Post.findById(req.params.id);
		client.set(key, JSON.stringify(MyPost), 'EX', 180);

		return res.send(MyPost);
	} catch (err) {
		throw new Error(err);
	}
});

router.post('/addPost', Authentication, async (req, res) => {
	const newPost = new Post({
		postTitle: req.body.postTitle,
		postText: req.body.postText,
		postOwner: req.user.id,
	});
	newPost
		.save()
		.then(() => {
			client.keys('*Posts*', (err, keys) => {
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

router.delete('/deletePost/:id', Authentication, async (req, res) => {
	try {
		if (!req.user.admin) throw new Error('You have not permission to delete Product!');
		const deletedPost = await Post.findByIdAndDelete(req.params.id);
		client.keys('*Posts*', (err, keys) => {
			keys.forEach((item) => {
				client.del(item);
			});
		});
		res.send(deletedPost);
	} catch (err) {
		throw new Error(err);
	}
});

router.patch('/updatePost/:id', Authentication, async (req, res) => {
	try {
		if (!req.user.admin) throw new Error('You have not permission to update Product!');
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
router.post('/addComment/:Post', Authentication, async (req, res) => {
	const MyPost = await Post.findById(req.params.Post);
	const newComment = {
		postedBy: req.user.id,
		comment: req.body.comment,
	};
	MyPost.comments.push(newComment);
	await MyPost.save()
		.then(() => {
			client.keys(`*${req.params.Post}*`,(err, keys) => {
				keys.forEach((item) => {
					client.del(item);
				});
			});
			res.send(Post);
		})
		.catch((err) => res.status(400).json(err));
});


router.post('/deleteComment/:Product/comment/:Comment', Authentication, async (req, res) => {
	const MyProduct = await Post.findById(req.params.Product);
	const commentToDelete = MyProduct.comments.find((comment) => {
		return comment.id === req.params.Comment;
	});
	if (commentToDelete.postedBy !== req.user.id) throw new Error('You can not delete comment');
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

module.exports = router;
