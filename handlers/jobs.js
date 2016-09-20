exports.sendMail = {
  description: 'create a job to send a mail',
  method: 'post',
  path: '/mails',
  schema: {
    type: 'object',
    properties: {
      template: {type: 'string'},
      payload: {
        type: 'object'
      },
      recipient: {type: 'string', format: 'email'}
    },
    required: ['template', 'recipient']
  },
  handler: function * (next) {
    const {publisher} = this.app.context;
    const jobBuffer = Buffer.from(JSON.stringify(this.request.body));
    publisher.sendToQueue('sendEmail', jobBuffer, {persistent: false});
    this.status = 202;
  }
};

exports.indexClassifed = {
  description: 'index a new classified',
  method: 'post',
  path: '/classifieds/index',
  schema: {
    type: 'object',
    properties: {
      id: {type: ['integer', 'string']},
      title: {type: 'string'},
      content: {type: 'string'},
      tags: {
        type: 'array',
        items: {type: 'string'}
      },
      price: {type: 'number'},
      createdAt: {type: 'string'},
      updatedAt: {type: 'string'},
    },
    required: ['title', 'content']
  },
  handler: function * () {
    const {publisher} = this.app.context;
    const {body:classified}=this.request;
    const jobBuffer = Buffer.from(JSON.stringify(classified));
    publisher.sendToQueue('indexClassified', jobBuffer, {persistent: false});
    this.status = 202;
  }
};