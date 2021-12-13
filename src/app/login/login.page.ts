/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Network } from '@capacitor/network';
import { Storage } from '@capacitor/storage';
import { NavController } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { ConstantsService } from '../services/constants.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  loginFormSubmit = false;
  constructor(
    private fb: FormBuilder,
    private constants: ConstantsService,
    private api: ApiService,
    private navController: NavController,
    ) {
      this.loginForm = this.fb.group({
        regid: ['', [Validators.required]],
        password: ['', [Validators.required]]
      });
    }

  ngOnInit() {
  }

  async login() {
    this.loginFormSubmit = true;
    if(this.loginForm.valid) {
      const connected = await Network.getStatus();
      if (connected.connected) {
        const loader = await this.constants.getLoader();
        await loader.present();
        this.api.login(this.loginForm.value).subscribe(async (result: any) => {
          await loader.dismiss();
          // this.constants.presentToast(result.status);
          if (result.status !== 1) {
            this.constants.presentToast(result.msg);
          } else {
            await Storage.set({
              key: 'studentData',
              value: JSON.stringify(result.data)
            });
            ConstantsService.studentBasicData = {
              id: result.data.id,
              reg_id: result.data.reg_id,
              prefix: result.data.prefix,
              sname: result.data.sname,
              class: result.data.class_category.class,
              section: result.data.class_section.section_type,
              profilePic: result.data.pic
            };
            ConstantsService.studentProfileData = {
              id: result.data.id,
              reg_id: result.data.reg_id,
              prefix: result.data.prefix,
              sname: result.data.sname,
              class: result.data.class_category.class,
              section: result.data.class_section.section_type,
              profilePic: result.data.pic,
              father_name: result.data.father_name,
              mother_name: result.data.mother_name,
              address: result.data.address,
              dob: result.data.dob
            };
            this.navController.navigateRoot([ '/', 'dashboard']);
          }
        }, async (error) => {
          await  loader.dismiss();
          this.constants.presentToast('Unable to login. Please try again later');
        });
      } else {
        this.constants.presentToast('Check your internet connection.');
      }
    }
  }
}
