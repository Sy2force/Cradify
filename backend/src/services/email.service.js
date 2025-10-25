const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialize();
  }

  /**
   * Initialize email transporter
   */
  initialize() {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      logger.warn('Email service not configured. Missing environment variables.');
      return;
    }

    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        logger.error('Email service configuration error:', error);
      } else {
        logger.info('✅ Email service ready');
      }
    });
  }

  /**
   * Send welcome email to new users
   * @param {string} email - User email
   * @param {string} name - User name
   */
  async sendWelcomeEmail(email, name) {
    if (!this.transporter) {
      logger.warn('Email service not configured');
      return;
    }

    try {
      const mailOptions = {
        from: `"Cardify Team" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Welcome to Cardify! 🎉',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Welcome to Cardify!</h1>
            </div>
            
            <div style="padding: 30px; background-color: #f9f9f9;">
              <h2 style="color: #333;">Hello ${name}! 👋</h2>
              
              <p style="color: #666; line-height: 1.6;">
                Welcome to Cardify, your professional business card management platform!
              </p>
              
              <p style="color: #666; line-height: 1.6;">
                With Cardify, you can:
              </p>
              
              <ul style="color: #666; line-height: 1.8;">
                <li>📇 Create and manage professional business cards</li>
                <li>🔍 Discover other professionals in your network</li>
                <li>❤️ Like and save interesting business cards</li>
                <li>💬 Connect with others through our chat system</li>
                <li>🚀 Grow your professional network</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 12px 30px; 
                          text-decoration: none; 
                          border-radius: 25px; 
                          display: inline-block;">
                  Get Started
                </a>
              </div>
              
              <p style="color: #666; line-height: 1.6;">
                If you have any questions, feel free to reach out to our support team.
              </p>
              
              <p style="color: #666;">
                Best regards,<br>
                <strong>The Cardify Team</strong>
              </p>
            </div>
            
            <div style="background-color: #333; padding: 20px; text-align: center;">
              <p style="color: #999; margin: 0; font-size: 12px;">
                This email was sent from Cardify. Please do not reply to this email.
              </p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Welcome email sent to ${email}`);
    } catch (error) {
      logger.error('Error sending welcome email:', error);
    }
  }

  /**
   * Send password reset email
   * @param {string} email - User email
   * @param {string} name - User name
   * @param {string} resetToken - Password reset token
   */
  async sendPasswordResetEmail(email, name, resetToken) {
    if (!this.transporter) {
      logger.warn('Email service not configured');
      return;
    }

    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: `"Cardify Team" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Request - Cardify 🔒',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Password Reset</h1>
            </div>
            
            <div style="padding: 30px; background-color: #f9f9f9;">
              <h2 style="color: #333;">Hello ${name},</h2>
              
              <p style="color: #666; line-height: 1.6;">
                We received a request to reset your password for your Cardify account.
              </p>
              
              <p style="color: #666; line-height: 1.6;">
                Click the button below to reset your password:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); 
                          color: white; 
                          padding: 12px 30px; 
                          text-decoration: none; 
                          border-radius: 25px; 
                          display: inline-block;">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #666; line-height: 1.6;">
                If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
              </p>
              
              <p style="color: #666; line-height: 1.6;">
                This link will expire in 24 hours for security reasons.
              </p>
              
              <p style="color: #666;">
                Best regards,<br>
                <strong>The Cardify Team</strong>
              </p>
            </div>
            
            <div style="background-color: #333; padding: 20px; text-align: center;">
              <p style="color: #999; margin: 0; font-size: 12px;">
                This email was sent from Cardify. Please do not reply to this email.
              </p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
      logger.error('Error sending password reset email:', error);
    }
  }

  /**
   * Send business account approval email
   * @param {string} email - User email
   * @param {string} name - User name
   */
  async sendBusinessApprovalEmail(email, name) {
    if (!this.transporter) {
      logger.warn('Email service not configured');
      return;
    }

    try {
      const mailOptions = {
        from: `"Cardify Team" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Business Account Approved! 🎉',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10ac84 0%, #00d2d3 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Business Account Approved!</h1>
            </div>
            
            <div style="padding: 30px; background-color: #f9f9f9;">
              <h2 style="color: #333;">Congratulations ${name}! 🎉</h2>
              
              <p style="color: #666; line-height: 1.6;">
                Your business account has been approved! You can now create and manage business cards.
              </p>
              
              <p style="color: #666; line-height: 1.6;">
                Business account features:
              </p>
              
              <ul style="color: #666; line-height: 1.8;">
                <li>📇 Create unlimited business cards</li>
                <li>✏️ Edit and manage your cards</li>
                <li>📊 Track card views and likes</li>
                <li>🚀 Enhanced visibility in search</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/create-card" 
                   style="background: linear-gradient(135deg, #10ac84 0%, #00d2d3 100%); 
                          color: white; 
                          padding: 12px 30px; 
                          text-decoration: none; 
                          border-radius: 25px; 
                          display: inline-block;">
                  Create Your First Card
                </a>
              </div>
              
              <p style="color: #666;">
                Best regards,<br>
                <strong>The Cardify Team</strong>
              </p>
            </div>
            
            <div style="background-color: #333; padding: 20px; text-align: center;">
              <p style="color: #999; margin: 0; font-size: 12px;">
                This email was sent from Cardify. Please do not reply to this email.
              </p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Business approval email sent to ${email}`);
    } catch (error) {
      logger.error('Error sending business approval email:', error);
    }
  }
}

module.exports = new EmailService();
