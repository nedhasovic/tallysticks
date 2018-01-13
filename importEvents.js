const MongoClient = require('mongodb').MongoClient;
var fs = require('fs');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'tallysticks';

let db;



const importEvents = (db) => {
    var events = JSON.parse(fs.readFileSync('./events.json', 'utf8'));
    events.forEach((item) => {

        if (item.method == "CREATE") {

            // insert data
            let data = item.args
            data.createdTime = new Date(item.timestamp);

            if (item.scope == "DOCUMENTS") {
                data.createdYear = data.createdTime.getFullYear();
                data.createdMonth = data.createdTime.toLocaleString('en-us', {month: "long"});
            }

            db.collection(item.scope.toLowerCase()).insert(data, (err) => {
                if (err != null) {
                    console.error(err.message);
                }
            })

        } else if (item.method == "UPDATE") {

            if (item.args.id == undefined) {
                console.error(new Error("Missing id for update"));
            } else {
                let data = item.args
                data.updatedTime = new Date(item.timestamp);

                db.collection(item.scope.toLowerCase()).updateOne({id: item.args.id}, {$set:data}, (err, res) => {
                    if (err != null) {
                        console.error(err.message);
                    }
                })
            }
        }
    });
}

// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
  db = client.db(dbName);
  db.collection('accounts').drop();
  db.collection('documents').drop();
  importEvents(db)
  client.close();
});
