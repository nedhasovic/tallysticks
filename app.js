const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const crypto2 = require('crypto2');
const path = require("path");
const fs = require("fs");
var crypto = require('crypto');
const port = 8080;

// Init app
const app = express();

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'tallysticks';

let db;

// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
    db = client.db(dbName);
    //client.close();
});

// // View Engine
// app.engine('handlebars', exphbs({defaultLayout:'main'}));
// app.set('view engine', 'handlebars');
//
// // body-parser
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended:false}));
//
// // Main Search Page
// app.get('/', function(req, res, next){
//   res.render('searchbox');
// });
//
//
// // Search User processing
// app.post('/user/search', function(req, res, next){
//   let userId = req.body.userId;
//
//   client.hgetall("accounts:"+userId+":args", function(err, obj){
//     if(!obj){
//       res.render('searchbox', {
//         error: 'User does not exist'
//       });
//     } else {
//       obj.userId = userId;
//       res.render('userDetails', {
//         user: obj
//       });
//     }
//   });
// });
//
// // Search Doc processing
// app.post('/doc/search', function(req, res, next){
//   let docId = req.body.docId;
//
//   client.hgetall(docId, function(err, obj){
//     if(!obj){
//       res.render('searchbox', {
//         error: 'Doc does not exist'
//       });
//     } else {
//       obj.docId = docId;
//
//       res.render('docDetails', {
//         user: obj
//       });
//     }
//   });
// });

let documentFields = { id:1, encryptedData:1, hash:1, uploadedBy:1,encryptionKey:1,  createdTime:1, _id:0 , createdMonth:1 , createdYear: 1};
let accountFields = {id:1, nickname:1, createdTime:1, updatedTime:1, _id:0};

decrypt = (cryptkey, iv, encryptdata) => {
    var decipher = crypto.createDecipheriv('aes-256-cbc', cryptkey, iv);
    return Buffer.concat([
        decipher.update(encryptdata),
        decipher.final()
    ]);
}


function decypher(text, hash){

    let hex =  Buffer.from(text).toString('hex');
    console.log(hash);
    console.log(hex);

    crypto2.decrypt.aes256cbc(hash, hex, (err, decryptedText) => {
        console.log(decryptedText);
        return decryptedText;
    });
}

let encrypt = () => {
    crypto2.encrypt.aes256cbc('sdijfhaospdfnopasdnjoasdncoa;sdlncalsdnca;lsdcna;lsdcnalskjdcalksdbclkasdbcalksdjbc', '12321asdfasdfasdf', (err, text) => {
        console.log(text);
    });
}
let decryptWithPrivateKey = (item) => {

    // var privKeyPath = path.resolve('./privkey.pem');
    // var privateKey = fs.readFileSync(privKeyPath, "utf8");
    // var decrypted = crypto.privateDecrypt(privateKey, new Buffer("RzlVVlJmY2VqQ1dzdDNNMFc2WjIvcHQ3dVRHallUakprNVpFenIrOXBSVWhpdWJjRU5sQ282L1EwS3BPNVYwc1lvbDBrYithQUhjSE8vNS96eXg2L1htL0pnTG5CVXRhMnhkL0J6eTJmQjFZOXcrcFVVeVJCMXhxLytkWGxWZTkySm5rUEY4a09PREdmKy9CdFBSRUVKS2tLbFNVUGtleGlRdGpwYVF4V3dDL3RPbDhtNm9WK1pWRm5ic05wV3pQdFVHZWVaajVYY2g4ZGZWcGxucWNibFp4YnRGeDdmK1RiVWpna25KUFF5Z1FWNmpUUk1qUWpmbHdSSDJCdGlzTEc3MUplUVkvdnRsbVlUMUVtRGJLTkZDd3MyNVcrUlNndDJkelU5QzRWTTVlZjVVc1VwL2pteHhNdVhqbWQxM0VneCtpcXg0U0lnc05BaXZVd3ZQNTlBPT0="));
    // return decrypted.toString("utf8");

    // The value of encryption key is itself encrypted RSA 2048
     crypto2.readPrivateKey('./privkey.pem', (errReadPrivateKey, privateKey) => {
         crypto2.decrypt.rsa(item.encryptionKey, privateKey, (errDecrypt, decrypted) => {

             let buf = new Buffer(decrypted)
             //encrypt();
             let ed = new Buffer(item.encryptedData, 'base64');

             crypto2.decrypt.aes256cbc( item.hash , ed.toString('utf8') ,(err, decryptedText) => {
                 console.log(err.message);
                 console.log(decryptedText);
             });



            //let key = new Buffer(decrypted);
            //console.log(decrypt(key, 'a2xhcgAAAAAAAAAA', item.encryptionKey));
            //
            // let hex =  Buffer.from(decrypted).toString('hex');
            // console.log(hex);
            //
            // iv = 'a2xhcgAAAAAAAAAA',
            // let a = decrypt(hex, iv, decrypted);
            //
            //     console.log(a);
            //     console.log(err);
            //     //console.log(decryptedText);



        });
      });


}

let decrtyptData = (item) => {

    // decrypting they key
    //let base64decryptedKey = new Buffer(item.encryptionKey)
    //let testing = new Buffer();
    decryptWithPrivateKey(item);

// decipher = crypto.createDecipher('aes-256-cbc', item.);
// decipher.update(item.hash, 'base64', 'utf8');
//
// var decryptedPassword = decipher.final('utf8');

    return {};
}




const errorHandler = (err) => {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 400;
    console.error(err.message);
    res.send({error: err.message});
}

app.get('/documents', (req, res, next) => {
    db.collection('documents').find({}).project(documentFields).sort({createdTime: -1}).toArray((err, docs) => {

        if (err != null) {
            return errorHandler(err);
        }

        docs.forEach((item) => {
            item.data = decrtyptData(item)
        })

        res.setHeader('Content-Type', 'application/json');
        res.send(docs);
    });
});

app.get('/documents/:documentID', (req, res, next) => {
    db.collection('documents').findOne({
        id: req.params.documentID
    } , {fields: documentFields}, (err, doc) => {

        if (err != null) {
            return errorHandler(err);
        }

        res.setHeader('Content-Type', 'application/json');
        res.send(doc);

    });
});

app.get('/accounts/:accountID', (req, res, next) => {
    db.collection('accounts').findOne({
        id: req.params.accountID
    }, {fields: accountFields}, (err, account) => {

        if (err != null) {
            return errorHandler(err);
        }

        res.setHeader('Content-Type', 'application/json');
        res.send(account);
    });
});

app.get('/accounts/:accountID/documents', (req, res, next) => {
    db.collection('documents').find({uploadedBy: req.params.accountID}).project(documentFields).toArray((err, docs) => {

        if (err != null) {
            return errorHandler(err);
        }

        res.setHeader('Content-Type', 'application/json');
        res.send(docs);
    });
});

app.listen(port, function() {
    console.log('Server started on port ' + port);
});
