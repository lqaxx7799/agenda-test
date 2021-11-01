const axios = require('axios');

const appId = '602f390695a28901361b1f62';
const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MDJmMzkwNjk1YTI4OTAxMzYxYjFmNjAiLCJyb2xlIjoidXNlciIsImlhdCI6MTYzNTc2MTM5MCwiZXhwIjoxOTUxMTIxMzkwfQ.C74gE1S6pPa9ZCMeNsze0wyMqdT24q8iEQSb89LjfP4';
const LIMIT_TRIES = 20;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let tries = 0;

async function resolveConv() {
  return axios({
    method: 'get',
    url: `https://api-internal.oncustomer.asia/livechat/conversations?groupId=all&status=open&sort=oldest&appId=${appId}`,
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
  })
    .then((res) => res.data)
    .then((conversations) => {
      if (conversations.length) {
        const conversationIds = conversations.map(x => x._id);
        return axios({
          method: 'put',
          url: `https://api-internal.oncustomer.asia/livechat/conversation/resolve?appId=${appId}`,
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json',
          },
          data: {
            conversationIds,
          },
        })
          .then(async () => {
            tries += 1;
            if (tries >= LIMIT_TRIES) {
              return Promise.resolve();
            }
            await sleep(1000);
            console.log('done');
            return resolveConv();
          })
          .catch(console.log);
      }
    })
    .catch(console.log);
}

resolveConv();
// axios({
//   method: 'put',
//   url: `https://api-internal.oncustomer.asia/livechat/conversation/resolve?appId=${appId}`,
//   headers: {
//     'Authorization': token,
//     'Content-Type': 'application/json',
//   },
//   data: {
//     conversationIds,
//   },
// })
//   .then(() => {
//     console.log('done');
//   })
//   .catch(console.log);