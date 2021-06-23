const Agenda = require('agenda');
const Mongoose = require('mongoose');
const flowServices = require('./flow/services/flow');
const FlowExecuted = require('./flow/models/flow-executed');
const Flow = require('./flow/models/flow');

// const db = require('./db');

async function run() {
  const agenda = new Agenda()
    .mongo(Mongoose.connection, 'jobs');
    // .processEvery('one minute');

  // `job` is an object representing the job that `producer.js` scheduled.
  // `job.attrs` contains the raw document that's stored in MongoDB, so
  // `job.attrs.data` is how you get the `data` that `producer.js` passes
  // to `schedule()`
  agenda.define('print', job => {
    console.log(job.attrs.data);
  });
  agenda.define('oc:on-ticker', async job => {
    const { flowRunningId, flowId, stateId, dataContext } = job.attrs.data;
    console.log('delay', 'exited');
    const flowExecuted = await FlowExecuted.get(flowRunningId);
    const flow = await Flow.get(flowId);

    flowServices.resume(flowExecuted, flow, {
      ...dataContext,
      eventName: 'oc:on-ticker-resolved',
      stateId,
      code: 'SUCCESS',
    });
  })

  await new Promise(resolve => agenda.once('ready', resolve));

  agenda.start();
}

module.exports = {
  run,
};
