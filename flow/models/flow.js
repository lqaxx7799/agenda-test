const mongoose = require('mongoose');
const { FLOW_STATUS } = require('../utils/constant');

const Schema = mongoose.Schema;

const stateSchema = new Schema({
  rawId: String,
  name: String,

  context: Schema.Types.Mixed,
  privateContext: Schema.Types.Mixed,

  exitConditions: Schema.Types.Mixed,
  transitions: {
    type: Map,
    of: String,
  },
});
const flowSchema = new Schema({
  appId: String,
  listeningEvents: Array,
  status: {
    type: String,
    default: FLOW_STATUS.INIT,
  },
  state: [stateSchema],
  deleted: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
});
const Flow = mongoose.model('flow', flowSchema);

async function getByApp(appId) {
  return Flow.find({ appId, deleted: false });
}

async function get(id) {
  return Flow.findById(id).lean();
}

module.exports = {
  get,
  getByApp,
};
