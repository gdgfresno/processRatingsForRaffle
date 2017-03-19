/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

app.get('/process', function(req, res) {
  var fs = require('fs');
  var ratingsText = fs.readFileSync('ratings.json', 'utf8');
  var ratingsJson = JSON.parse(ratingsText);

  var participants = [];
  Object.keys(ratingsJson).forEach(function(key) {
    var participant = ratingsJson[key];
    if (participant.email) {
      var generalSurveyCompleted = false;
      var sessionSurveyCompleted = 0;
      if (participant.sessions) {
        var sessionKeys = Object.keys(participant.sessions);
        var numSession = sessionKeys.length;
        generalSurveyCompleted = sessionKeys.indexOf('137') >= 0;
        sessionSurveyCompleted = generalSurveyCompleted ? numSession - 1 : numSession;
      }
      var part = {
        'email': participant.email,
        'name': participant.name || '',
        'generalSurvey': generalSurveyCompleted,
        'sessionSurvey': sessionSurveyCompleted
      }
      participants.push(part);
    }
  });
  participants.sort(
    function(a, b) {
      var nameA = a.name.toLowerCase(), nameB = b.name.toLowerCase();
      if (nameA < nameB) //sort string ascending
        return -1;
      if (nameA > nameB)
        return 1;
      return 0; //default return value (no sorting)
    }
  );

  fs.writeFile('raffleFeed.jsonp', 'participants=' + JSON.stringify(participants, null, 2), function (err) {
    if (err) {
      res.send(err);
    } else {
      res.send('Processing finished');
    }
  });
});

// Start server on the specified port and binding host
app.listen(5858, '0.0.0.0', function() {
  // Print a message when the server starts listening
  console.log('server starting on 5858');
});
