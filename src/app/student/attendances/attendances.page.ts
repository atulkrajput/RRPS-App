import { Component, OnInit } from '@angular/core';
import { Storage } from '@capacitor/storage';
import { ApiService } from 'src/app/services/api.service';
import { ConstantsService } from 'src/app/services/constants.service';

@Component({
  selector: 'app-attendances',
  templateUrl: './attendances.page.html',
  styleUrls: ['./attendances.page.scss'],
})
export class AttendancesPage implements OnInit {

  attendancesData = [];

  constructor(
    private constants: ConstantsService,
    private api: ApiService,
  ) { }

  ngOnInit() {
    this.getAttandances();
  }

  async getAttandances(){
    const sData = await Storage.get({ key: 'studentData'});
    const sDetails = JSON.parse(sData.value);
    //console.log(sDetails.id);
    const loader = await this.constants.getLoader();
    await loader.present();
    this.api.attendance(sDetails.id).subscribe(async (result: any) => {
      await loader.dismiss();
      // console.log(result.data);
      this.attendancesData = result.data;
      // console.log(this.attendancesData);
    }, async (error) => {
      await  loader.dismiss();
      this.constants.presentToast('Unable To Fetch Your Attendance. Check Your Internet Connection.');
    });
  }

}
