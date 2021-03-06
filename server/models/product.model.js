

const mongoose = require('mongoose');
const validator = require('validator');
const math = require('lodash/math');

const { Schema } = mongoose;
const NewSchema = mongoose.Schema;

const productCommentSchema = new NewSchema(
	{
		postedBy: { type: Schema.Types.ObjectId, ref: 'User' },
		comment: { type: String, trim: true },
		commentDate: { type: Date, default: Date.now() },
	},
	{
		timestamps: true,
	},
);

const productSchema = new NewSchema(
	{
		productName: {
			type: String,
			required: true,
			trim: true,
			unique: [true, 'Product exist!'],
			maxlength: [150, 'Name is too long!'],
			lowercase: true,
			alias: 'name',
			validate(value) {
				if (validator.isEmpty(value))
					throw new Error('Please enter your name !');
			},
		},
		productPrice: {
			type: Number,
			required: [true, 'Price is required!'],
			trim: true,
			get: (v) => math.round(v, 2),
			set: (v) => math.round(v, 2),
			min: [0, 'Price is to low!'],
			max: [10000, 'Price is to high!'],
			alias: 'price',
			validate(value) {
				if (!value) throw new Error('Please enter price !');
			},
		},
		productType: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
			enum: ['ring', 'watch'],
		},
		productDescription: {
			type: String,
			required: [true, 'Description is required!'],
			trim: true,
			alias: 'description',
			validate(value) {
				if (validator.isEmpty(value))
					throw new Error(`Value ${value} is not an email!`);
			},
		},
		productMark: {
			type: String,
			required: [true, 'Mark is required!'],
			trim: true,
			lowercase: true,
			alias: 'mark',
			validate(value) {
				if (validator.isEmpty(value))
					throw new Error(`Value ${value} is not an email!`);
				if (!validator.isAlpha(value))
					throw new Error(`Mark: ${value} can not contain numbers !`);
			},
		},
		productStone: {
			type: String,
			trim: true,
			lowercase: true,
			alias: 'stone',
			validate(value) {
				if (validator.isEmpty(value))
					throw new Error(`Value ${value} is not an email!`);
				if (!validator.isAlpha(value))
					throw new Error(`Material: ${value} can not contain numbers !`);
			},
		},
		productMaterial: {
			type: String,
			trim: true,
			lowercase: true,
			alias: 'material',
			validate(value) {
				if (validator.isEmpty(value))
					throw new Error(`Value ${value} is not an email!`);
			},
		},
		productMechanism: {
			type: String,
			trim: true,
			lowercase: true,
			alias: 'mechanism',
			validate(value) {
				if (validator.isEmpty(value))
					throw new Error(`Value ${value} is not an email!`);
				if (!validator.isAlpha(value))
					throw new Error(`Material: ${value} can not contain numbers !`);
			},
		},
		productEnvelope: {
			type: String,
			trim: true,
			lowercase: true,
			alias: 'envelope',
			validate(value) {
				if (validator.isEmpty(value))
					throw new Error(`Value ${value} is not an email!`);
			},
		},
		productBelt: {
			type: String,
			trim: true,
			lowercase: true,
			alias: 'belt',
			validate(value) {
				if (validator.isEmpty(value))
					throw new Error(`Value ${value} is not an email!`);
			},
		},
		productAccess: { type: Boolean, default: true, alias: 'access' },
		productSale: {
			type: Number,
			trim: true,
			min: 0,
			max: 10000,
			alias: 'sale',
		},
		productPhotos: [{ type: Buffer }],
		comments: [productCommentSchema],
	},
	{
		timestamps: true,
	},
);

productSchema.methods.toJSON = function () {
	const product = this;
	const productObject = product.toObject();
	delete productObject.productPhotos;
	return productObject;
};

productSchema.statics.findProducts = (title) => {
	const regexQuery = {
		productName: new RegExp(title, 'i'),
	};
	// eslint-disable-next-line no-use-before-define
	return Product.find(regexQuery).select('productName productPrice productPhotos');
};

productSchema.statics.findNewProducts = () => {
	// eslint-disable-next-line no-use-before-define
	return Product.find().select('productName productPrice productPhotos').limit(4).sort({ createdAt: -1 });
};

const Product = mongoose.model('Product', productSchema);
const ProductComment = mongoose.model('ProductComment', productCommentSchema);

Product.watch().on('change', (data) => console.log(new Date(), data));

module.exports = { ProductComment, Product };
