"use strict";
const logger    = require('./app//modules/logger');
const push = require("./app/modules/database_mod");

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

     // Set static folders
     // Grant access permission
    app.use('/public', express.static('public'));
    app.use('/static', express.static('static'));
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

    app.get('/guestLogin', async function(req, res){
        console.log("Creation of guest account request received.");
        // Create account
        var guestaccount = await rainbowSDK.admin.createAnonymousGuestUser(7200).then( (guest) => {
            return guest;
        }).catch((err) => {
            logger.log("debug", "error creating user");
        });

        // Create Bubble
        let withHistory = true;
        var bubbleId;
        var bubble = await rainbowSDK.bubbles.createBubble("Support", "A little description of my bubble", withHistory).then((bubble) => {
            return bubble;
        }).catch(function(err) {
            console.log("Error creating bubble");
        });
        bubbleId = bubble.id;
        var loginCred = {"Username": guestaccount.loginEmail, "Password": guestaccount.password, "BubbleId": bubbleId};
        
        // returns the credentials for guest user account
        res.end(JSON.stringify(loginCred));

        // Add user into bubble
        var contact_id = await rainbowSDK.contacts.getContactById(guestaccount.id);
        rainbowSDK.bubbles.inviteContactToBubble(contact_id, bubble, false, false, "").then(function(bubbleUpdated) {
            // do something with the invite sent
            logger.log("debug", "guest user has been added to bubble");
            logger.log("debug", "bubble jid: "+ bubbleUpdated.jid);
        }).catch(function(err) {
            // do something if the invitation failed (eg. bad reference to a buble)
            logger.log("debug", "guest user invite failed");
        });
    })
     
    var server = app.listen(8081, function () {
        var host = server.address().address
        var port = server.address().port
        console.log("Example app listening at http://%s:%s", host, port)
     });
});
