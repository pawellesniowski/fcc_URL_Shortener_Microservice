const express = require('express'),
    app = express();
    mongoClient = require('mongodb').MongoClient,
    dbURL = "mongodb://localhost:27017/mydb"; 
var port = process.env.PORT || 5000;

app.get('/new/:passedURL(*)', (req, res, next)=>{
    var myDomain = req.headers.host;
    // if (req.params.passedURL) // validiation ..

    if (req.params.passedURL.match(/http/i)){
        var original_url = req.params.passedURL;
        var shorten_url = "http://" + myDomain +"/"+ Math.floor(Math.random()*100000);
    } else {
        var original_url = "http://"+req.params.passedURL;
        var shorten_url = "http://" + myDomain +"/"+ Math.floor(Math.random()*100000);
    }

    mongoClient.connect(dbURL, (err, db)=>{
            if(err){ 
                 console.log('Unable to connect to mongoDB: ', err);
            } else { 
                console.log('Connected do Mongo DB'); // 
                db.collection('shortURL').insertOne({
                    original_url: original_url,
                    shorten_url: shorten_url
                }, (err, result)=>{
                    db.close();
                });
            }
    });//end of mongo connection code
    res.json({original_url: original_url, shorten_url: shorten_url});
}); //end of get req

app.get('/:numberPassed', (req, res)=>{
    var myDomain = req.headers.host;
    var numberPassed = req.params.numberPassed;
    var redirectTo;
    // get document with this number form database
    mongoClient.connect(dbURL, (err, db)=>{
        if (err) return err;
        db.collection('shortURL').find({
            shorten_url: "http://" + myDomain +"/"+ numberPassed
        }).toArray((err, doc)=>{
            if (err) return err;
            redirectTo = doc[0].original_url;
            res.redirect(redirectTo);
        })
    })
});

app.listen(port, ()=>console.log('app is running on port: ', port));