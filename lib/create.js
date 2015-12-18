function create(doc, options, callback) {
  'use strict';

  var _this = this;

  if (arguments.length < 3) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
  }

  var obj = new _this(doc);

  obj.save(function(err) {

    // Populate relationships.
    if (options.relate) {

      var relationships = require('./relationships')(_this);

      // TODO: Finish relationships before sending response.
      relationships.forEach(function(relation) {

        var referenceId = data[relation.property];

        // Normalize to array.
        if (!Array.isArray(referenceId)) {
          referenceId = [referenceId];
        }

        referenceId.forEach(function(id) {
          var update = {};

          update[relation.relatedProperty] = data._id;

          relation.relatedModel.findByIdAndUpdate(id,
            relation.isArray ? { $addToSet: update } : update,

            function(err, data) {
              if (err) {
                debug('Relationship error:', err);
                debug('Failed to relate:',
                  relation.relatedModel.modelName,
                  relation.relatedProperty);
              }

              debug('Relationship success:', data);
            }
          );
        });

      });
    }

    callback(err, obj);
  });
}

module.exports = create;
