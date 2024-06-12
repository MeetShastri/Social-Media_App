/**
 * MessageController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  sendMessage: async(req, res) => {
    const {sender, reciever, content} = req.body;
    if(!sender || !reciever || !content){
      return res.status(400).json({
        message:'All fields are required'
      });
    }
    const showTableQuery = 'SHOW TABLES LIKE "Message"';
    const showTableResult = await sails.sendNativeQuery(showTableQuery);
    if (showTableResult.rows.length === 0) {
      const createTableQuery = `
          CREATE TABLE Message(
              id INT PRIMARY KEY AUTO_INCREMENT,
              sender INT NOT NULL,
              reciever INT NOT NULL,
              content VARCHAR(255) NOT NULL,
              FOREIGN KEY (sender) REFERENCES User(id),
              FOREIGN KEY (reciever) REFERENCES User(id)
          )`;
      await sails.sendNativeQuery(createTableQuery);
    }
    const sendMessageQuery = 'INSERT INTO Message (sender, reciever, content) VALUES ($1, $2, $3)';
    const sendMessageParams = [sender, reciever, content];
    const sendMessageResult = await sails.sendNativeQuery(sendMessageQuery, sendMessageParams);
    console.log(sendMessageResult);
    const id = sendMessageResult.insertId;
    if(sendMessageResult.affectedRows>0){
      const findMessageQuery = 'SELECT * FROM Message WHERE id = $1';
      const findMessageParams = [id];
      const findMessageResult = await sails.sendNativeQuery(findMessageQuery, findMessageParams);
      if(findMessageResult.rows.length>0){
        return res.status(200).json({
          message:'Message has been sent successfully',
          Message: findMessageResult.rows[0],
        });
      }
      else{
        return res.status(400).json({
          message:'Message has not been sent',
        });
      }
    }
  },

  getMessages: async(req, res) => {
    const {senderId, recieverId, page = 1, limit = 10} = req.query;
    if(!senderId || !recieverId){
      return res.status(400).json({
        message:'All fields are required',
      });
    }
    const checkIdQuery = `SELECT * FROM User WHERE id IN ($1, $2)`;
    const checkIdParams = [senderId, recieverId];
    const checkIdResult = await sails.sendNativeQuery(checkIdQuery, checkIdParams);
    console.log(checkIdResult);
    if (checkIdResult.rows.length !== 2) {
      return res.status(404).json({
        message: 'Either or Both ID not Found',
      });
    }
    const offset = (page - 1) * limit;
    const limitInt = parseInt(limit, 10);
    const offsetInt = parseInt(offset, 10);
    const getMessageQuery = `SELECT * FROM Message WHERE (sender = $1 AND reciever = $2) OR (reciever = $1 AND sender = $2) ORDER BY id LIMIT ${limitInt} OFFSET ${offsetInt}`;
    const getMessageParams = [senderId, recieverId, limit, offset];
    const getMessageResult = await sails.sendNativeQuery(getMessageQuery, getMessageParams);
    if(getMessageResult.rows.length<=0){
      return res.status(404).json({
        message:'No messages found',
      });
    }
    else{
      return res.status(200).json({
        message:'All messages between 2 users are here',
        Messages: getMessageResult.rows,
        currentPage: page,
        limit: limit
      });
    }
  },

  updateMessage: async(req, res) => {
    const messageid = req.params.messageid;
    const {content}  = req.body;
    const findMessageQuery = 'SELECT * FROM Message WHERE id = $1';
    const findMessageParams = [messageid];
    const findMessageResult = await sails.sendNativeQuery(findMessageQuery, findMessageParams);
    if(findMessageResult.rows.length<=0){
      return res.status(400).json({
        message:'No Chat found with this ID',
      });
    }
    else{
      const updateMessageQuery = 'UPDATE Message SET content = $1 WHERE id = $2';
      const updateMessageParams = [content, messageid];
      const updateMessageResult = await sails.sendNativeQuery(updateMessageQuery, updateMessageParams);
      if(updateMessageResult.affectedRows>0){
        const getUpdatedMessageQuery = 'SELECT * FROM Message WHERE id = $1';
        const getUpdatedMessageParams = [messageid];
        const getUpdatedMessageResult = await sails.sendNativeQuery(getUpdatedMessageQuery, getUpdatedMessageParams);
        return res.status(200).json({
          message:'Message has been updated',
          UpdatedMessage: getUpdatedMessageResult.rows[0]
        });
      }
    }
  },

  deleteMessage: async(req, res) => {
    const messageid = req.params.messageid;
    const findMessageQuery = 'SELECT * FROM Message WHERE id = $1';
    const findMessageParams = [messageid];
    const findMessageResult = await sails.sendNativeQuery(findMessageQuery, findMessageParams);
    console.log(findMessageResult.rows[0]);
    if(findMessageResult.rows.length<=0){
      return res.status(404).json({
        message:'No Chat wih this ID has found',
      });
    }
    else{
      const deleteMessageQuery = 'DELETE FROM Message WHERE id = $1';
      const deleteMessageParams = [messageid];
      const deleteMessageResult = await sails.sendNativeQuery(deleteMessageQuery, deleteMessageParams);
      console.log(deleteMessageResult);
      if(deleteMessageResult.affectedRows>0){
        return res.status(200).json({
          message:'Message has been deleted successfully',
          DeletedMessage: findMessageResult.rows,
        });
      }
      else{
        return res.status(404).json({
          message:'Message has not been deleted',
        });
      }
    }
  }

};

