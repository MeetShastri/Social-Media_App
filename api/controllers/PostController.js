/**
 * PostController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const path = require('path');
module.exports = {

  addPost: async (req, res) => {

    req.file('image').upload({
      dirname: path.resolve(sails.config.appPath, 'assets/images')
    }, async (err, uploadedFiles) => {
      if (err) { return res.serverError(err); }

      if (uploadedFiles.length === 0) { return res.badRequest('No file was uploaded'); }

      const file = uploadedFiles[0];
      const imagePath = '/images/' + path.basename(file.fd);


      const { text, author, likes } = req.body;

      if (!text || !author || !likes) {
        return res.status(400).json({
          message: 'All fields are required',
        });
      }

      const showTableQuery = 'SHOW TABLES LIKE "Post"';
      const showTableResult = await sails.sendNativeQuery(showTableQuery);
      if (showTableResult.rows.length === 0) {
        const createTableQuery = `
          CREATE TABLE Post(
              id INT AUTO_INCREMENT PRIMARY KEY,
              text VARCHAR(255) NOT NULL,
              imagePath VARCHAR(255) NOT NULL,
              author VARCHAR(255) NOT NULL,
              likes VARCHAR(255) NOT NULL             
          )`;
        await sails.sendNativeQuery(createTableQuery);
      }

      const findUserQuery = 'SELECT id FROM User WHERE id = $1';
      const findUserParams = [author];
      const findUserResult = await sails.sendNativeQuery(findUserQuery, findUserParams);
      const user = findUserResult.rows[0];
      if (findUserResult.rows.length <= 0) {
        return res.status(404).json({
          message: 'There is no user with given Author ID',
        });
      }

      const insertPostQuery = `
        INSERT INTO Post (text, imagePath, author, likes)
        VALUES ($1, $2, $3, $4)
      `;
      const insertPostParams = [text, imagePath, user.id, likes];
      const insertPostResult = await sails.sendNativeQuery(insertPostQuery, insertPostParams);
      const id = insertPostResult.insertId;
      if(insertPostResult.affectedRows>0){
        const postQuery = 'SELECT * FROM Post WHERE id = $1';
        const postParams = [id];
        const postResult = await sails.sendNativeQuery(postQuery, postParams);
        return res.status(201).json({
          message: 'Post created successfully!',
          post: {
            Post: postResult.rows[0],
          }
        });
      }
    });
  },

  getPostById: async(req, res) => {
    const id = req.params.postid;
    const findPostByIdQuery = 'select P.id as Post_id, P.text as Post_text, P.imagePath as Post_imagePath, P.likes as Post_likes, P.author as Post_Author, C.id as Comment_id, C.text as Comment, C.author as Comment_Author, C.post as Comment_On_Post from Post P left join Comments C on P.id = C.author WHERE P.id = $1';
    const findPostByIdParams = [id];
    const findPostByIdResult = await sails.sendNativeQuery(findPostByIdQuery, findPostByIdParams);
    const post = findPostByIdResult.rows;
    if(findPostByIdResult.rows.length <= 0){
      return res.status(404).json({
        message:'No Post with this id has been found',
      });
    }
    else{
      return res.status(200).json({
        message:'Your Post with ID provided is as follow',
        post: post
      });
    }
  },


  getPostByAuthorId: async(req, res) => {
    const id = req.params.authorid;
    const findPostByAuthorIdQuery = 'select P.id as Post_id, P.text as Post_Text, P.imagePath as Post_ImagePath, P.author as Post_Creator, P.likes as Post_likes, C.id as Comment_ID, C.text as Comment_text, C.author as Comment_Creator, C.post as Comment_On_Post from post P  left join comments C on P.id = C.post WHERE P.author = $1';
    const findPostByAuthorIdParams = [id];
    const findPostByAuthorIdResult = await sails.sendNativeQuery(findPostByAuthorIdQuery, findPostByAuthorIdParams);
    const posts = findPostByAuthorIdResult.rows;
    if(findPostByAuthorIdResult.rows.length <= 0){
      return res.status(404).json({
        message:'No Post with this id has been found',
      });
    }
    else{
      return res.status(200).json({
        message:'Post created by Author are here',
        PostByAuthor: posts
      });
    }
  },

  updatePost: async(req, res) => {
    const postid = req.params.postid;
    const {text, comments} = req.body;
    let updatePostQuery = 'UPDATE Post SET ';
    const updatePostParams = [];
    if(text){
      updatePostQuery += 'text = $1, ';
      updatePostParams.push(text);
    }
    if(comments){
      updatePostQuery += 'comments = $2, ';
      updatePostParams.push(comments);
    }
    updatePostQuery = updatePostQuery.slice(0, -2);
    const lengthOfArray = updatePostParams.length;
    updatePostQuery += ` WHERE id = $${lengthOfArray + 1}`;
    updatePostParams.push(postid);
    const updateResult = await sails.sendNativeQuery(updatePostQuery, updatePostParams);
    if(updateResult.affectedRows>0){
      const getPostQuery = 'SELECT * FROM Post WHERE id = $1';
      const getPostParams = [postid];
      const getPostResult = await sails.sendNativeQuery(getPostQuery, getPostParams);
      const post = getPostResult.rows[0];
      return res.status(200).json({
        message:'Your data has been successfully updated...',
        updatedPost: post,
      });
    }
  },

  deletePost: async(req, res) => {
    const id = req.params.postid;
    const findPostQuery = 'SELECT * FROM Post WHERE id = $1';
    const findPostParams = [id];
    const findPostResult = await sails.sendNativeQuery(findPostQuery, findPostParams);
    const post = findPostResult.rows[0];
    if(findPostResult.rows.length<=0){
      return res.status(404).json({
        message: 'No Post with this ID is found',
      });
    }
    else{
      const deletePostQuery = 'DELETE FROM Post WHERE id = $1';
      const deletePostParams = [id];
      const deletePostResult = await sails.sendNativeQuery(deletePostQuery, deletePostParams);
      if(deletePostResult.affectedRows>0){
        return res.status(200).json({
          message:'Post has been deleted',
          deletedPost: post
        });
      }
      else{
        return res.status(404).json({
          message:'Post is not deleted'
        });
      }
    }
  },

  searchPost: async(req, res) => {
    const searchTerm = req.query.q;
    if (!searchTerm) {
      return res.status(400).json({
        message: 'Search term is required',
      });
    }
    const searchPostsQuery = `SELECT * FROM Post WHERE text LIKE $1`;
    const searchPostsParams = [`%${searchTerm}%`];
    const searchPostResult = await sails.sendNativeQuery(searchPostsQuery, searchPostsParams);
    if(searchPostResult.rows.length<=0){
      return res.status(400).json({
        message: 'No Posts found',
      });
    }
    else{
      return res.status(200).json({
        message: 'Posts retrieved successfully',
        posts: searchPostResult.rows
      });
    }
  },
};



