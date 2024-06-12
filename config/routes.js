/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  'POST /user/usersignup' : 'UserController.userSignUp',
  'POST /user/usersignin' : 'UserController.userSignIn',
  'GET /user/getuserbyid/:userid' : 'UserController.getUserById',
  'PATCH /user/updateuser/:userid' : 'UserController.updateUserDetails',
  'POST /user/recieveotp' : 'UserController.recieveOtp',
  'POST /user/userresetpassword' : 'UserController.userResetPassword',
  'GET /user/searchuser' : 'UserController.searchUsers',

  'POST /post/addpost' : 'PostController.addPost',
  'GET /post/getpostbypostid/:postid' : 'PostController.getPostById',
  'GET /post/getpostbyauthorid/:authorid' : 'PostController.getPostByAuthorId',
  'PATCH /post/updatepost/:postid' : 'PostController.updatePost',
  'DELETE /post/deletepost/:postid' : 'PostController.deletePost',
  'GET /post/searchpost/' : 'PostController.searchPost',

  'POST /comment/addcomment' : 'CommentController.addComment',
  'GET /comment/getcomment/:postid' : 'CommentController.getCommentByPost',
  'PATCH /comment/updatecomment/:commentid' : 'CommentController.updateComment',
  'DELETE /comment/deletecomment/:commentid' : 'CommentController.deleteComment',
  'GET /comment/searchcomment' : 'CommentController.searchComment',

  'POST /friendrequest/sendrequest' : 'FriendrequestController.sendRequest',
  'POST /friendrequest/acceptrequest' : 'FriendrequestController.acceptRequest',
  'POST /friendrequest/declinerequest' : 'FriendrequestController.declineRequest',

  'POST /message/sendmessage' : 'MessageController.sendMessage',
  'GET /message/getmessage' : 'MessageController.getMessages',
  'PATCH /message/updatemessage/:messageid' : 'MessageController.updateMessage',
  'DELETE /message/deletemessage/:messageid' : 'MessageController.deleteMessage',

  'POST /profilepic/uploadprofilepic' : 'ProfilePicController.uploadProfilePic',
  'GET /profilepic/getprofilepic/:userid' : 'ProfilePicController.getProfilePic',
  'PATCH /profilepic/updateprofilepic/:userid' : 'ProfilePicController.updateProfilePic',
  'DELETE /profilepic/deleteprofilepic/:userid' : 'ProfilePicController.deleteProfilePic',
};
