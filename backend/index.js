/* eslint-disable */
exports.start = async options => {
  const egg = require('egg');
  const application = egg(options);
  await application.start();
  return application;
};
