const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);

    this.tmpBuffer = Buffer.from([]);
  }

  static splitChunk(chunk) {
    return chunk.toString().split(os.EOL).map(Buffer.from);
  }

  _transform(chunk, encoding, callback) {
    if (chunk.includes(os.EOL)) {
      const splittedChunk = LineSplitStream.splitChunk(chunk);

      splittedChunk[0] = Buffer.concat([this.tmpBuffer, splittedChunk[0]]);

      this.tmpBuffer = splittedChunk[splittedChunk.length - 1];

      splittedChunk
          .splice(0, splittedChunk.length - 1)
          .forEach((data) => this.push(data));
    } else {
      this.tmpBuffer = Buffer.concat([this.tmpBuffer, chunk]);
    }

    callback();
  }

  _flush(callback) {
    if (this.tmpBuffer.length > 0) {
      this.push(this.tmpBuffer);
    }

    callback();
  }
}

module.exports = LineSplitStream;
