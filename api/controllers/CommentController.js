/**
 * CommentController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  //  Controller for adding Comment
  addComment: async(req, res) => {
    const {text, author, post} = req.body;
    if(!text || !author || !post){
      return res.status(404).json({
        message:'All fields are required',
      });
    }
    const showTableQuery = 'SHOW TABLES LIKE "Comments"';
    const showTableResult = await sails.sendNativeQuery(showTableQuery);
    if(showTableResult.rows.length === 0){
      const createTableQuery = `
        CREATE TABLE Comments(
            id INT AUTO_INCREMENT PRIMARY KEY,
            text VARCHAR(255) NOT NULL,
            author VARCHAR(255) NOT NULL,
            post VARCHAR(255) NOT NULL
        )`; await sails.sendNativeQuery(createTableQuery);
    }

    const addCommentQuery = 'INSERT INTO Comments (text, author, post) VALUES ($1, $2, $3)';
    const addCommentParams = [text, author, post];
    const addCommentResult = await sails.sendNativeQuery(addCommentQuery, addCommentParams);
    if(addCommentResult.affectedRows > 0){
      const id = addCommentResult.insertId;
      const getCommentQuery ='SELECT * FROM Comments WHERE id = $1';
      const getCommentParams = [id];
      const getCommentResult = await sails.sendNativeQuery(getCommentQuery, getCommentParams);
      const comment = getCommentResult.rows[0];
      if(getCommentResult.rows.length<=0){
        return res.status(404).json({
          message:'Comment is not added pls try again',
        });
      }
      else{
        return res.status(201).json({
          message:'Comment has been added successfully',
          Comment: comment,
        });
      }
    }
  },

  //Controller for getting Comment by Post ID
  getCommentByPost: async(req, res) => {
    const postid = req.params.postid;
    const findCommentQuery = 'SELECT C.id as Comment_ID, C.text as Comment, C.author as Comment_CreatedBy, C.post as Comment_OnPost FROM Comments C WHERE post = $1';
    const findCommentParams = [postid];
    const findCommentResult = await sails.sendNativeQuery(findCommentQuery, findCommentParams);
    if(findCommentResult.rows.length>0){
      return res.status(200).json({
        message:'Your Comments are as follows',
        Comments: findCommentResult.rows
      });
    }
    else{
      return res.status(404).json({
        message:'No Comments on this post',
      });
    }
  },

  //Controller for updating the Comment
  updateComment: async(req, res) => {
    const commentId = req.params.commentid;
    const {text} = req.body;
    const findCommentQuery = 'SELECT * FROM Comments WHERE id = $1';
    const findCommentParams = [commentId];
    const findCommentResult = await sails.sendNativeQuery(findCommentQuery, findCommentParams);
    if(findCommentResult.rows.length<=0){
      return res.status(404).json({
        message:'No Comment with this ID',
      });
    }
    const updateCommentQuery = 'UPDATE Comments SET text = $1 WHERE id = $2';
    const updateCommentParams = [text, commentId];
    const updateCommentResult = await sails.sendNativeQuery(updateCommentQuery, updateCommentParams);
    if(updateCommentResult.affectedRows>0){
      const findUpdatedCommentQuery = 'SELECT * FROM Comments WHERE id = $1';
      const findUpdatedCommentParams = [commentId];
      const findUpdatedCommentResult = await sails.sendNativeQuery(findUpdatedCommentQuery, findUpdatedCommentParams);
      return res.status(200).json({
        message:'Comment has been Updated Successfully',
        UpdatedComment: findUpdatedCommentResult.rows[0],
      });
    }
    else{
      return res.json({
        message:'Comment is not updated'
      });
    }
  },

  //Controller for deletng the Comment
  deleteComment: async(req, res) => {
    const commentId = req.params.commentid;
    const findCommentQuery = 'SELECT * FROM Comments WHERE id = $1';
    const findCommentParams = [commentId];
    const findCommentResult = await sails.sendNativeQuery(findCommentQuery, findCommentParams);
    if(findCommentResult.rows.length<=0){
      return res.status(404).json({
        message:'No Comment with this ID',
      });
    }
    else{
      const deleteCommentQuery = 'DELETE FROM Comments WHERE id = $1';
      const deleteCommentParams = [commentId];
      const deleteCommentResult = await sails.sendNativeQuery(deleteCommentQuery, deleteCommentParams);
      if(deleteCommentResult.affectedRows>0){
        return res.status(200).json({
          message:'Comment Deleted Successfully',
          Comment:findCommentResult.rows[0],
        });
      }
      else{
        return res.status(404).json({
          message:'Comment is not deleted',
        });
      }
    }
  },

  //Controller for Searching the comment
  searchComment: async(req, res) => {
    const searchTerm = req.query.q;
    if (!searchTerm) {
      return res.status(400).json({
        message: 'Search term is required',
      });
    }
    const searchCommentsQuery = `SELECT * FROM Comments WHERE text LIKE $1`;
    const searchCommentsParams = [`%${searchTerm}%`];
    const searchCommentsResult = await sails.sendNativeQuery(searchCommentsQuery, searchCommentsParams);
    if(searchCommentsResult.rows.length<=0){
      return res.status(400).json({
        message: 'No Comments found',
      });
    }
    else{
      return res.status(200).json({
        message: 'Comments retrieved successfully',
        posts: searchCommentsResult.rows
      });
    }
  }
};

