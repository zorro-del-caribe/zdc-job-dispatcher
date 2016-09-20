const app = require('./app')();
const logger = require('./lib/logger');

app.start()
  .catch(function (err) {
    logger.error(err);
    process.exit(1);
  });