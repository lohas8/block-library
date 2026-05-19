/* eslint-disable */
module.exports = app => {
  app.beforeStart(async () => {
    app.logger.info('Application starting, MongoDB configured');
  });
};
