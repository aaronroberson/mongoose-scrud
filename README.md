# Mongoose SCRUD

Node.js Express middleware that uses your Mongoose schema to generate SCRUD API routes compatible with AngularJS and ngResource.

## Implementation

Before you begin, be sure [MongoDB is installed](http://docs.mongodb.org/manual/installation/) and `mongod` is running.

Install mongoose-scrud as a dependency and add it to your `package.json` file.

```
npm install mongoose-scrud --save
```

First, define your Mongoose models and any necessary validations and indexes.

```
// models.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	name: { type: String, required: true },
	email: { type: String, required: true },
	password: { type: String, required: true }
});
mongoose.model('User', userSchema);

var postSchema = new Schema({
	title: { type: String, required: true },
	contents: { type: String, required: true },
	author: { type: Schema.Types.ObjectId, ref: 'User', index: true }
});
mongoose.model('Post', postSchema);
```

## Options

Mongoose SCRUD expects the Model object and options to be passed in on require of the module as seen below:

```
var scrud = require('mongoose-scrud')(Model, {
	relate: true
});
```

### relate
Experimental feature that automatically populates references on create and removes them on delete. Default: `false`

## Usage

For each model, five endpoints are created that handle resource search, create, read, update and delete (SCRUD) functions.

### Search
```
function(req, res, next) {
	scud.search(req.query, function(error, results) {
	  error ? response.json(500, {code: 'MongoError', message: error}) : response.json(200, results);
	});
}
```
The search route returns an array of resources that match the fields and values provided in the query parameters.

For example:

```
GET /api/posts?author=544bbbceecd047be03d0e0f7&__limit=1
```
If no query parameters are present, it returns the entire data set.  No results will be an empty array (`[]`).

Options are passed in as query parameters in the format of `&__{option}={value}` in the query string, and unlock the power of MongoDB's `find()` API.

Option   | Description
-------- | -------------
limit    | Limits the result set count to the supplied value.
skip     | Number of records to skip (offset).
sort     | Sorts the record according to provided [shorthand sort syntax](http://mongoosejs.com/docs/api.html#query_Query-sort) (e.g. `&__sort=-name`).
populate | Populates object references with the full resource (e.g. `&__populate=users`).
count    | When present, returns the resulting count in an array (e.g. `[38]`).
near     | Performs a geospatial query on given coordinates and an optional range (in meters), sorted by distance by default. Required format: `{longitude},{latitude},{range}`

Mongoose SCRUD also supports range queries. To perform a range query, pass in a stringified JSON object into the field on the request.

```
GET /api/posts?createdAt={"$gt":"2013-01-01T00:00:00.000Z"}
```

Using `ngResource` in AngularJS, performing a range query is easy:

```
// Find posts created on or after 1/1/2013.
Posts.query({
	createdAt: JSON.stringify({
		$gte: new Date('2013-01-01')
	})
});
```

### Create
```
function(req, res, next) {
	scud.create(req.body, function(error, results) {
	  error ? response.json(500, {code: 'MongoError', message: error}) : response.json(200, results);
	});
}
```
Posting (or putting, if enabled) to the create route validates the incoming data and creates a new resource in the collection. Upon validation failure, a `400` error with details will be returned to the client. On success, a status code of `201` will be issued and the new resource will be returned.

### Read
```
function(req, res, next) {
	scud.read(id, req.query, function(error, results) {
	  error ? response.json(500, {code: 'MongoError', message: error}) : response.json(200, results);
	});
}
```
The read path returns a single resource object in the collection that matches a given id. If the resource does not exist, a `404` is returned.

### Update
```
function(req, res, next) {
	scud.update(id, req.body, function(error, results) {
	  error ? response.json(500, {code: 'MongoError', message: error}) : response.json(200, results);
	});
}
```
Posting (or putting, if enabled) to the update route will validate the incoming data and update the existing resource in the collection and respond with `204` if successful. Upon validation failure, a `400` error with details will be returned to the client. A `404` will be returned if the resource did not exist.

### Delete
```
function(req, res, next) {
	scud.del(id, function(error, results) {
	  error ? response.json(500, {code: 'MongoError', message: error}) : response.json(200, results);
	});
}
```
Issuing a delete request to this route will result in the deletion of the resource and a `204` response if successful. If there was no resource, a `404` will be returned.

## Sub-documents
```
function index(request, response) {
  request.query = request.query || {};

  // Support for nested resources such as
  // GET /portal/accounts/:id/transactions
  if (request.params.id || request.accountId) {
    request.query.account = request.params.id || request.accountId;
  }

  // Default sort to descending order on createdAt
  request.query.__sort = request.query.__sort || '-createdAt';

  scrud.search(request.query, function(error, results) {
    error ? response.json(500, {code: 'MongoError', message: error}) : response.json(200, results);
  });
}
```


## Validation Hooks

Mongoose SCRUD will handle [validation described by your models](http://mongoosejs.com/docs/validation.html), as well as any [error handling defined](http://mongoosejs.com/docs/middleware.html) in your `pre` middleware hooks.

```
postSchema.path('type').validate(function (value) {
  return /article|review/i.test(value);
}, 'InvalidType');

```

The above custom validator example will return a validation error if a value other than "article" or "review" exists in the `type` field upon creation or update.

Example response:

```
{
	message: 'Validation failed',
	name: 'ValidationError',
	errors: {
		type:
			{
				message: 'InvalidType',
				name: 'ValidatorError',
				path: 'type',
				type: 'user defined',
				value: 'poop'
			}
		}
	}
}
```

Advanced validation for the create and update routes may be achieved using the `pre` hook, for example:

```
commentSchema.pre('save', function (next) {
	if (this.message.length <= 5) {
		var error = new Error();
		error.name = 'ValidateLength'
		error.message = 'Comments must be longer than 5 characters.';
		return next(error);
	}
	next();
});
```
Mongoose SCRUD will return a `400` with the error object passed by your middleware.

```
{
	name: 'ValidateLength',
	message: 'Comments must be longer than 5 characters.'
}
```

## Credits

This package is adapted from [meanify](https://github.com/artzstudio/meanify) and is made for use in non-express applications. As such, Express is not a dependency. Please note, this library does not generate endpoints.

## Roadmap

* Examples and documentation on integration.

## Changelog

### 0.1.0 | 10/28/2014
* Alpha release ready for publish to npm and testing.