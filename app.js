var builder = require('botbuilder');
var restify = require('restify');

//restify server
var server = restify.createServer();
server.listen(process.env.port || 3978, function(){
    console.log(`server name: ${server.name} | ${server.url}`)
});

var connector = new builder.ChatConnector({
    appId: process.env.APP_ID,
    appPassword: process.env.APP_PASSWORD
});

server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector, function(session){
    
    bot.on('typing', function(){
        session.send('hey your typing');
    });

    

    if (session.dialogData === null){
        session.send('Hello there!');
    }
    session.send(`OK, ça fonctionne!! [message.length = ${session.message.text.length}]`);
    session.send(`Session state = ${JSON.stringify(session.sessionState)}]`);
    session.send(JSON.stringify(session.dialogData));
});


bot.on('conversationUpdate', (message) => {
    if (message.membersAdded) {
        message.membersAdded.forEach(function (identity) {
            if (identity.id === message.address.bot.id) {
                let msg = new builder.Message().address(message.address);
                msg.text('Hello, this is a notification');
                msg.textLocale('en-US');
                bot.send(msg);    
            }
        });
    }
});