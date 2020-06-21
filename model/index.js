const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
 
// Connection URL
const url = 'mongodb://localhost:27017';
 
// Database Name
const dbName = 'web_nav';
 
// Use connect method to connect to the server
function connect(callback){
    MongoClient.connect(url, function(err, client) {
        if(err) return console.log("Connected successfully to server");
              
        const db = client.db(dbName);
       
        callback && callback(db)
        client.close();
      });
}

module.exports = {
connect
}
