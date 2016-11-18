const restify = require("restify");
const builder = require("botbuilder");
const assert = require("assert");
const DataStore = require("nedb-promise");
const _ = require("lodash");

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
    server.post("/api/dudes", (req, res) => {
        DB.dudes.find({})
            .then(result => res.send(result))
            .catch(err => res.status(500).send(err));
    });

    server.post("/api/channels", (req, res) => {
        DB.channels.find({})
            .then(result => res.send(result))
            .catch(err => res.status(500).send(err));
    });
} else {
    console.log("Starting console client");
    connector = new builder.ConsoleConnector().listen();
}

function storeInDB(type, data) {
    const key = type === "dude" ? "name" : "id";

    return DB[`${type}s`].find({ [key]: data[key] })
        .then(result => {
            if (!result.length) {
                console.log(`Creating new ${type}: ${data[key]}`);
                return Promise.all([
                    DB[`${type}s`].insert(data),
                    "new"
                ]);
            }

            result = result[0];

            if (result.id !== data.id) {
                console.log(`Updating ${type}: ${data[key]}`);
                return Promise.all([
                    DB[`${type}s`].update({ _id: result._id }, { $set: data }),
                    "update"
                ]);
            }

            return Promise.all([result, "existing"]);
        })
        .then(results => {
            const [user, resType] = results;
            console.log(`${resType}: ${type}`);
            return Promise.resolve(results);
        })
        .catch(err => console.log(err, "Errored!"));
}

function createAddressForUser (name, bot) {
    return DB.dudes.find({ name })
        .then(user => Promise.resolve({
            channelId: ENV === "local" ? "console" : "skype",
            user: _.omit(user, "_id"),
            conversation: { id: user.id },
            bot,
            serviceUrl: 'https://skype.botframework.com',
            useAuth: true
        }))
        .catch(err => console.log(err, "Errored!"));
}

// Bot
const bot = new builder.UniversalBot(connector);

bot.dialog("/", (session) => {
    storeInDB("channel", session.message.address.conversation);
    storeInDB("dude", session.message.address.user)
        .then(results => {
            const [user, resType] = results;
            if (resType !== "new" && resType !== "update") {
                return;
            }

            createAddressForUser(ENV === "local" ? "User1" : "Andres Zorro")
                .then(address => {
                    const msg = new builder.Message()
                        .address(address)
                        .text(`${resType}: ${user.name || user.id}`);

                    bot.send(msg);
                })
        });
});
