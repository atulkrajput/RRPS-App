import { AfterContentInit, AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@capacitor/storage';
import { AlertController, MenuController } from '@ionic/angular';
import { StudentBasicData } from 'src/app/interfaces/student_basic_data';
import { ApiService } from 'src/app/services/api.service';
import { ConstantsService } from 'src/app/services/constants.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  studentBasicData: StudentBasicData ;
  profilePic: string = null;

  constructor(
    private api: ApiService,
    private alertCtrl: AlertController,
    private menuController: MenuController,
    private router: Router
    ) {
    this.menuController.enable(true);
    this.studentBasicData = ConstantsService.studentBasicData;
  }

  ngOnInit() {

  }

  ionViewWillEnter() {
    this.studentBasicData = ConstantsService.studentBasicData;
    this.profilePic =  this.api.profilePicUrl + this.studentBasicData.profilePic+ '?Date=' + Date.now();

  }

  async logOut() {
    const alert = await this.alertCtrl.create({
      header: 'Confirmation',
      message: 'Are you sure you want to log out ?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: async () => {
            await Storage.clear();
            ConstantsService.studentBasicData = undefined;
            this.router.navigate(['/login']);
          }
        }
      ]
    });
    await alert.present();
  }
}
