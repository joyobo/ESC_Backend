"use strict";
const logger    = require('./app//modules/logger');
const push = require("./app/modules/database_mod");
const add_to_queue = require("./add_to_queue");
//var mysql = require('mysql');

var express = require('express');
var app = express();
var bodyParser = require('body-parser');

// Load the SDK
let RainbowSDK = require("rainbow-node-sdk");

// Define your configuration
let options = {
    rainbow: {
        host: "sandbox"
    },
    credentials: {
        login: "joey_yeo@mymail.sutd.edu.sg", // To replace by your developer credendials
        password: "OFLl[8d(Py~8" // To replace by your developer credentials
    },
    // Application identifier
    application: {
        appID: "b6f834105aed11eabf7e77d14e87b936",
        appSecret: "LzUG5l0iM9YproZTONXSkwnRmeAl7cEWrxSyg3ziSHlPpOVGVA8YY5lC2R6B0IwT"
    },

    // Logs options
    logs: {
        enableConsoleLogs: true,
        enableFileLogs: false,
        "color": true,
        "level": 'debug',
        "customLabel": "vincent01",
        "system-dev": {
            "internals": false,
            "http": false,
        }, 
        file: {
            path: "/var/tmp/rainbowsdk/",
            customFileName: "R-SDK-Node-Sample2",
            level: "debug",
            zippedArchive : false/*,
            maxSize : '10m',
            maxFiles : 10 // */
        }
    },
    // IM options
    im: {
        sendReadReceipt: true
    }
};

// Instantiate the SDK
let rainbowSDK = new RainbowSDK(options);

// Start the SDK
rainbowSDK.start().then(() => {
     // Do something when the SDK is connected to Rainbow

     // listen to request
    app.use(express.static('public'));
    app.use(bodyParser.urlencoded({
    extended: true
    }));

    // a simple form on localhost
    app.get('/',function(req,res){
    res.sendfile("index.html");
    });

    // creates guest user account
    app.post('/', async function(req,res){
        var firstName=req.body.firstName;
        var lastName=req.body.lastName;
        var category = req.body.category;
        var skill = req.body.skill;
        var guestaccount;
        console.log("first Name = "+firstName+", last Name = "+lastName);

        var guestaccount = await rainbowSDK.admin.createGuestUser(firstName, lastName, "en-US", 86400).then( (guest) => {
            // Do something when the guest has been created and added to that company
            return guest;
            //logger.log("debug", "guest"+guest);
        }).catch((err) => {
            // Do something in case of error
            logger.log("debug", "error creating user");
        });
        
         // add user into a bubble
         rainbowSDK.bubbles.createBubble("Support", "A little description of my bubble", false).then(async function(bubble) {
            // do something with the bubble created
            
            let invitedAsModerator = false;     // To set to true if you want to invite someone as a moderator
            let sendAnInvite = false;            // To set to false if you want to add someone to a bubble without having to invite him first
            let inviteReason = "bot-invite";    // Define a reason for the invite (part of the invite received by the recipient)
            var contact_id = await rainbowSDK.contacts.getContactById(guestaccount.id);
            
            rainbowSDK.bubbles.inviteContactToBubble(contact_id, bubble, invitedAsModerator, sendAnInvite, inviteReason).then(function(bubbleUpdated) {
                // do something with the invite sent
                var bubbleJid = bubbleUpdated.jid;
                logger.log("debug", "guest user has been added to bubble");
                logger.log("debug", "bubble jid: "+ bubbleJid);

                // push the bubble jid into the respective category in db
                add_to_queue(bubbleJid, skill);
                
            }).catch(function(err) {
                // do something if the invitation failed (eg. bad reference to a buble)
                logger.log("debug", "guest user invite failed");
            });

        }).catch(function(err) {
            // do something if the creation of the bubble failed (eg. providing the same name as an existing bubble)
            logger.log("debug","guest bubble creation failed");
        });

        var loginCred = {"loginEmail": guestaccount.loginEmail, "password": guestaccount.password, "category":category, "skill":skill};
        
        // returns the credentials for guest user account
        res.end(JSON.stringify(loginCred));
     });
     
    var server = app.listen(8081, function () {
        var host = server.address().address
        var port = server.address().port
        console.log("Example app listening at http://%s:%s", host, port)
     });
    
    // Routing part
    rainbowSDK.events.on("rainbow_onmessagereceived", async (message) => {
        // Check if the message is not from you
        if(!message.fromJid.includes(rainbowSDK.connectedUser.jid_im)) {
            // Check that the message is from a user and not a bot
            if( message.type === "chat") {
                // Answer to this user
                rainbowSDK.im.sendMessageToJid("hello! Im listening!", message.fromJid);
                push.todb(message.content);
                // Do something with the message sent
                if(message.content == "i want agent"){
                    let withHistory = false; // Allow newcomers to have access to the bubble messages since the creation of the bubble
                    rainbowSDK.bubbles.createBubble("Support", "A little description of my bubble", withHistory).then(async function(bubble) {
                        // do something with the bubble created
                        
                        let invitedAsModerator = false;     // To set to true if you want to invite someone as a moderator
                        let sendAnInvite = false;            // To set to false if you want to add someone to a bubble without having to invite him first
                        let inviteReason = "bot-invite";    // Define a reason for the invite (part of the invite received by the recipient)
                        var contact_id = await rainbowSDK.contacts.getContactByJid(message.fromJid);
                        
                        rainbowSDK.bubbles.inviteContactToBubble(contact_id, bubble, invitedAsModerator, sendAnInvite, inviteReason).then(function(bubbleUpdated) {
                            // do something with the invite sent
                            logger.log("debug", "user has been added to bubble");
                        }).catch(function(err) {
                            // do something if the invitation failed (eg. bad reference to a buble)
                            logger.log("debug", "user invite failed");
                        });
                        
                        var contact_agent = await rainbowSDK.contacts.getContactById("", true);
                        rainbowSDK.bubbles.inviteContactToBubble(contact_agent, bubble, invitedAsModerator, sendAnInvite, inviteReason).then(function(bubbleUpdated) {
                            // do something with the invite sent
                            logger.log("debug", "agent has been added to bubble");
                        }).catch(function(err) {
                            // do something if the invitation failed (eg. bad reference to a buble)
                            logger.log("debug", "agent invite failed");
                        });
                        
                    }).catch(function(err) {
                        // do something if the creation of the bubble failed (eg. providing the same name as an existing bubble)
                        logger.log("debug","bubble creation failed");
                    });
                }
            }
        }
    });
    
});
