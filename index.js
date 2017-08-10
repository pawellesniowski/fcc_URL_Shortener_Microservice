const express = require('express'),
    app = express();
    mongoClient = require('mongodb').MongoClient,
    dbURL = "mongodb://localhost:27017/mydb"; 
var port = process.env.PORT || 5000,
    collectionName = 'shortURL';

app.get('/new/:passedURL(*)', (req, res, next)=>{
    // ask DB if there is passedURL allredy in the database
    var regExPassedURL = new RegExp(req.params.passedURL, "ig");
    mongoClient.connect(dbURL, (err, db)=>{
        if(err) throw err;
        db.collection(collectionName).find({
            original_url: regExPassedURL
        }).toArray((err, doc)=>{
            if(err) throw err;
            dbChecked(doc);
            db.close();
            
        })
    })
    
    function dbChecked(doc){
        console.log(doc);
        // console.log("TUTAJ JESTEM !!!!!!!!!!!!!", doc[0].original_url, doc[0].shorten_url);

        if(typeof doc[0] === 'undefined' || doc[0] === null) {
            var myDomain = req.headers.host;
            // regEx for correct addresed passed:
            var regEx = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
            if (req.params.passedURL.match(regEx)) {
                    
                    if(/http:/.test(req.params.passedURL)){ //for example: http://google.com 
                        var original_url = req.params.passedURL;
                        var shorten_url = 'http://'+ myDomain + "/" + Math.floor(Math.random()*100000);
                    } else { //for example google.com
                        var original_url = 'http://'+ req.params.passedURL;
                        var shorten_url = 'http://'+ myDomain + "/" + Math.floor(Math.random()*100000);
                    }

            } else {
                var original_url = "incorrect address, try again";
                var shorten_url = "unable to set shortcut";
            }

            mongoClient.connect(dbURL, (err, db)=>{
                    if(err){ 
                        console.log('Unable to connect to mongoDB: ', err);
                    } else { 
                        console.log('Connected do Mongo DB'); // 
                        db.collection(collectionName).insertOne({
                            original_url: original_url,
                            shorten_url: shorten_url
                        }, (err, result)=>{
                            // console.log(result);
                            db.close();
                        });
                    }
            });//end of mongo connection code
            res.json({original_url: original_url, shorten_url: shorten_url});
        } else {
            console.log(doc);
            res.json({original_url: doc[0].original_url, shorten_url: doc[0].shorten_url});
        }

    }// end of function dbChecked

}); //end of first get req


// second get request
app.get('/:numberPassed', (req, res)=>{
    var myDomain = req.headers.host;
    var numberPassed = +req.params.numberPassed;
    console.log(numberPassed);
    // get document with this number form database
    mongoClient.connect(dbURL, (err, db)=>{
        if (err) return err;
        var regExShortenURL = new RegExp(numberPassed, 'ig');
        db.collection('shortURL').find({
            shorten_url: regExShortenURL
        }).toArray((err, doc)=>{
            if (err) return err;
            res.redirect(doc[0].original_url);
        })
    })
});

app.listen(port, ()=>console.log('app is running on port: ', port));