async function onEnter() {
  console.log('sendEmail', 'entered');
  await _sleep(2000);

  return {
    code: [
      { name: 'SUCCESS' },
    ],
  };
}

async function onLeave() {
  console.log('sendEmail', 'left');
}

async function _sleep(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms);
  });
}

module.exports = {
  onEnter,
  onLeave,
};
