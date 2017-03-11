const { bot } = require('./src/connector');
const { trace } = require('./src/config/debug')(__filename);
// const { storeInDB, createAddressForUser } = require("./src/util/db");
// const parseMessage = require("./src/util/responses");

// const ENV = process.env.ENV || 'local';

// BOT DIALOGS
bot.dialog('/', (session) => {
    trace('Message received', session.message);
});
