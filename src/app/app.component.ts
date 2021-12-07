/* eslint-disable @typescript-eslint/naming-convention */
import { Component } from '@angular/core';
import { MenuController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { Storage } from '@capacitor/storage';
import { ConstantsService } from './services/constants.service';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(
    private router: Router,
    private platform: Platform,
    private menuCtrl: MenuController,
    // private authenticationService: AuthenticationService
  ) {
    this.initializeApp();
    }

    initializeApp() {
      this.platform.ready().then(async () => {
        let studentData = null;
        try{
          studentData = JSON.parse((await Storage.get({
            key: 'studentData'
          })).value);
        } catch(error) {
          studentData = null;
        }
        if(!!studentData) {
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
          this.router.navigate([ '/', 'dashboard']);
          // this.router.navigate(['login']);
        }  else {
          this.menuCtrl.enable(false);

          this.router.navigate(['login']);
        }
        // this.authenticationService.authState.subscribe(state => {
        //   if (state) {
        //     this.router.navigate(['dashboard']);
        //   } else {
        //     this.router.navigate(['login']);
        //   }
        // });
      });
    }

}
