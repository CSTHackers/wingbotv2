/* jshint esversion: 6 */

/* Nolan Begin */
var catKey = require('./categoriesKey.js');
//var wingbot = require('./wingbot.js');
var haven = require('./HavenOnDemand.js');

/* Nolan End */

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

/*LOGIC of the bot*/

//user object to store information given
var user  = {
  name: " ",
  gender:"",
  facts: [" "],
  answeredQuestions:  [" "]
};

var stateOftheApp = {
  state:[0,0],
  catPool:0,
  userAnswer: "",
  secondQuestion:0
};

var openEndedQuestions = ["Tell me one interesting thing about yourself.",
                  "What can you do better than anyone else?",
                  "What do you do for fun?"];

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
  var chosenPool = getObject(stateOftheApp.catPool);
  addVariableToString(answer, chosenPool.answeredQuestions[index]);
}

//substitute # for answer variable
function addVariableToString(answer, string) {
  return string.replace("#", answer);
}

var counterHell=0;
//chooseGender function where 3 buttons are shown and the user chooses their prefered gender
function chooseGender(event) {
  console.log("got to the chooseGender function");
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  sendButtonMessage(senderID);
  if (counterHell === 1) {
    stateOftheApp.state = [2,0];
    //try to see if it works putting this function here that calls the first open ended question:
    console.log("got to the chooseGender function");
  }
}

//function called to get bot to give you one of the open ended questions:
function askOpenEndedQuestion(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  if (stateOftheApp.state[0] === 1) stateOftheApp.state = [2,0];
  var random = Math.floor(Math.random() * openEndedQuestions.length);
  sendMessage(senderID,openEndedQuestions[random]);
  openEndedQuestions.splice(random, 1);
  console.log("state inside open Question" +stateOftheApp.state[0]);
}

