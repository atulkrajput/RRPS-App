/* eslint-disable @typescript-eslint/naming-convention */
import { Component } from '@angular/core';
import { AlertController, MenuController, Platform } from '@ionic/angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '@angular/router';
import { Storage } from '@capacitor/storage';
import { ConstantsService } from './services/constants.service';
import { PushNotificationService } from './services/push-notification.service';
import { ApiService } from './services/api.service';

const APP_VERSION = '1.0.2';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(
    private router: Router,
    private platform: Platform,
    private menuCtrl: MenuController,
    private statusBar: StatusBar,
    private pushNotificationService: PushNotificationService,
    private api: ApiService,
    private alertCtrl: AlertController
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(async () => {
      this.statusBar.styleDefault();

      // Initialize push notifications
      await this.pushNotificationService.initPushNotifications();

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
        this.router.navigate(['/', 'dashboard']);
        // Re-register device for push notifications
        this.pushNotificationService.registerDeviceForStudent(studentData.id);
      } else {
        this.menuCtrl.enable(false);
        this.router.navigate(['login']);
      }
    });
  }

  checkForUpdate() {
    this.api.checkAppVersion(APP_VERSION).subscribe(async (result: any) => {
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
}
