const ENV = process.env.ENV || "local";
const restify = require("restify");
const builder = require("botbuilder");
const assert = require("assert");

let _connector, server;

if (ENV !== "local") {
    _connector = new builder.ChatConnector({
        appId: process.env.APP_ID,
        appPassword: process.env.APP_PWD
    });
    // Restify
    server = restify.createServer();

    server.use(restify.queryParser());

    assert(process.env.APP_ID, "No App ID set!");
    assert(process.env.APP_PWD, "No App Pwd set!");

    server.post("/api/messages", _connector.listen());

    // Routes
    require("./routes")(server);

    // Init server
    server.listen(process.env.port || process.env.PORT || 3978, function () {
        console.log("%s listening to %s", server.name, server.url);
    });

} else {
    console.log("Starting console client");
    _connector = new builder.ConsoleConnector().listen();
}

// Bot
const bot = new builder.UniversalBot(_connector);

module.exports = { bot };
