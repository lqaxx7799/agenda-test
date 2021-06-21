const _ = require('lodash');
const mongoose = require('mongoose');
const { FLOW_STATUS } = require('../utils/constant');

const Schema = mongoose.Schema;

const flowExecutedSchema = new Schema({
  appId: String,
  visitorId: String,
  flowId: String,
  status: {
    type: String,
    default: FLOW_STATUS.INIT,
  },
  context: Schema.Types.Mixed, // Context of current running flow
  currentStates: [String],
  listeningEvents: [String],
  type: String,
  deleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});
const FlowExecuted = mongoose.model('flow_executed', flowExecutedSchema);

async function getStatusFlowByExecuted(appId, visitorId) {
  return FlowExecuted.find({ appId, visitorId });
}

async function upsert(data = {}) {
  if (!data._id) {
    data._id = new mongoose.mongo.ObjectID();
  }

  return FlowExecuted.findOneAndUpdate({
    _id: data._id,
  }, _.omit(data, ['_id']), {
    new: true,
    upsert: true,
  });
}
async function add(data) {
  return FlowExecuted.create(data);
}

async function remove(id) {
  return FlowExecuted.update({
    _id: id,
    deleted: true,
  });
}

async function update(filter, updates) {
  return FlowExecuted.update(filter, updates);
}

module.exports = {
  upsert,
  getStatusFlowByExecuted,

  add,
  update,
  remove,
};
