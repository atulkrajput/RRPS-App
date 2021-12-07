import { Component, OnInit } from '@angular/core';
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
  // sDatails = [];
  // profilePic = '';
  constructor(
    private api: ApiService,
  ) {
    this.studentProfileData = ConstantsService.studentProfileData;
    console.log(this.studentProfileData);
    // this.profilePic =  this.api.profilePicUrl + this.studentProfileData.profilePic+ '?Date=' + Date.now();
   }

  ngOnInit() {
   //this.studentProfileData = ConstantsService.studentProfileData;
  }
  ionViewWillEnter() {

  }

  async updateProfile(){
    //const sData = await Storage.get({ key: 'studentData'});
    //this.sDatails = JSON.parse(sData.value);
    //console.log(this.sDatails);
  }
}
