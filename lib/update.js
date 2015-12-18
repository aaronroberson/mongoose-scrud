function update(conditions, doc, callback) {
  'use strict';

  var _ = require('lodash');
  var _this = this;

  var obj;

  if (arguments.length < 3) {
    if (typeof doc === 'function') {
      callback = doc;
      doc = {};
    }
  }

  // Lookup the item
  _this.findOne(conditions, function(err, item) {
    if (err) {
      callback(err);
    }

    // Check if we've found a match
    if (item) {

      // Update the item from the payload
      obj = _.extend(item, doc);

      // Save the updated item
      obj.save(function(err) {

        // Return error or updated item
        err ? callback(err) : callback(null, obj);
      });

    } else {

      // Return 404 Not Found
      callback({status: 404, message: 'Resource not found.'});
    }
  });
}

module.exports = update;
