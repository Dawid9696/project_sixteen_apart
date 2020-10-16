/** @format */

const mongoose = require("mongoose");
const validator = require("validator");
var math = require("lodash/math");

const Schema = mongoose.Schema;

const postCommentSchema = new Schema(
	{
		postedBy: { type: Schema.Types.ObjectId, ref: "User" },
		comment: { type: String, trim: true },
		commentDate: { type: Date, default: Date.now() },
	},
	{
		timestamps: true,
	}
);

const postSchema = new Schema(
	{
		postTitle: {
			type: String,
			required: true,
			trim: true,
			maxlength: [100, "Post is too long!"],
			alias: "title",
			validate(value) {
				if (validator.isEmpty(value)) throw new Error("Please enter your name !");
			},
		},
		postText: {
			type: String,
			required: true,
			trim: true,
			maxlength: [1000, "Post is too long!"],
			alias: "text",
			validate(value) {
				if (validator.isEmpty(value)) throw new Error("Please enter your name !");
			},
		},
		postLikes: { type: Number, default: 0, get: (v) => math.round(v, 0), set: (v) => math.round(v, 0) },
		postOwner: { type: Schema.Types.ObjectId, ref: "User" },
		postDate: {
			type: Date,
			default: Date.now(),
		},
		postComments: [postCommentSchema],
	},
	{
		timestamps: true,
	}
);

postSchema.statics.ShowPosts = (title) => {
	var regexQuery = {
		postTitle: new RegExp(title, "i"),
	};
	return Post.find(regexQuery).populate("postOwner", "name").select("postTitle postOwner postDate name");
};

var Post = mongoose.model("Post", postSchema);
var PostComment = mongoose.model("PostComment", postCommentSchema);

module.exports = Post;
