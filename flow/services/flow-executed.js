const _ = require('lodash');
const { v4: uuidv4 } = require('uuid');
const FlowExecuted = require('../models/flow-executed');
const Flow = require('../models/flow');

async function startFlow(dataContext = {}, context = {}) {
  const flow = dataContext.flow || await Flow.get(dataContext.flowId);
  if (_.isEmpty(flow)) {
    return;
  }
  const flowExecuted = await FlowExecuted.add({
    appId: dataContext.appId,
    flowId: dataContext.flowId,
    visitorId: dataContext.visitorId,
    currentStates: flow.initialStates,
    listeningEvents: flow.listeningEvents,
    context: {
      variable: context.variable,
      // flowContext: flow.context,
      // privateContext: flow.privateContext,
    },
  });
  return flowExecuted;
}

module.exports = {
  startFlow,
};
