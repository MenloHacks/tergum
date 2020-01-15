# mongooserest
A RESTful API for Mongoose with Express

## Install

`npm install mongooserest`

## Setup


Add the mongooserest middleware in your express:

``` javascript
var express = require("express");
var bodyParser = require("body-parser");
var mongooserest = require("mongooserest");
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test');


//...

var app = express();
app.use(bodyParser.json());
app.use('/api', mongooserest(mongoose));
//...

```

Define your mongoose models

``` javascript
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var book = new Schema({
  title: {type: String, required: 'Title is required', index: {unique: true}}
});
var Book = mongoose.model('book', book);
```

## RESTful API


### GET (find)


``` javascript
//Get all
$.getJSON('/api/book', function(books){
    console.log(books); // [{title: "Book1", _id: 11111111}, {title: "Book2", _id:22222222}]
});

//Get by id
$.getJSON('/api/book/11111111', function(book){
    console.log(book); // {title: "Book1", _id: 11111111}
});

//Filter
var query = encodeURI(JSON.stringify({title: "book2"}));
$.getJSON('/api/book?query=' + query, function(books){
    console.log(books); // [{title: "Book2", _id:22222222}]
});


//For paging large data set
$.getJSON('/api/book/count', function(result){
    console.log(result); // {count: 1000}
});
$.getJSON('/api/book?skip=500&limit=100', function(books){
    console.log(books); // [{title: "Book2", _id:22222222}, ...]
});


//Sort
$.getJSON('/api/book?sort=-title', function(books){
    console.log(books); // [{title: "Book2", _id:22222222}, {title: "Book1", _id: 11111111}]
});

//Select
$.getJSON('/api/book?sort=-title&select=title', function(books){
    console.log(books); // [{title: "Book2"}, {title: "Book1"}]
});

```


### POST (insert)

``` javascript
$.post('/api/book', {title:'Book3}, function(book){
    console.log(book); // {title: "Book3", _id: 33333333}
});
```

### PUT (update)

``` javascript
$.ajax({
    url: '/api/book/33333333',
    type:'PUT'
    data: {title:'Book3a'},
    success: function(book){
                console.log(book); // {title: "Book3a", _id: 33333333}
            }
});
```

### DELETE (remove)

``` javascript
$.ajax({
    url: '/api/book/33333333',
    type:'DELETE'
    success: function(){
                console.log('deleted');
            }
});
```


### SCHEMA


``` javascript
//Get mongoose schema
$.getJSON('/api/book/schema', function(schema){
    console.log(schema); // {
                         //   title: {
                         //     index: {unique: true},
                         //     default: 'Book',
                         //     required: 'Title is required',
                         //     type: 'String'
                         //     _id: {auto: true, type: 'ObjectId'}
                         //   }
                         // }
});
```

## Authentication

You can use the normal Express router pattern to implement authentication

``` javascript

function myAuthentication(req, res, next) {
  if (req.cookies.token) {
    //...
  } else {
    res.sendStatus(401);
  }
}

app.use('/api', myAuthentication, mongooserest(mongoose));

```

## Versions
- 1.0.0 Initial version
- 1.0.1 Updated README
- 1.0.2 Fixed minor bug on PUT
- 1.0.3 Use save instead of findAndUpdate, so that the pre-save method in the model is used.
- 1.0.4 Added sorting, see example in section GET.
- 1.0.5 If model does not exist, pass on to next Express router.
- 1.0.6 Export mongoose schema
- 1.0.7 Added `select` for selecting specific fields, better performance and save bandwidth.
- 1.0.8 Fixed bug related to version 1.0.7
- 1.0.8 (2015-07-05) Better error messages

## Next steps
- Options for choosing which model to publish
- Fine grained selection of which fields to be enabled for select or update

## License
(The MIT License)

Copyright (c) 2015 Johnny Tsang &lt;johnny@webura.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

