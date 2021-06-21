const _ = require('lodash');

module.exports = {
  getInitialStates,
  getCurrentState,
};

function getCurrentState(flowRunning, flow) {
  const stateIds = _.isEmpty(flowRunning.currentStates) ? flowRunning.initialStates : flowRunning.currentStates;
  return _.filter(flow.state, state => _.includes(stateIds, state._id));
}

function getInitialStates(flowRunning) {
  const stateIds = flowRunning.initialStates;
  return _.filter(flowRunning.state, state => _.includes(stateIds, state._id));
}