function askKeyquestions(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  if (stateOftheApp.state[0] === 2) stateOftheApp.state = [3,0];
  var chosenPool = getObject(stateOftheApp.catPool);
  var random = Math.floor(Math.random() * chosenPool.questions.length);
  stateOftheApp.secondQuestion = random;
  sendMessage(senderID,chosenPool.questions[random]);
  chosenPool.questions.splice(random, 1);
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

  //console.log("Received message for user %d and page %d at %d with message:",
    //senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;

  console.log("message: "+messageText);
  if (messageText) {
    //sendMessage(senderID,messageText);
    //sendMessage(senderID, messageText);
    //console.log("after two echos");
    // If we receive a text message, check to see if it matches any special
    // keywords and send back the corresponding example. Otherwise, just echo
    // the text we received.
    switch (stateOftheApp.state[0]) {
      case 0:
        console.log("case 0");
        if(stateOftheApp.state[1] === 0) sendMessage(senderID,"Hey! I’m Wingbot. I can help you write your online dating Profile");
        if (messageText === "hello") {
              sendMessage(senderID,"What should I call you?");
              stateOftheApp.state[0] = 1;
        } else stateOftheApp.state[1] = 1;
        break;
      case 1:
        user.name = messageText;
        if (user.name === " ") {
            user.name = messageText;
            stateOftheApp.state[0] = 1;
        } else {
          sendMessage(senderID, "Nice to meet you "+messageText);
          chooseGender(event);
        }
        break;
      case 2:
      console.log("inside case 2");
      console.log("app state: "+stateOftheApp.state);
      console.log("message: "+messageText);
      counterHell = 0;
        if (stateOftheApp.state[1] === 0) {
          if (isNegative(messageText)) {
            sendMessage(senderID,"This does not seem like a very positive fact about yourself, are you sure you do not want to change your answer?");
            stateOftheApp.userAnswer = messageText;
          } else {
            if(stateOftheApp.state[0] === 2) sendMessage(senderID,getReaction());
            console.log(messageText);
            //user.facts.push(messageText);
            console.log("check if pool "+checkIfPool(messageText));
            stateOftheApp.catPool = checkIfPool(messageText);
            askKeyquestions(event);
          }
        } else {
          sendMessage(senderID,getReaction());
          user.facts.push(messageText);
          stateOftheApp.catPool = checkIfPool(messageText);
        }
        break;
      case 3:
        var chosenPool = getObject(stateOftheApp.catPool);
        if (stateOftheApp.state[1] === 0) {
          if (isNegative(messageText)) {
            //if first key question is not liked you get a random catPool num and ask question again
            stateOftheApp.catPool = Math.floor(Math.random() * 5)+1;
            askKeyquestions(event);
          } else {
            //if they like the first question we send the subquestion:
            stateOftheApp.state[1] = 1;
            sendMessage(senderID,chosenPool.subquestion[stateOftheApp.secondQuestion]);
          }
        } else {
          //if this is a repeat it means user is answering subquestion; we store the answeredQuestions and count++ to that pool
          sendMessage(senderID,getReaction());
          storeAnsweredQuestions(chosenPool.index, messageText);
          addPointsToPersonality(chosenPool.index);
          stateOftheApp.state[1] = 0;
          askKeyquestions(event);
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
    if(payload) {
      user.gender = payload;
      sendMessage(senderID, "Ok, "+payload+" pronouns it is!!");
      askOpenEndedQuestion(event);
    }


  console.log("Received postback for user %d and page %d with payload '%s' " +
    "at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to
  // let them know it was successful

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
          text: "Awesome! What gender speaks to you the most?",
          buttons:[{
            type: "postback",
            title: "Man",
            payload: "man"
          }, {
            type: "postback",
            title: "Woman",
            payload: "women"
          },{
            type: "postback",
            title: "Dinousar",
            payload: "dinousar"
          }]
        }
      }
    }
  };
  counterHell++;
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


var havenondemand = require('havenondemand');
var client = new havenondemand.HODClient('5e3a9098-3935-43c2-ab2f-42d58fab0589');


function isNegative(message){
  var dataSentiment = {text:message};
  client.call('analyzesentiment',dataSentiment, function(err,resp,body){
    if(!err){
      var score = resp.body.aggregate.score;
      console.log("negative check");
      if(score > 0){
        console.log("false");
        return false;
      }
      else{
        console.log("true");
        return true;
      }
    }
    else{
      //console.log("break")
    }
  });
}


function checkRelatedConcepts(message){
  var dataRelatedConcepts = {text: message};
  client.call('findrelatedconcepts', dataRelatedConcepts, function(err, resp, body){
    if(!err){
      var relatedConcepts = resp.body.entities;
      var conceptsArray = new Array(5);
      conceptsArray[0] = relatedConcepts[0];
      conceptsArray[1] = relatedConcepts[1];
      conceptsArray[2] = relatedConcepts[2];
      conceptsArray[3] = relatedConcepts[3];
      conceptsArray[4] = relatedConcepts[4];
      return conceptsArray;
    }
      // for (var i=0; i<5; i++) {
      //   var relatedConcept = relatedConcepts[i]
      //   var text = relatedConcept.text
      //   console.log(text)
      // }
  });
}

//Function takes in user response as a string
function callToAPI_check(textSentiments){
  var dataSentiment = {text: textSentiments};
  //Calls for use of sentiment analysis on data from callToAPI_check()
  // Tyler mentioned that you can reuse the function(err,resp,body), but I'll bother him
  // with a bigger problem down the line ¯\_(ツ)_/¯
    client.call('analyzesentiment', dataSentiment, function(err1, resp1, body1) {
      if (!err1) {
        // Will go down a nested chain from a .json file which is generated from the api
        // It pulls the decimal value associated with how high/low a particular phrase is rated
        var score = resp1.body1.aggregate.score;
        if (score > 0) {

          var dataRelatedConcepts = dataSentiment;
          client.call('findrelatedconcepts', dataRelatedConcepts, function(err2, resp2, body2) {
            if (!err2) {
              //console.log('am i here 3?')
              var relatedConcepts =  resp2.body2.entities;
              for (var i=0; i<relatedConcepts.length; i++) {
                var relatedConcept = relatedConcepts[i];
                var text = relatedConcept.text;
                console.log(text);
              }
            }
          });
        }
      }
    });
}

//Page to store the different categories of personalities that we have created
var jockGirl = {
  count: 0,
  index:1,
  keywords: ["sport", "sports", "club", "clubs","friends", "team","baseball", "football", "basketball", "beer", "pub", "bar", "playing", "play", "running", "exercise", "training"],
  questions: ["Do you like watching sports?", "Do you play any sports?", "Are you part of the club scene?", "Do you lift?", "Can you run more than a mile without stopping?"],
  subQuestions: ["Who do you root for?", "Which are your favorites?", "Which one do you go to most often?", "How much?", "How much more?"],
  answeredQuestions:["Yes, I am a huge # fan and I’m not ashamed of it. If you root for another team, I won’t judge you for it. Much.",
                    "I’m definitely a competitive sort and actively play #. Some of them I do it for fun, but the bragging rights don’t hurt either.",
                    "Do I have moves like Jagger? Possibly. Come out with me to # and find out sometime.",
                    "If you’re looking for me, you’ll probably find me at the gym lifting 1/4 of my body weight. And before you ask, no I’m not telling how much that is.",
                    "Oh yes, and if you want to go running, I’d love to try and keep up with you. At least for the first # miles that is."],
  statement: "In short: looking to take on everything life has to offer. Let me know if you’re in."
};
var NPRnerd = {
  count: 0,
  index:2,
  keywords: ["politics", "literature", "books", "book", "biographies", "black lives matter", "volunteer", "social justice", "show", "podcasts", "shows"],
  questions:["Do you like reading?", "Do you listen to radio shows or podcasts?", "Who do you look up to?", "Are you passionate about a particular cause?",
              "Do you enjoy having academic conversations with other people?"],
  subQuestions:["What are some of the books made it onto your shelf?", "Which ones do you tune into regularly?", "Why?", "Which ones?", "What subjects do you enjoy talking about the most?"],
  answeredQuestions:["I am an avid reader. If you look on my shelf you can find # among other favorites. There’s always room for more though: send me all your recommendations!",
                  "Like most people, I’m a great listener: especially when it comes to #, and occasionally real people.",
                  "Some days I wish I could be more #. Life goals. I know. I’m an idealist: what can I say?",
                  "I care a lot about #. Sure, the pay isn’t much but I get to feel like I’m saving the world. Go me!",
                  "To me, the best kind of conversation is a smart conversation. I’m always up for chatting about # any day of the week. Yes, people: I am asking you to talk nerdy to me."],
  statement: "In short: nerd out with me a bit and let’s see where this goes."
};
var Foodie ={
  count: 0,
  index:3,
  keywords: ["food", "foods", "chef", "chefs", "chocolate", "restaurant", "dine out", "dining", "food truck", "vegan", "vegetarian", "eat", "ate", "cooking", "cook", "bake", "bakery", "baked goods"],
  questions:["Do you have a favorite food?", "What’s the weirdest thing you’ve ever eaten?", "What are some of your favorite restaurants?", "Do you follow any celebrity chefs?", "Do you cook or bake at home?"],
  subQuestions:["What is it?", "I’ve never heard of that. Can you send me a Wikipedia link?", "If you could only pick one, which will it be?", "Which one is your favorite?", "What is the house specialty?" ],
  answeredQuestions:["I love (insert favorite food). Take notes, if you want the way to my heart: it’s through my stomach.",
                    "Fun fact: I also once ate a #. I know, I know. It’s strange. But the tongue wants what it wants. Google the images if you are brave!",
                    " I’m always open to trying new places, but I can get enough of #. If you’ve been there, you know what I’m talking about. If not: prepare yourself for a whole new world of delicious.",
                    " I find people cooking food kind of awesome. Just set me up with a TV, turn on some # and you’ll have me salivating in seconds.",
                    "Yes, I do have a kitchen and I’m not afraid to use it. If you’re lucky enough, I’ll make you a # but be warned: I don’t just make it for anyone."],
  statement: "In short: feed me. I will totally love you for it."
};
var STEMnerd= {
  count: 0,
  index:4,
  keywords: ["science", "nerd", "code", "tech", "technology", "bot", "API", "experiments", "logic", "apps", "engineering", "school", "puzzles", "math", "scientists", "doctor"],
  questions:["Are you a scientist, doctor, or engineer?", "Do you follow any celebrity scientists?", "Have you ever survived a hackathon?", "Do you have a favorite gadget?",
            "Do you enjoy math and calculus courses?"],
  subQuestions:["What’s is your area of specialty?", "Which ones are your favorites?" ,"What did you make?", "What is it?", "What was your latest favorite course?"],
  answeredQuestions:["In my professional life I am a #. My parents are definitely proud of me. My wallet however is another story.",
                    "I’m a huge fan of science. # is my god. Yes, I am a nerd. Live it. Love it. Embrace it.",
                    " Fun fact: I’ve been to a hackathon and survived it on free food, caffeine, and no shortage of goodwill. Managed to build a # to boot as well. If you’re at all curious, you can message and I would love to show it to you!", "SI have to admit, I’m also in love with my #. If this causes any problems in our potential relationship, I apologize in advance.",
                    "I’ll admit, I do find numbers a bit sexy. Like # sexy. And yet, in spite of all that, I probably could still use some help getting my taxes done. Oh well."],
  statement: "In short: let’s find out if this whole love thing can work out between us. For science."
};
var BigNerd= {
  count: 0,
  index:5,
  keywords: ["videogame", "videogames", "geek", "tv shows", "movies", "comics", "anime", "manga", "fiction", ""],
  questions:["What is your gaming platform of choice?", "Do you belong to any fandoms?","Are you into any board games?","What is your favorite genre?", "Do you visit any sort of geeky convention?"],
  subQuestions:["What multi-player game have you been playing the most?", "What are your top three?","Which one do you play the most?" ,"What was the book, movie, TV show that got you into it?", "Which one do you like attending the most?"],
  answeredQuestions:[" In case you’re wondering about our gaming compatibility. If you’re ever up for a game, I’ve been playing a lot of # and will happily kick your ass any day of the week.",
                    "Just in case you haven’t guessed, I am indeed a thoroughbred geek. Hit me up with your gifs, fanfiction or references, I will gladly take anything related to #.",
                    "Tabletop is definitely one of the places I feel most at home, especially when I break out my copy of #. Sure, I know it might not be for, but for me it’s an awesome way to find people to roll with.", " If I had to describe my primary geekdom, I’d probably classify myself as a super geek. Personally, I blame # for the addiction.",
                    "If you’re looking for me during the con season, you’ll probably find me at # making new friends and having the time of my life. And in case you’re wondering, yes: the con flu is always worth it."],
  statement: "In short: I’m looking for my player two or, if you’re quick enough, my player one. ;)"
};

//check if input matches any personality type, return that index
function checkPersonalityType (keyword) {
   if(matchKeywords(keyword, jockGirl)) return jockGirl.index;
   if(matchKeywords(keyword, NPRnerd)) return NPRnerd.index;
   if(matchKeywords(keyword, Foodie)) return Foodie.index;
   if(matchKeywords(keyword, STEMnerd)) return STEMnerd.index;
   if(matchKeywords(keyword, BigNerd)) return BigNerd.index;
   else return 0;
}

//returns boolean true/false if the object passed has keys that matches the keyword
function matchKeywords(keyword, object) {
    if(object.keywords.find(keyword) === undefined) return false;
    else return true;
}

//add a keyword to each pool
function addKeytoPersonalityPool(keyword,poolId) {
    switch (poolId) {
      case 1: jockGirl.keywords.push(keyword);  break;
      case 2: NPRnerd.keywords.push(keyword); break;
      case 3: Foodie.keywords.push(keyword); break;
      case 4: STEMnerd.keywords.push(keyword); break;
      case 5: BigNerd.keywords.push(keyword); break;
      default: return 0;
    }
}

//function grabs keywords from messages and returns index of the keyPool
function checkIfPool(message) {
  var wordsArray = splitStringforKeys(message);
  var poolsMentioned = new Array();
  var repeated = 0;
  for (var i =0; i<wordsArray.length; i++) {
    if(checkPersonalityType(wordsArray[i]) !==0) poolsMentioned.push(checkPersonalityType(wordsArray[i]));
  }
  for (var k =0; i<poolsMentioned.length; i++){
    var tempNum = poolsMentioned[k];
    for (var j =poolsMentioned.length; j >=0; j--) {
      if (j !== k) {
        if (poolsMentioned[j] === tempNum) repeated = tempNum;
      }
    }
  }
  return repeated;
}

//split a string into words
function splitStringforKeys (message) {
  var temp = new Array();
  temp = message.split(" ");
  for(var i = 0; i < temp.length; i++){
     if(temp[i] === "." || temp[i] === "," || temp[i] === "!") temp.splice(i,1);
  }
  return temp;
}

function getObject(index) {
  switch (index) {
    case 1: return jockGirl;
    case 2: return NPRnerd;
    case 3: return Foodie;
    case 4: return STEMnerd;
    case 5: return BigNerd;
    default: return 0;
  }
}

//give add a count
function addPointsToPersonality (poolId) {
  switch (poolId) {
    case 1: jockGirl.count++;  break;
    case 2: NPRnerd.count++; break;
    case 3: Foodie.count++; break;
    case 4: STEMnerd.count++; break;
    case 5: BigNerd.count++; break;
    default: return 0;
  }
}
