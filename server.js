const express = require("express"); 
const mongoose = require("mongoose"); 
const dotenv = require('dotenv');
const path = require('path');
const { Server } = require("socket.io");
var { createServer } = require('http');

// DotEnv Configuration
dotenv.config();

// Mongo DB Configuration
const dbConfig = {
    database : process.env.MONGO_DB ?? '',
    hostname : process.env.MONGO_HOST ?? '',
    port : process.env.MONGO_PORT ?? '',
};

const connectionURI = `mongodb://${dbConfig.hostname}:${dbConfig.port}/${dbConfig.database}`
mongoose.connect(connectionURI);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// App configuration
const appConfig = { port : process.env.APP_PORT ?? '5000' }

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', `http://${process.env.UI_HOST}:${process.env.UI_PORT}`);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});


// Route Configuration
const userRoutes = require("./routes/users");
const filtersRoutes = require("./routes/filters");

app.use("/", userRoutes);
app.use("/", filtersRoutes);

// Starting the node.js server
app.listen(appConfig.port, () => {
    console.log(`Serving node server on port ${appConfig.port}`);
});

// Socket configuration

const httpServer = createServer();
const io = new Server(httpServer);

const socketConfig = { port : process.env.SOCKET_PORT ?? '2000'}
const connectedUsers = new Map();

io.on("connection", (socket) => {

    const connectedUserId = socket.handshake.query['userId'];
    if(connectedUserId === null) return; 

    // Add new connected user to Map
    if(!connectedUsers.has(connectedUserId)){
        connectedUsers.set(connectedUserId, socket);
    }

    // For Simple Message Sending
    io.on("send_message"), (senderSocket, receiverId, message) => {

        try{
            if(receiverId === undefined || receiverId === null){
                senderSocket.emit("send_message_error", {msg:"Invalid receiver user id."});
            }else if(!connectedUsers.has(receiverId)){
                senderSocket.emit("send_message_error", {msg:"Receiver user is not online."});
            }

            const receiverSocket = connectedUsers.get(receiverId);
            receiverSocket.emit("receive_message", {msg:message});
            senderSocket.emit("send_message_successful");

        }catch(ex){
            senderSocket.emit("send_message_error", {msg:"An exception has occurred."});
        }
    }
});

io.on("disconnect", (socket) => {

    const connectedUserId = socket.handshake.query['userId'];
    if(connectedUserId === null) return; 

    // Remove user from map 
    if(connectedUsers.has(connectedUserId)){
        connectedUsers.delete(connectedUserId);
    }
});

httpServer.listen(socketConfig.port, () => {
    console.log(`Serving socket server on port ${socketConfig.port}`);
});