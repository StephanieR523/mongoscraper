// Dependencies
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");

// Scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

// Requiring all models
var db = require("./models");

// Initializing the port
var PORT = process.env.PORT || 3000;

// Initializing Express
var app = express();

// Middleware
    // Use morgan logger for logging requests
    app.use(logger("dev"));
    // Parse request body as JSON
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    // Make public a static folder
    app.use(express.static("public"));

// Using Handlebars
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({
    defaultLayout: "main",
    partialsDir: path.join(__dirname, "/views/layouts/partials")
}));
app.set("view engine", "handlebars");


/*==========================
           Routes
===========================*/

// Shows all unsaved articles on homepage
app.get("/", function(req, res){
    db.Article.find({"saved": false}).then(function(result){
        // This variable allows us to use handlebars by passing the results 
        // from the database as the value in an object
        var hbsObject = { articles: result };
        res.render("index",hbsObject);
    }).catch(function(err){ res.json(err) });
});

// Scrapes the artnews website for the article data
app.get("/scraped", function(req, res) {
    axios.get("http://www.artnews.com/category/news/").then(function(response) {
      var $ = cheerio.load(response.data);

      $("h2.entry-title").each(function(i, element) {
        var result = {};

        result.title = $(element).text();
    
        result.link = $(element).children("a").attr("href");

        result.summary = $(element).siblings(".entry-summary").text().trim();
    
        db.Article.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          console.log(err);
        });
      });
});
res.send("Scrape Complete");
});

// Displays specified saved articles
app.get("/saved", function(req, res) {
    db.Article.find({"saved": true})
        .populate("notes")
        .then(function(result){
        var hbsObject = { articles: result };
        res.render("saved",hbsObject);
    }).catch(function(err){ res.json(err) });
});

// Posts saved articles 
app.post("/saved/:id", function(req, res) {
    db.Article.findOneAndUpdate({"_id": req.params.id}, {"$set": {"saved": true}})
    .then(function(result) {
        res.json(result);
    }).catch(function(err){ res.json(err) });
})

// Deletes specific articles from "Saved Articles" and puts them back on the homepage
app.post("/delete/:id", function(req, res){
    db.Article.findOneAndUpdate({"_id": req.params.id}, {"$set": {"saved": false}})
    .then(function(result){
        res.json(result);
    }).catch(function(err) { res.json(err) });
});

// Grabs a specific article by id and populates it with it's note(s)
app.get("/articles/:id", function(req, res) {
    db.Article.findOne({"_id": req.params.id })
      .populate("notes")
      .then(function(result) {
        res.json(result);
      }).catch(function(err) { res.json(err); });
  });

// Creates an article's associated note(s)
app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function(dbNote) {
        
        return db.Article.findOneAndUpdate({"_id": req.params.id }, {"notes": dbNote._id }, { new: true });
      })
      .then(function(dbArticle) {
      
        res.json(dbArticle);
      })
      .catch(function(err) {
       
        res.json(err);
      });
  });

// Deletes one note
app.post("/deleteNote/:id", function(req, res){
    db.Note.remove({"_id": req.params.id})
      .then(function(result){
        res.json(result);
      })
      .catch(function(err) { 
        res.json(err) 
      });
});

// Clears all articles
// app.get("/clearall", function(req, res) {
//     db.Article.remove({})
//     .then(function(result) {
//         res.json(result);
//       })
//       .catch(function(err) {
//         res.json(err);
//       });
// })


// Starting the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });

  var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/homework";

mongoose.connect(MONGODB_URI);
