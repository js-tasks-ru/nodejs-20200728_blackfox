const mongoose = require('mongoose');

const Product = require('../models/Product');

const mapProductToInternal = (product) => ({
  id: product._id,
  title: product.title,
  images: product.images,
  category: product.category,
  subcategory: product.subcategory,
  price: product.price,
  description: product.description,
});

module.exports.productsBySubcategory = async function productsBySubcategory(
    ctx,
    next,
) {
  const {subcategory} = ctx.request.query;

  if (!subcategory) {
    return next();
  }

  const products = await Product.find({subcategory});

  ctx.body = {products: products.map(mapProductToInternal)};
};

module.exports.productList = async function productList(ctx, next) {
  const products = await Product.find();

  ctx.body = {products: products.map(mapProductToInternal)};
};

module.exports.productById = async function productById(ctx, next) {
  const {
    params: {id},
  } = ctx;

  const isValidId = mongoose.Types.ObjectId.isValid(id);

  if (!isValidId) {
    ctx.status = 400;
    return;
  }

  const product = await Product.findById(id);

  if (product) {
    ctx.body = {
      product: mapProductToInternal(product),
    };
  } else {
    ctx.status = 404;
  }
};
