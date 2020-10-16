/** @format */

const router = require("express").Router();

//HELPERS
const Authentication = require("../Helpers/Authentication");

const redis = require("redis");
const util = require("util");
const redisUrl = "redis://127.0.0.1:6379";
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);

let Post = require("../models/post.model");

// router.get("/Posts", async (req, res) => {
// 	const posts = await Post.ShowPosts(req.query.title)
// 		.skip(req.query.page * 8)
// 		.limit(8);

// 	const key = JSON.stringify(req.query);
// 	const cachedProducts = await client.get(key);

// 	if (cachedProducts) {
// 		const currentDataLength = JSON.parse(cachedProducts).length;
// 		const incomingDataLegth = posts.length;
// 		if (currentDataLength != incomingDataLegth) {
// 			return client.flushall();
// 		}
// 		return res.send(JSON.parse(cachedProducts));
// 	}
// 	client.set(key, JSON.stringify(posts), "EX", 180);
// 	res.send(posts);
// });

router.get("/Posts", async (req, res) => {
	const posts = await Post.ShowPosts(req.query.title)
		.skip(req.query.page * 8)
		.limit(8);

	// const key = JSON.stringify(req.query);
	// const cachedProducts = await client.get(key);

	// if (cachedProducts) {
	// 	const currentDataLength = JSON.parse(cachedProducts).length;
	// 	const incomingDataLegth = posts.length;
	// 	if (currentDataLength != incomingDataLegth) {
	// 		return client.flushall();
	// 	}
	// 	return res.send(JSON.parse(cachedProducts));
	// }
	// client.set(key, JSON.stringify(posts), "EX", 180);
	res.send(posts);
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

		res.send(MyPost);
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
			res.send(newPost);
		})
		.catch((err) => {
			res.status(400).send(err);
		});
});

//DELETE BOOK ROUTER
router.delete("/deletePost/:id", Authentication, async (req, res) => {
	try {
		if (!req.user.admin) throw new Error("You have not permission to delete Product!");
		const deletedPost = await Post.findByIdAndDelete(req.params.id);
		res.send(deletedPost);
	} catch (err) {
		throw new Error(err);
	}
});

//UPDATE BOOK ROUTER
router.patch("/updatePost/:id", Authentication, async (req, res) => {
	try {
		if (!req.user.admin) throw new Error("You have not permission to update Product!");
		const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body);
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
		.then((Post) => res.send(Post))
		.catch((err) => res.status(400).json("Error: " + err));
});

//ADD COMMENT ROUTER
router.post("/addComment/:Product/comment/:Comment", Authentication, async (req, res) => {
	const MyProduct = await Post.findById(req.params.Product);
	const commentToDelete = MyProduct.comments.find((comment) => {
		return comment._id == req.params.Comment;
	});
	if (commentToDelete.postedBy != req.user.id) throw new Error("You can not delete comment");
	MyProduct.comments = MyProduct.comments.filter((comment) => {
		return comment._id != req.param.Comment;
	});
	await MyProduct.save()
		.then((Product) => res.send(Product))
		.catch((err) => res.status(400).json("Error: " + err));
});

module.exports = router;
