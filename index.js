const restify = require("restify");
const builder = require("botbuilder");
const assert = require("assert");
const DataStore = require("nedb-promise");

const DB = {
    dudes: new DataStore({
        filename: "collections/users",
        autoload: true
    }),
    channels: new DataStore({
        filename: "collections/channels",
        autoload: true
    })
};

const ENV = process.env.ENV || "local";

let connector, server;

if (ENV !== "local") {
    connector = new builder.ChatConnector({
        appId: process.env.APP_ID,
        appPassword: process.env.APP_PWD
    });
    // Restify
    server = restify.createServer();
    server.listen(process.env.port || process.env.PORT || 3978, function () {
        console.log("%s listening to %s", server.name, server.url);
    });

    assert(process.env.APP_ID, "No App ID set!");
    assert(process.env.APP_PWD, "No App Pwd set!");
    server.post("/api/messages", connector.listen());
} else {
    console.log("Starting console client");
    connector = new builder.ConsoleConnector().listen();
}

function storeInDB(type, data) {
    const key = type === "dude" ? "name" : "id";

    return DB[`${type}s`].find({ [key]: data[key] })
        .then(result => {
            if (!result.length) {
                console.log(`Creating new ${type} record: ${data[key]}`);
                return DB[`${type}s`].insert(data);
            }

            if (result.id !== data.id) {
                return DB[`${type}s`].update({ _id: result._id }, { $set: data });
            }

            return Promise.resolve(result);
        })
        .then(result => console.log(`${type} stored`))
        .catch(err => console.log(err, "Errored!"));
}

// Bot
const bot = new builder.UniversalBot(connector);

bot.dialog("/", (session) => {

    storeInDB("dude", session.message.address.user);
    storeInDB("channel", session.message.address.conversation);
});
