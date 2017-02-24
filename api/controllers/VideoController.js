/**
 * VideoController
 *
 * @description :: Server-side logic for managing videos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// checkout this example
// https://github.com/stefanbuck/sails-social-auth-example
var youtubedl = require('youtube-dl');
var fs = require('fs');
var ffmpeg = require('fluent-ffmpeg');
var Promise = require("bluebird");

var mongoose = require('mongoose');



// module
// exports
module.exports = {
	convert: function (req, res) {
	  var input = [
      "https://www.youtube.com/watch?v=C-eHiGqKsVY&list=PL5NkwhWJzVESbr6is7BYBwUuaJwMkuT-g&index=4",
      "https://www.youtube.com/watch?v=DrilFGojVFE&index=5&list=PL5NkwhWJzVESbr6is7BYBwUuaJwMkuT-g",
    ];
	
	  // db
	  mongoose.connect('mongodb://localhost/test_youtube_dl_back');
	  
	  // connect
	  var db = mongoose.connection;
	  
	  // error
	  db.on('error', console.error.bind(console, 'connection error:'));
	  
	  
	  Utils.youtubedl_get_info(input).then(function(infos){
	  
	    console.log(infos);
	  
	    return res.send('----- done ----');
	  });
	  
  },
  
  bye: function (req, res) {
    return res.redirect('http://www.sayonara.com');
  }
};

