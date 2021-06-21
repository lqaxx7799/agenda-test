const fs = require('fs');
/*
 * initializes all models and sources them as .model-name
 */
fs.readdirSync(__dirname).forEach((file) => {
  if (file === 'index.js') {
    return;
  }
  const moduleName = file.split('.')[0];
  // eslint-disable-next-line
  exports[moduleName] = require(`./${moduleName}`);
});
