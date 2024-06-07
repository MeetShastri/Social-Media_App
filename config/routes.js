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
};
