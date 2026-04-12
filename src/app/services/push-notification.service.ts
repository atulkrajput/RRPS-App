import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import {
  PushNotifications,
  PushNotificationSchema,
  Token,
  ActionPerformed,
} from '@capacitor/push-notifications';
import { Router } from '@angular/router';
import { Storage } from '@capacitor/storage';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private fcmToken: string = null;
  private deviceId: string = null;

  constructor(
    private platform: Platform,
    private router: Router,
    private api: ApiService
  ) {}

  async initPushNotifications() {
    if (!this.platform.is('capacitor')) { return; }

    try {
      // Get or generate device ID
      this.deviceId = await this.getDeviceId();

      // Request permission and register
      let permStatus = await PushNotifications.checkPermissions();
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }
      if (permStatus.receive !== 'granted') {
        console.log('Push notification permission not granted');
        return;
      }

      this.addListeners();
      await PushNotifications.register();
    } catch (error) {
      console.warn('Push notifications init failed:', error);
    }
  }

  private async getDeviceId(): Promise<string> {
    const stored = await Storage.get({ key: 'device_uid' });
    if (stored.value) { return stored.value; }
    const uid = 'rrps_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    await Storage.set({ key: 'device_uid', value: uid });
    return uid;
  }

  /**
   * Call after login to link device to student
   */
  async registerDeviceForStudent(studentId: number) {
    if (!this.platform.is('capacitor')) { return; }
    try {
      if (!this.deviceId) {
        this.deviceId = await this.getDeviceId();
      }
      const token = this.fcmToken || 'pending';
      this.api.registerDevice(
        this.deviceId, token, studentId,
        '1.0.2', this.platform.is('android') ? 'android' : 'ios', 'mobile'
      ).subscribe(
        (res: any) => console.log('Device registered for student:', res),
        (err) => console.warn('Device registration failed:', err)
      );
    } catch (error) {
      console.warn('registerDeviceForStudent error:', error);
    }
  }

  private addListeners() {
    PushNotifications.addListener('registration', (token: Token) => {
      console.log('FCM token:', token.value);
      this.fcmToken = token.value;

      // Register device with token (no student yet — broadcast)
      this.api.registerDevice(
        this.deviceId, token.value, undefined,
        '1.0.2', this.platform.is('android') ? 'android' : 'ios', 'mobile'
      ).subscribe();
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Push registration error:', JSON.stringify(error));
    });

    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push received:', JSON.stringify(notification));
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      const data = notification.notification.data;
      if (data && data.type) {
        const routes = {
          homework: '/homework',
          exam: '/exams',
          attendance: '/attendance',
          fee: '/fees',
          meeting: '/meetings'
        };
        this.router.navigate([routes[data.type] || '/notifications']);
      } else {
        this.router.navigate(['/notifications']);
      }
    });
  }
}
