//Page to store the different categories of personalities that we have created
var jockGirl = {
  count: 0,
  index:1,
  keywords: ["sport", "sports", "club", "clubs","friends", "team","baseball", "football", "basketball", "beer", "pub", "bar" ],
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
  keywords: [""],
  questions:[],
  subQuestions:[],
  statement: ""
};
var Foodie ={
  count: 0,
  index:3,
  keywords: [""]
};
var STEMnerd= {
  count: 0,
  index:4,
  keywords: [""]
};
var BigNerd= {
  count: 0,
  index:5,
  keywords: [""]
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
  var poolsMentioned;
  for (var i =0; i<wordsArray.length; i++) {
    if(checkPersonalityType(wordsArray[i]) !==0) poolsMentioned.push(checkPersonalityType(wordsArray[i]));
  }
  return pool;
}

//split a string into words
function splitStringforKeys (message) {

  return array;
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
