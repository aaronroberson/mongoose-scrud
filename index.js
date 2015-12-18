/*!
 * Mongoose SCRUD Plugin
 * Copyright(c) 2015 Aaron Roberson <aaronroberson@gmail.com>
 * MIT Licensed
 */

var search = require('./lib/search');
var create = require('./lib/create');
var read = require('./lib/read');
var update = require('./lib/update');
var destroy = require('./lib/destroy');

function scrud(schema) {
  schema.statics.$search = search;
  schema.statics.$create = create;
  schema.statics.$read = read;
  schema.statics.$update = update;
  schema.statics.$destroy = destroy;
}

module.exports = scrud;
