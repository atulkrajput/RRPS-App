import { Component, OnInit } from '@angular/core';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { AppRate } from '@ionic-native/app-rate/ngx';
import { AlertController, LoadingController, NavController, Platform } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { Browser } from '@capacitor/browser';
import { Storage } from '@capacitor/storage';
import { ConstantsService } from 'src/app/services/constants.service';
import { ApiService } from 'src/app/services/api.service';
@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  version = '';
  constructor(
    private appVersion: AppVersion,
    private platform: Platform,
    private alertCtrl: AlertController,
    private constants: ConstantsService,
    private api: ApiService,
    private rate: AppRate,
    private navCtrl: NavController,
    private loadCtrl: LoadingController,
  ) { }

  async ngOnInit() {
    this.version = await this.appVersion.getVersionNumber();
  }

  async goToBrowser(value: number) {
    if(value ===0)
    {
      await Browser.open({ url: 'https://www.facebook.com/rrps.noorpur'});
    }
    else if(value ===1)
    {
      await Browser.open({ url: 'https://twitter.com/RRPUBLICSCHOOL1'});
    }
    else if(value ===2)
    {
      await Browser.open({ url: 'https://www.instagram.com/doonportal/'});
    }

  }

  async rateApp() {
    //console.log('called');
    this.platform.ready().then(()=>{
      //console.log('called 1');
      this.rate.setPreferences({
        storeAppURL : environment.storeAppURL,
        usesUntilPrompt : 3,
        promptAgainForEachNewVersion : true,
        simpleMode : true
      });
      this.rate.promptForRating(true);
    });
  }

  async changePasswordPrompt() {
    const alert = await this.alertCtrl.create({
      cssClass: 'changePassword',
      mode:'ios',
      header: 'Change Password',
      inputs: [
        {
          name: 'oldPassword',
          placeholder: 'Old Password',
          type: 'password'
        },
        {
          name: 'newPassword',
          placeholder: 'New Password',
          type: 'password'
        },
        {
          name: 'confPassword',
          placeholder: 'Confirm Password',
          type: 'password'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Change',
          handler: data => {
            if (data.oldPassword === '' || data.oldPassword == null) {
              alert.message =  'Enter Old Password';
              return false;
            }
            else if (data.newPassword === '' || data.newPassword == null) {
              alert.message = 'Enter New Password';
              return false;
            }
            else if (data.newPassword.length < 5) {
              alert.message = 'Too Short New Password.<br/>Minimum 5 Characters Required.';
              return false;
            }
            else if (data.confPassword === '' || data.confPassword == null) {
              alert.message = 'Enter Confirm Password';
              return false;
            }
            else if (data.confPassword.length < 5) {
              alert.message = 'Too Short Confirm Password.<br/>Minimum 5 Characters Required.';
              return false;
            }
            else if (data.newPassword !== data.confPassword) {
              alert.message = 'Passwords Do Not Match';
              return false;
            }
            else {
              this.changePassword(data.oldPassword, data.newPassword, data.confPassword);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  async changePassword(old_password: string, new_password: string, conf_password: string) {
    const loader = await this.loadCtrl.create({
      spinner: 'crescent',
      backdropDismiss: true,
      message: 'Please wait...',
      translucent: true,
      cssClass: 'loader-css'
    });
    const sData = await Storage.get({ key: 'studentData'});
    const sDetails = JSON.parse(sData.value);
    loader.present().then(() => {
      const myData = new FormData();
      myData.append('student_id', sDetails.id);
      myData.append('old_password', old_password);
      myData.append('new_password', new_password);
      this.api.changepassword(myData).subscribe((result: any) => {
        loader.dismiss();
        if (result.status === 1) {
          //this.storage.setItem('user', result.data);
          //ConstantsService.userData = result.data;
          this.constants.presentToast(result.msg);
        } else if (result.status === 0) {
            Storage.clear();
            ConstantsService.studentBasicData = undefined;
            ConstantsService.studentProfileData = undefined;
            this.navCtrl.navigateRoot(['/login']);
        } else {
          this.constants.presentToast(result.msg);
        }
      }, (error) => {
        loader.dismiss();
        this.constants.presentToast('Unable To Change Your Password. Check Your Internet Connection.');
      });
    });
  }

  async changeNotification() {
    // const loader = await this.loadingController.create({
    //   spinner: 'crescent',
    //   backdropDismiss: true,
    //   message: 'Please wait...',
    //   translucent: true,
    //   cssClass: 'loader-css'
    // });
    // loader.present().then(() => {
    //   let myData = new FormData();
    //   myData.append('id', this.user.id);
    //   myData.append('token', this.user.token);
    //   myData.append('notifications', '' + (this.notifications ? 1 : 0));
    //   this.api.notificationtoggle(myData).subscribe((result: any) => {
    //     loader.dismiss();
    //     if (result.status == 1) {
    //       this.storage.setItem('user', result.data);
    //       ConstantsService.userData = result.data;
    //       this.constants.presentToast(result.msg);
    //     } else if (result.status == 0) {
    //       this.constants.logOut('Session Expired. Please Log In Again.');
    //     } else {
    //       this.constants.presentToast(result.msg);
    //     }
    //   }, (error) => {
    //     loader.dismiss();
    //     this.constants.presentToast('Unable To Change Your Notifications. Check Your Internet Connection.');
    //   });
    // });
    }
}
