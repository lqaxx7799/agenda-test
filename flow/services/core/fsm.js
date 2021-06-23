const fp = require('lodash/fp');
const _ = require('lodash');
const stateExecutors = require('../state-executor');

async function transition(state, flow, flowRunning) {
  if (state.name === 'final') {
    console.log('final state reached');
    return {
      enterResult: null,
      nextStateIds: [],
    };
  }

  const stateExecutor = stateExecutors[state.name];
  if (!stateExecutor || typeof stateExecutor.onEnter !== 'function') {
    console.log('state executor not found');
    return null;
  }
  
  const enterResult = await stateExecutor.onEnter(state, flow, flowRunning);

  const nextTransitions = _.map(_.get(enterResult, 'code', []), item => item.name).filter(item => item !== 'WAITED');

  const nextStateIds = _(_.get(state, 'transitions'))
    .filter(transition => nextTransitions.includes(transition.name))
    .map(transition => transition._id)
    .value();

  const waitedStates = _(_.get(enterResult, 'code', []))
    .filter(item => item.name === 'WAITED')
    .map(item => ({
      eventName: item.eventName,
      stateId: state._id,
    }))
    .value();
  
  // const nextStateResults = _(nextStateIds)
  //   .map(nextStateId => {
  //     const nextState = _.find(_.get(flow, 'state'), item => item._id === nextStateId);
  //     const nextStateExecutor = stateExecutors[nextState.name];
  //     if (!nextStateExecutor) {
  //       console.log('state executor not found');
  //       return null;
  //     }
  //     const nextStateResult = await nextStateExecutor.onEnter();
  //     return {
  //       nextStateId,
  //       nextStateResult,
  //     };
  //   })
  //   .filter(item => !item)
  //   .value();

  return {
    enterResult,
    nextStateIds,
    waitedStates,
  };
}

async function resume(code, state) {
  const nextStateIds = _(_.get(state, 'transitions'))
    .filter(transition => transition.name === code)
    .map(transition => transition._id)
    .value();

  return {
    nextStateIds,
  };
}

module.exports = {
  transition,
  resume,
};
