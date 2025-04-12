'use strict';

const Category = require('../models/category');

const { parseQueryValues } = require('../utils/repositoryUtils');

function getQueryFromOptions (options = {}) {
  const query = {};
  if (options.name) {
    query.name = parseQueryValues(options.name);
  }

  if (options.description) {
    query.description = options.description;
  }

  if (options.active) {
    query.active = parseQueryValues(options.active);
  }

  if (options.startDate || options.endDate) {
    query.creationDate = {};
    if (options.startDate) {
      query.creationDate.$gte = new Date(options.startDate);
    }
    if (options.endDate) {
      query.creationDate.$lte = new Date(options.endDate);
    }
  }

  return query;
}

function buildQueryProjectionAndPopulation (options = {}) {
  const query = getQueryFromOptions(options) || {};
  const projection = {};
  const population = [];

  return { query, projection, population };
}

async function create (categoryData) {
  const category = new Category(categoryData);
  return await category.save();
}

async function update (categoryId, categoryData) {
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new Error('Categoría no encontrada');
    }

    Object.assign(category, categoryData);
    return await category.save();
  } catch (error) {
    throw new Error(`Error al actualizar la categoría: ${error.message}`);
  }
}

async function updateName (categoryId, categoryName) {
  try {
    if (!categoryId || !categoryName) {
      throw new Error('ID de categoría o nombre no proporcionados');
    }

    const category = await Category.findByIdAndUpdate(
      categoryId,
      { name: categoryName },
      { new: true }
    );
    if (!category) {
      throw new Error('Categoría no encontrada');
    }

    return category;
  } catch (error) {
    throw new Error(`Error al actualizar el nombre de la categoría: ${error.message}`);
  }
}

async function updateDescription (categoryId, categoryDescription) {
  try {
    if (!categoryId || !categoryDescription) {
      throw new Error('ID de categoría o descripción no proporcionados');
    }

    const category = await Category.findByIdAndUpdate(
      categoryId,
      { description: categoryDescription },
      { new: true }
    );
    if (!category) {
      throw new Error('Categoría no encontrada');
    }

    return category;
  } catch (error) {
    throw new Error(`Error al actualizar la descripción de la categoría: ${error.message}`);
  }
}

async function updatePathEmojiIcon (categoryId, pathIcon) {
  try {
    if (!categoryId || !pathIcon) {
      throw new Error('ID de categoría o icono no proporcionados');
    }

    const category = await Category.findByIdAndUpdate(
      categoryId,
      { imgEmojiIcon: pathIcon },
      { new: true }
    );
    if (!category) {
      throw new Error('Categoría no encontrada');
    }

    return category;
  } catch (error) {
    throw new Error(`Error al actualizar el icono de la categoría: ${error.message}`);
  }
}

async function updateActive (categoryId, active) {
  try {
    if (!categoryId || active === undefined) {
      throw new Error('ID de categoría o estado no proporcionados');
    }

    const category = await Category.findByIdAndUpdate(
      categoryId,
      { active },
      { new: true }
    );
    if (!category) {
      throw new Error('Categoría no encontrada');
    }

    return category;
  } catch (error) {
    throw new Error(`Error al actualizar el estado de la categoría: ${error.message}`);
  }
}

async function getCategory (options = {}) {
  try {
    const { query } = buildQueryProjectionAndPopulation(options);
    return await Category.find(query).exec();
  } catch (error) {
    throw new Error(`Error al obtener la categoría: ${error.message}`);
  }
}

async function getById (categoryId, options = {}) {
  try {
    const { query } = buildQueryProjectionAndPopulation(options);
    return await Category.findById(categoryId, query).exec();
  } catch (error) {
    throw new Error(`Error al obtener la categoría por ID: ${error.message}`);
  }
}

async function getList (options = {}) {
  try {
    const { query } = buildQueryProjectionAndPopulation(options);
    return await Category.find(query).exec();
  } catch (error) {
    throw new Error(`Error al obtener la lista de categorías: ${error.message}`);
  }
}

async function getListByIds (ids) {
  try {
    if (!ids || !Array.isArray(ids)) {
      throw new Error('Invalid input: ids must be an array');
    }

    return await Category.find({ _id: { $in: ids } }).exec();
  } catch (error) {
    throw new Error(`Error al obtener la lista de categorías por ID: ${error.message}`);
  }
}

async function deleteCategory (categoryId) {
  try {
    if (!categoryId) {
      throw new Error('ID de categoría no proporcionado');
    }

    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
      throw new Error('Categoría no encontrada');
    }

    return category;
  } catch (error) {
    throw new Error(`Error al eliminar la categoría: ${error.message}`);
  }
}

module.exports = {
  create,
  update,
  getCategory,
  getById,
  getList,
  getListByIds,
  updateName,
  updateDescription,
  updatePathEmojiIcon,
  updateActive,
  delete: deleteCategory
};
