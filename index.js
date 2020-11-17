const http = require("http");
const url = require("url");
const fs = require("fs");
const game = require("./common/game");

let playerWon = 0;
let playerLastAction;
let sameCount = 0;

http
  .createServer(function (request, response) {
    const parseUrl = url.parse(request.url, true);
    if (parseUrl.pathname === "/favicon.ico") {
      response.writeHead(200);
      response.end();
      return;
    }

    if (parseUrl.pathname === "/game") {
      const query = parseUrl.query;
      const action = query.action;
      const res = game(action);

      if (playerWon >= 3 || sameCount == 9) {
        response.writeHead(500);
        response.end("我再也不和你玩了！");
        return;
      }

      // 当玩家操作与上次相同，则连续相同操作统计次数+1，否则统计清零
      // 当玩家操作连续三次相同，则视为玩家作弊，把sameCount置为9代表有过作弊行为
      if (playerLastAction && action == playerLastAction) {
        sameCount++;
      } else {
        sameCount = 0;
      }
      playerLastAction = action;

      if (sameCount >= 3) {
        response.writeHead(400);
        response.end("你作弊！");
        sameCount = 9;
        return;
      }

      response.writeHead(200);
      if (res === 0) {
        response.end("平局");
      } else if (res === 1) {
        playerWon++;
        response.end("你赢了");
      } else {
        response.end("你输了");
      }
    }

    if (parseUrl.pathname === "/") {
      // 流
      fs.createReadStream(__dirname + "/common/index.html").pipe(response);
    }
  })
  .listen(3000);
console.log("服务启动ing...");
