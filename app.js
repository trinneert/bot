
var restify = require('restify');
var builder = require('botbuilder');
//require('launch-json');

// bot setup

// setup restify server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
})

server.get('/', restify.serveStatic({
    directory: __dirname,
    default: '/index.html'
}));

// create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

// activity events
bot.on('conversationUpdate', function (message) {
    // check for group
    if (message.address.conversation.isGroup) {
        if (message.membersAdded) {
            message.membersAdded.forEach(function (identity) {
                if (identity.id === message.address.bot.id) {
                    var reply = new builder.Message().address(message.address).text("Hello Gems!");
                    bot.send(reply);
                }
            });
        }

        if (message.membersRemoved) {
            message.membersRemoved.forEach(function (identity) {
                if (identity.id === message.address.bot.id) {
                    var reply = new builder.Message().address(message.address).text("Goodbye Gem!");
                    bot.send(reply);
                } 
            });
        }
    }
    
});

bot.on('contactRelationUpdate', function (message) {
    if (message.action === 'add') {
        var name = message.user ? message.user.name : null;
        var reply = new builder.Message().address(message.address).text("Hellp %s... Thanks for adding me.  Say 'hi' to get started.", name || 'there');
        bot.send(reply);
    } else {
        //to do: delete their data
    }
});

// bot middleware
bot.use(builder.Middleware.dialogVersion({ version: 1.0, resetCommand: /^reset/i }));

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

intents.matches('/^tell me about my gem/i', [
    function (session) {
        session.beginDialog('/tellMe');
    }
]);

intents.onDefault ([
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

//dialog.onDefault(builder.DialogAction.send("I'm sorry, I don't understand."));

bot.dialog('/tellMe',  [
    function (session) {
        builder.Prompts.text(session, 'Working on %s', session.userData.name.toUpperCase());
        switch(session.userData.name.toUpperCase()) {
            case 'STEVEN':
                builder.Prompts.text(session, "Steven is a human-gem hybrid");
                break;
            default:
                builder.Prompts.text(session, "I don't know which gem you are.");
                break;
        }
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