/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  // http://sailsjs.com/documentation/concepts/models-and-orm/associations/one-to-many
  attributes: {
    userURL: { type: 'string' },
    
    videos: {
      collection: 'video',
      via: 'owner'
    }
  }
};

