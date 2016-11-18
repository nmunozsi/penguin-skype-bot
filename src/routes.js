const DB = require("./db");

module.exports = function (server) {
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
};
