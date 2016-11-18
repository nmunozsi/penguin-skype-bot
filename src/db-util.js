const _ = require("lodash");
const DB = require("./db");

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

            if (result[0].id !== data.id) {
                console.log(`Updating ${type}: ${data[key]}`);
                return Promise.all([
                    DB[`${type}s`].update(
                        { _id: result[0]._id },
                        data,
                        { returnUpdatedDocs: true }),
                    "update"
                ]);
            }

            return Promise.all([result[0], "existing"]);
        })
        .then(results => {
            const [user, resType] = results;
            console.log(`${resType}: ${type}`);
            return Promise.resolve([user[1] || user[0] || user, resType]);
        })
        .catch(err => console.log(err, "Errored when searchin DB!"));
}

function createAddressForUser (name, bot) {
    return DB.dudes.find({ name })
        .then(user => Promise.resolve({
            channelId: ENV === "local" ? "console" : "skype",
            user: _.omit(user[0], "_id"),
            conversation: { id: user[0].id },
            bot,
            serviceUrl: 'https://skype.botframework.com',
            useAuth: true
        }))
        .catch(err => console.log(err, "Errored when creating address!"));
}

module.exports = {
    storeInDB,
    createAddressForUser
}
