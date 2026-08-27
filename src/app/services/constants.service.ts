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

  // Default grey color when house is not assigned
  public static readonly DEFAULT_HOUSE_COLOR = '#6b7280';
  public static readonly DEFAULT_HOUSE_GRADIENT = 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';

  static getHouseColorCode(): string {
    return ConstantsService.studentBasicData?.house_color_code || ConstantsService.DEFAULT_HOUSE_COLOR;
  }

  static getHouseGradient(): string {
    const color = ConstantsService.getHouseColorCode();
    if (color === ConstantsService.DEFAULT_HOUSE_COLOR) {
      return ConstantsService.DEFAULT_HOUSE_GRADIENT;
    }
    // Generate a darker shade for gradient end
    return `linear-gradient(135deg, ${color} 0%, ${ConstantsService.darkenColor(color, 30)} 100%)`;
  }

  static getHouseName(): string {
    return ConstantsService.studentBasicData?.house_name || 'No House';
  }

  private static darkenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - Math.round(2.55 * percent));
    const g = Math.max(0, ((num >> 8) & 0x00FF) - Math.round(2.55 * percent));
    const b = Math.max(0, (num & 0x0000FF) - Math.round(2.55 * percent));
    return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
  }

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
      duration: 3000,
      position: 'bottom',
      cssClass: 'modern-toast',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
}
