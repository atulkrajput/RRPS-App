/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { Network } from '@capacitor/network';
import { ApiService } from '../services/api.service';
import { ConstantsService } from '../services/constants.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit, OnDestroy {
  currentStep = 1; // 1: Enter RegID, 2: Verify OTP, 3: Reset Password
  regIdForm: FormGroup;
  otpForm: FormGroup;
  resetForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isSubmitting = false;

  // OTP Timer
  otpTimer = 300; // 5 minutes in seconds
  timerInterval: any = null;
  canResendOtp = false;

  // Data from API
  maskedMobile = '';
  regId = '';
  resetToken = '';

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private constants: ConstantsService,
    private navController: NavController
  ) {
    this.regIdForm = this.fb.group({
      regid: ['', [Validators.required, Validators.minLength(3)]]
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern('^[0-9]{6}$')]]
    });

    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.clearTimer();
  }

  // Step 1: Request OTP
  async requestOtp() {
    if (this.regIdForm.invalid) { return; }
    const connected = await Network.getStatus();
    if (!connected.connected) {
      this.constants.presentToast('Please check your internet connection');
      return;
    }

    this.isSubmitting = true;
    this.regId = this.regIdForm.value.regid.trim();

    this.api.forgotPassword(this.regId).subscribe(
      (result: any) => {
        this.isSubmitting = false;
        if (result.status === 1) {
          this.maskedMobile = result.data?.mobile_masked || '****';
          this.currentStep = 2;
          this.startOtpTimer();
          this.constants.presentToast(result.msg || 'OTP sent successfully');
        } else {
          this.constants.presentToast(result.msg || 'Unable to send OTP. Please try again.');
        }
      },
      (error) => {
        this.isSubmitting = false;
        if (error.status === 404 || error.status === 500 || error.status === 0) {
          this.constants.presentToast('This feature is not yet available. Please contact the school office to reset your password.');
        } else {
          this.constants.presentToast('Something went wrong. Please try again later.');
        }
      }
    );
  }

  // Step 2: Verify OTP
  async verifyOtp() {
    if (this.otpForm.invalid) { return; }
    const connected = await Network.getStatus();
    if (!connected.connected) {
      this.constants.presentToast('Please check your internet connection');
      return;
    }

    this.isSubmitting = true;
    const otp = this.otpForm.value.otp.trim();

    this.api.verifyOtp(this.regId, otp).subscribe(
      (result: any) => {
        this.isSubmitting = false;
        if (result.status === 1) {
          this.resetToken = result.data?.reset_token || '';
          this.currentStep = 3;
          this.clearTimer();
          this.constants.presentToast('OTP verified successfully');
        } else {
          this.constants.presentToast(result.msg || 'Invalid OTP. Please try again.');
        }
      },
      (error) => {
        this.isSubmitting = false;
        this.constants.presentToast('Something went wrong. Please try again later.');
      }
    );
  }

  // Step 3: Reset Password
  async resetPassword() {
    if (this.resetForm.invalid) { return; }

    const { newPassword, confirmPassword } = this.resetForm.value;
    if (newPassword !== confirmPassword) {
      this.constants.presentToast('Passwords do not match');
      return;
    }

    const connected = await Network.getStatus();
    if (!connected.connected) {
      this.constants.presentToast('Please check your internet connection');
      return;
    }

    this.isSubmitting = true;

    this.api.resetPassword(this.resetToken, newPassword, confirmPassword).subscribe(
      (result: any) => {
        this.isSubmitting = false;
        if (result.status === 1) {
          this.constants.presentToast('Password reset successfully! Please login with your new password.');
          this.navController.navigateBack('/login');
        } else {
          this.constants.presentToast(result.msg || 'Unable to reset password. Please try again.');
        }
      },
      (error) => {
        this.isSubmitting = false;
        this.constants.presentToast('Something went wrong. Please try again later.');
      }
    );
  }

  // Resend OTP
  async resendOtp() {
    if (!this.canResendOtp) { return; }
    this.canResendOtp = false;
    this.otpForm.reset();
    await this.requestOtpSilent();
  }

  private async requestOtpSilent() {
    this.api.forgotPassword(this.regId).subscribe(
      (result: any) => {
        if (result.status === 1) {
          this.startOtpTimer();
          this.constants.presentToast('New OTP sent successfully');
        } else {
          this.canResendOtp = true;
          this.constants.presentToast(result.msg || 'Unable to resend OTP');
        }
      },
      (error) => {
        this.canResendOtp = true;
        this.constants.presentToast('Unable to resend OTP. Try again.');
      }
    );
  }

  // Timer management
  startOtpTimer() {
    this.clearTimer();
    this.otpTimer = 300;
    this.canResendOtp = false;
    this.timerInterval = setInterval(() => {
      this.otpTimer--;
      if (this.otpTimer <= 0) {
        this.clearTimer();
        this.canResendOtp = true;
      }
    }, 1000);
  }

  clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  getTimerDisplay(): string {
    const minutes = Math.floor(this.otpTimer / 60);
    const seconds = this.otpTimer % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Navigation
  goBack() {
    if (this.currentStep > 1) {
      this.currentStep--;
      if (this.currentStep === 1) {
        this.clearTimer();
      }
    } else {
      this.navController.navigateBack('/login');
    }
  }

  goToLogin() {
    this.navController.navigateBack('/login');
  }
}
