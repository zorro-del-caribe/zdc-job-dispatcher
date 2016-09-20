const url = require('url');
const amqp = require('amqplib');
const debug = require('debug')('zdc-broker');
module.exports = {
  priority: 100,
  init(app, handlers){

    const {conf} = app.context;
    const rabbit = conf.value('broker');
    const urlString = url.format(rabbit);

    if (process.env.NODE_ENV !== 'test') {
      return amqp.connect(urlString)
        .then(function (conn) {
          return Promise.all([conn.createChannel(), conn.createChannel()]);
        })
        .then(function ([publisher,loggingConsumer]) {
          //creating queues
          publisher.assertQueue('sendEmail', {durable: false});
          publisher.assertQueue('indexClassified', {durable: false});

          app.context.publisher = publisher;

          //logging consumer
          loggingConsumer.consume('sendEmail', function (msg) {
            if (msg && msg.content) {
              msg.content = msg.content.toString();
            }
            debug(msg);
            loggingConsumer.ack(msg);
          });

          loggingConsumer.consume('indexClassified', function (msg) {
            if (msg && msg.content) {
              msg.content = msg.content.toString();
            }
            debug(msg);
            loggingConsumer.ack(msg);
          });


        });
    }
  }
};