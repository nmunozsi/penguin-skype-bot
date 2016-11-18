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

module.exports = DB;
