const restify = require("restify");
const builder = require("botbuilder");
const assert = require("assert");

// Setup Restify Server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log("%s listening to %s", server.name, server.url); 
});

assert(process.env.APP_ID, "No App ID set!");
assert(process.env.APP_PWD, "No App Pwd set!");

const connector = new builder.ChatConnector({
    appId: process.env.APP_ID,
    appPassword: process.env.APP_PWD
});

const bot = new builder.UniversalBot(connector);

// Restify
server.post("/api/messages", connector.listen());
server.post("/", res => res.send(200));

// Bot
bot.dialog("/", (session) => {
    session.send("Hello World");
});