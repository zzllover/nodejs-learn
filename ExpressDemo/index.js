const fs = require("fs");
const express = require('express');
const game = require('../common/game')

let playerWinCounter = 0;
let playerLastAction;
let sameCount = 0;

const app = express();

app.get('/favicon.ico', function (request, response) {
  response.status(200);
  return;
});

app.get('/game',
  function (request, response, next ) {

    // 利用洋葱模型分解功能模块, 中间件逻辑
    if (playerWinCounter >= 3 || sameCount == 9) {
      response.status(500);
      response.send("我再也不和你玩了！");
      return;
    }

    next(); //进入下一层

    if (response.playerWon) {
      playerWinCounter++
    }
  },

  function (request, response,next) {
    const query = request.query;
    const playerAction = query.action;

    if (!playerAction) {
      // 处理请求错误
      response.status(400);
      response.send();
      return;
    }
    if (playerLastAction && playerAction == playerLastAction) {
      sameCount++;
      if (sameCount >= 3) {
        response.status(400);
        response.send("你作弊！");
        sameCount = 9;
        return;
      }
    } else {
      sameCount = 0;
    }
    playerLastAction = playerAction;
    response.playerAction = playerAction;
    next();
  },

  function (request, response) {
    const playerAction = response.playerAction;
    const result = game(playerAction);
    response.status(200);
    if (result === 0) {
      response.send("平局");
    } else if (result === 1) {
      response.send("你赢了");
      response.playerWon = true;
    } else {
      response.send("你输了");
    }
  }

);

app.get('/', function (request, response) {
  response.send(
    fs.readFileSync(__dirname + '/common/index.html', 'utf-8')
  )
});

app.listen(3000);


