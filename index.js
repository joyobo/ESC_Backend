"use strict";
const logger    = require('./app//modules/logger');
const push = require("./app/modules/database_mod");

var express = require('express');
var app = express();
var bodyParser = require('body-parser');

// Load the SDK
let RainbowSDK = require("rainbow-node-sdk");

app.use('/public', express.static('public'));
app.use('/static', express.static('static'));

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

     // Set static folders
     // Grant access permission
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    // get root html
    app.get('/',function(req,res){
    res.sendfile("./public/index.html");
    });

    // get all other htmls
    /*
    contactUs
    chat
    email
    call
    */
    app.get('/chat.html', function(req, res){
        res.sendfile("./public/chat.html");
    })

    app.get('/contactUs.html', function(req, res){
        res.sendfile("./public/contactUs.html");
    })

    app.get('/email.html', function(req, res){
        res.sendfile("./public/email.html");
    })

    app.get('/call.html', function(req, res){
        res.sendfile("./public/call.html");
    })

    app.get('/vendors-sdk.min.js', function(req, res){
        res.sendfile("./public/vendors-sdk.min.js");
    })

    app.get('/rainbow-sdk.min.js', function(req, res){
        res.sendfile("./public/rainbow-sdk.min.js");
    })

    app.get('/chat.js', function(req, res){
        res.sendfile("./public/chat.js");
    })

    app.get('/guestLogin', async function(req, res){
        console.log("Creation of guest account request received.");
        // Create account
        var guestaccount = await rainbowSDK.admin.createAnonymousGuestUser(7200).then( (guest) => {
            return guest;
        }).catch((err) => {
            logger.log("debug", "error creating user");
        });
        var contact_id = await rainbowSDK.contacts.getContactById(guestaccount.id);

        // Create Bubble of name support
        let withHistory = false;
        var bubbleId;
        var bubble = await rainbowSDK.bubbles.createBubble("Debug", "A little description of my bubble", withHistory).then((bubble) => {
            bubbleId = bubble.id;
            return bubble;
        }).catch(function(err) {
            console.log("Error creating bubble");
        });
        
        // Assume that we know that it is Iphone: logging in
        // add the bubbleId into the queues of agents with appropriate skill

        
        // Add guest into bubble
        rainbowSDK.bubbles.inviteContactToBubble(contact_id, bubble, false, false, "").then(function(bubbleUpdated) {
            // do something with the invite sent
            logger.log("debug", "guest user has been added to bubble");
            logger.log("debug", "bubble jid: "+ bubbleUpdated.jid);
        }).catch(function(err) {
            // do something if the invitation failed (eg. bad reference to a buble)
            logger.log("debug", "guest user invite failed");
        });

        // wai


        // Add agent into bubble
        // Test function only
        var agent_id = await rainbowSDK.contacts.getContactById("5e60e5ddd8084c29e64eba90");
        rainbowSDK.bubbles.inviteContactToBubble(agent_id, bubble, false, false, "").then(function(bubbleUpdated) {
            logger.log("debug", "agent added into bubble");                
        }).catch(function(err) {
            // do something if the invitation failed (eg. bad reference to a buble)
            logger.log("debug", "agent user invite failed");
        });
    
       

        var loginCred = {"Username": guestaccount.loginEmail, "Password": guestaccount.password, "BubbleId": bubbleId};
        
        // returns the credentials for guest user account
        res.end(JSON.stringify(loginCred));
        
    })
     
    var server = app.listen(8081, function () {
        var host = server.address().address
        var port = server.address().port
        console.log("Example app listening at http://%s:%s", host, port)
     });
});
