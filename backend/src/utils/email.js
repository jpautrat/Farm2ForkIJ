/**
 * Email utility for sending emails
 * Uses nodemailer to send emails with the configured email service
 */
const nodemailer = require('nodemailer');
const config = require('../config');

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email message
 * @param {string} options.html - HTML content (optional)
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendEmail = async (options) => {
  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: config.email.service,
      auth: config.email.auth
    });

    // Define email options
    const mailOptions = {
      from: config.email.from,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);

    // In development, log the email details
    if (config.server.env === 'development') {
      console.log('Email would be sent with the following details:');
      console.log('To:', options.email);
      console.log('Subject:', options.subject);
      console.log('Message:', options.message);
    }

    // Re-throw the error for handling by the caller
    throw error;
  }
};

module.exports = sendEmail;
