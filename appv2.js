/* jshint node: true, devel: true */
'use strict';
/*
Connections to the API Facebook Starts here:
 */

const
  bodyParser = require('body-parser'),
  config = require('config'),
  crypto = require('crypto'),
  express = require('express'),
  https = require('https'),
  request = require('request');

var app = express();

app.set('port', process.env.PORT || 5000);
app.use(bodyParser.json({ verify: verifyRequestSignature }));
app.use(express.static('public'));

/* Nolan Begin */
//var HavenOnDemand = require('./HavenOnDemand.js')
var catKey = require('./oldCode/categoriesKey.js');
//var wingbot = require('./wingbot.js');
var haven = require('./oldCode/HavenOnDemand.js');

/* Nolan End */

/*
 * Be sure to setup your config values before running this code. You can
 * set them using environment variables or modifying the config file in /config.
 *
 */

// App Secret can be retrieved from the App Dashboard
const APP_SECRET = (process.env.MESSENGER_APP_SECRET) ?
  process.env.MESSENGER_APP_SECRET :
  config.get('appSecret');

// Arbitrary value used to validate a webhook
const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) ?
  (process.env.MESSENGER_VALIDATION_TOKEN) :
  config.get('validationToken');

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
  (process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
  config.get('pageAccessToken');

if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN)) {
  console.error("Missing config values");
  process.exit(1);
}

/*
 * Use your own validation token. Check that the token used in the Webhook
 * setup is the same token used here.
 *
 */


app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === VALIDATION_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});

/*
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page.
 * https://developers.facebook.com/docs/messenger-platform/implementation#subscribe_app_pages
 *
 */

 /*LOGIC of the bot*/

 //user object to store information given
 var user  = {
   name: "",
   gender:"",
   facts:[" "],
   answeredQuestions: [""]
 };

 var stateOftheApp = {
   state:[0,0],
   catPool:0,
   userAnswer: "",
   secondQuestion:0
 };

 var openEndedQuestions = ["Tell me one interesting thing about yourself.",
                   "What can you do better than anyone else?",
                   "What do you do for fun?",
                   "empty string for test"];

 var manReactions = ["That’s cool bro.", "Awesome dude!", "Totally hardcore."];
 var girlReactions = ["That’s cute. I like that!", "Awww. That’s adorable.", "You go girl!"];
 var dinosaurReactions = ["Rawr!","That’s killer.", "You’ve got good mating instincts."];

 function getReaction() {
   switch (user.gender) {
     case "male" : return manReactions[Math.floor(Math.random() * 3)];
     case "female": return girlReactions[Math.floor(Math.random() * 3)];
     case "neutral": return dinosaurReactions[Math.floor(Math.random() * 3)];
   }
 }

 function storeAnsweredQuestions (index, answer) {
   var chosenPool = catKey.getObject(stateOftheApp.catPool);
   addVariableToString(answer, chosenPool.answeredQuestions[index]);
 }

 //substitute # for answer variable
 function addVariableToString(answer, string) {
   return string.replace("#", answer);
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
                 "payload":"male"
               },
               {
                 "type":"postback",
                 "title":"Female",
                 "payload":"female"
               },
               {
                 "type":"postback",
                 "title":"Dinousar",
                 "payload":"neutral"
               }
               ]
           }
         }
   };
   stateOftheApp.state = [0,0];
   sendMessage(message);
   //try to see if it works putting this function here that calls the first open ended question:
   askOpenEndedQuestion();
 }

 //function called to get bot to give you one of the open ended questions:
 function askOpenEndedQuestion() {
   if (stateOftheApp.state[0] === 0) stateOftheApp.state = [1,0];
   var random = Math.floor(Math.random() * openEndedQuestions.length());
   sendMessage(openEndedQuestions[random]);
   openEndedQuestions.splice(random, 1);
 }

 function askKeyquestions() {
   if (stateOftheApp.state[0] === 1) stateOftheApp.state = [2,0];
   var chosenPool = catKey.getObject(stateOftheApp.catPool);
   var random = Math.floor(Math.random() * chosenPool.questions.length());
   stateOftheApp.secondQuestion = random;
   sendMessage(chosenPool.questions[random]);
   chosenPool.questions.splice(random, 1);
 }

