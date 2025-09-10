import { collection, addDoc, query, where, orderBy, limit, getDocs, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface OTPSendResult {
  success: boolean;
  message: string;
  otpId?: string;
}

export interface OTPVerifyResult {
  success: boolean;
  message: string;
  token?: string;
}

export class OTPService {
  private static readonly OTP_EXPIRY_MINUTES = 5;
  private static readonly OTP_LENGTH = 6;

  /**
   * Generate a random 6-digit OTP
   */
  private static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP to user's email
   */
  static async sendOTP(email: string): Promise<OTPSendResult> {
    try {
      // Validate email format
      if (!this.isValidEmail(email)) {
        return {
          success: false,
          message: 'Invalid email format'
        };
      }

      // Generate OTP
      const otp = this.generateOTP();
      const expiryTime = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

      // Store OTP in Firestore
      try {
        const otpData = {
          email: email.toLowerCase(),
          otp: otp,
          expiresAt: Timestamp.fromDate(expiryTime),
          used: false,
          attempts: 0,
          createdAt: Timestamp.now()
        };
        
        const otpRef = await addDoc(collection(db, 'otps'), otpData);

        // Send email with OTP
        await this.sendEmailOTP(email, otp);

        return {
          success: true,
          message: `OTP sent to ${email}`,
          otpId: otpRef.id
        };
      } catch (error: any) {
        console.error('Error storing OTP:', error);
        return {
          success: false,
          message: 'Failed to generate OTP. Please try again.'
        };
      }
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.'
      };
    }
  }

  /**
   * Verify OTP and return authentication token
   */
  static async verifyOTP(email: string, otp: string): Promise<OTPVerifyResult> {
    try {
      // Find the OTP record
      const otpsRef = collection(db, 'otps');
      const q = query(
        otpsRef,
        where('email', '==', email.toLowerCase()),
        where('used', '==', false),
        where('expiresAt', '>', Timestamp.now()),
        orderBy('expiresAt', 'desc'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return {
          success: false,
          message: 'Invalid or expired OTP'
        };
      }

      const otpDoc = querySnapshot.docs[0];
      const otpRecord = { id: otpDoc.id, ...otpDoc.data() } as any;

      // Check if OTP matches
      if (otpRecord.otp !== otp) {
        // Increment attempts
        await updateDoc(doc(db, 'otps', otpRecord.id), {
          attempts: otpRecord.attempts + 1
        });

        if (otpRecord.attempts >= 3) {
          // Mark as used after 3 failed attempts
          await updateDoc(doc(db, 'otps', otpRecord.id), {
            used: true
          });
          return {
            success: false,
            message: 'Too many failed attempts. Please request a new OTP.'
          };
        }

        return {
          success: false,
          message: 'Invalid OTP'
        };
      }

      // Mark OTP as used
      await updateDoc(doc(db, 'otps', otpRecord.id), {
        used: true
      });

      // Check if user exists, if not create one
      let user;
      try {
        const usersRef = collection(db, 'users');
        const userQuery = query(usersRef, where('email', '==', email.toLowerCase()));
        const userSnapshot = await getDocs(userQuery);
        
        if (userSnapshot.empty) {
          // User doesn't exist, create a new one
          const userData = {
            email: email.toLowerCase(),
            emailVisibility: true,
            verified: true,
            name: email.split('@')[0], // Default name from email
            username: email.split('@')[0],
            role: 'passenger',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          };
          
          const userRef = await addDoc(collection(db, 'users'), userData);
          user = { id: userRef.id, ...userData };
        } else {
          user = { id: userSnapshot.docs[0].id, ...userSnapshot.docs[0].data() };
        }
      } catch (error) {
        console.error('Error checking/creating user:', error);
        throw error;
      }

      // For OTP authentication, we'll use a special authentication method
      // Since we can't use the regular password auth, we'll return a success token
      // and let the calling code handle the authentication
      
      return {
        success: true,
        message: 'OTP verified successfully',
        token: 'otp_verified_' + user.id
      };
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: 'Failed to verify OTP. Please try again.'
      };
    }
  }

  /**
   * Send email with OTP using Firebase or third-party email service
   */
  private static async sendEmailOTP(email: string, otp: string): Promise<void> {
    try {
      // For now, we'll use the third-party email service
      // You can integrate Firebase Functions for email sending later
      await this.sendEmailViaThirdParty(email, otp);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send OTP email');
    }
  }

  /**
   * Alternative email sending using a third-party service
   */
  private static async sendEmailViaThirdParty(email: string, otp: string): Promise<void> {
    // Example using a service like SendGrid, Nodemailer, etc.
    // This is a placeholder - implement based on your preferred email service
    
    const emailData = {
      to: email,
      subject: 'Dynamic Trike - OTP Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #58BC6B;">Dynamic Trike</h2>
          <p>Your OTP verification code is:</p>
          <h1 style="color: #58BC6B; font-size: 32px; letter-spacing: 4px; text-align: center;">${otp}</h1>
          <p>This code will expire in ${this.OTP_EXPIRY_MINUTES} minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `
    };

    // Implement your email service here
    console.log('Sending email:', emailData);
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Clean up expired OTPs
   */
  static async cleanupExpiredOTPs(): Promise<void> {
    try {
      // Get all expired OTPs
      const otpsRef = collection(db, 'otps');
      const q = query(otpsRef, where('expiresAt', '<', Timestamp.now()));
      const querySnapshot = await getDocs(q);

      // Delete each expired OTP
      for (const doc of querySnapshot.docs) {
        try {
          await deleteDoc(doc.ref);
        } catch (error) {
          console.error(`Error deleting OTP ${doc.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
    }
  }
}
