const { omit } = require("lodash");
const DB = require("./../db");

function storeInDB(type, data, key, validator) {
    key = key || "id";
    validator = validator || "id";

    return DB[`${type}s`].findOne({ [key]: data[key] })
        .then(result => {
            if (!result) {
                console.log(`Creating new ${type}: ${data[key]}`);
                return Promise.all([
                    DB[`${type}s`].insert(data),
                    "new"
                ]);
            }

            validator = typeof validator === "function" ? validator : (r, d) => {
                return r[validator] !== d[validator];
            };

            if (validator(result, data)) {
                console.log(`Updating ${type}: ${data[key]}`);
                return Promise.all([
                    DB[`${type}s`].update(
                        { _id: result._id },
                        data,
                        { returnUpdatedDocs: true }),
                    "update"
                ]);
            }

            return Promise.all([result, "existing"]);
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
            user: omit(user[0], "_id"),
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
