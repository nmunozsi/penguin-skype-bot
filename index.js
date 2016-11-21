const { bot } = require("./src/connector");
const { storeInDB, createAddressForUser } = require("./src/util/db");
const parseMessage = require("./src/util/responses");

// BOT DIALOGS
bot.dialog("/", (session) => {
    storeInDB("channel", session.message.address.conversation);
    storeInDB("dude", session.message.address.user, "name")
    .then(results => {
        const [user, resType] = results;
        if (resType !== "new" && resType !== "update") {
            return;
        }

        createAddressForUser(
            ENV === "local" ? "User1" : "Andres Zorro",
            session.message.address.bot)
        .then(address => {
            const msg = new builder.Message()
                .address(address)
                .text(`${resType}: ${user.name || user.id}`);

            bot.send(msg);
        });
    });

    const parsed = parseMessage(session.message);

    if (parsed.links) {
        parsed.links.forEach(link => storeInDB("link", link, "link"));
    }
});
