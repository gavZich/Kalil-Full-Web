const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  try {
    // Configure your email service
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // Example with Gmail
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    // Send email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendEmail;
