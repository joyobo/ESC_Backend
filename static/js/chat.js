$(function() {
    console.log("[DEMO] :: Rainbow Application started!");

    // Update the variables below with your applicationID and applicationSecret strings
    var applicationID = "b6f834105aed11eabf7e77d14e87b936",
        applicationSecret = "LzUG5l0iM9YproZTONXSkwnRmeAl7cEWrxSyg3ziSHlPpOVGVA8YY5lC2R6B0IwT";

    var RainbowUsername, RainbowPassword;

    /* Bootstrap the SDK */
    angular.bootstrap(document, ["sdk"]).get("rainbowSDK");

    const proxyurl = "https://cors-anywhere.herokuapp.com/";
    const createGuestUrl = "https://sheltered-journey-07706.herokuapp.com/api/v1/guest_creation"; 
    const routingEngineUrl = "https://sheltered-journey-07706.herokuapp.com/db/route";
    const setAvailabilituUrl = "https://sheltered-journey-07706.herokuapp.com/db/agent/"


    /* Callback for handling the event 'RAINBOW_ONREADY' */
    var onReady = function onReady() {

        // Get guest account
        fetch(proxyurl + createGuestUrl)
        .then(response => response.text())
        .then(function(result) { 
            result = JSON.parse(result);
            if (result['success']==true){
                myRainbowLogin = result['data']['username'];
                myRainbowPassword = result['data']['password'];

                // Sign in to rainbow
                rainbowSDK.connection.signin(myRainbowLogin, myRainbowPassword)
                .then(function(account) {
                    console.log(myRainbowLogin+" login in successfully!");

                    addInitPrompt()

                    // Promp customers to choose service and language upon successful login
                    const selectionBox = document.getElementById('selection-box')
                    selectionBox.addEventListener('submit', e=>{
                        e.preventDefault()
                        const selectedLanguage = document.getElementById('language')
                        const selectedService = document.getElementById('service')
                        const selectButton = document.getElementById('select-button')

                        console.log(selectedLanguage);
                        console.log(selectedService);
                                            
                        selectButton.disabled = true;
                        selectedLanguage.disabled = true;
                        selectedService.disabled = true;

                        appendMessage('Looking for available agent ... ', 'agent');
                                                
                        fetch(proxyurl+routingEngineUrl+"/"+selectedLanguage.value+"+"+selectedService.value)
                          .then(response => response.text())
                          .then(function(result) {
                            console.log('result is : '+result)
                            result = JSON.parse(result);

                            if (result['success']==true){
                                if (result['data'].length == 0){
                                    appendMessage(result['message'], 'agent')
                                    selectButton.disabled = false;
                                    selectedLanguage.disabled = false;
                                    selectedService.disabled = false;
                                }else{
                                    console.log('agent is found')
                                    agent_id = result['data']
                                    console.log('agent id is '+agent_id)
                                    appendMessage('Agent is found id: '+agent_id, 'agent')
                                    setAgentAvailabiliy(agent_id, 1)
                                    rainbowSDK.contacts.searchById(agent_id).then(function(contact) {
                                        rainbowSDK.conversations.openConversationForContact(contact).then(function(conversation){
                                            rainbowSDK.im.sendMessageToConversation(conversation, "Hi agent "+agent_id);
                                            
                                        })        
                                    });            
                                }
                            }
                          })
                          .catch(error => console.log('error', error));
                    })
                })
                .catch(function(err) {
                    console.log(myRainbowLogin + " login failed. " + err);
                });
            }else{
                alert('Fail to register guest account');
            }
        })
        .catch((error) => {
            console.log('error', error);
            alert(error);
        });
}



    /* Callback for handling the event 'RAINBOW_ONCONNECTIONSTATECHANGED' */
    var onLoaded = function onLoaded() {
        console.log("[DEMO] :: On SDK Loaded !");

        rainbowSDK
            .initialize(applicationID, applicationSecret)
            .then(function() {
                console.log("[DEMO] :: Rainbow SDK is initialized!");
            })
            .catch(function(err) {
                console.log("[DEMO] :: Something went wrong with the SDK...", err);
            });

            if(rainbowSDK.webRTC.canMakeAudioVideoCall()) {
                console.log(' Web allows AudioVideocall')
            }
    
            if(rainbowSDK.webRTC.hasACamera()) {
                console.log('camera is available');
            }
    
            if(rainbowSDK.webRTC.hasAMicrophone()) {
                console.log('mic is available');
            }
    };

    var conversation_global;

    // Im handler
    let onNewMessageReceived = function(event) {

        // as noted in the documentation, RAINBOW_ONNEWIMMESSAGERECEIVED carries three parameters: Message, Conversation and CC. Let's retrieve them:

        let message = event.detail.message;
        let conversation = event.detail.conversation;   // refer to api "conversation"-web-sdk

        conversation_global = conversation;

        let conversation_id = conversation.id;
        let contact = conversation.contact;

        console.log('conversation id is :' + conversation_id);
        console.log('contact id is : '+contact.id)
        console.log('msg id is : ' + message.id);
        console.log('msg is from : '+ message.from.id);

        appendMessage(`${message.data}`, 'agent');
        console.log('New message >>>>>>>>>>>>>>>>>>: '+ message.data);
    }

    // add event listener
    document.addEventListener(rainbowSDK.im.RAINBOW_ONNEWIMMESSAGERECEIVED, onNewMessageReceived)


    const messageContainer = document.getElementById('message-container')
    const messageForm = document.getElementById('send-container')
    const messageInput = document.getElementById('message-input')
    messageForm.addEventListener('submit', e=>{
        e.preventDefault()
        const message = messageInput.value
        if (message != ''){
            rainbowSDK.im.sendMessageToConversation(conversation_global, message);
            appendMessage(`${message}`, 'user')
            messageInput.value=''       
        }
    })


    function setAgentAvailabiliy(agent_id, availability){
        var requestOptions = {
            method: 'PUT',
            redirect: 'follow'
        };

        fetch(proxyurl+ setAvailabilituUrl + agent_id + '/availability/' + availability, requestOptions)
        .then(response => response.text())
        .then(result => console.log(result+'\n set ' + agent_id + ' to availability ' + availability))
        .catch(error => console.log('error', error));

    }

    function addInitPrompt(){
        $('.message-container').append("<li tabindex=\"1\">\
        <img class=\"agenthead\" src=\"./img/user_head.png\">\
        <form class=\"agent\" id=\"selection-box\">\
            Please Choose Language :\
            <select id=\"language\">\
                <option value=\"english\">English</option>\
                <option value=\"chinese\">Chinese</option>\
                <option value=\"malay\">Malay</option>\
            </select>\
            <br></br> \
            Please Choose Service :\
            <select id=\"service\">\
                <option value=\"insurance\">Insurance</option>\
                <option value=\"bank_statement\">Bank Statement</option>\
                <option value=\"fraud\">Fraud</option>\
            </select>\
            <br></br> \
            <button type=\"submit\" id=\"select-button\">Select</button>\
        </form>\
        </li>");
    }


    // Add HTML tags
    // sender: 'user' or 'agent'
    function appendMessage(message, sender){
        if (sender == 'agent'){
            console.log('sender is agent');
            $('.message-container').append('<li tabindex="1"><img class="agenthead" src="./img/user_head.png"><span class="agent">'+message+'</span><br></br></li>');
        }else if (sender == 'user'){
            console.log('sender is user' );
            $('.message-container').append('<li tabindex="1"><img class="userhead" src="./img/user_head.png"><span class="user">'+message+'</span><br></br></li>');
        }
        $('.menu .message-container').scrollTop(1000000000000);
    }




    var onWebRTCCallChanged = function onWebRTCCallChanged(event) {
        /* Listen to WebRTC call state change */
        let call = event.detail;

        if (call.status.value === "incommingCall") {
            console.log('new incoming call');

            if (call.remoteMedia === 3) {
                console.log('it is video call');
                // The incoming call is of type audio + video
                rainbowSDK.webRTC.answerInVideo(call);
                var result = rainbowSDK.webRTC.showLocalVideo();
                console.log('result is '+result);

                rainbowSDK.webRTC.showRemoteVideo(call);
                console.log('call answered');

            } else if (call.remoteMedia === 1) {
                console.log('it is audio call');
                rainbowSDK.webRTC.answerInAudio(call);
                console.log('call answered');
            }
        }
    };

    /* Subscribe to WebRTC call change */
    document.addEventListener(rainbowSDK.webRTC.RAINBOW_ONWEBRTCCALLSTATECHANGED, onWebRTCCallChanged)

    /* Listen to the SDK event RAINBOW_ONREADY */
    document.addEventListener(rainbowSDK.RAINBOW_ONREADY, onReady)

    /* Listen to the SDK event RAINBOW_ONLOADED */
    document.addEventListener(rainbowSDK.RAINBOW_ONLOADED, onLoaded)

    /* Load the SDK */
    rainbowSDK.load();
});