//TODO: function that returns message when bot starts
//sendMessage("Oh hey there, what’s your name?");

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
        if (messagingEvent.optin) {
          receivedAuthentication(messagingEvent);
        } else if (messagingEvent.message) {
          receivedMessage(messagingEvent);
        } else if (messagingEvent.delivery) {
          receivedDeliveryConfirmation(messagingEvent);
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
 * Verify that the callback came from Facebook. Using the App Secret from
 * the App Dashboard, we can verify the signature that is sent with each
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
function verifyRequestSignature(req, res, buf) {
  var signature = req.headers["x-hub-signature"];

  if (!signature) {
    // For testing, let's log an error. In production, you should throw an
    // error.
    console.error("Couldn't validate the signature.");
  } else {
    var elements = signature.split('=');
    var method = elements[0];
    var signatureHash = elements[1];

    var expectedHash = crypto.createHmac('sha1', APP_SECRET)
                        .update(buf)
                        .digest('hex');

    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

/*
 * Authorization Event
 *
 * The value for 'optin.ref' is defined in the entry point. For the "Send to
 * Messenger" plugin, it is the 'data-ref' field. Read more at
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference#auth
 *
 */
function receivedAuthentication(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfAuth = event.timestamp;

  // The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
  // The developer can set this to an arbitrary value to associate the
  // authentication callback with the 'Send to Messenger' click event. This is
  // a way to do account linking when the user clicks the 'Send to Messenger'
  // plugin.
  var passThroughParam = event.optin.ref;

  console.log("Received authentication for user %d and page %d with pass " +
    "through param '%s' at %d", senderID, recipientID, passThroughParam,
    timeOfAuth);

  // When an authentication is received, we'll send a message back to the sender
  // to let them know it was successful.
  sendMessage(senderID, "Authentication successful");
}


/*
 * Message Event
 *
 * This event is called when a message is sent to your page. The 'message'
 * object format can vary depending on the kind of message that was received.
 * Read more at https://developers.facebook.com/docs/messenger-platform/webhook-reference#received_message
 *
 * For this example, we're going to echo any text that we get. If we get some
 * special keywords ('button', 'generic', 'receipt'), then we'll send back
 * examples of those bubbles to illustrate the special message bubbles we've
 * created. If we receive a message with an attachment (image, video, audio),
 * then we'll simply confirm that we've received the attachment.
 *
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
  var messageAttachments = message.attachments;


  if (messageText) {

    // If we receive a text message, check to see if it matches any special
    // keywords and send back the corresponding example. Otherwise, just echo
    // the text we received.
    switch (stateOftheApp.state[0]) {
      case 0:
        user.name = messageText;
        sendMessage("Hey "+user.name+"! I’m Wingbot. I can help you write your online dating Profile");
        chooseGender();
        break;
      case 1:
        if (stateOftheApp.state[1] === 0) {
          if (haven.isNegative(messageText)) {
            sendMessage(yesOrNoButtons("This does not seem like a very positive fact about yourself, are you sure you do not want to change your answer?"));
            stateOftheApp.userAnswer = messageText;
          } else {
            getReaction();
            user.facts.push(messageText);
            stateOftheApp.catPool = catKey.checkIfPool(messageText);
            askKeyquestions();
          }
        } else {
          getReaction();
          user.facts.push(messageText);
          stateOftheApp.catPool = catKey.checkIfPool(messageText);
        }
        break;
      case 2:
        var chosenPool = catKey.getObject(stateOftheApp.catPool);
        if (stateOftheApp.state[1] === 0) {
          if (haven.isNegative(messageText)) {
            //if first key question is not liked you get a random catPool num and ask question again
            stateOftheApp.catPool = Math.floor(Math.random() * 5)+1;
            askKeyquestions();
          } else {
            //if they like the first question we send the subquestion:
            stateOftheApp.state[1] = 1;
            sendMessage(chosenPool.subquestion[stateOftheApp.secondQuestion]);
          }
        } else {
          //if this is a repeat it means user is answering subquestion; we store the answeredQuestions and count++ to that pool
          getReaction();
          storeAnsweredQuestions(chosenPool.index, messageText);
          catKey.addPointsToPersonality(chosenPool.index);
          stateOftheApp.state[1] = 0;
          askKeyquestions();
        }
        break;

      case 3:
        sendReceiptMessage(senderID);
        break;

      default:
        sendMessage(senderID, "Excuse I did not quite get that, can you repeat?");
    }
  }
}


/*
 * Delivery Confirmation Event
 *
 * This event is sent to confirm the delivery of a message. Read more about
 * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference#message_delivery
 *
 */
function receivedDeliveryConfirmation(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var delivery = event.delivery;
  var messageIDs = delivery.mids;
  var watermark = delivery.watermark;
  var sequenceNumber = delivery.seq;

  if (messageIDs) {
    messageIDs.forEach(function(messageID) {
      console.log("Received delivery confirmation for message ID: %s",
        messageID);
    });
  }

  console.log("All message before %d were delivered.", watermark);
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

  switch (stateOftheApp.state[0]) {
    case 0:
      user.gender = payload;
      break;
    case 1:
      if(payload == "Yes") {
        sendMessage("Ok, then I will use this fact to write your About me.");
        user.facts.push(stateOftheApp.userAnswer);
      } else {
        stateOftheApp.state = [1,1];
      }
  }

  console.log("Received postback for user %d and page %d with payload '%s' " +
    "at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to
  // let them know it was successful
  sendMessage(senderID, "Postback called");
}


/*
 * Send a message with an using the Send API.
 *
 */
function sendImageMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: "http://i.imgur.com/zYIlgBl.png"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a text message using the Send API.
 *
 */
function sendMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a button message using the Send API.
 *
 */
function sendButtonMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "This is test text",
          buttons:[{
            type: "web_url",
            url: "https://www.oculus.com/en-us/rift/",
            title: "Open Web URL"
          }, {
            type: "postback",
            title: "Call Postback",
            payload: "Developer defined postback"
          }]
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a Structured Message (Generic Message type) using the Send API.
 *
 */
function sendGenericMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "rift",
            subtitle: "Next-generation virtual reality",
            item_url: "https://www.oculus.com/en-us/rift/",
            image_url: "http://messengerdemo.parseapp.com/img/rift.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "touch",
            subtitle: "Your Hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",
            image_url: "http://messengerdemo.parseapp.com/img/touch.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble",
            }]
          }]
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a receipt message using the Send API.
 *
 */
