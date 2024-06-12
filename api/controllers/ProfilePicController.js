/**
 * ProfilePicController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const path = require('path');
module.exports = {

  uploadProfilePic: async(req, res) => {
    req.file('image').upload({
      dirname: path.resolve(sails.config.appPath, 'assets/images')
    }, async (err, uploadedFiles) => {
      if (err) { return res.serverError(err); }

      if (uploadedFiles.length === 0) { return res.badRequest('No file was uploaded'); }

      const file = uploadedFiles[0];
      const imagePath = '/images/' + path.basename(file.fd);
      const {imageName, userId} = req.body;
      if(!imageName || !userId){
        return res.status(400).json({
          message:'Image Name and UserId are required'
        });
      }
      const showTableQuery = 'SHOW TABLES LIKE "Profilepic"';
      const showTableResult = await sails.sendNativeQuery(showTableQuery);
      if (showTableResult.rows.length === 0) {
        const createTableQuery = `
          CREATE TABLE Profilepic(
              id INT AUTO_INCREMENT PRIMARY KEY,
              imageName VARCHAR(255) NOT NULL,
              userId INT NOT NULL,
              imagePath VARCHAR(255) NOT NULL          
          )`;
        await sails.sendNativeQuery(createTableQuery);
      }

      const insertProfilePicQuery = `INSERT INTO Profilepic (imageName, userId, imagePath) VALUES ($1, $2, $3)`;
      const insertProfilePicParams = [imageName, userId, imagePath];
      const insertProfilePicResult = await sails.sendNativeQuery(insertProfilePicQuery, insertProfilePicParams);
      const id = insertProfilePicResult.insertId;
      if(insertProfilePicResult.affectedRows>0){
        const getProfilePicQuery = 'SELECT * FROM Profilepic WHERE id = $1';
        const getProfilePicParams = [id];
        const getProfilePicResult = await sails.sendNativeQuery(getProfilePicQuery, getProfilePicParams);
        return res.status(200).json({
          message:'Profile Pic has been uploaded successfully',
          ProfilePic: getProfilePicResult.rows[0],
        });
      }
      else{
        return res.status(400).json({
          message:'Profile Pic is not uploaded',
        });
      }
    });
  },

  getProfilePic: async(req, res) => {
    const userid = req.params.userid;
    const findProfilePicQuery = 'SELECT * FROM Profilepic WHERE userId = $1';
    const findProfilePicParams = [userid];
    const findProfilePicResult = await sails.sendNativeQuery(findProfilePicQuery, findProfilePicParams);
    if(findProfilePicResult.rows.length<=0){
      return res.status(404).json({
        message:'No Profile Pic for this User',
      });
    }
    else{
      return res.status(200).json({
        message:'Profile Pic for this User is as follows',
        ProfilePic: findProfilePicResult.rows[0],
      });
    }
  },

  updateProfilePic: async(req, res) => {
    const userId = req.params.userid;
    if (!userId) {
      return res.status(400).json({
        message: 'User ID is necessary',
      });
    }

    const findProfilePicQuery = 'SELECT * FROM Profilepic WHERE userId = $1';
    const findProfilePicParams = [userId];
    const findProfilePicResult = await sails.sendNativeQuery(findProfilePicQuery, findProfilePicParams);

    if (findProfilePicResult.rows.length <= 0) {
      return res.status(404).json({
        message: 'No Profile Pic for this User',
      });
    }

    req.file('image').upload({
      dirname: path.resolve(sails.config.appPath, 'assets/images')
    }, async (err, uploadedFiles) => {
      if (err) {
        return res.serverError(err);
      }

      let imagePath = null;
      let imageName = req.body.imageName || null;

      if (uploadedFiles.length > 0) {
        const file = uploadedFiles[0];
        imagePath = '/images/' + path.basename(file.fd);
      }

      if (!imagePath && !imageName) {
        return res.badRequest('No file or image name was provided for update');
      }

      let updateProfilePicQuery = 'UPDATE Profilepic SET ';
      const updateProfilePicParams = [];

      if (imagePath) {
        updateProfilePicParams.push(imagePath);
        updateProfilePicQuery += `imagePath = $${updateProfilePicParams.length}, `;
      }

      if (imageName) {
        updateProfilePicParams.push(imageName);
        updateProfilePicQuery += `imageName = $${updateProfilePicParams.length}, `;
      }

      // Remove the trailing comma and space
      updateProfilePicQuery = updateProfilePicQuery.slice(0, -2);

      updateProfilePicParams.push(userId);
      updateProfilePicQuery += ` WHERE userId = $${updateProfilePicParams.length}`;

      const updateProfilePicResult = await sails.sendNativeQuery(updateProfilePicQuery, updateProfilePicParams);

      if (updateProfilePicResult.affectedRows > 0) {
        const getUpdatedProfilePicQuery = 'SELECT * FROM Profilepic WHERE userId = $1';
        const getUpdatedProfilePicParams = [userId];
        const getUpdatedProfilePicResult = await sails.sendNativeQuery(getUpdatedProfilePicQuery, getUpdatedProfilePicParams);

        return res.status(200).json({
          message: 'Profile Pic has been Updated Successfully',
          UpdatedProfilePic: getUpdatedProfilePicResult.rows[0],
        });
      } else {
        return res.status(400).json({
          message: 'Profile Pic has not been Updated',
        });
      }
    });
  },

  deleteProfilePic: async(req, res) => {
    const userId = req.params.userid;
    if(!userId){
      return res.status(400).json({
        message:'User ID is necessary',
      });
    }
    const findProfilePicQuery = 'SELECT * FROM Profilepic WHERE userId = $1';
    const findProfilePicParams = [userId];
    const findProfilePicResult = await sails.sendNativeQuery(findProfilePicQuery, findProfilePicParams);
    if(findProfilePicResult.rows.length<=0){
      return res.status(404).json({
        message:'No Profile Pic for this User',
      });
    }
    else{
      const findProfilePicQuery = 'SELECT * FROM Profilepic WHERE userId = $1';
      const findProfilePicParams = [userId];
      const findProfilePicResult = await sails.sendNativeQuery(findProfilePicQuery, findProfilePicParams);
      const deleteProfilePicQuery = 'DELETE FROM Profilepic WHERE userId = $1';
      const deleteProfilePicParams = [userId];
      const deleteProfilePicResult = await sails.sendNativeQuery(deleteProfilePicQuery, deleteProfilePicParams);
      if(deleteProfilePicResult.affectedRows>0){
        return res.status(200).json({
          message:'Profile Pic Deleted Successfully',
          DeletedProfilePic: findProfilePicResult.rows[0],
        });
      }
      else{
        return res.status(400).json({
          message:'Profile Pic has not been deleted',
        });
      }
    }
  }
};

