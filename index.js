const restify = require("restify");
const builder = require("botbuilder");
const assert = require("assert");

// Setup Restify Server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log("%s listening to %s", server.name, server.url); 
});

assert(process.env.APP_ID, "No App ID set!");
assert(process.env.APP_PWD, "No App Pwd set!");

const connector = new builder.ChatConnector({
    appId: process.env.APP_ID,
    appPassword: process.env.APP_PWD
});

// const connector = new builder.ConsoleConnector().listen();

const bot = new builder.UniversalBot(connector);

// Restify
server.post("/api/messages", connector.listen());

// Bot
bot.dialog("/", (session) => {
   console.log(session.message);
   session.send("Address id is %s", session.message.address);
});

setTimeout(() => {
   const msg = new builder.Message()
      .address({ 
         id: '4dd2ZfkzZ3ZILH8K',
         channelId: 'skype',
         user: { 
            id: '29:15uqu8NboV6gFk1tSWbtTNESZ6uf6Oe5wzBLdsoIAvI0',
            name: 'Andres Zorro' 
         },
         conversation: { 
           id: '29:15uqu8NboV6gFk1tSWbtTNESZ6uf6Oe5wzBLdsoIAvI0' 
         },
         bot: { 
            id: '28:0052536f-9a58-41d0-bf09-2bb0cba028b7',
            name: 'Penguin Report' 
         },
         serviceUrl: 'https://skype.botframework.com',
         useAuth: true 
      })
      .text("This is a timeout test! %s", new Date().toString());
      
   bot.send(msg);
}, 30000);

