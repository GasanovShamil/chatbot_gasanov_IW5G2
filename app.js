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


var bot = new builder.UniversalBot(connector, [
    session => session.beginDialog('greetings')
]);

bot.on('conversationUpdate', (message) => {
    if (message.membersAdded) {
        message.membersAdded.forEach(function (identity) {
            if (identity.id === message.address.bot.id) {
                let msg = new builder.Message().address(message.address);
                msg.text('Bonjour bienvenue sur le bot');
                bot.send(msg);    
            }
        });
    }
});

bot.dialog('greetings',[
    function (session) {
        session.beginDialog('askName');
    },
    function (session, results) {
        //session.endDialog('Hello %s!', results.response);
        /*session.endDialogWithResult({ 
            response: { name: session.dialogData.name, nombre: session.dialogData.nombre, date: session.dialogData.date }
          });*/
        session.send(`Bonjour ${results.response.name}, votre table de ${results.response.nombre} personnes sera 
        disponible le : ${results.response.date}`);
    }
]);



bot.dialog('askName', [
    function (session, args, next) {
        session.dialogData.profile = args || {}; 
        if (!session.dialogData.profile.name) {
            builder.Prompts.text(session, "What's your name?");
        } else {
            next();
        }
    },

    function (session , results, next) {
        if (results.response) {
            session.dialogData.profile.name = results.response;
        }
        if (!session.dialogData.profile.nombre) {
            builder.Prompts.number(session, "Une table de combien de personne ?");
        } else {
            next(); 
        }
    },
    function (session , results, next) {
        if (results.response) {
            session.dialogData.profile.nombre = results.response;
        }
        if (!session.dialogData.profile.date) {
            builder.Prompts.number(session, "Pour quelle date ?");
        } else {
            next(); 
        }
    },
    function (session, results) {
        if (results.response) {
            session.dialogData.profile.date = results.response;
        }
        session.endDialogWithResult({ response: session.dialogData.profile });
    }
]);



// var bot = new builder.UniversalBot(connector, function(session){
    
//     bot.on('typing', function(){
//         session.send('hey your typing');
//     });

    

//     if (session.dialogData === null){
//         session.send('Hello there!');
//     }
//     session.send(`OK, ça fonctionne!! [message.length = ${session.message.text.length}]`);
//     session.send(`Session state = ${JSON.stringify(session.sessionState)}]`);
//     session.send(JSON.stringify(session.dialogData));
// });


// bot.on('conversationUpdate', (message) => {
//     if (message.membersAdded) {
//         message.membersAdded.forEach(function (identity) {
//             if (identity.id === message.address.bot.id) {
//                 let msg = new builder.Message().address(message.address);
//                 msg.text('Hello, this is a notification');
//                 msg.textLocale('en-US');
//                 bot.send(msg);    
//             }
//         });
//     }
// });