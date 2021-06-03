const MongoClient = require('mongodb').MongoClient;

const options = {
  useUnifiedTopology: true,
};

let db;

async function init() {
  return MongoClient.connect('mongodb://127.0.0.1:27017', options)
    .catch(err => console.error(err.stack))
    .then(database => {
      db = database.db('test');
    });
}

function getConnection() {
  return db;
}

module.exports = {
  init,
  getConnection,
};