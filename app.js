var restify = require('restify');
var builder = require('botbuilder');
var cognitiveServices = require('botbuilder-cognitiveservices');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector);


// POST /knowledgebases/97763c34-65da-40f4-9fa3-9a934848e02a/generateAnswer
// Host: https://westus.api.cognitive.microsoft.com/qnamaker/v2.0
// Ocp-Apim-Subscription-Key: 97d7c8e2b5c94ce295787da257790c86
// Content-Type: application/json
// {"question":"hi"}
var qnaMekerRecogniser = new cognitiveServices.QnAMakerRecognizer({
    knowledgeBaseId:'97763c34-65da-40f4-9fa3-9a934848e02a',
    subscriptionKey:'97d7c8e2b5c94ce295787da257790c86'
});

var qnaMakerDialog = new cognitiveServices.QnAMakerDialog({
    recognizers:[qnaMekerRecogniser],
    qnaThreshold:0.4,
    defaultMessage: 'tu te trompe gros!'
});

// bot.dialog('/', qnaMakerDialog);

var luisEndpoint = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/00998a70-c4b7-4dde-ba83-4d7b55488a92?subscription-key=0898a72fbc3341dfb5220cae1a6b77b9&spellCheck=true&verbose=true&timezoneOffset=0';
var luisRecognizer = new builder.LuisRecognizer(luisEndpoint);

bot.recognizer(luisRecognizer);

//var entities = builder.EntityRecognizer.findEntity(intentResult.entities, 'HomeAutomation.Device');
// var message = `Intent : ${JSON.stringify(result.intent)}\n--------------------\n`;
// result.entities.forEach(function(element) {
//     message += `Entity : ${element.entity}\n`
//     message += `Type : ${element.type}\n-------`
// }, this);
// session.send(message);

bot.dialog('HomePilot', [
    function(session, args, next){
        var message = '';

        if (args) {
            var result = args.intent;
            var operation = builder.EntityRecognizer.findEntity(result.entities, 'HomeAutomation.Operation');
            var device = builder.EntityRecognizer.findEntity(result.entities, 'HomeAutomation.Device');
            var room = builder.EntityRecognizer.findEntity(result.entities, 'HomeAutomation.Room');

            if (operation) {
                if (operation.entity == 'on') message += 'ALLUMER ' + device.entity;
                else if (operation.entity == 'off') message += 'ETEINDRE ' + device.entity;
            } else {
                message += 'CHANGER ' + device.entity;

                var temperature = builder.EntityRecognizer.findEntity(result.entities, 'temperature');
                if (temperature) {
                    message += ' A ' + temperature.entity;
                } else {
                    var color = builder.EntityRecognizer.findEntity(result.entities, 'HomeAutomation.Color');
                    if (color) message += ' EN ' + color.entity;

                    var percentage = builder.EntityRecognizer.findEntity(result.entities, 'percentage');
                    if (percentage) message += ' A ' + percentage.entity;
                }
            }

            if (room) message += ' DANS ' + room.entity;

        } else {
            message += 'Je n\'ai pas compris votre demande, veuillez reformuler.';
        }

        session.send(message);
    }
]).triggerAction({
    matches:['HomeAutomation.TurnOn', 'HomeAutomation.TurnOff', 'HomeAutomation.Control']
});

bot.dialog('Error', [
    function(session){
        session.send('Je n\'ai pas compris votre demande, veuillez reformuler.');
    }
]).triggerAction({
    matches: /^(?!(HomeAutomation.))/i
});