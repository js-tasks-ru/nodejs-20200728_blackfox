const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'DELETE':
      if (pathname.split('/').length > 1) {
        res.statusCode = 400;
        return res.end('Subdirectories are not supported');
      }

      fs.stat(filepath, (err) => {
        if (err) {
          res.statusCode = 404;
          return res.end('File not found');
        }

        fs.unlink(filepath, (err) => {
          if (err) {
            res.statusCode = 500;
            return res.end('Internal server error');
          }

          res.statusCode = 200;
          res.end('File successfully removed');
        });
      });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
