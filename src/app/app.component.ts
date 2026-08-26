/* eslint-disable @typescript-eslint/naming-convention */
import { Component } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Storage } from '@capacitor/storage';
import { AlertController, MenuController, NavController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { ConstantsService } from './services/constants.service';
import { ApiService } from './services/api.service';
import { PushNotificationService } from './services/push-notification.service';
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
    private router: Router,
    private pushService: PushNotificationService
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
        this.navCtrl.navigateRoot(['splash']);
      }
      this.initializePushNotifications();
    });
  }

  async initializePushNotifications() {
    // Initialize push notifications (registers device for broadcast)
    await this.pushService.initPushNotifications();

    // If student is logged in, also register device for that student
    try {
      const sData = await Storage.get({ key: 'studentData' });
      if (sData.value) {
        const student = JSON.parse(sData.value);
        if (student && student.id) {
          await this.pushService.registerDeviceForStudent(student.id);
        }
      }
    } catch (e) {
      // Ignore — push will still work for broadcasts
    }
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
      // Root pages accessible from side menu — show exit confirmation
      const rootPages = [
        '/dashboard', '/login', '/profile', '/homework', '/fees',
        '/syllabus', '/exams', '/attendance', '/calender', '/transports',
        '/meetings', '/complaints', '/feedbacks', '/messages', '/settings'
      ];
      if (rootPages.some(p => url === p || url.startsWith(p + '?'))) {
        const alert = await this.alertCtrl.create({
          cssClass: 'exit-alert',
          header: 'Leaving So Soon?',
          message: '<div class="exit-alert-content"><ion-icon name="sad-outline" class="exit-icon"></ion-icon><p>We\'ll miss you! Are you sure you want to exit the app?</p></div>',
          buttons: [
            {
              text: 'Stay',
              role: 'cancel',
              cssClass: 'stay-btn'
            },
            {
              text: 'Exit App',
              cssClass: 'exit-btn',
              handler: () => {
                navigator['app']?.exitApp();
              }
            }
          ],
          backdropDismiss: true
        });
        await alert.present();
      } else {
        // Navigate back for sub-pages
        this.navCtrl.back();
      }
    });
  }

}
