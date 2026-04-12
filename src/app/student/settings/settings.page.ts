import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Storage } from '@capacitor/storage';
import { ApiService } from 'src/app/services/api.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  constructor(
    private alertCtrl: AlertController,
    private api: ApiService,
    private constants: ConstantsService
  ) { }

  ngOnInit() { }

  goToBrowser(value: number) { }

  async rateApp() { }

  fetchAppVersion() {
    return environment.appVersion;
  }

  async changePasswordPrompt() {
    const alert = await this.alertCtrl.create({
      header: 'Change Password',
      inputs: [
        { name: 'oldPassword', type: 'password', placeholder: 'Current Password' },
        { name: 'newPassword', type: 'password', placeholder: 'New Password' },
        { name: 'confirmPassword', type: 'password', placeholder: 'Confirm New Password' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Change',
          handler: (data) => {
            if (!data.oldPassword || !data.newPassword || !data.confirmPassword) {
              this.constants.presentToast('Please fill all fields');
              return false;
            }
            if (data.newPassword !== data.confirmPassword) {
              this.constants.presentToast('New password and confirmation do not match');
              return false;
            }
            this.changePassword(data.oldPassword, data.newPassword, data.confirmPassword);
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
    this.api.checkAppVersion(this.fetchAppVersion()).subscribe(async (result: any) => {
      await loader.dismiss();
      if (result.status === 1 && result.data.needs_update) {
        const alert = await this.alertCtrl.create({
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
        await alert.present();
      } else {
        this.constants.presentToast('App is up to date');
      }
    }, async (error) => {
      await loader.dismiss();
      this.constants.presentToast('Unable to check for updates.');
    });
  }
}
