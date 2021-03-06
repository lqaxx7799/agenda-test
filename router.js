const dayjs = require('dayjs');
const Router = require('express').Router();
const producer = require('./producer');
const flowServices = require('./flow/services/flow');

Router.post('/schedule', (req, res) => {
  const { type, period, eventName, eventData } = req.body;
  let scheduledAt;
  if (type === 'absolute') {
    scheduledAt = dayjs(period).toDate();
  } else if (type === 'relative') {
    scheduledAt = dayjs().add(period.value, period.unit);
  }

  producer.run(scheduledAt, eventName, eventData);
  res.json({ success: true });
});

Router.delete('/schedule/:id', (req, res) => {
  const { id } = req.params;
  producer.cancel(id);
  res.json({ success: true });
});

Router.post('/flow/start', (req, res) => {
  const { dataContext, context } = req.body;
  flowServices.start(dataContext, context);
  res.json({ success: true });
});

module.exports = Router;