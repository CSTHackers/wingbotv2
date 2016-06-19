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
                  "Like most people, I’m a great listener: especially when it comes to #, and occasionally real people."
                  "Some days I wish I could be more #. Life goals. I know. I’m an idealist: what can I say?",
                  "I care a lot about #. Sure, the pay isn’t much but I get to feel like I’m saving the world. Go me!",
                  "To me, the best kind of conversation is a smart conversation. I’m always up for chatting about # any day of the week. Yes, people: I am asking you to talk nerdy to me."],
  statement: ""
};
var Foodie ={
  count: 0,
  index:3,
  keywords: [""],
  questions:["Do you have a favorite food?", "What’s the weirdest thing you’ve ever eaten?" ],
  subQuestions:["What is it?", ],
  answeredQuestions:["I love (insert favorite food). Take notes, if you want the way to my heart: it’s through my stomach.", ],
  statement: ""
};
var STEMnerd= {
  count: 0,
  index:4,
  keywords: [""],
  questions:[],
  subQuestions:[],
  answeredQuestions:[],
  statement: ""
};
var BigNerd= {
  count: 0,
  index:5,
  keywords: [""],
  questions:[],
  subQuestions:[],
  answeredQuestions:[],
  statement: ""
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
  for (var i =0; i<poolsMentioned.length; i++){
    var tempNum = poolsMentioned[i];
    for (var j =poolsMentioned.length; j >=0; j--) {
      if (j !== i) {
        if (poolsMentioned[j] === tempNum) repeated = tempNum;
      }
    }
  }
  return repeated;
}

//split a string into words
function splitStringforKeys (message) {
  var temp = new Array();
  temp = str.split(" ");
  for(var i = 0; i < temp.length(); i++){
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
