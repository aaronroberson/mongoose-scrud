function create(payload, options, cb) {
  'use strict';

  if (arguments.length < 3) {
    if (typeof options === 'function') {
      cb = options;
      options = {};
    }
  }

  this.create(payload, function(err, doc) {
    if (err) {
      return cb(err)
    }

    // Populate relationships.
    if (options.relate) {
      var relationships = require('relationships.js')(this);

      // TODO: Finish relationships before sending response.
      relationships.forEach(function(relation) {

        var referenceId = doc[relation.property];
        // Normalize to array.
        if (!Array.isArray(referenceId)) {
          referenceId = [ referenceId ];
        }

        referenceId.forEach(function(id) {
          var update = {};
          update[relation.relatedProperty] = doc._id;
          relation.relatedModel.findByIdAndUpdate(id, relation.isArray ? { $addToSet: update } : update, function(err, data) {
              if (err) {
                return cb(err);
              }
            }
          );
        });

      });
    }

    // Return document
    return cb(null, doc)
  });
}

module.exports = create;