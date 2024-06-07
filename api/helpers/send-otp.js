// api/helpers/send-otp.js
const nodemailer = require('nodemailer');
const { totp } = require('otplib');
const emailConfig = sails.config.email;

module.exports = {
  friendlyName: 'Send OTP',

  description: 'Generate and send an OTP to the specified email address',

  inputs: {
    email: {
      type: 'string',
      required: true
    }
  },

  exits: {
    success: {
      description: 'OTP sent successfully'
    },
    error: {
      description: 'An error occurred'
    }
  },

  fn: async function (inputs, exits) {
    // Generate OTP
    const otp = totp.generate('secret'); // Use a secure, unique secret per user in a real application

    // Set up transporter
    const transporter = nodemailer.createTransport({
      service: emailConfig.service,
      auth: {
        user: emailConfig.auth.user,
        pass: emailConfig.auth.pass
      }
    });

    // Email options
    const mailOptions = {
      from: emailConfig.auth.user,
      to: inputs.email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}`
    };

    // Send email
    try {
      await transporter.sendMail(mailOptions);
      return exits.success({ otp });
    } catch (err) {
      return exits.error(err);
    }
  }
};
