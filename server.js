//URL_Shortener_Microservice
//FCC API Basejump: URL Shortener Microservice
'use strict';
var mongo = require('mongodb');

var ejs = require('ejs');

var validUrl = require('valid-url');

var shortid = require('shortid');

var express = require('express');

var app = express();

var urlmLab = process.env.MONGOLAB_URI;

mongo.MongoClient.connect(urlmLab || 'mongodb://localhost:27017/code101', function(err, db) { 
 if (err) { 
     throw new Error('Database failed to connect.'); 
   } else { 
     console.log('Successfully connected to MongoDB.'); 
   } 

db.createCollection("urls", { 
     capped: true, 
     size: 5242880, 
     max: 5000 
   }); 

app.set('view engine', 'ejs');
var bodyParser = require('body-parser');
//var path = require('path');
//require('dotenv').load();

app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json()); 
app.use('/', express.static(process.cwd() + '/')); 
      
var port = process.env.PORT || 8080; 


app.get('/', function(req, res) {
    res.sendFile(process.cwd() + '/index.html');
});


app.post("/", function (req, res) {
    console.log(req.body.url);
        
var url = req.body.url;
var tagline = "URL info: ";
    
var getID = shortGen();

console.log('URL: TRUE: ' + url);


var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

console.log(fullUrl);
var newUrl = fullUrl + getID;
console.log(newUrl);


var urlrec = {};
if (validateURL(url)) { 
       urlrec = { 
         "origurl": url, 
         "shorturl": getID
       }; 
      // res.send(urlObj); 
      res.render('pages/index', {
        "origurl": url, 
        "shorturl": fullUrl+getID,
         "error": "",
        tagline: tagline
    });
    
       saveURL(urlrec, db);
       
     } else { 
       urlrec = { 
         "error": "Wrong URL website address, please check again!" 
       }; 
       //res.send(urlObj); 
        res.render('pages/index', {
        "origurl": url, 
        "shorturl": "",            
        "error": "Wrong URL website address, please check again!",
        tagline: tagline
    });
     } 

//res.render('pages/index', {
//        url: url,
//        tagline: tagline
//    });

});



app.get('/:urlnew*', function(req, res) {
   //console.log(req.body.urlnew);
   console.log("URL: " + req.params.urlnew);   
   //req.params.urlnew;
   var tagline = "URL info: ";
   
   var urlnew = req.params.urlnew;
   
   var sites = db.collection('shortCol');
    sites.findOne({
      "shorturl": urlnew
    }, function(err, result) {
        console.log(result);
      if (err) throw err;
      if (result) {
        console.log(result);
        
        console.log('Open page from short URL: ' + result.origurl);
        res.redirect(result.origurl);
      } else {
       // res.send({
       // "error": "URL does not exist here!"
     // });
     res.render('pages/index', {
        "origurl": "", 
        "shorturl": "",            
        "error": "Wrong URL website address, please check again!",
        tagline: tagline
    });
      }
    });
   
});


app.listen(port,  function () 
{
	
console.log('Node.js ... HERE ... listening on port ' + port + '...');

});

function validateURL(url) { 
if (validUrl.isUri(url)){
        console.log('Looks like an URI');
        return true; 
    } else {
        console.log('Not a URI');
        return false;
    }
  } 
  
  function shortGen() { 
      var temp = shortid.generate();
    console.log(temp);
    return temp;
  }
  
function saveURL(rec, db) { 
      // save data into db collection
     var urls = db.collection('shortCol'); 
     urls.save(rec, function(err, result) { 
       if (err) throw err; 
       console.log('Saved ' + result); 
     }); 
   } 
   
   
   
  // end  
});