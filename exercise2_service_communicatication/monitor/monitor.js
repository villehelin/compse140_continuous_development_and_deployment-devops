const express = require('express');
var amqp = require('amqplib/callback_api');
const app = express();

var exec = require('child_process').execSync;


const messages = [];

exec('./wait-for-it.sh helin-ex2-rabbitmq:5672 --timeout=0 -- echo "rabbitmq is up"');

amqp.connect('amqp://helin-ex2-rabbitmq', function(error0, connection) {
    if (error0) {
        throw error0;
    }

    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }

        channel.assertQueue('log', {
            durable: false
        });

        channel.consume('log', function(msg) {
            messages.push(msg.content.toString());
        }, {	
            noAck: true
        });
    });
});

app.get('/', (req, res) => {
    res.status(200).type('text/plain').send(messages.join('\n'));
});
  
app.listen(8087, () => { console.log('Server running on port 8087'); });