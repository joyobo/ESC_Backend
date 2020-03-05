"use strict";
const logger    = require('./app/modules/logger');
const push = require("./app/modules/database_mod");

// Load the SDK
let RainbowSDK = require("rainbow-node-sdk");

// Define your configuration
let options = {
    rainbow: {
        host: "sandbox"
    },
    credentials: {
        login: "", // To replace by your developer credendials
        password: "" // To replace by your developer credentials
    },
    // Application identifier
    application: {
        appID: "",
        appSecret: ""
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