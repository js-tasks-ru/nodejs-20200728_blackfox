const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  req.on('aborted', () => {
    fs.unlink(filepath, (err) => {
      if (!err) {
        // console.log(`file successfully ${filepath} removed`);
      }
    });
  });

  switch (req.method) {
    case 'POST':
      if (pathname.split('/').length > 1) {
        res.statusCode = 400;
        return res.end('Subdirectories are not supported');
      }

      fs.stat(filepath, (error) => {
        if (!error) {
          res.statusCode = 409;
          return res.end(`File ${pathname} already exists`);
        }

        const limitStream = new LimitSizeStream({limit: 1048576});
        const outStream = fs.createWriteStream(filepath);

        outStream.on('error', () => {
          res.statusCode = 500;
          res.end('Internal server error!');
        });

        limitStream
            .on('error', () => {
              res.statusCode = 413;
              res.end('File is too big');
              fs.unlink(filepath, (err) => {
                if (!err) {
                  // console.log(`File successfully ${filepath} removed`);
                }
              });
            })
            .pipe(outStream);

        req.on('data', (chunk) => {
          limitStream.write(chunk);
        });

        req.on('end', () => {
          res.statusCode = 201;
          res.end(`File ${pathname} successfully created`);
        });
      });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
