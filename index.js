const restify = require("restify");
const builder = require("botbuilder");

// Setup Restify Server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log("%s listening to %s", server.name, server.url); 
});

console.log(process.env.APP_ID);
console.log(process.env.APP_PWD);

const connector = new builder.ChatConnector({
    appId: process.env.APP_ID,
    appPassword: process.env.APP_PWD
});

const bot = new builder.UniversalBot(connector);

// Restify
server.get("/", (req, res) => {
    res.send({hello: "world"});
    return next();
});
server.post('/api/messages', connector.listen());

// Bot
bot.dialog('/', function (session) {
    session.send("Hello World");
});