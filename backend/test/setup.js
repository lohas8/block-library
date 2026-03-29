const EggApplication = require('egg').Application;

class TestApp extends EggApplication {
  constructor(options) {
    super(options);
    this.lifecycle.startTime = Date.now();
  }
}

module.exports = TestApp;
