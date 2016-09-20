const test = require('tape');
const app = require('../app');
const req = require('supertest');

function mockPublisherChannel () {
  let queue = null;
  let buffer = null;

  function once (fn) {
    let called = false;
    return function () {
      if (called)
        throw new Error('function has already been called');

      return fn(...arguments);
    }
  }

  return Object.create({
    sendToQueue(queue, jobBuffer){
      this.queue = queue;
      this.buffer = jobBuffer;
    }
  }, {
    queue: {
      get(){
        return queue
      },
      set: once(function (val) {
        queue = val;
      })
    },
    buffer: {
      get(){
        return buffer.toString()
      },
      set: once(function (val) {
        buffer = val;
      })
    }
  });
}

test('accept a send email job', t=> {
  app
    .start()
    .then(function () {
      app.context.publisher = mockPublisherChannel();
      req(app.server)
        .post('/jobs/mails')
        .send({template: 'welcome', payload: {user: 'Raymond'}, recipient: 'foo@bar.com'})
        .expect(202)
        .end(function (err, res) {
          t.error(err);
          t.equal(app.context.publisher.queue, 'sendMail');
          t.deepEqual(JSON.parse(app.context.publisher.buffer), {
            template: 'welcome',
            payload: {user: 'Raymond'},
            recipient: 'foo@bar.com'
          });
          app.stop();
          t.end();
        });
    })
    .catch(t.end);
});

test('accept a index classified job', t=> {
  app
    .start()
    .then(function () {
      app.context.publisher = mockPublisherChannel();
      const expectedBody = {id: 1234, title: 'foo', content: 'super foo'};
      req(app.server)
        .post('/jobs/classifieds/index')
        .send(expectedBody)
        .expect(202)
        .end(function (err, res) {
          t.error(err);
          t.equal(app.context.publisher.queue, 'indexClassified');
          t.deepEqual(JSON.parse(app.context.publisher.buffer), expectedBody);
          app.stop();
          t.end();
        });
    })
    .catch(t.end);
});