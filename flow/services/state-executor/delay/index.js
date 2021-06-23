const dayjs = require('dayjs');
const schedulerProducer = require('../../../../producer');

async function onEnter(state, flow, flowRunning) {
  console.log('delay', 'entered');
  await schedulerProducer.run(dayjs().add(5, 'second'), 'oc:on-ticker', {
    dataContext: { hihi: 'hehe' },
    flowRunningId: flowRunning._id,
    flowId: flow._id,
    stateId: state._id,
  });
  return {
    code: [
      { name: 'WAITED', eventName: 'oc:on-ticker-resolved', stateId: state._id },
    ],
  };
}

async function onLeave() {
  
}

module.exports = {
  onEnter,
  onLeave,
};
