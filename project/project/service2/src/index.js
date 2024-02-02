const path = require('path');
const express = require("express");
const app = express();
const axios = require("axios");

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

async function getState() {
    try {
      const response = await axios.get("http://gateway:8083/state");
  
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.error(`Failed to get state: ${error}`);
      return null;
    }
}

async function checkState() {
    while (true) {
      const state = await getState();
  
      if (state === "SHUTDOWN") {
        process.exit(0);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

setTimeout(() => {
    exec('./utils/wait-for-it.sh rabbitmq:5672 --timeout=0 -- echo "rabbitmq is up"');

    checkState();

    amqp.connect('amqp://rabbitmq', function(error0, connection) {

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