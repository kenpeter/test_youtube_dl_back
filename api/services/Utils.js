// https://stackoverflow.com/questions/31668911/correct-place-to-define-reusable-functions-in-sails-js
// https://stackoverflow.com/questions/18447434/what-services-would-one-add-to-the-api-services-folder-in-sails-js
var youtubedl = require('youtube-dl');
var Promise = require("bluebird");

module.exports.youtubedl_get_info = function (input) {
  return new Promise(function (resolve, reject){
    youtubedl.getInfo(input, function(err, info) {
      if (err) {
        reject(err);
      }  
      else
      {
        //console.log(info);
        resolve(info); 
      }  
    });    
  });
  
};
