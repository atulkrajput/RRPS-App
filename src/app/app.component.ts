/* eslint-disable @typescript-eslint/naming-convention */
import { Component } from '@angular/core';
import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PermissionStatus, PushNotifications, PushNotificationSchema } from '@capacitor/push-notifications';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Storage } from '@capacitor/storage';
import { MenuController, NavController, Platform } from '@ionic/angular';
import { ConstantsService } from './services/constants.service';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(
    private navCtrl: NavController,
    private platform: Platform,
    private menuCtrl: MenuController,
    private constants: ConstantsService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(async () => {
      await StatusBar.setStyle({ style: Style.Default });
      await SplashScreen.hide();

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
          profilePic: studentData.pic
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
          dob: studentData.dob
        };
        this.menuCtrl.enable(true);
        this.navCtrl.navigateRoot(['/', 'dashboard']);
      } else {
        this.menuCtrl.enable(false);
        this.navCtrl.navigateRoot(['login']);
      }
    });
  }

  createChannel() {
    PushNotifications.createChannel({
      id: "default_channel",
      name: "RRPS",
      description: "RRPS",
      sound: "default",
      vibration: true,
      lights: true,
      importance: 5,
      visibility: 1
    });
  }

  checkChannel(channels: any, channelId: string) {
    if (channels.length > 0) {
      const checkData = channels.find(channel => channel.id == channelId)
      if (checkData)
        return true;
      else return false;
    } else return false;
  }

  async initializeFCM() {
    await FirebaseAnalytics.enable();

    const hasPermission : PermissionStatus = await PushNotifications.checkPermissions();
    if (hasPermission && hasPermission.receive == 'granted') {
      const granted = await LocalNotifications.checkPermissions();
      if (granted && granted.display == 'granted') {
        this.registerFCM();
      } else {
        this.constants.presentToast("Please Enable Notifications Setting To Recieve Notifications")
      }
    } else {
      this.registerFCM();
    }
  }

  async registerFCM() {
    if(this.platform.is('ios')) {
      PushNotifications.register();
    }
    PushNotifications.addListener('registration', (token) => {
      console.log("Token", token.value)
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      console.log(error)
      this.constants.presentToast("Unable to register for push notifications.")
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
    PushNotifications.register().then(res=> {
      console.log(res)
    }).catch(err => {
      console.log(err)
    });
  }

  async initalizeLocal(data: any) {
    const granted = await LocalNotifications.requestPermissions();
    if (granted.display != 'granted') {
      this.constants.presentToast("Please Enable Notifications Setting To Recieve Notifications")
    } else {
      this.showLocal(data);
    }
  }

  async showLocal(data: any) {
    if (data.image) {
      LocalNotifications.schedule({
        notifications : [
          {
            id : Math.random(),
            title: data.title,
            body: data.body,
            summaryText: data.body,
            attachments: [data.image],
            channelId: 'default_channel'
          }
        ]
      })
    } else {
      LocalNotifications.schedule({
        notifications : [
          {
            id : Math.random(),
            title: data.title,
            body: data.body,
            summaryText: data.body,
            channelId: 'default_channel'
          }
        ]
      })
    }
  }
}
