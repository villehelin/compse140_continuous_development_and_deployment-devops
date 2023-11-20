const fs = require('fs');
const path = require('path');
const express = require("express");
const app = express();

app.use(express.text());

const logFilePath = path.join(__dirname, '..', 'logs', 'service2.log');
// Check if the log file exists
if (!fs.existsSync(logFilePath)) {
    // Create the logs directory if it doesn't exist
    const logDir = path.dirname(logFilePath);
    fs.mkdirSync(logDir, { recursive: true });
    
    // Create the service2.log file and ensure it's empty
    fs.writeFileSync(logFilePath, '');
}

app.post("/", (req, res) => {
    // If the received text was “STOP” close file “service2.log” and exit
    if (req.body === "STOP") {
        res.sendStatus(200);
        fs.appendFileSync(logFilePath, req.body + "\n");
        console.log(req.body);
        process.exit(0);
    }
    
    console.log(req.body +" " + req.socket.remoteAddress);
    // As a response to incoming message create a new text that adds the remote address and write that text to file “service2.log”
    fs.appendFileSync(logFilePath, req.body + req.socket.remoteAddress + "\n");
    res.sendStatus(200);
});

// Establish an HTTP server that listens in port 8000 
app.listen(8000, () => { console.log(`Server running on port 8000`); });