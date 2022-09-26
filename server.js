const express = require("express"); 
const mongoose = require("mongoose"); 
const dotenv = require('dotenv');
const path = require('path');

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
const appConfig = { port : process.env.APP_PORT ?? '3000' }

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Route Configuration
const userRoutes = require("./routes/users");

app.use("/", userRoutes)

// Starting the node.js server
app.listen(appConfig.port, () => {
    console.log("Serving on port 3000");
});

