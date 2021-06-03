const express = require('express');
const router = require('./router');
const db = require('./db');
const consumer = require('./consumer');

const app = express();

function init() {
  app.listen(5000, () => {
    console.log('Listening at 5000');

    consumer.run().catch(error => {
      console.error(error);
      process.exit(-1);
    });
  });
}

app.use(express.json());

app.use('/', router);

// Initialize connection once
db.init().then(init);