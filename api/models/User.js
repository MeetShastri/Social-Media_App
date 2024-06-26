/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    firstName:{
      type: 'string',
      required:true
    },
    lastName:{
      type: 'string',
      required:true
    },
    email:{
      type: 'string',
      required:true,
    },
    password:{
      type: 'string',
      required:true
    },
    posts: {
      collection: 'post',
      via: 'author',
    },
    sentRequests:{
      collection:'friendrequest',
      via: 'sender'
    },
    recievedRequests:{
      collection:'friendrequest',
      via: 'reciever'
    },
    sendMessage:{
      collection:'message',
      via:'sender'
    },
    recieveMessage:{
      collection:'message',
      via:'reciever'
    },
    profilePic:{
      collection:'profilepic',
      via:'userId'
    }
  },

};

