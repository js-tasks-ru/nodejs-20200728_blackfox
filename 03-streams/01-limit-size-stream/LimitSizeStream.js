const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options = {}) {
    super(options);

    this.limit = options.limit || 0;
    this.transferredDataLength = 0;
  }

  _transform(chunk, encoding, callback) {
    const error = this.checkTransferredDataLength(chunk);

    callback(error, chunk);
  }

  checkTransferredDataLength(chunk) {
    if (this.limit === 0) {
      return null;
    }

    this.transferredDataLength += chunk.length;

    if (this.transferredDataLength >= this.limit) {
      return new LimitExceededError();
    }

    return null;
  }
}

module.exports = LimitSizeStream;
