const Category = require('../models/Category');

const mapSubcategoryToInternal = (subcategory) => ({
  id: subcategory._id,
  title: subcategory.title,
});

const mapCategoryToInternal = (category) => ({
  id: category._id,
  title: category.title,
  subcategories: category.subcategories.map(mapSubcategoryToInternal),
});

module.exports.categoryList = async function categoryList(ctx, next) {
  const categories = await Category.find().populate('subcategories');

  ctx.body = {categories: categories.map(mapCategoryToInternal)};
};
