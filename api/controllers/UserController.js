/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const bcrypt = require ('bcrypt');
const jwt = require ('jsonwebtoken');
const { totp } = require('otplib');
module.exports = {

  //Controller for User Sign Up
  userSignUp: async(req, res) => {
    const {firstName, lastName, email, password} = req.body;
    if(!firstName || !lastName || !email || !password){
      return res.status(404).json({
        message:'All fields are required'
      });
    }

    const showTableQuery = 'SHOW TABLES LIKE "User"';
    const showTableResult = await sails.sendNativeQuery(showTableQuery);
    if(showTableResult.rows.length === 0){
      const createTableQuery = `
        CREATE TABLE User(
            id INT AUTO_INCREMENT PRIMARY KEY,
            firstName VARCHAR(255) NOT NULL,
            lastName VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL
        )`; await sails.sendNativeQuery(createTableQuery);
    }

    const checkEmailQuery = 'SELECT email FROM User WHERE email = $1';
    const checkEmailParams = [email];
    const checkEmailResult = await sails.sendNativeQuery(checkEmailQuery, checkEmailParams);
    if(checkEmailResult.rows.length>0){
      return res.status(404).json({
        message:'User with this email ID is present please use another email ID'
      });
    }

    const createUserQuery = 'INSERT INTO User(firstName, lastName, email, password) VALUES ($1, $2, $3, $4)';
    const hashedPassword = await bcrypt.hash(password,10);
    const createUserParams = [firstName, lastName, email, hashedPassword];
    const createUserResult = await sails.sendNativeQuery(createUserQuery, createUserParams);
    if(createUserResult.affectedRows > 0){
      const id = createUserResult.insertId;
      const getUserQuery = 'SELECT * FROM User WHERE id = $1';
      const getUserParams = [id];
      const getUserResult = await sails.sendNativeQuery(getUserQuery, getUserParams);
      if(getUserResult.rows.length>0){
        return res.status(201).json({
          message:'User has been Signed In',
          userDetails: getUserResult.rows,
        });
      }
    }
  },

  //Controlller for User Sign In
  userSignIn: async (req, res) => {
    const { email, password } = req.body;
    const checkEmailQuery = 'SELECT * FROM User WHERE email = $1';
    const checkEmailParams = [email];
    const checkEmailResult = await sails.sendNativeQuery(checkEmailQuery, checkEmailParams);

    if (checkEmailResult.rows.length <= 0) {
      return res.status(404).json({
        message: 'Email Not found',
      });
    }

    const user = checkEmailResult.rows[0];
    const matchPassword = await bcrypt.compare(password, user.password);

    if (matchPassword) {
      const tokenObject = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      };

      const token =  jwt.sign(tokenObject, 'abcde', { expiresIn: '12hr' });


      const otp = totp.generate('secret');
      // sails.otpCache[email] = otp;
      sails.config.custom.otpCache[email] = otp;

      // Send OTP
      try {
        await sails.helpers.sendOtp.with({ email: user.email });
        return res.status(201).json({
          message: 'You are successfully Signed In!! OTP has been sent to your email.',
          tokenObject,
          token,
          otp
        });
      } catch (err) {
        return res.status(500).json({
          message: 'You are successfully Signed In but failed to send OTP.',
          tokenObject,
          token,
          error: err.message
        });
      }
    } else {
      return res.status(401).json({
        message: 'Invalid password',
      });
    }
  },

  //Controller for Getting user by ID
  getUserById: async(req, res) => {
    const id = req.params.userid;
    const getUserByIdQuery = 'select U.id as User_Id, U.firstName as First_Name, U.lastName as Last_Name, U.email as Email, U.password as Password, P.imageName as Image_Name, P.imagePath as ImagePath from User U left join Profilepic P on U.id = P.userId WHERE U.id = $1';
    const getUserByIdParams = [id];
    const getUserByIdResult = await sails.sendNativeQuery(getUserByIdQuery, getUserByIdParams);
    const user = getUserByIdResult.rows[0];
    if(getUserByIdResult.rows.length <= 0){
      res.status(404).json({
        message:'User with this ID is not found',
      });
    }
    else{
      return res.status(200).json({
        message:'User Details are as follows',
        user: user
      });
    }
  },

  //Controller for updating th User details
  updateUserDetails: async(req, res) => {
    const userid = req.params.userid;
    const {firstName, lastName, email} = req.body;
    let updateUserQuery = 'UPDATE User SET ';
    const updateUserParams = [];
    if(firstName){
      updateUserQuery += 'firstName = $1, ';
      updateUserParams.push(firstName);
    }
    if(lastName){
      updateUserQuery += 'lastName = $2, ';
      updateUserParams.push(lastName);
    }
    if(email){
      updateUserQuery += 'email = $3, ';
      updateUserParams.push(email);
    }
    updateUserQuery = updateUserQuery.slice(0, -2);
    const lengthOfArray = updateUserParams.length;
    updateUserQuery += ` WHERE id = $${lengthOfArray + 1}`;
    updateUserParams.push(userid);
    const updateResult = await sails.sendNativeQuery(updateUserQuery, updateUserParams);
    if(updateResult.affectedRows>0){
      const getUserByIdQuery = 'SELECT id, firstName, lastName, email FROM User WHERE id = $1';
      const getUserByIdParams = [userid];
      const getUserByIdResult = await sails.sendNativeQuery(getUserByIdQuery, getUserByIdParams);
      res.status(200).json({
        message:'User has been updated',
        updatedUser:getUserByIdResult.rows
      });
    }
  },

  //Controller for Recieving the OTP
  recieveOtp: async(req, res) => {
    const {email, otp} = req.body;
    const savedOtp = sails.config.custom.otpCache[email];
    if(savedOtp){
      if(savedOtp === otp){
        // delete sails.config.custom.otpCache[email];
        res.status(200).json({
          message:'OTP has been verified, You are successfully logged in!!!'
        });
      }
      else{
        res.status(400).json({
          message:'OTP is wrong pleases enter correct OTP'
        });
      }
    }
    else{
      return res.status(404).json({
        message: 'No OTP found for the provided email'
      });
    }
  },

  //Controller for Reset the Password
  userResetPassword: async(req, res) => {
    const {email, oldPassword, newPassword} = req.body;
    if(!email || !oldPassword || !newPassword){
      res.status(404).json({
        message:'All fields are required'
      });
    }
    const getUserByEmailQuery = 'SELECT *  FROM User WHERE email = $1';
    const getUserByIdEmailParams = [email];
    const getUserByEmailResult = await sails.sendNativeQuery(getUserByEmailQuery, getUserByIdEmailParams);
    const user = getUserByEmailResult.rows[0];
    if(getUserByEmailResult.rows.length<=0){
      res.status(404).json({
        message:'No User found with this Email ID',
      });
    }
    const passwordCheck = await bcrypt.compare( oldPassword, user.password);
    if(passwordCheck){
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      const changePasswordQuery = 'UPDATE User SET password = $1 WHERE email = $2';
      const changePasswordParams = [hashedNewPassword, email];
      const changePasswordResult = await sails.sendNativeQuery(changePasswordQuery, changePasswordParams);
      if(changePasswordResult.affectedRows > 0){
        return res.status(200).json({
          message:'Your Password has been reset successfully',
        });
      }
    }
    else{
      return res.status(404).json({
        message:'Old Password is not matching',
      });
    }
  },

  //Controller for Searching the users
  searchUsers: async (req, res) => {
    const searchTerm = req.query.q;
    if (!searchTerm) {
      return res.status(400).json({ message: 'Search term is required' });
    }

    const searchUsersQuery = `
      SELECT * FROM User 
      WHERE firstName LIKE $1 OR lastName LIKE $1 OR email LIKE $1
    `;
    const searchUsersParams = [`%${searchTerm}%`];

    try {
      const result = await sails.sendNativeQuery(searchUsersQuery, searchUsersParams);
      if(result.rows.length<=0){
        return res.status(400).json({
          message: 'No Users found',
        });
      }
      return res.status(200).json({
        message: 'Users retrieved successfully',
        users: result.rows
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Error retrieving users',
        error: error.message
      });
    }
  }

};

