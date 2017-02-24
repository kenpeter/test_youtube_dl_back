/**
 * Video.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

// http://sailsjs.com/documentation/concepts/models-and-orm/associations/one-to-many
module.exports = {

  attributes: {
    youtube_id: {type: 'string'},
    duration: {type: 'string'},
    fulltitle: {type: 'string'},
    view_count: {type: 'number'},
    
    description: {type: 'string'},
    thumbnail: {type: 'string'},
    url: {type: 'string'},
   
    owner: {
      model: 'user'
    } 
  }
};

