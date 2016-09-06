
var restify = require('restify');
var builder = require('botbuilder');

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
        var reply = new builder.Message().address(message.address).text("Hello %s... Thanks for adding me.  Say 'hi' to get started.", name || 'there');
        bot.send(reply);
    } else {
        //to do: delete their data
    }
});

// bot middleware
bot.use(builder.Middleware.dialogVersion({ version: 1.0, resetCommand: /^reset/i }));

// bot dialogs
var intents = new builder.IntentDialog();

bot.dialog('/', new builder.IntentDialog()
    .matches(/^change gem/i, '/changeProfile')
    .matches(/^about me/i, '/aboutMe')
    .matches(/^help/i, '/help')
    .matches(/^hi/i, '/hi')
    .matches(/^quit/i, '/quit')
    .onDefault(builder.DialogAction.send("I'm sorry, but I don't understand."))
);

intents.onBegin ([
    function (session, args, next) {
        if (!session.userData.name) {
            session.beginDialog('/profile');
        } else {
            next();
        }
    },
    function (session, results) {
        session.send('Hello %s!', session.userData.name);
        session.endDialog();

    }
]);


bot.dialog('/quit', [
    function(session) {
        session.sendTyping();
        session.cancelDialog('OK, see you later!');
    }
]);

bot.dialog('/hi', [
    function (session) {
        session.send("Hi %s", session.userData.name);
        session.endDialog();
    }
]);

bot.dialog('/help', [
    function (session) {
        session.send("You can say hi | change gem | about me | help | quit");
        session.endDialog();
    }
]);

bot.dialog('/aboutMe',  [
    function (session) {
        switch(session.userData.name.toUpperCase()) {
            case "STEVEN":
                var msgSteven = new builder.Message(session)
                .attachments([
                    new builder.HeroCard(session)
                       .title("Steven Universe")
                        .text("Steven is the son of Greg Universe and Rose Quartz. He is the only half-human, half-gem and has special powers.  His destiny is to protect humanity.")
                        .images([
                            builder.CardImage.create(session, "http://i.cdn.turner.com/v5cache/CARTOON/site/Images/i79/steven_steven_180x180.png") 
                        ])        
                        .tap(builder.CardAction.openUrl(session, "http://fantendo.wikia.com/wiki/Steven_Universe"))
                ]);     
                session.send(msgSteven);
                session.endDialog();
                break;
            default:
                session.send("I don't know which gem you are.");
                session.endDialog();
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
        session.send('OK... changed your gem to %s', session.userData.name);
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