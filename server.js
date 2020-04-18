const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const URI = process.env.MONGODB_URI || 'mongodb://localhost/database';
const PORT = process.env.PORT || 5000;
const DB_NAME = process.env.DB_NAME;

// middleware
app.use(bodyParser.urlencoded( {extended: false} ));
app.use(bodyParser.json());


// routes
// dirname, this finds the root directory (where we are storing all of our files), and then adding 'secret.html' at the end
app.get('/secret', (req, res) => res.sendFile(path.join(__dirname, 'secret.html')))
app.post('/secret', (req, res) => {
    MongoClient.connect(URI, { useNewUrlParser: true }, (err, client) => {
        if (err) {
            console.log(err);
        } else {
            const db = client.db(DB_NAME); // storing the db into a variable, so you can use its methods
            const collection = db.collection('names'); // you can name collection anything here, in here its 'names'
            const entry = {
                name: req.body.name.toLowerCase(), // getting the name (check secret.html) from the request body
                card: req.body.number + '_of_' + req.body.suit // getting number and suit (check secret.html) from req body
            };
            // Since we're only inserting one entry thus we use insertOne
            collection.insertOne(entry, (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    res.send('Inserted into database');
                }
            })
            client.close();
        }
    })
})

// This is a route with a variable at the end! Basically you can put anything at the end
// :param*
app.get('/:param*', (req, res) => {
    const name = req.url.slice(1).toLowerCase(); // from the url you are getting index 1, which is the name that you put it!

    MongoClient.connect(URI, {useNewUrlParser: true }, (err, client) => {
        if (err) {
            console.log(err);
        } else {
            const db = client.db(DB_NAME);
            const collection = db.collection('names');

            if (name === 'deleteall') {
                collection.deleteMany({});
                res.send('Database reset');
            } else {
                collection.find({name: name}).toArray((err, result) => {
                    if (err) {
                        console.log(err);
                    } else if (result.length >= 1) {
                        const card = result[result.length-1].card + '.png';
                        res.sendFile(path.join(__dirname + '/cards/' + card))
                    } else {
                        res.sendStatus(404);
                    }

                    client.close();

                })
            }
        }
    })
})

app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
})