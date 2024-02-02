const express = require('express');
var amqp = require('amqplib/callback_api');
const app = express();
const axios = require("axios");

var exec = require('child_process').execSync;


const messages = [];

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
