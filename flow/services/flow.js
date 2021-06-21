
const _ = require('lodash');
const { FLOW_STATUS } = require('../utils/constant');
const machine = require('./core/machine');
const fsmUtils = require('./core/fsm');
const stateExecutor = require('./state-executor');
const flowExecutor = require('./flow-executed');
const Flow = require('../models/flow');
const FlowExecuted = require('../models/flow-executed');

async function start(dataContext = {}, context = {}) {
  const { visitorId, flowId, appId } = dataContext;
  const flow = await Flow.get(flowId);

  if (_.isEmpty(flow)) {
    console.log('SM_FLOW_NOT_FOUND', { flowId, appId });
    // hapiLogger.log('info', 'SM_FLOW_NOT_FOUND', { flowId, appId });
    return;
  }
  if (!flow.active) {
    console.log('SM_FLOW_NOT_ACTIVE', { flowId, appId });
    // hapiLogger.log('info', 'SM_FLOW_NOT_ACTIVE', { flowId, appId });
    return;
  }
  const flowExecuted = await flowExecutor.startFlow({
    appId, visitorId, flowId,
  }, context);
  // Check transition first time
  const transitionResult = await transition(flowExecuted, flow, dataContext, context);
  console.log(transitionResult);
}

async function transition(flowExecuted, flow, dataContext = {}, context = {}) {
  const currentStates = machine.getCurrentState(flowExecuted, flow);
  if (_.isEmpty(currentStates)) {
    // hapiLogger.log('info', 'SM_TRANSITION no_current_state');
    console.log('SM_TRANSITION no_current_state');
    return;
  }
  // hapiLogger.log('info', 'SM_TRANSITION continue');
  console.log('SM_TRANSITION continue');

  _.map(currentStates, async (state) => {
    const executor = stateExecutor[state.name];
    if (!executor) {
      console.log('SM_TRANSITION no_executor', { state });
      // hapiLogger.log('info', 'SM_TRANSITION no_executor', { state });
      return;
    }
    await _transition(_.assign({}, dataContext, {
      flowExecuted,
      flow,
      state,
    }), context);
  });
}

async function _transition(dataContext = {}, context = {}) {
  const { state, flow, flowExecuted: previousFlowExecuted } = dataContext;

  const { enterResult, nextStateIds } = await fsmUtils.transition(state, flow);
  
  const updatedStatus = _.isEmpty(nextStateIds) ? FLOW_STATUS.FINISHED : FLOW_STATUS.IN_PROGRESS;

  const updatedCurrentStates = _(_.get(previousFlowExecuted, 'currentStates'))
    .reject(stateId => stateId === state._id)
    .concat(nextStateIds)
    .value();

  await FlowExecuted.update({
    _id: previousFlowExecuted._id,
  }, {
    currentStates: updatedCurrentStates,
    status: updatedStatus,
  });

  _.forEach(nextStateIds, stateId => {
    const state = _.find(_.get(flow, 'state'), state => state._id === stateId);
    _transition({
      ...dataContext,
      state,
    }, context);
  });
}

module.exports = {
  start,
  transition,
};
