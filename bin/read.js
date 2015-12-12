function read(id, params, cb) {
  'use strict';

  var populate = '';

  if (arguments.length < 3) {
    if (typeof params === 'function') {
      cb = params;
      params = {};
    }
  }

  if (params.__populate) {
    populate = params.__populate;
    delete params.__populate;
  }

  if (id) {
    // Lookup document
    this.findById(id)
      .populate(populate)
      .exec(function(err, doc) {
        if (err) {
          return cb(err);
        }

        // Return doc or 404
        return doc ? cb(null, doc) : cb({status: 404, message: 'Resource not found'});
      });
  } else {

    // Return 404 "Resource not found"
    cb({status: 404, message: 'Resource not found'});
  }
}

module.exports = read;