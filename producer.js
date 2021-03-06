const Agenda = require('agenda');
// const db = require('./db');
const ObjectId = require('mongodb').ObjectId;
const Mongoose = require('mongoose');

async function run(scheduledAt, eventName, eventData) {
  const agenda = new Agenda()
    .mongo(Mongoose.connection, 'jobs')
    .processEvery('one minute');

  // Wait for agenda to connect. Should never fail since connection failures
  // should happen in the `await MongoClient.connect()` call.
  await new Promise(resolve => agenda.once('ready', resolve));

  // The third parameter to `schedule()` is an object that can contain
  // arbitrary data. This data will be stored in the `data` property
  // in the document in mongodb
  agenda.schedule(scheduledAt, eventName, eventData);
}

async function cancel(id) {
  const agenda = new Agenda().mongo(Mongoose.connection, 'jobs');

  // Wait for agenda to connect. Should never fail since connection failures
  // should happen in the `await MongoClient.connect()` call.
  await new Promise(resolve => agenda.once('ready', resolve));

  // The third parameter to `schedule()` is an object that can contain
  // arbitrary data. This data will be stored in the `data` property
  // in the document in mongodb
  agenda.cancel({ _id: Mongoose.Types.ObjectId(id) });
}

module.exports = {
  run,
  cancel,
};