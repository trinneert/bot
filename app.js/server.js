var restify = require('restify');
var builder = require('botbuilder');

var MICROSOFT_APP_ID = '9d14e131-f233-43e5-a311-198cf4f68107';
var MICROSOFT_APP_PASSWORD = '1RZx6P7nbn2bDnGrdXHy5pO';

// bot setup

// setup restify server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
})

// create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

// bot dialogs
var intents = new builder.IntentDialog();
bot.dialog('/', intents);

intents.matches(/^change gem/i, [
    function (session) {
        session.beginDialog('/changeProfile');
    },
    function (session, results) {
        session.send('OK... changed your gem to %s', session.userData.name);
    }
]);

intents.onDefault([
    function (session, args, next) {
        if (!session.userData.name) {
            session.beginDialog('/profile');
        } else {
            next();
        }
    },
    function (session, results) {
        session.send('Hello %s!', session.userData.name);
    }
]);

bot.dialog('/changeProfile', [
    function (session) {
        builder.Prompts.text(session, 'OK, Which gem are you now?');
    },
    function (session, results) {
        session.userData.name = results.response;
        session.endDialog();
    }
]);

bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Hi! Which gem are you?');
    },
    function (session, results) {
        session.userData.name = results.response;
        session.endDialog();
    }
]);