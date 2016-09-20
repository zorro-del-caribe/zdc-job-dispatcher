const logMiddleware = require('../middlewares/logger');
const logger = require('../lib/logger');
const bodyParser = require('koa-bodyparser');
const gzip = require('koa-compress');


module.exports = {
  priority: 200,
  init: function (app, handlers) {
    return app
      .use(gzip())
      .use(logMiddleware({logger}))
      .use(bodyParser());
  }
};