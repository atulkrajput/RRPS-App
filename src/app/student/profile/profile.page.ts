import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Storage } from '@capacitor/storage';
import { ApiService } from 'src/app/services/api.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { PushNotificationService } from 'src/app/services/push-notification.service';
import { StudentProfileData } from 'src/app/interfaces/student_profile_data';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  studentProfileData: StudentProfileData;
  profilePic: string = null;
  houseGradient: string;
  houseColor: string;
  houseName: string;

  constructor(
    private api: ApiService,
    private alertCtrl: AlertController,
    private router: Router,
    private pushService: PushNotificationService
  ) {
    this.studentProfileData = ConstantsService.studentProfileData;
    this.houseGradient = ConstantsService.getHouseGradient();
    this.houseColor = ConstantsService.getHouseColorCode();
    this.houseName = ConstantsService.getHouseName();
  }

  ngOnInit() {
    this.loadProfilePic();
  }

  ionViewWillEnter() {
    this.loadProfilePic();
    this.houseGradient = ConstantsService.getHouseGradient();
    this.houseColor = ConstantsService.getHouseColorCode();
    this.houseName = ConstantsService.getHouseName();
  }

  loadProfilePic() {
    if (this.studentProfileData && this.studentProfileData.profilePic) {
      this.profilePic = this.api.profilePicUrl + this.studentProfileData.profilePic + '?Date=' + Date.now();
    }
  }

  async logOut() {
    const alert = await this.alertCtrl.create({
      header: 'Confirmation',
      message: 'Are you sure you want to log out?',
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Yes',
          handler: async () => {
            // Unlink device from student before clearing storage
            const studentId = ConstantsService.studentProfileData?.id;
            if (studentId) {
              await this.pushService.unlinkStudentFromDevice(studentId);
            }
            // Keep device_id and device_uid for re-registration
            const deviceId = await Storage.get({ key: 'device_id' });
            const deviceUid = await Storage.get({ key: 'device_uid' });
            const fcmToken = await Storage.get({ key: 'fcm_token' });
            await Storage.clear();
            if (deviceId.value) { await Storage.set({ key: 'device_id', value: deviceId.value }); }
            if (deviceUid.value) { await Storage.set({ key: 'device_uid', value: deviceUid.value }); }
            if (fcmToken.value) { await Storage.set({ key: 'fcm_token', value: fcmToken.value }); }
            ConstantsService.studentBasicData = undefined;
            ConstantsService.studentProfileData = undefined;
            this.router.navigate(['/login']);
          }
        }
      ]
    });
    await alert.present();
  }
}
