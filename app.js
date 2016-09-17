
var restify = require('restify');
var builder = require('botbuilder');
var gems = require('./gems.js');

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
        session.send('OK, see you later!\n\n');
        builder.Prompts.text(session, 'Hi! Which gem are you?');
    },
    function (session, results) {
        session.userData.name = results.response;
        session.send('Hello %s!', session.userData.name);
        session.endDialog();
  
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
        session.send("You can say:\n\n hi | change gem | about me | help | quit");
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
                       .text(gems.stevenText)
                       .images([
                            builder.CardImage.create(session, gems.stevenPic)
                            .tap(builder.CardAction.openUrl(session, gems.stevenUri))
                        ])        
                ]);     
                session.send(msgSteven);
                session.endDialog();
                break;
/*
            case "GARNET":
                var msgGarnet = new builder.Message(session)
                .attachments([
                    new builder.HeroCard(session)
                    .title("Garnet")
                    .text(gems.garnetText)
                    .images([
                        builder.CardImage.create(session, gems.garnetPic)
                        .tap(builder.CardAction.openUrl(session, gems.garnetUri))
                    ])
                ]);
                session.send(msgGarnet);
                session.endDialog();
                break;
            case "PEARL":
                var msgPearl = new builder.Message(session)
                .attachments([
                    new builder.HeroCard(session)
                    .title("Pearl")
                    .text(gems.pearlText)
                    .images([
                        builder.CardImage.create(session, gems.pearlPic)
                        .tap(builder.CardAction.openUrl(session, gems.pearlUri))
                    ])
                ]);
                session.send(msgPearl);
                session.endDialog();
                break;
            case "LAPIS LAZULI":
                var msgLapis = new builder.Message(session)
                .attachments([
                    new builder.HeroCard(session)
                    .title("Lapis Lazuli")
                    .text(gems.lapisText)
                    .images([
                        builder.CardImage.create(session, gems.lapisPic)
                        .tap(builder.CardAction.openUrl(session, gems.lapisUri))
                    ])
                ]);
                session.send(msgLapis);
                session.endDialog();
                break;
            case "PERIDOT":
                var msgPeridot = new builder.Message(session)
                .attachments([
                    new builder.HeroCard(session)
                    .title("Peridot")
                    .text(gems.peridotText)
                    .images([
                        builder.CardImage.create(session, gems.peridotPic)
                        .tap(builder.CardAction.openUrl(session, gems.peridotUri))
                    ])
                ]);
                session.send(msgPeridot);
                session.endDialog();
                break;
            case "AMETHEST":
                var msgAmethyst = new builder.Message(session)
                .attachments([
                    new builder.HeroCard(session)
                    .title("Amythest")
                    .text(gems.amethystText)
                    .images([
                        builder.CardImage.create(session, gems.amethystPic)
                        .tap(builder.CardAction.openUrl(session, gems.amethystUri))
                    ])
                ]);
                session.send(msgAmethyst);
                session.endDialog();
                break;
            case "JASPER":
                var msgJasper = new builder.Message(session)
                .attachments([
                    new builder.HeroCard(session)
                    .title("Jasper")
                    .text(gems.jasperText)
                    .images([
                        builder.CardImage.create(session, gems.jasperPic)
                        .tap(builder.CardAction.openUrl(session, gems.jasperUri))
                    ])
                ]);
                session.send(msgJasper);
                session.endDialog();
                break;
            case "CONNIE":
                var msgConnie = new builder.Message(session)
                .attachments([
                    new builder.HeroCard(session)
                    .title("Connie")
                    .text(gems.connieText)
                    .images([
                        builder.CardImage.create(session, gems.conniePic)
                        .tap(builder.CardAction.openUrl(session, gems.connieUri))
                    ])
                ]);
                session.send(msgConnie);
                session.endDialog();
                break;
            case "SADIE":
                var msgSadie = new builder.Message(session)
                .attachments([
                    new builder.HeroCard(session)
                    .title("Sadie")
                    .text(gems.sadieText)
                    .images([
                        builder.CardImage.create(session, gems.sadiePic)
                        .tap(builder.CardAction.openUrl(session, gems.sadieUri))
                    ])
                ]);
                session.send(msgSadie);
                session.endDialog();
                break;
            case "LARS":
                var msgLars = new builder.Message(session)
                .attachments([
                    new builder.HeroCard(session)
                    .title("Lars")
                    .text(gems.larsText)
                    .images([
                        builder.CardImage.create(session, gems.larsPic)
                        .tap(builder.CardAction.openUrl(session, gems.larsUri))
                    ])
                ]);
                session.send(msgLars);
                session.endDialog();
                break;
            case "GREG":
                var msgGreg = new builder.Message(session)
                .attachments([
                    new builder.HeroCard(session)
                    .title("Greg")
                    .text(gems.gregText)
                    .images([
                        builder.CardImage.create(session, gems.gregPic)
                        .tap(builder.CardAction.openUrl(session, gems.gregUri))
                    ])
                ]);
                session.send(msgGreg);
                session.endDialog();
                break;
 */
            default:
                session.send("I don't know which gem you are.");
                session.endDialog();
                break;
        }
    }
]);

bot.dialog('/changeProfile', [
    function (session) {
        builder.Prompts.text(session, 'Ok. Which gem are you now?');
    },
    function (session, results) {
        session.userData.name = results.response;
        session.send('Ok... changed your gem to %s', session.userData.name);
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