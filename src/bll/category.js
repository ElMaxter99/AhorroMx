'use strict';

const categoryRepository = require('../repository/category');

async function createCategory (data, user) {
  const savedCategory = await categoryRepository.createCategory(data);
  return savedCategory;
}
exports.create = createCategory;

async function getById (categoryId, user) {
  const category = await categoryRepository.getById(categoryId);
  return category;
}
exports.getById = getById;

async function getList (options = {}, user) {
  const categories = await categoryRepository.getList(options);
  return categories;
}
exports.getList = getList;

async function getListByIds (ids, user) {
  const categories = await categoryRepository.getListByIds(ids);
  return categories;
}
exports.getListByIds = getListByIds;

async function deleteCategory (categoryId, user) {
  const deletedCategory = await categoryRepository.delete(categoryId);
  return deletedCategory;
}
exports.delete = deleteCategory;

async function updateName (categoryId, name, user) {
  const category = await getById(categoryId, user);
  if (!category) {
    throw new Error('Categoría no encontrada.');
  }

  const updatedCategory = await categoryRepository.updateName(categoryId, name);
  return updatedCategory;
}
exports.updateName = updateName;

async function updateDescription (categoryId, description, user) {
  const category = await getById(categoryId, user);
  if (!category) {
    throw new Error('Categoría no encontrada.');
  }

  const updatedCategory = await categoryRepository.updateDescription(categoryId, description);
  return updatedCategory;
}
exports.updateDescription = updateDescription;

async function updatePathEmojiIcon (categoryId, pathEmojiIcon, user) {
  const category = await getById(categoryId, user);
  if (!category) {
    throw new Error('Categoría no encontrada.');
  }

  const updatedCategory = await categoryRepository.updatePathEmojiIcon(categoryId, pathEmojiIcon);
  return updatedCategory;
}
exports.updatePathEmojiIcon = updatePathEmojiIcon;

async function updateActive (categoryId, active, user) {
  const category = await getById(categoryId, user);
  if (!category) {
    throw new Error('Categoría no encontrada.');
  }

  const updatedCategory = await categoryRepository.updateActive(categoryId, active);
  return updatedCategory;
}
exports.updateActive = updateActive;

async function updateCategory (categoryId, data, user) {
  const category = await getById(categoryId, user);
  if (!category) {
    throw new Error('Categoría no encontrada.');
  }

  const updatedCategory = await categoryRepository.updateCategory(categoryId, data);
  return updatedCategory;
}
exports.update = updateCategory;
