function create(payload, options, cb) {
  'use strict';

  var self = this;

  if (arguments.length < 3) {
    if (typeof options === 'function') {
      cb = options;
      options = {};
    }
  }

  self.create(payload, function(err, doc) {
    if (err) {
      return cb(err);
    }

    // Populate relationships.
    if (options.relate) {
      var relationships = require('relationships.js')(self);

      // TODO: Finish relationships before sending response.
      relationships.forEach(function(relation) {

        var referenceId = doc[relation.property];

        // Normalize to array.
        if (!Array.isArray(referenceId)) {
          referenceId = [referenceId];
        }

        referenceId.forEach(function(id) {
          var update = {};
          update[relation.relatedProperty] = doc._id;
          relation.relatedModel.findByIdAndUpdate(id, relation.isArray ? { $addToSet: update } : update, function(err) {
              if (err) {
                return cb(err);
              }
            }
          );
        });

      });
    }

    // Return document
    return cb(null, doc);
  });
}

module.exports = create;
