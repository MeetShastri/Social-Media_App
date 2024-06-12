/**
 * FriendrequestController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {


  sendRequest: async (req, res) => {
    const { sender, receiver } = req.body;
    console.log(sender, receiver);
    if (!sender || !receiver) {
      return res.status(404).json({
        message: 'All fields are required',
      });
    }

    try {
      // Check for table existence and create if needed
      const showTableQuery = 'SHOW TABLES LIKE "Friendrequest"';
      const showTableResult = await sails.sendNativeQuery(showTableQuery);
      if (showTableResult.rows.length === 0) {
        const createTableQuery = `
          CREATE TABLE Friendrequest(
              id INT PRIMARY KEY AUTO_INCREMENT,
              sender INT NOT NULL,
              receiver INT NOT NULL,
              status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
              FOREIGN KEY (sender) REFERENCES User(id),
              FOREIGN KEY (receiver) REFERENCES User(id)
          )`;
        await sails.sendNativeQuery(createTableQuery);
      }

      // Check for user IDs (assuming separate query for efficiency)
      const checkIdQuery = `SELECT * FROM User WHERE (id = $1 AND id = $2)`;
      const checkIdParams = [sender, receiver];
      const checkIdResult = await sails.sendNativeQuery(checkIdQuery, checkIdParams);
      if (checkIdResult.rows.length <= 0) {
        return res.status(404).json({
          message: 'ID not Found',
        });
      }

      // Send friend request (assuming separate query for efficiency)
      const sendRequestQuery = `INSERT INTO Friendrequest (sender, receiver, status) VALUES ($1, $2, 'pending')`;
      const sendRequestParams = [sender, receiver];
      const sendRequestResult = await sails.sendNativeQuery(sendRequestQuery, sendRequestParams);
      console.log(sendRequestResult);
      res.status(200).json({ message: 'Friend request sent successfully' });
    } catch (error) {
      console.error('Error sending friend request:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  acceptRequest: async(req, res) => {
    try {
      const { requestId } = req.body;

      // Update the friend request status to 'accepted'
      const updateQuery = `
          UPDATE FriendRequest
          SET status = 'accepted'
          WHERE id = $1
        `;
      await sails.sendNativeQuery(updateQuery, [requestId]);

      return res.status(200).json({ message: 'Friend request accepted successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to accept friend request', error: error.message });
    }
  },

  declineRequest: async(req, res) => {
    try {
      const { requestId } = req.body;

      // Update the friend request status to 'declined'
      const updateQuery = `
          UPDATE FriendRequest
          SET status = 'declined'
          WHERE id = $1
        `;
      await sails.sendNativeQuery(updateQuery, [requestId]);

      return res.status(200).json({ message: 'Friend request declined successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to decline friend request', error: error.message });
    }
  }

};

