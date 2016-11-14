const restify = require("restify");
const builder = require("botbuilder");

// Setup Restify Server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log("%s listening to %s", server.name, server.url); 
});

server.get("/", (req, res) => {
    res.send({hello: "world"});
    return next();
})