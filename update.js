module.exports = function(Model, options) {
  'use strict';

  var _ = require('lodash');

  function update(id, payload, cb) {
    var updatedItem;

    // Lookup the item
    Model.findById(id, function(err, item) {
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

  return update;
};