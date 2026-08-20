import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Storage } from '@capacitor/storage';
import { ApiService } from 'src/app/services/api.service';
import { ConstantsService } from 'src/app/services/constants.service';
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
    private router: Router
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
            await Storage.clear();
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
