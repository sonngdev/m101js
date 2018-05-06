var express = require('express'),
    app = express(),
    engines = require('consolidate'),
    bodyParser = require('body-parser');
    MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

app.engine('html', engines.nunjucks);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: true }));

MongoClient.connect('mongodb://localhost:27017/video', function(err, db) {

  assert.equal(null, err);
  console.log("Successfully connected to MongoDB.");

  // Handler for internal server errors
  function errorHandler(err, req, res, next) {
    console.error(err.message);
    console.error(err.stack);
    res.status(500).render('error_template', { error: err });
  }

  app.get('/', express.static("public"));

  app.post('/newmovie', function(req, res, next) {
    var title = req.body.title,
        year = req.body.year,
        imdb = req.body.imdb;

    if (!title || !year || !imdb) {
      next('Please fill in all fields');
    }
    else {
      db.collection("movies").insertOne({title: title, year: year, imdb: imdb});
      res.render("newmovie_template", {title: title, year: year, imdb: imdb});
    }
  });

  app.use(errorHandler);

  app.use(function(req, res){
      res.sendStatus(404);
  });

  var server = app.listen(3000, function() {
    var port = server.address().port;
    console.log('Express server listening on port %s.', port);
  });

});
