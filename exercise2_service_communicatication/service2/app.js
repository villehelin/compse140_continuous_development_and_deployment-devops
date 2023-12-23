const path = require('path');
const express = require("express");
const app = express();

var amqp = require('amqplib/callback_api');

var exec = require('child_process').execSync;

const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const PROTO_PATH = path.join(__dirname, 'exercise2.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
keepCase: true,
longs: String,
enums: String,
defaults: true,
oneofs: true
});
const exercise2_proto = grpc.loadPackageDefinition(packageDefinition);


app.use(express.text());


setTimeout(() => {
    exec('./wait-for-it.sh helin-ex2-rabbitmq:5672 --timeout=0 -- echo "rabbitmq is up"');

    amqp.connect('amqp://helin-ex2-rabbitmq', function(error0, connection) {

        if (error0) {
            throw error0;
        }
        connection.createChannel(function(error1, channel) {
            if (error1) {
                throw error1;
            }

            var queue = 'message';

            channel.assertQueue(queue, {
                durable: false
            });

            channel.consume(queue, function(msg) {
                channel.assertQueue('log', { durable: false });
                channel.sendToQueue('log', Buffer.from(msg.content.toString() + ' MSG')); 
                console.log('MQ: '+ msg.content.toString() + ' MSG')
            }, {
                noAck: true
            });

            app.post("/", (req, res) => {
                channel.assertQueue('log', { durable: false });
                channel.sendToQueue('log', Buffer.from(req.body + ' ' + req.socket.remoteAddress));
                console.log('HTTP: ' + req.body + ' ' + req.socket.remoteAddress);   
                res.sendStatus(200);
            });
            
            app.listen(8000, () => { console.log('Server running on port 8000'); });

            function count0(call, callback) {
                const data = call.request.message;
                zeroCount = 0;
                for (let i = 0; i < data.length; i++) {
                    if (data[i] === '0') {
                        zeroCount++;
                    }
                }
                callback(null, { count: zeroCount });
              }
        
            const server = new grpc.Server();
            server.addService(exercise2_proto.messager.service, {send_message: count0});
        
            server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
                console.log('gRPC server running on port 50051');
                server.start();
            });
        });
    });
}, 2000);