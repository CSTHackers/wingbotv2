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
  statement: ""
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
  statement: ""
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
  statement: ""
};
var BigNerd= {
  count: 0,
  index:5,
  keywords: ["videogame", "videogames", "geek", "tv shows", "movies", "comics", "anime", "manga", "fiction", ""],
  questions:["What is your gaming platform of choice?", "Do you belong to any fandoms?"],
  subQuestions:["What multi-player game have you been playing the most?", "Why?"],
  answeredQuestions:[" In case you’re wondering about our gaming compatibility. If you’re ever up for a game, I’ve been playing a lot of # and will happily kick your ass any day of the week.",
                    " In case you’re wondering about our gaming compatibility, I’m currently available for (insert platforms here). Currently totally in love with (insert game here). (Insert person’s “why” in here.)"],
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
