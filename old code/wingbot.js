//Main File of wingbot

//user object to store information given
var user  = {
  name = "";
  gender ="";
  facts = {" "};
}

var stateOftheApp = {
  state = {0,0};
  userAnswer = "";
}

var openEndedQuestions = {"Tell me one interesting thing about yourself.",
                  "What can you do better than anyone else?",
                  "What do you do for fun?",
                  "empty string for test"};

//TODO: function that returns message when bot starts



//TODO: function that asks userName from the user
function getUserName () {
  sendMessage("Oh hey there, what’s your name?");
  var userName = getAnswer();
  user.name = userName;
  sendMessage("Hey "+userName+"! I’m Wingbot. Want some help writing your dating profile?");
  if (getAnswer()=="NO" || getAnswer()=="no") {
      sendMessage("Ok. But if you do, I’ll be around. Catch you later!");
      end();
  } else {
    chooseGender();
  }
}

//chooseGender function where 3 buttons are shown and the user chooses their prefered gender
function chooseGender() {
 var  message = {
      "attachment":{
          "type":"template",
          "payload":{
              "template_type":"button",
              "text":"Awesome! What gender speaks to you the most?",
              "buttons":[
              {
                "type":"postback",
                "title":"Male",
                "payload":"gender_Male"
              },
              {
                "type":"postback",
                "title":"Female",
                "payload":"gender_Female"
              }
              {
                "type":"postback",
                "title":"Dinousar",
                "payload":"gender_Neutral"
              }
              ]
          }
        }
  };
  stateOftheApp.state = {0,0};
  sendMessage(message);
  //try to see if it works putting this function here that calls the first open ended question:
  askOpenEndedQuestion();
}

//function called to get bot to give you one of the open ended questions:
function askOpenEndedQuestion() {
  stateOftheApp.state = {1,0};
  var random = Math.floor(Math.random() * openEndedQuestions.length());
  sendMessage(openEndedQuestions[random]);
  openEndedQuestions.splice(random, 1);
}



//TODO: sendMessage function
function sendMessage() {

}

//TODO: getAnswer() function
function getAnswer() {

}

//TODO: function where the app gets the webhook and gets either a message the user send or a payload!

/*
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page.
 * https://developers.facebook.com/docs/messenger-platform/implementation#subscribe_app_pages
 *
 */
app.post('/webhook', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object == 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;

      // Iterate over each messaging event
      pageEntry.messaging.forEach(function(messagingEvent) {
        if (messagingEvent.message) {
          receivedMessage(messagingEvent);
        } else if (messagingEvent.postback) {
          receivedPostback(messagingEvent);
        } else {
          console.log("Webhook received unknown messagingEvent: ", messagingEvent);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know you've
    // successfully received the callback. Otherwise, the request will time out.
    res.sendStatus(200);
  }
});

/*
 * Message Event
 *
 * This event is called when a message is sent to your page. The 'message'
 * object format can vary depending on the kind of message that was received.
 * Read more at https://developers.facebook.com/docs/messenger-platform/webhook-reference#received_message
 */
function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;
  // You may get a text or attachment but not both
  var messageText = message.text;

  //TODO:set up functions to process messagesRecieved
  if (messageText) {
    // If we receive a text message, check to see if it matches any special
    // keywords and send back the corresponding example. Otherwise, just echo
    // the text we received.
    switch (stateOftheApp.state[0]) {
      case 1:
        if (isNegative(messageText)) {
          sendMessage(yesOrNoButtons("This does not seem like a very positive fact about yourself, are you sure you do not want to change your answer?"));
        } else {
          user.facts.push(messageText);
        }

        user.facts.push(messageText);
        sendButtonMessage(senderID);
        break;

      case 'generic':
        sendGenericMessage(senderID);
        break;

      case 'receipt':
        sendReceiptMessage(senderID);
        break;

      default:
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

/*
 * Postback Event
 *
 * This event is called when a postback is tapped on a Structured Message. Read
 * more at https://developers.facebook.com/docs/messenger-platform/webhook-reference#postback
 *
 */
function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback
  // button for Structured Messages.
  var payload = event.postback.payload;

  if (stateOftheApp.state == {0,0}) user.gender = payload;
  else {
    if(payload == "Yes") sendMessage("Ok, then I will use this fact to write your About me.");
    else sendMessage("")
  }
  console.log("Received postback for user %d and page %d with payload '%s' " +
    "at %d", senderID, recipientID, payload, timeOfPostback);

  return payload;
  // When a postback is called, we'll send a message back to the sender to
  // let them know it was successful
  sendMessage(senderID, "Postback called");
}

//function that sends a yesorno buttons template to the user
function yesOrNoButtons(title) {
  var  message = {
       "attachment":{
           "type":"template",
           "payload":{
               "template_type":"button",
               "text":title,
               "buttons":[
               {
                 "type":"postback",
                 "title":"Yes",
                 "payload":"Yes"
               },
               {
                 "type":"postback",
                 "title":"No",
                 "payload":"No"
               }
               ]
           }
         }
   };
   sendMessage(message);
}


//TODO: end function, it collects data from the user
function end () {

}
