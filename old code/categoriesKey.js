//Page to store the different categories of personalities that we have created
var jockGirl = {
  count: 0,
  index:1,
  keywords: ["sport", "sports", "club", "clubs","friends", "team","baseball", "football", "basketball", "beer", "pub", "bar" ]
};
var NPRnerd = {
  count: 0,
  index:2,
  keywords: [""]
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
}

//returns boolean true/false if the object passed has keys that matches the keyword
function matchKeywords(keyword, object) {
    if(object.keywords.find(keyword) == undefined) return false;
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

//give add a count
function (poolId) {
  switch (poolId) {
    case 1: jockGirl.count++;  break;
    case 2: NPRnerd.count++; break;
    case 3: Foodie.count++; break;
    case 4: STEMnerd.count++; break;
    case 5: BigNerd.count++; break;
    default: return 0;
  }
}
