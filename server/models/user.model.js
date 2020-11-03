/** @format */

const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Post = require("./post.model");
const { ProductComment } = require("./product.model");

const { Schema } = mongoose;
const NewSchema = mongoose.Schema;

const authUserOptions = { discriminatorKey: "authUserKey" };
const googleAuthUserOptions = { discriminatorKey: "googleAuthUserKey" };
const facebookAuthUserOptions = { discriminatorKey: "facebookAuthUserKey" };

const userSchema = new NewSchema(
	{
		admin: { type: Boolean, default: false },
		name: {
			type: String,
			required: true,
			trim: true,
			maxlength: [20, "Name is too long!"],
			lowercase: true,
			validate(value) {
				if (validator.isEmpty(value)) throw new Error("Please enter your name !");
				if (!validator.isAlpha(value)) throw new Error(`Name: ${value} can not contain numbers !`);
			},
		},
		surname: {
			type: String,
			required: true,
			trim: true,
			maxlength: [20, "Surname is to long!!"],
			lowercase: true,
			validate(value) {
				if (validator.isEmpty(value)) throw new Error("Please enter your surname !");
				if (!validator.isAlpha(value)) throw new Error(`Surname: ${value} can not contain numbers !`);
			},
		},
		phone: {
			type: Number,
			trim: true,
			// required: true,
			// unique: [true, 'This phone number is already used!'],
			match: /\d{9}/gm,
		},
		avatar: { type: Buffer },
		address: {
			type: String,
			trim: true,
			lowercase: true,
			// required: true,
		},
		city: {
			type: String,
			// required: true,
			trim: true,
			lowercase: true,
			validate(value) {
				if (!validator.isAlpha(value)) throw new Error(`City: ${value} can not contain numbers !`);
			},
		},
		postalCode: {
			type: Number,
			// required: true,
			trim: true,
			match: /\d\d-\d\d\d/g,
		},
		sex: {
			type: String,
			enum: ["MALE", "FAMALE"],
			trim: true,
			// required: true,
			validate(value) {
				if (validator.isEmpty(value)) {
					throw new Error("Please choose your sex!");
				}
			},
		},
		rules: {
			type: Boolean,
			required: true,
			validate(value) {
				if (value !== true) {
					throw new Error("You have to accept rules!");
				}
			},
		},
		myCart: [{ type: Schema.Types.ObjectId, ref: "Product" }],
		myWishList: [{ type: Schema.Types.ObjectId, ref: "Product" }],
	},
	{
		timestamps: true,
		_id: true,
		minimize: true,
		strict: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

userSchema.virtual("fullname").get(function () {
	return `${this.name} ${this.surname}`;
});

userSchema.virtual("fullname").set(function () {
	return `${this.name} ${this.surname}`;
});

userSchema.virtual("MyPosts", {
	ref: "Post",
	localField: "_id",
	foreignField: "postOwner",
	justOne: false,
	options: { createdAt: -1, limit: 5 },
});

userSchema.virtual("numOfPosts", {
	ref: "Post",
	localField: "_id",
	foreignField: "postOwner",
	count: true,
});

userSchema.methods.toJSON = function () {
	const user = this;
	const userObject = user.toObject();

	delete userObject.password;
	delete userObject.tokens;
	delete userObject.avatar;
	delete userObject.id;
	delete userObject.t;
	delete userObject.v;

	return userObject;
};

userSchema.methods.generateAuthToken = async function () {
	const user = this;
	const token = jwt.sign({ _id: user.id.toString() }, process.env.JWT, { expiresIn: 3600 });
	user.tokens = user.tokens.concat({ token });
	await user.save();
	return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
	const user = await authUser.findOne({ email });
	if (!user) {
		throw new Error("There is no user");
	}
	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		throw new Error("There is no match bitch");
	}
	return user;
};

userSchema.pre("save", async function (next) {
	const user = this;
	if (user.isModified("password")) {
		user.password = await bcrypt.hash(user.password, 8);
	}
	next();
});

// Delete user tasks when user is removed
userSchema.pre("remove", async function (next) {
	const user = this;
	await Post.deleteMany({ postOwner: user.id });
	await ProductComment.deleteMany({ postedBy: user.id });
	next();
});
const User = mongoose.model("User", userSchema);

const authUser = User.discriminator(
	"authUser",
	new mongoose.Schema(
		{
			email: {
				type: String,
				required: [true, "E-mail is required!"],
				trim: true,
				unique: [true, "E-mail exist!"],
				match: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g,
				lowercase: true,
				validate(value) {
					if (validator.isEmpty(value)) {
						throw new Error(`Value ${value} is not an email!`);
					}
				},
			},
			password: {
				type: String,
				required: [true, "Password is required!"],
				trim: true,
				minlength: 8,
				match: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,
				validate(value) {
					if (validator.isEmpty(value)) {
						throw new Error("Password is required!");
					}
				},
			},
			photo: {
				type: String,
				trim: true,
			},
			tokens: [
				{
					token: { type: String },
				},
			],
		},
		authUserOptions
	)
);

const googleAuthUser = User.discriminator(
	"googleAuthUser",
	new mongoose.Schema(
		{
			googleId: {
				type: String,
				trim: true,
			},
		},
		googleAuthUserOptions
	)
);

const facebookAuthUser = User.discriminator(
	"facebookAuthUser",
	new mongoose.Schema(
		{
			facebookId: {
				type: String,
				trim: true,
			},
		},
		facebookAuthUserOptions
	)
);

module.exports = { User, authUser, googleAuthUser, facebookAuthUser };
