function update(id, payload, cb) {
  'use strict';

  var _ = require('lodash');

  var updatedItem;

  if (arguments.length < 3) {
    if (typeof payload === 'function') {
      cb = payload;
      payload = {};
    }
  }

  // Lookup the item
  this.findById(id, function(err, item) {
    if (err) {
      cb(err);
    }

    // Check if we've found a match
    if (item) {

      // Update the item from the payload
      updatedItem = _.extend(item, payload);

      // Save the updated item
      updatedItem.save(function(err) {

        // Return error or updated item
        err ? cb(err) : cb(null, updatedItem);
      });
    } else {

      // Return 404 Not Found
      cb({status: 404, message: 'Resource not found.'});
    }
  });
}

module.exports = update;