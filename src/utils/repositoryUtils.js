'use strict';

function parseQueryValues (value) {
  if (typeof value === 'string' && value.includes(',')) {
    return { $in: value.split(',').map(v => v.trim()) };
  }
  return value;
}
exports.parseQueryValues = parseQueryValues;
