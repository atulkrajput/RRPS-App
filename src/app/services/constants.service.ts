import { Injectable } from '@angular/core';
import {
  LoadingController,
  LoadingOptions, ToastController
} from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { StudentBasicData } from '../interfaces/student_basic_data';
import { StudentProfileData } from '../interfaces/student_profile_data';
import { ApiService } from '../services/api.service';


@Injectable({
  providedIn: 'root',
})

export class ConstantsService {

  public static studentBasicData: StudentBasicData = undefined;
  public static studentProfileData: StudentProfileData = undefined;

  // public static userData: any = null;
  // public static appVersion  = '';
  // public static placeData = [];
  // public static packagesData = [];
  // public static categories = [];
  // public static imei  = '';
  // public static fcm  = '';
  // public static os  = '';
  // public static model  = '';

  constructor(
    // private navController: NavController,
    // private storage: NativeStorage,
    // private alertCtrl: AlertController,
    private toastController: ToastController,
    private loadCtrl: LoadingController,
    private api: ApiService
  ) {}

  async getLoader(loaderOptions: LoadingOptions = null) {
    const loader = await this.loadCtrl.create({
      spinner: 'crescent',
      backdropDismiss: true,
      message: 'Please wait...',
      translucent: true,
      cssClass: 'loader-css',
      ...loaderOptions,
    });
    return loader;
  }

  async registerToken() {
    // const user = ConstantsService.userData;
    // if (user) {
    //   const formData = new FormData();
    //   formData.append('id', user.id);
    //   formData.append('token', user.token);
    //   formData.append('fcm_token', ConstantsService.fcm);
    //   formData.append('uid', ConstantsService.imei);
    //   formData.append('app_version', ConstantsService.appVersion);
    //   formData.append('os', ConstantsService.os);
    //   formData.append('model', ConstantsService.model);
    //   this.api.updateFCMDetails(formData).subscribe((result: any) => {
    //   }, (error) => {
    //   });
  }

  async presentToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration:3000,
      buttons: [
        {
          text: 'Close',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
}
