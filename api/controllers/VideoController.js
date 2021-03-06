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

var glob = require("glob");
var exec = require('child_process').exec;


// module
// exports
module.exports = {
  // convert
	convert: function (req, res) {
	  var input = [
      "https://www.youtube.com/watch?v=C-eHiGqKsVY&list=PL5NkwhWJzVESbr6is7BYBwUuaJwMkuT-g&index=4",
      "https://www.youtube.com/watch?v=DrilFGojVFE&index=5&list=PL5NkwhWJzVESbr6is7BYBwUuaJwMkuT-g",
    ];

	  
	  Utils.youtubedl_get_info(input).then(function(infos){
	  
	    return Promise.each(infos, function(info) {
	    
	      return new Promise(function(resolve, reject) {
	      
	        var video_output = info._filename.replace(/[&\/\\#,+()$~%'":*?<>{}\ ]/g, "_");
          var audio_title = info.title;
          audio_title = audio_title.replace(/[&\/\\#,+()$~%'":*?<>{}\ ]/g, "_");
	      
	        var downloaded = 0;
      
          // fs file exist sync
          if (fs.existsSync(video_output)) {
            // fs state sync
            // video file
            // size
            downloaded = fs.statSync(video_output).size;
          }
	      
	        
	        var video = youtubedl(
            // pass youtube url
            info.webpage_url,
            // format
            ['--format=18'],
            // start that download
            { 
              start: downloaded, 
              cwd: __dirname + "/../../video",
              maxBuffer: Infinity
            }
          );
	        
	        // video info
          video.on('info', function(info) {
            console.log('Download started');
            console.log('filename: ' + video_output);

            // total size
            var total = info.size + downloaded;
            console.log('size: ' + total);

            if (downloaded > 0) {
              console.log('resuming from: ' + downloaded);
              console.log('remaining bytes: ' + info.size);
            }
          });
	      
	        video.pipe(fs.createWriteStream(__dirname + "/../../video/" + video_output, { flags: 'a' }));
	      
	        // video complete
          video.on('complete', function complete(info) {
            'use strict';
            console.log('filename: ' + video_output + ' already downloaded.');
            resolve();
          });
	      
	      
	        // end
	        video.on('end', function() {
	          console.log('Finished downloading! Start to convert to mp3');
        
            // https://stackoverflow.com/questions/42382561/how-to-resolve-this-promise-when-converting-to-mp3-is-completed-fluent-ffmpeg
            // https://github.com/fluent-ffmpeg/node-fluent-ffmpeg#savefilename-save-the-output-to-a-file
            // https://codedump.io/share/KVSJfXwwlRSI/1/nodejs--how-to-pipe---youtube-to-mp4-to-mp3
            var proc = new ffmpeg({source: "./video/" + video_output});

            // set
            proc.setFfmpegPath('/usr/bin/ffmpeg');
            
            // proc output
            proc.output("./audio/" + audio_title + ".mp3");
            
            // proc on error
            proc.on('error', function (err) {
	            console.log(err);
            });
	        
	          
	          proc.on('end', function () {
	            console.log("----- mp3 done! -----");
	            var param = {};
	            
	            // http://sailsjs.com/documentation/reference/waterline-orm/models/find
	            // https://stackoverflow.com/questions/22868420/how-do-i-handle-a-unique-field-in-sails
	            User.find({ userURL: info.uploader_url }).exec(function(error, userDoc) {
	              var userId = userDoc[0].id;
	            
	              // DB error
                if (error) {
                  return res.send(error, 500);
                }

                // User exists
                if (userDoc && userDoc.length) {
                  console.log("User already exists");
                  
                  Video.find({ youtube_id: info.id }).exec(function(error, videoDoc){
                  
                    if (error) {
                      return res.send(error, 500);
                    }  
                  
                    if(videoDoc.length) {
                      console.log("Video already exists");
                  
                      // !!!!!!!!!!!!!!!!!!!!!!!!!!!
                      resolve();
                    }
                    else {
                      // 
                      param = {
                        youtube_id: info.id,
                        duration: info.duration,
                        fulltitle: info.fulltitle,
                        view_count: info.view_count,
                        
                        description: info.description,
                        thumbnail: info.thumbnail,
                        url: info.url,
                        
                        owner: userId
                      };    
                      
                      Video.create(param).exec(function(error, user) {
                        if (error) {
                          return res.send(error, 500);
                        }
                        
                        console.log("New video is created");
                        
                        // !!!!!!!!!!!!!!!!!!!!!!!!!!!
                        resolve();
                      });
                      
                    }
                  
                  });
                  
	                
                }
                else {
                  // need to create user
                  User.create({ userURL: info.uploader_url }).exec(function(error, user) {

                    // DB error
                    if (error) {
                      return res.send(error, 500);
                    }

                    console.log("New user is created");

                    // Just create the video without checking......
                    param = {
                      youtube_id: info.id,
                      duration: info.duration,
                      fulltitle: info.fulltitle,
                      view_count: info.view_count,
                      
                      description: info.description,
                      thumbnail: info.thumbnail,
                      url: info.url,
                      
                      owner: userId
                    };    
                    
                    Video.create(param).exec(function(error, user) {
                      if (error) {
                        return res.send(error, 500);
                      }
                      
                      console.log("New video is created");
                      
                      // !!!!!!!!!!!!!!!!!!!!!!!!!!!
                      resolve();
                    });
                            
                  });
                  
                }
	            
	            });
	            
	              
	          });
	        
	          
	          // now run
            proc.run();  
	        
	        
	        });
	      
	      
	      });
	    
	    });

	  }).then(function(){
	    return res.send("convert all done.");
	  });
	  
  },
  
  
  
  
  push_audio: function (req, res) {
  
    // kill adb
    exec("adb kill-server", Utils.puts);

    // start adb
    exec("adb start-server", Utils.puts);

    //
    console.log("\nwait for 8s\n");
    
    var audio_path = __dirname + "/../../audio";
    
    // https://stackoverflow.com/questions/32604656/what-is-the-glob-character
    setTimeout(
      function() {
        glob(audio_path + "/**/*.mp3", function (er, files) {

          files.map(function(singleFile) {
            var arr = singleFile.split("/");
            var lastElement = arr[arr.length - 1];
            // https://stackoverflow.com/questions/441018/replacing-spaces-with-underscores-in-javascript
            // https://stackoverflow.com/questions/9705194/replace-special-characters-in-a-string-with-underscore
            var tmpFileName = lastElement.replace(/[&\/\\#,+()$~%'":*?<>{}\ ]/g, "_");
          
            //https://stackoverflow.com/questions/22504566/renaming-files-using-node-js
            var tmpFullFile = audio_path + "/"+ tmpFileName;
            fs.rename(singleFile, tmpFullFile, function(err) {
              if ( err ) console.log('ERROR: ' + err);
              
              var cmd = "adb push" + " " + tmpFullFile + " " + "/sdcard/Music";
              console.log(cmd);
              exec(cmd, Utils.puts);
            });
            
          }); // end files.map
          
        }); // end glob
      }, 
      8000
    );
    
  },
  
  
  push_video: function (req, res) {
  
    // kill adb
    exec("adb kill-server", Utils.puts);

    // start adb
    exec("adb start-server", Utils.puts);

    //
    console.log("\nwait for 8s\n");
    
    var audio_path = __dirname + "/../../video";
    
    // https://stackoverflow.com/questions/32604656/what-is-the-glob-character
    setTimeout(
      function() {
        glob(audio_path + "/**/*.mp4", function (er, files) {

          files.map(function(singleFile) {
            var arr = singleFile.split("/");
            var lastElement = arr[arr.length - 1];
            var tmpFileName = lastElement.replace(/[&\/\\#,+()$~%'":*?<>{}\ ]/g, "_");
          
            //https://stackoverflow.com/questions/22504566/renaming-files-using-node-js
            var tmpFullFile = audio_path + "/"+ tmpFileName;
            fs.rename(singleFile, tmpFullFile, function(err) {
              if ( err ) console.log('ERROR: ' + err);
              
              var cmd = "adb push" + " " + tmpFullFile + " " + "/sdcard/Movies";
              console.log(cmd);
              exec(cmd, Utils.puts);
            });
            
          }); // end files.map
          
        }); // end glob
      }, 
      8000
    );
  }
  
  
  
};

