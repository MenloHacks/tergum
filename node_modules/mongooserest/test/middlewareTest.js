var assert = require("assert");
var express = require("express");
var bodyParser = require("body-parser");
var request = require("supertest");
var mongoose = require('mongoose');
var mongooserest = require("../");

var app = express();
mongoose.connect('mongodb://localhost:27017/test');
var Schema = mongoose.Schema;


var author = new Schema({
  name: {type: String, required: 'Name is required', index: {unique: true}}
});
var Author = mongoose.model('Author', author);

var book = new Schema({
  title: {type: String, required: 'Title is required', default: 'Book', index: {unique: true}},
  author: {
    type: Schema.Types.ObjectId,
    ref: 'Author'
  }
});
var Book = mongoose.model('Book', book);

app.use(bodyParser.json());

describe('mongooserest', function () {
  describe('MIDDLEWARE', function () {
    it('Add middleware to Express and set up mockup data', function (done) {
      app.use('/api', mongooserest(mongoose));
      var author = Author({name: 'Johnny'});
      author.save(function () {
        Book.remove(function () {
          var books = [];
          for (var i = 1; i <= 10; i++) {
            books.push({title: 'Book' + i, author: author});
          }
          Book.create(books, function () {
            done();
          });
        });
      });
    });
  });

  describe('GET', function () {
    it('should return list books and get title by id', function (done) {
      request(app)
        .get('/api/book')
        .set('Accept', 'application/json')
        .end(function (err, res) {
          if (err) done(err);
          var books = JSON.parse(res.text);
          request(app)
            .get('/api/book/' + books[0]._id)
            .set('Accept', 'application/json')
            .end(function (err, res) {
              if (err) done(err);
              var title = JSON.parse(res.text).title;
              if (title == 'Book1')
                done();
              else
                done('Count not find book');
            });
        });
    });
  });

  describe('PUT', function () {
    it('should update book title', function (done) {
      request(app)
        .get('/api/book')
        .set('Accept', 'application/json')
        .end(function (err, res) {
          var books = JSON.parse(res.text);
          request(app)
            .put('/api/book/' + books[0]._id)
            .set('Accept', 'application/json')
            .send({title: 'Book X'})
            .end(function (err, res) {
              request(app)
                .get('/api/book/' + books[0]._id)
                .set('Accept', 'application/json')
                .end(function (err, res) {
                  var title = JSON.parse(res.text).title;
                  if (title == 'Book X')
                    done();
                  else
                    done(title);
                });
            });
        });
    });
  });

  describe('POST', function () {
    it('should insert a new book', function (done) {
      request(app)
        .post('/api/book')
        .set('Accept', 'application/json')
        .send({title: 'Book NEW'})
        .end(function (err, res) {
          var book = JSON.parse(res.text);
          if (book._id)
            done();
          else
            done(book);
        });
    });
  });

  describe('DELETE', function () {
    it('should delete a new book', function (done) {
      request(app)
        .get('/api/book')
        .set('Accept', 'application/json')
        .end(function (err, res) {
          var books = JSON.parse(res.text);
          request(app)
            .delete('/api/book/' + books[0]._id)
            .set('Accept', 'application/json')
            .expect(200)
            .end(function (err, res) {
              request(app)
                .get('/api/book/count')
                .set('Accept', 'application/json')
                .expect({count: 10})
                .end(done);
            });
        });
    });
  });

  describe('QUERY', function () {
    it('should return book count 10', function (done) {
      request(app)
        .get('/api/book/count')
        .set('Accept', 'application/json')
        .expect({"count": 10})
        .end(done);
    });

    it('should return list books with title "Book2"', function (done) {
      request(app)
        .get('/api/book?query=' + encodeURI(JSON.stringify({title: "Book2"})))
        .set('Accept', 'application/json')
        .end(function (err, res) {
          if (err) done(err);
          var books = JSON.parse(res.text);
          if (books.length == 1 && books[0].title == 'Book2')
            done();
          else
            done(books.length);
        });
    });

    it('should return limit 5 books', function (done) {
      request(app)
        .get('/api/book?limit=5')
        .set('Accept', 'application/json')
        .end(function (err, res) {
          if (err) done(err);
          var books = JSON.parse(res.text);
          if (books.length == 5)
            done();
          else
            done(books.length);
        });
    });

    it('should skip 5 and return 1 book', function (done) {
      request(app)
        .get('/api/book?skip=5&limit=1')
        .set('Accept', 'application/json')
        .end(function (err, res) {
          if (err) done(err);
          var books = JSON.parse(res.text);
          if (books.length == 1 && books[0].title == 'Book7') //removed 1 skiped 5 more.
            done();
          else
            done(JSON.stringify(books));
        });
    });

    it('should sort by title', function (done) {
      request(app)
        .get('/api/book?sort=-title')
        .set('Accept', 'application/json')
        .end(function (err, res) {
          if (err) done(err);
          var books = JSON.parse(res.text);
          if (books[0].title == 'Book9')
            done();
          else
            done(JSON.stringify(books));
        });
    });
  });

  describe('MODEL NOT FOUND', function () {
    it('should give pass to next express router if no model is found', function (done) {
      request(app)
        .get('/api/none')
        .set('Accept', 'application/json')
        .expect(404)
        .end(done);
    });
  });

  describe('SCHEMA', function () {
    it('should return the model schema if allowed', function (done) {
      request(app)
        .get('/api/book/schema')
        .set('Accept', 'application/json')
        .expect({
          title: {
            index: {unique: true},
            default: 'Book',
            required: 'Title is required',
            type: 'String'
          },
          author: {ref: 'Author', type: 'ObjectId'},
          _id: {auto: true, type: 'ObjectId'}
        })
        .end(done);
    });
  });
});