/* eslint-disable @typescript-eslint/naming-convention */
import { Component } from '@angular/core';
import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PermissionStatus, PushNotifications, PushNotificationSchema } from '@capacitor/push-notifications';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Storage } from '@capacitor/storage';
import { AlertController, MenuController, NavController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { ConstantsService } from './services/constants.service';
import { ApiService } from './services/api.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  version = '';
  constructor(
    private navCtrl: NavController,
    private platform: Platform,
    private menuCtrl: MenuController,
    private constants: ConstantsService,
    private api: ApiService,
    private alertCtrl: AlertController,
    private router: Router
  ) {
    this.initializeApp();
    this.setupBackButton();
  }

  initializeApp() {
    this.platform.ready().then(async () => {
      if (Capacitor.isPluginAvailable('StatusBar')) {
        await StatusBar.setStyle({ style: Style.Default });
      }
      if (Capacitor.isPluginAvailable('SplashScreen')) {
        await SplashScreen.hide();
      }

      // Check for app updates
      this.checkForUpdate();

      let studentData = null;
      try {
        studentData = JSON.parse((await Storage.get({
          key: 'studentData'
        })).value);
      } catch (error) {
        studentData = null;
      }
      if (!!studentData) {
        ConstantsService.studentBasicData = {
          id: studentData.id,
          reg_id: studentData.reg_id,
          prefix: studentData.prefix,
          sname: studentData.sname,
          class: studentData.class_category.class,
          section: studentData.class_section.section_type,
          profilePic: studentData.pic,
          house_color: studentData.house_color || null,
          house_color_code: studentData.house_color_code || null,
          house_name: studentData.house ? studentData.house.name : null
        };
        ConstantsService.studentProfileData = {
          id: studentData.id,
          reg_id: studentData.reg_id,
          prefix: studentData.prefix,
          sname: studentData.sname,
          class: studentData.class_category.class,
          section: studentData.class_section.section_type,
          profilePic: studentData.pic,
          father_name: studentData.father_name,
          mother_name: studentData.mother_name,
          address: studentData.address,
          dob: studentData.dob,
          house_color: studentData.house_color || null,
          house_color_code: studentData.house_color_code || null,
          house_name: studentData.house ? studentData.house.name : null,
          class_section_id: studentData.class_section_id,
          academic_session: studentData.academic_session ? studentData.academic_session.session_name : null,
          mobile: studentData.mobile,
          defaulter: studentData.defaulter || false
        };
        this.menuCtrl.enable(true);
        this.navCtrl.navigateRoot(['/', 'dashboard']);
      } else {
        this.menuCtrl.enable(false);
        this.navCtrl.navigateRoot(['login']);
      }
      this.initializeFCM();
    });
  }

  checkForUpdate() {
    this.api.checkAppVersion(environment.appVersion).subscribe(async (result: any) => {
      if (result.status === 1 && result.data && result.data.needs_update) {
        const isForce = result.data.force_update;
        const buttons: any[] = [];

        if (!isForce) {
          buttons.push({ text: 'Later', role: 'cancel' });
        }

        buttons.push({
          text: 'Update Now',
          handler: () => {
            if (result.data.download_url) {
              window.open(result.data.download_url, '_system');
            }
          }
        });

        const alert = await this.alertCtrl.create({
          header: 'Update Available',
          subHeader: `Version ${result.data.latest_version} is available`,
          message: result.data.changelog || 'A new version of the app is available. Please update for the best experience.',
          buttons,
          backdropDismiss: !isForce
        });
        await alert.present();
      }
    });
  }

  setupBackButton() {
    this.platform.backButton.subscribeWithPriority(10, async () => {
      const url = this.router.url;
      // On root pages (dashboard, login), show exit confirmation
      if (url === '/dashboard' || url === '/login') {
        const alert = await this.alertCtrl.create({
          header: 'Exit App',
          message: 'Are you sure you want to exit?',
          buttons: [
            { text: 'Cancel', role: 'cancel' },
            {
              text: 'Exit',
              handler: () => {
                navigator['app']?.exitApp();
              }
            }
          ]
        });
        await alert.present();
      } else {
        // Navigate back for all other pages
        this.navCtrl.back();
      }
    });
  }

  createChannel() {
    PushNotifications.createChannel({
      id: 'default_channel',
      name: 'RRPS',
      description: 'RRPS',
      sound: 'default',
      vibration: true,
      lights: true,
      importance: 5,
      visibility: 1
    });
  }

  checkChannel(channels: any, channelId: string) {
    if (channels.length > 0) {
      const checkData = channels.find(channel => channel.id === channelId);
      return !!checkData;
    }
    return false;
  }

  async initializeFCM() {
    await FirebaseAnalytics.enable();

    const hasPermission: PermissionStatus = await PushNotifications.checkPermissions();
    if (hasPermission && hasPermission.receive === 'granted') {
      const granted = await LocalNotifications.checkPermissions();
      if (granted && granted.display === 'granted') {
        this.registerFCM();
      } else {
        this.constants.presentToast('Please Enable Notifications Setting To Recieve Notifications');
      }
    } else {
      this.registerFCM();
    }
  }

  async registerFCM() {
    if (this.platform.is('ios')) {
      PushNotifications.register();
    }
    PushNotifications.addListener('registration', async (token) => {
      await this.api.updateFCMDetails(token);
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      console.log(error);
      this.constants.presentToast('Unable to register for push notifications.');
    });

    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      this.initalizeLocal(notification);
    });

    if (this.platform.is('android')) {
      PushNotifications.listChannels().then((channels) => {
        if (!this.checkChannel(channels.channels, 'default_channel')) {
          this.createChannel();
        }
      });
    }
    PushNotifications.register().then(res => {
      console.log(res);
    }).catch(err => {
      console.log(err);
    });
  }

  async initalizeLocal(data: any) {
    const granted = await LocalNotifications.requestPermissions();
    if (granted.display !== 'granted') {
      this.constants.presentToast('Please Enable Notifications Setting To Recieve Notifications');
    } else {
      this.showLocal(data);
    }
  }

  async showLocal(data: any) {
    const notification: any = {
      id: Math.random(),
      title: data.title,
      body: data.body,
      summaryText: data.body,
      channelId: 'default_channel'
    };
    if (data.image) {
      notification.attachments = [data.image];
    }
    LocalNotifications.schedule({ notifications: [notification] });
  }
}
