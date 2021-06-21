const Agenda = require('agenda');
const Mongoose = require('mongoose');
// const db = require('./db');

async function run() {
  const agenda = new Agenda()
    .mongo(Mongoose.connection, 'jobs')
    .processEvery('one minute');

  // `job` is an object representing the job that `producer.js` scheduled.
  // `job.attrs` contains the raw document that's stored in MongoDB, so
  // `job.attrs.data` is how you get the `data` that `producer.js` passes
  // to `schedule()`
  agenda.define('print', job => {
    console.log(job.attrs.data);
  });

  await new Promise(resolve => agenda.once('ready', resolve));

  agenda.start();
}

module.exports = {
  run,
};
