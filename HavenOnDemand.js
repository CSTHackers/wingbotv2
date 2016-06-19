var havenondemand = require('havenondemand');
var client = new havenondemand.HODClient('5e3a9098-3935-43c2-ab2f-42d58fab0589');


function isNegative(message){
  var dataSentiment = {text:message};
  client.call('analyzesentiment',dataSentiment, function(err,resp,body){
    if(!err){
      var score = resp.body.aggregate.score;
      console.log("pre check");
      if(score > 0){
        //console.log('false')
        return false;
      }
      else{
        //console.log('true')
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
        var score = resp1.body.aggregate.score;
        if (score > 0) {

          var dataRelatedConcepts = dataSentiment;
          client.call('findrelatedconcepts', dataRelatedConcepts, function(err2, resp2, body2) {
            if (!err2) {
              //console.log('am i here 3?')
              var relatedConcepts =  resp2.body.entities;
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
