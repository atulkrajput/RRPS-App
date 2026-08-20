import { Component, OnInit } from '@angular/core';
import { AppRate } from '@ionic-native/app-rate/ngx';
import { AlertController, Platform } from '@ionic/angular';
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

  constructor(
    private platform: Platform,
    private alertCtrl: AlertController,
    private constants: ConstantsService,
    private api: ApiService,
    private rate: AppRate,
  ) { }

  ngOnInit() { }

  fetchAppVersion() {
    return environment.appVersion;
  }

  async goToBrowser(value: number) {
    if (value === 0) {
      await Browser.open({ url: 'https://www.facebook.com/rrps.noorpur' });
    } else if (value === 1) {
      await Browser.open({ url: 'https://twitter.com/RRPUBLICSCHOOL1' });
    } else if (value === 2) {
      await Browser.open({ url: 'https://www.instagram.com/doonportal/' });
    }
  }

  async rateApp() {
    this.platform.ready().then(() => {
      this.rate.setPreferences({
        storeAppURL: (environment as any).storeAppURL,
        usesUntilPrompt: 3,
        promptAgainForEachNewVersion: true,
        simpleMode: true
      });
      this.rate.promptForRating(true);
    });
  }

  async changePasswordPrompt() {
    const alert = await this.alertCtrl.create({
      cssClass: 'changePassword',
      mode: 'ios',
      header: 'Change Password',
      inputs: [
        { name: 'oldPassword', placeholder: 'Old Password', type: 'password' },
        { name: 'newPassword', placeholder: 'New Password', type: 'password' },
        { name: 'confirmPassword', placeholder: 'Confirm Password', type: 'password' },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Change',
          handler: data => {
            if (!data.oldPassword) {
              alert.message = 'Enter Old Password';
              return false;
            } else if (!data.newPassword) {
              alert.message = 'Enter New Password';
              return false;
            } else if (data.newPassword.length < 5) {
              alert.message = 'Too Short New Password.<br/>Minimum 5 Characters Required.';
              return false;
            } else if (!data.confirmPassword) {
              alert.message = 'Enter Confirm Password';
              return false;
            } else if (data.newPassword !== data.confirmPassword) {
              alert.message = 'Passwords Do Not Match';
              return false;
            } else {
              this.changePassword(data.oldPassword, data.newPassword, data.confirmPassword);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async changePassword(oldPwd: string, newPwd: string, confirmPwd: string) {
    const sData = await Storage.get({ key: 'studentData' });
    const sDetails = JSON.parse(sData.value);
    const loader = await this.constants.getLoader();
    await loader.present();
    this.api.changePassword(sDetails.id, oldPwd, newPwd, confirmPwd).subscribe(async (result: any) => {
      await loader.dismiss();
      this.constants.presentToast(result.msg);
    }, async (error) => {
      await loader.dismiss();
      this.constants.presentToast('Unable to change password. Check your internet connection.');
    });
  }

  async changeNotification() { }

  async checkForUpdate() {
    const loader = await this.constants.getLoader();
    await loader.present();
    this.api.checkAppVersion(environment.appVersion).subscribe(async (result: any) => {
      await loader.dismiss();
      if (result.status === 1 && result.data.needs_update) {
        const updateAlert = await this.alertCtrl.create({
          header: 'Update Available',
          message: result.data.changelog || 'A new version is available.',
          buttons: [
            { text: 'Later', role: 'cancel' },
            {
              text: 'Update',
              handler: () => {
                if (result.data.download_url) {
                  window.open(result.data.download_url, '_system');
                }
              }
            }
          ],
          backdropDismiss: !result.data.force_update
        });
        await updateAlert.present();
      } else {
        this.constants.presentToast('App is up to date');
      }
    }, async (error) => {
      await loader.dismiss();
      this.constants.presentToast('Unable to check for updates.');
    });
  }
}
