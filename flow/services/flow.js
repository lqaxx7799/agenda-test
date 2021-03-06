
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

  const { enterResult, nextStateIds, waitedStates } = await fsmUtils.transition(state, flow, previousFlowExecuted);
  
  const updatedStatus =
    _.isEmpty(nextStateIds) && _.isEmpty(waitedStates)
      ? FLOW_STATUS.FINISHED
      : FLOW_STATUS.IN_PROGRESS;

  const updatedCurrentStates = _(_.get(previousFlowExecuted, 'currentStates'))
    .reject(stateId => stateId === state._id)
    .concat(nextStateIds, _.map(waitedStates, item => item.stateId))
    .value();

  await FlowExecuted.update({
    _id: previousFlowExecuted._id,
  }, {
    currentStates: updatedCurrentStates,
    status: updatedStatus,
    waitedStates,
  });
  const updatedFlowExecuted = await FlowExecuted.get(previousFlowExecuted._id);

  _.forEach(nextStateIds, stateId => {
    const state = _.find(_.get(flow, 'state'), state => state._id === stateId);
    return _transition({
      ...dataContext,
      state,
      flowExecuted: updatedFlowExecuted,
    }, context);
  });
}


// dataContext.eventName
// dataContext.stateId
async function resume(flowRunning, flow, dataContext) {
  const { waitedStates } = flowRunning;
  const { stateId, eventName, code } = dataContext;
  const state = _.find(flow.state, item => item._id === stateId);

  console.log(11111111, state);

  if (_.find(waitedStates, item => item.eventName === eventName && item.stateId === stateId)) {
    const { nextStateIds } = await fsmUtils.resume(code, state);

    const updatedCurrentStates = _(_.get(flowRunning, 'currentStates'))
      .reject(id => id === stateId)
      .concat(nextStateIds)
      .value();

    await FlowExecuted.update({
      _id: flowRunning._id,
    }, {
      currentStates: updatedCurrentStates,
      waitedStates: _.reject(waitedStates, item => item.stateId === stateId),
    });

    const updatedFlowExecuted = await FlowExecuted.get(flowRunning._id);
    _.forEach(nextStateIds, stateId => {
      const state = _.find(_.get(flow, 'state'), state => state._id === stateId);
      _transition({
        // ...dataContext,
        flow,
        state,
        flowExecuted: updatedFlowExecuted,
      }, dataContext);
    });
  }
}

// const _transition = trampoline(async function (dataContext = {}, context = {}) {
//   const { state, flow, flowExecuted: previousFlowExecuted } = dataContext;

//   const { enterResult, nextStateIds } = await fsmUtils.transition(state, flow);
  
//   const updatedStatus = _.isEmpty(nextStateIds) ? FLOW_STATUS.FINISHED : FLOW_STATUS.IN_PROGRESS;

//   const updatedCurrentStates = _(_.get(previousFlowExecuted, 'currentStates'))
//     .reject(stateId => stateId === state._id)
//     .concat(nextStateIds)
//     .value();

//   await FlowExecuted.update({
//     _id: previousFlowExecuted._id,
//   }, {
//     currentStates: updatedCurrentStates,
//     status: updatedStatus,
//   });

//   _.forEach(nextStateIds, stateId => {
//     const state = _.find(_.get(flow, 'state'), state => state._id === stateId);
//     return _transition({
//       ...dataContext,
//       state,
//     }, context);
//   });
// })

// function trampoline(f) {
//   return function trampolined(...args) {
//     let result = f.bind(null, ...args);

//     while (typeof result === 'function') result = result();

//     return result;
//   };
// }

module.exports = {
  start,
  transition,
  resume,
};
