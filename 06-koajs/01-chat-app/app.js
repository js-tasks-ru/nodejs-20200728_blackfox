const path = require('path');
const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

let clients = [];

router.get('/subscribe', async (ctx, next) => {
  const {req, res} = ctx;

  clients.push(res);

  await new Promise((resolve) => {
    req.on('end', resolve);
  });
});

router.post('/publish', async (ctx, next) => {
  const {message} = ctx.request.body;

  if (!message) {
    return next();
  }

  clients.forEach((res) => {
    res.statusCode = 200;
    res.end(message);
  });

  clients = [];

  ctx.res.statusCode = 200;
});

app.use(router.routes());

module.exports = app;
