function relationships(Model) {

  var relationships = [];
  var modelName = Model.modelName;
  var tree = Model.base.modelSchemas[modelName].tree;

  for (var property in tree) {

    // Alternative way of specifying Geospatial index.
    // https://github.com/LearnBoost/mongoose/wiki/3.6-Release-Notes#geojson-support-mongodb--24
    if (tree[property].index === '2dsphere') {
      // TODO: Figure how this relates to search
      geoField = property;
    }

    var schema = tree[property];
    if (Array.isArray(schema)) {
      schema = schema[0];
    }

    if (schema.ref) {
      var relatedModel = mongoose.model(schema.ref);
      // TODO: relatedModel.tree?
      var relatedTree = relatedModel.base.modelSchemas[schema.ref].tree;
      for (var relatedProperty in relatedTree) {

        var isArray = false;
        var relatedSchema = relatedTree[relatedProperty];
        if (Array.isArray(relatedSchema)) {
          isArray = true;
          relatedSchema = relatedSchema[0];
        }

        if (relatedSchema.ref === modelName) {
          relationships.push({
            isArray: isArray,
            Model: Model,
            property: property,
            relatedModel: relatedModel,
            relatedProperty: relatedProperty
          });
        }
      }
    }
  }

  return relationships;
}

module.exports = relationships;