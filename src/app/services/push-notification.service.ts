import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import {
  PushNotifications,
  PushNotificationSchema,
  Token,
  ActionPerformed,
} from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Router } from '@angular/router';
import { Storage } from '@capacitor/storage';
import { Device } from '@capacitor/device';
import { ApiService } from './api.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private fcmToken: string = null;
  private deviceUid: string = null;

  constructor(
    private platform: Platform,
    private router: Router,
    private api: ApiService
  ) {}

  /**
   * Initialize push notifications — call on app startup.
   * Registers the device (without student_id) for broadcast notifications.
   */
  async initPushNotifications() {
    if (!this.platform.is('capacitor')) { return; }

    try {
      // Get device UID
      this.deviceUid = await this.getDeviceUid();

      // Request permission
      let permStatus = await PushNotifications.checkPermissions();
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }
      if (permStatus.receive !== 'granted') {
        console.warn('Push notification permission not granted');
        return;
      }

      // Setup listeners before registering
      this.addListeners();

      // Create notification channel for Android
      if (this.platform.is('android')) {
        await PushNotifications.createChannel({
          id: 'rrps_notifications',
          name: 'RRPS Notifications',
          description: 'School notifications and updates',
          sound: 'default',
          vibration: true,
          lights: true,
          importance: 5,
          visibility: 1
        });
      }

      // Register for push notifications
      await PushNotifications.register();
    } catch (error) {
      console.warn('Push notifications init failed:', error);
    }
  }

  /**
   * Get or generate a unique device identifier.
   */
  private async getDeviceUid(): Promise<string> {
    const stored = await Storage.get({ key: 'device_uid' });
    if (stored.value) { return stored.value; }

    // Try to get the real device ID first
    try {
      const deviceId = await Device.getId();
      const uid = (deviceId as any).uuid || (deviceId as any).identifier || null;
      if (uid) {
        await Storage.set({ key: 'device_uid', value: uid });
        return uid;
      }
    } catch (e) {
      // Fallback below
    }

    // Generate a fallback UID
    const uid = 'rrps_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    await Storage.set({ key: 'device_uid', value: uid });
    return uid;
  }

  /**
   * Call after login to link the device to a student for targeted notifications.
   */
  async registerDeviceForStudent(studentId: number) {
    if (!this.platform.is('capacitor')) { return; }
    try {
      if (!this.deviceUid) {
        this.deviceUid = await this.getDeviceUid();
      }
      const token = this.fcmToken || 'pending';
      const info = await Device.getInfo();

      this.api.registerDevice(
        this.deviceUid,
        token,
        studentId,
        environment.appVersion,
        info.platform || 'android',
        info.model || 'unknown'
      ).subscribe(
        (res: any) => console.log('Device registered for student:', res?.msg),
        (err) => console.warn('Device registration failed:', err)
      );
    } catch (error) {
      console.warn('registerDeviceForStudent error:', error);
    }
  }

  /**
   * Setup all push notification listeners.
   */
  private addListeners() {
    // Token received — register device (without student_id for broadcast)
    PushNotifications.addListener('registration', async (token: Token) => {
      console.log('FCM token received:', token.value);
      this.fcmToken = token.value;
      await Storage.set({ key: 'fcm_token', value: token.value });

      // Register device for broadcast notifications (no student_id yet)
      try {
        const info = await Device.getInfo();
        this.api.registerDevice(
          this.deviceUid,
          token.value,
          undefined,
          environment.appVersion,
          info.platform || 'android',
          info.model || 'unknown'
        ).subscribe();

        // If student is already logged in, also link device to student
        const sData = await Storage.get({ key: 'studentData' });
        if (sData.value) {
          const student = JSON.parse(sData.value);
          if (student && student.id) {
            this.api.registerDevice(
              this.deviceUid,
              token.value,
              student.id,
              environment.appVersion,
              info.platform || 'android',
              info.model || 'unknown'
            ).subscribe();
          }
        }
      } catch (e) {
        console.warn('registerDevice on token error:', e);
      }
    });

    // Registration error
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Push registration error:', JSON.stringify(error));
    });

    // Notification received while app is in foreground — show local notification
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push received in foreground:', notification.title);
      this.showLocalNotification(notification);
    });

    // User tapped on a notification (app was in background or closed)
    PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
      console.log('Notification tapped:', JSON.stringify(action.notification.data));
      this.handleNotificationTap(action.notification.data);
    });

    // Local notification tapped
    LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
      const data = action.notification.extra;
      if (data) {
        this.handleNotificationTap(data);
      }
    });
  }

  /**
   * Show a local notification when a push is received in foreground.
   */
  private async showLocalNotification(notification: PushNotificationSchema) {
    try {
      const permResult = await LocalNotifications.checkPermissions();
      if (permResult.display !== 'granted') {
        const reqResult = await LocalNotifications.requestPermissions();
        if (reqResult.display !== 'granted') { return; }
      }

      const localNotif: any = {
        id: Math.floor(Math.random() * 100000),
        title: notification.title || 'RRPS',
        body: notification.body || '',
        channelId: 'rrps_notifications',
        extra: notification.data || {}
      };

      if (notification.data?.image) {
        localNotif.largeIcon = notification.data.image;
      }

      await LocalNotifications.schedule({ notifications: [localNotif] });
    } catch (e) {
      console.warn('Local notification failed:', e);
    }
  }

  /**
   * Navigate to the appropriate page based on notification data.
   */
  private handleNotificationTap(data: any) {
    if (!data) {
      this.router.navigate(['/notifications']);
      return;
    }

    const type = data.type || data.notification_type || '';

    const routeMap: { [key: string]: string } = {
      homework: '/homework',
      exam: '/exams',
      attendance: '/attendance',
      fee: '/fees',
      fees: '/fees',
      meeting: '/meetings',
      meetings: '/meetings',
      transport: '/transports',
      message: '/messages',
      messages: '/messages',
      broadcast: '/messages',
      complaint: '/complaints',
      complaints: '/complaints',
      calendar: '/calender',
      syllabus: '/syllabus',
      notification: '/notifications',
      absent_notification: '/attendance',
      fee_reminder: '/fees',
      fee_receipt: '/fees',
      birthday_wish: '/notifications'
    };

    const route = routeMap[type.toLowerCase()] || '/notifications';
    this.router.navigate([route]);
  }
}
