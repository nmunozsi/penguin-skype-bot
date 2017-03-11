// const DB = require("./db");
// const moment = require("moment");

module.exports = function (server) {
    // server.get("/api/links", (req, res) => {
    //     const sharedBy = req.query.sharedBy;
    //     const sharedIn = req.query.sharedIn;
    //     const type = req.query.type;
    //
    //     let links;
    //
    //     // A better algorithm shall be proposed!
    //     DB.links.find({})
    //     .then(l => {
    //         links = l;
    //         let dudes = links.map(link => link.sharedBy);
    //         return DB.dudes.find({ id: { $in: dudes }});
    //     })
    //     .then(d => {
    //         links.forEach(link => {
    //             link.sharedBy = d.find(dude => dude.id === link.sharedBy);
    //         });
    //
    //         if (sharedBy) {
    //             links = links.filter(link =>
    //                 new RegExp(sharedBy, "i").test(link.sharedBy.name))
    //         }
    //
    //         if (type) {
    //             links = links.filter(link => link.type === type);
    //         }
    //
    //         if (sharedIn) {
    //             let [sharedStart, sharedEnd] = sharedIn.split(",").map(s => moment(s));
    //
    //             sharedEnd = moment.isMoment(sharedEnd) ? sharedEnd : moment();
    //
    //             links = links.filter(link =>
    //                 moment(link.sharedAt).isBetween(sharedStart, sharedEnd, "day", "[]"));
    //         }
    //
    //         res.send(links);
    //     });
    // });

    // server.get("/api/:collection", (req, res) => {
    //     const collection = req.params.collection;
    //
    //     if (Object.keys(DB).indexOf(collection) < 0) {
    //         res.status(500).send({
    //             message: "API Error"
    //         });
    //         return;
    //     }
    //
    //     DB[collection].find({})
    //     .then(result => res.send(result))
    //     .catch(err => res.status(500).send(err));
    // });
};
