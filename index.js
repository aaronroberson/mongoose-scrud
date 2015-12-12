/*!
 * Mongoose SCRUD Plugin
 * Copyright(c) 2015 Aaron Roberson <aaronroberson@gmail.com>
 * MIT Licensed
 */

function scrud(schema) {
  schema.statics.search = require('./bin/search');
  schema.statics.create = require('./bin/create');
  schema.statics.read = require('./bin/read');
  schema.statics.update = require('./bin/update');
  schema.statics.del = require('./bin/delete');
}

module.exports = scrud;
