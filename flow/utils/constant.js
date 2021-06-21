const FLOW_STATUS = {
  INIT: 'init',
  IN_PROGRESS: 'inprogress',
  EXITED: 'exited',
  DISENGAGED: 'disengaged',
  FINISHED: 'finished',
};

const STATE_TYPES = {
  CHECK_CONDITION: 'checkCondition',
  TAG: 'tag',
  SEND_CHAT: 'sendChat',
  SEND_SMS: 'sendSMS',
  SEND_EMAIL: 'sendEmail',
  FINAL: 'final',
};

module.exports = {
  STATE_TYPES,
  FLOW_STATUS
}