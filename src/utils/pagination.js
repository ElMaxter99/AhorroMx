/**
 * Utility function to handle pagination for API requests.
 * @param {Function} fetchFunction - The function to fetch data (should return a Promise).
 * @param {Object} options - Options for pagination.
 * @param {number} options.page - Current page number.
 * @param {number} options.pageSize - Number of items per page.
 * @returns {Promise<Object>} - Returns paginated data with metadata.
 */
async function paginate (fetchFunction, { page = 1, pageSize = 10 } = {}) {
  if (page < 1 || pageSize < 1) {
    throw new Error('Page and pageSize must be greater than 0');
  }

  const offset = (page - 1) * pageSize;
  const data = await fetchFunction({ offset, limit: pageSize });

  return {
    data: data.items,
    meta: {
      total: data.total,
      page,
      pageSize,
      totalPages: Math.ceil(data.total / pageSize)
    }
  };
}

module.exports = paginate;
