const express = require("express");
const app = express();
const axios = require("axios");
const bodyParser = require('body-parser');

app.use(bodyParser.text());


let currentState = "INIT"; 
let runlog = [];

if (currentState === "INIT") {
  setTimeout(() => {
    runlog.push(`${new Date().toISOString()}: ${currentState}->RUNNING`);
    currentState = "RUNNING";
  }, 3000);
}

app.get("/messages", async (req, res) => {
  const result = await axios.get("http://monitor:8087/");
  const data = result.data;

  res.setHeader("Content-Type", "text/plain");
  res.status(200).send(data);
});

app.put("/state", async (req, res) => {
  const state = req.body;

  if (currentState === state) {
    res.sendStatus(200);
    return;
  }

    switch (state) {
      case "INIT":
        runlog.push(`${new Date().toISOString()}: ${currentState}->${state}`);
        currentState = "INIT";
        break;
      case "PAUSED":
        runlog.push(`${new Date().toISOString()}: ${currentState}->${state}`);
        currentState = "PAUSED";
        break;
      case "RUNNING":
        runlog.push(`${new Date().toISOString()}: ${currentState}->${state}`);
        currentState = "RUNNING";
        break;
      case "SHUTDOWN":
        runlog.push(`${new Date().toISOString()}: ${currentState}->${state}`);
        currentState = "SHUTDOWN";
        break;
      default:
        res.sendStatus(400);
        return;
  }
  res.sendStatus(200);

  if (currentState === "INIT") {
    setTimeout(() => {
      runlog.push(`${new Date().toISOString()}: ${currentState}->RUNNING`);
      currentState = "RUNNING";
    }, 3000);
  }

  if (currentState === "SHUTDOWN") {
    setTimeout(() => {
      process.exit(0);
    }, 10000);
  }
});

app.get("/state", (req, res) => {
  res.type('text/plain').send(currentState);
});

app.get('/run-log', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.type('text/plain').send(runlog.join('\n'));    
});





const server = app.listen(8083, () => { console.log("Server running on port 8083"); });

module.exports = server;