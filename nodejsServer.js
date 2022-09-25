// 实现一个websocket服务器
// 用于接收客户端的消息，并将消息广播给所有客户端
// 需要定时向客户端发送心跳包，以保持连接

const { time } = require('console');

// 引入模块
var WebSocketServer = require('ws').Server;
// 创建一个websocket服务器
var wss = new WebSocketServer({port: 9099});
// 保存所有客户端
var clients = [];
// 监听connection事件
wss.on('connection', function(ws) {
    // 将客户端添加到clients数组中
    // clients.push(ws);
    // 利用uuid 保存客户端的唯一标识
    let uuid = require('uuid').v4();
    let client = new Map();
    // client.set('lasttime', new Date().toLocaleString());
    client.set('ws', ws);
    client.set('uuid', uuid);
    clients.push(client);
    // 监听客户端消息
    ws.on('message', function(message) {
        // 将消息回复给当前客户端
        // ws.send(message);
        // 处理 ping 消息
        msgObj = JSON.parse(message);
        if (msgObj.type == 'ping') {
            ws.send(JSON.stringify({'pong': new Date().toLocaleString()}));
            // client.lasttime = new Date().toLocaleString();
            for (var i = 0; i < clients.length; i++) {
                if (clients[i].get('uuid') == uuid) {
                    clients[i].set('lasttime', new Date().toLocaleString());
                }
            }
            console.log(`${uuid} ping at :`, new Date().toLocaleString());
        }
        
    });
    
    // 监听客户端关闭事件
    ws.on('close', function() {
        // 关闭定时器
        console.log('client closed');
    });
    // 监听客户端错误事件
    ws.on('error', function(error) {
        // 关闭定时器
        console.log('client closed on error');
        console.log(error);
    });
});

// 定时查看clients数组中的客户端状态
setInterval(function() {
    for (var i = 0; i < clients.length; i++) {
        // lasttime 距离现在超过  10 sec 断开链接
        let lastPingTime = clients[i].get('lasttime')
        if (!lastPingTime) {
            continue;
        }
        let lasttime = new Date(lastPingTime);
        
        let now = new Date();
        let diff = now - lasttime;
        if (diff > 30000) {
            // 超过1分钟，断开链接
            clients[i].get('ws').close();
            clients.splice(i, 1);
            console.log('client ping timeout, close', lastPingTime);
            // 关闭连接
        } else {
            // 发送心跳包
            clients[i].get('ws').send(JSON.stringify({'ping': new Date().toLocaleString()}));
            console.log('send ping to client');
        }
    }
}, 3000);
