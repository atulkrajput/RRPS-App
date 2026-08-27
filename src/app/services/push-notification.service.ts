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
  private deviceId: number = null; // Server-side device_id from V2 registration

  constructor(
    private platform: Platform,
    private router: Router,
    private api: ApiService
  ) {}

  /**
   * Initialize push notifications — call on app startup.
   * Registers the device via V2 API for broadcast notifications.
   */
  async initPushNotifications() {
    if (!this.platform.is('capacitor')) { return; }

    try {
      // Get device UID
      this.deviceUid = await this.getDeviceUid();

      // Restore device_id from storage if available
      const storedDeviceId = await Storage.get({ key: 'device_id' });
      if (storedDeviceId.value) {
        this.deviceId = parseInt(storedDeviceId.value, 10);
      }

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
   * Register device using V2 API. Called on FCM token receive.
   * Stores the returned device_id for subsequent link/unlink calls.
   */
  private async registerDeviceV2(studentId?: number) {
    try {
      if (!this.deviceUid) {
        this.deviceUid = await this.getDeviceUid();
      }
      const token = this.fcmToken || 'pending';
      const info = await Device.getInfo();
      const deviceType = info.platform === 'ios' ? 'iphone' : 'android';

      this.api.registerDeviceV2(
        this.deviceUid,
        token,
        deviceType,
        info.model || undefined,
        info.osVersion || undefined,
        environment.appVersion,
        studentId
      ).subscribe(
        async (res: any) => {
          if (res?.status === 1 && res?.data?.device_id) {
            this.deviceId = res.data.device_id;
            await Storage.set({ key: 'device_id', value: String(this.deviceId) });
            console.log('Device registered V2, device_id:', this.deviceId);

            // If student is logged in and we got a device_id, link them
            if (!studentId) {
              const sData = await Storage.get({ key: 'studentData' });
              if (sData.value) {
                const student = JSON.parse(sData.value);
                if (student?.id) {
                  this.linkStudentToDevice(student.id);
                }
              }
            }
          }
        },
        (err) => console.warn('Device V2 registration failed:', err)
      );
    } catch (error) {
      console.warn('registerDeviceV2 error:', error);
    }
  }

  /**
   * Link a student to the registered device. Call after login.
   */
  async linkStudentToDevice(studentId: number) {
    if (!this.platform.is('capacitor')) { return; }
    try {
      // Ensure we have a device_id
      if (!this.deviceId) {
        const storedDeviceId = await Storage.get({ key: 'device_id' });
        if (storedDeviceId.value) {
          this.deviceId = parseInt(storedDeviceId.value, 10);
        }
      }

      // If still no device_id, register device with student_id in one call
      if (!this.deviceId) {
        await this.registerDeviceV2(studentId);
        return;
      }

      this.api.linkDeviceStudent(this.deviceId, studentId).subscribe(
        (res: any) => console.log('Student linked to device:', res?.msg),
        (err) => console.warn('Link device student failed:', err)
      );
    } catch (error) {
      console.warn('linkStudentToDevice error:', error);
    }
  }

  /**
   * Unlink a student from the device. Call on logout.
   */
  async unlinkStudentFromDevice(studentId: number) {
    if (!this.platform.is('capacitor')) { return; }
    try {
      if (!this.deviceId) {
        const storedDeviceId = await Storage.get({ key: 'device_id' });
        if (storedDeviceId.value) {
          this.deviceId = parseInt(storedDeviceId.value, 10);
        }
      }

      if (!this.deviceId) {
        console.warn('Cannot unlink: no device_id available');
        return;
      }

      this.api.unlinkDeviceStudent(this.deviceId, studentId).subscribe(
        (res: any) => console.log('Student unlinked from device:', res?.msg),
        (err) => console.warn('Unlink device student failed:', err)
      );
    } catch (error) {
      console.warn('unlinkStudentFromDevice error:', error);
    }
  }

  /**
   * Get the current device_id (for external use if needed).
   */
  getDeviceId(): number | null {
    return this.deviceId;
  }

  /**
   * Setup all push notification listeners.
   */
  private addListeners() {
    // Token received — register device via V2 API
    PushNotifications.addListener('registration', async (token: Token) => {
      console.log('FCM token received:', token.value);
      this.fcmToken = token.value;
      await Storage.set({ key: 'fcm_token', value: token.value });

      // Register device via V2 (handles linking if student already logged in)
      await this.registerDeviceV2();
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