function sendReceiptMessage(recipientId) {
  // Generate a random receipt ID as the API requires a unique ID
  var receiptId = "order" + Math.floor(Math.random()*1000);

  var messageData = {
    recipient: {
      id: recipientId
    },
    message:{
      attachment: {
        type: "template",
        payload: {
          template_type: "receipt",
          recipient_name: "Peter Chang",
          order_number: receiptId,
          currency: "USD",
          payment_method: "Visa 1234",
          timestamp: "1428444852",
          elements: [{
            title: "Oculus Rift",
            subtitle: "Includes: headset, sensor, remote",
            quantity: 1,
            price: 599.00,
            currency: "USD",
            image_url: "http://messengerdemo.parseapp.com/img/riftsq.png"
          }, {
            title: "Samsung Gear VR",
            subtitle: "Frost White",
            quantity: 1,
            price: 99.99,
            currency: "USD",
            image_url: "http://messengerdemo.parseapp.com/img/gearvrsq.png"
          }],
          address: {
            street_1: "1 Hacker Way",
            street_2: "",
            city: "Menlo Park",
            postal_code: "94025",
            state: "CA",
            country: "US"
          },
          summary: {
            subtotal: 698.99,
            shipping_cost: 20.00,
            total_tax: 57.67,
            total_cost: 626.66
          },
          adjustments: [{
            name: "New Customer Discount",
            amount: -50
          }, {
            name: "$100 Off Coupon",
            amount: -100
          }]
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Call the Send API. The message data goes in the body. If successful, we'll
 * get the message id in a response
 *
 */
function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s",
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });
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


// Start server
// Webhooks must be available via SSL with a certificate signed by a valid
// certificate authority.
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

module.exports = app;
