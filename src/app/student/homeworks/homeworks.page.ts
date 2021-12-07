import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@capacitor/storage';
import { ApiService } from 'src/app/services/api.service';
import { ConstantsService } from 'src/app/services/constants.service';

@Component({
  selector: 'app-homeworks',
  templateUrl: './homeworks.page.html',
  styleUrls: ['./homeworks.page.scss'],
})
export class HomeworksPage implements OnInit {
  hwpastData = null;
  hwtodayData = null;
  hwydayData = null;
  homeworkTabs = 'today';
  constructor(
    private router: Router,
    private constants: ConstantsService,
    private api: ApiService,
  ) { }

  ngOnInit() {
    this.loadHomework();
  }

  homeworkDetails(){
    this.router.navigate(['/homework/homework-details']);
  }
  async loadHomework()
  {
    const sData = await Storage.get({ key: 'studentData'});
    const sDetails = JSON.parse(sData.value);
    const loader = await this.constants.getLoader();
    //Loading Today Homework
    await loader.present();
    this.api.dayhomework(sDetails.id).subscribe(async (result: any) => {
      await loader.dismiss();
      this.hwtodayData = result.data;
      //console.log(this.hwtodayData);
    }, async (error) => {
      await  loader.dismiss();
      this.constants.presentToast('Unable To Fetch Today Homework Data. Check Your Internet Connection.');
    });
    //Loading Yesetrday Homework
    await loader.present();
    this.api.ydayhomework(sDetails.id).subscribe(async (result: any) => {
      await loader.dismiss();
      this.hwydayData = result.data;
      //console.log(this.hwydayData);
    }, async (error) => {
      await  loader.dismiss();
      this.constants.presentToast('Unable To Fetch Yesterday Homework Data. Check Your Internet Connection.');
    });
    //Loading Past Home Work
    await loader.present();
    this.api.dayhomeworkhistory(sDetails.id).subscribe(async (result: any) => {
      await loader.dismiss();
      this.hwpastData = result.data;
      //console.log(this.hwpastData);
    }, async (error) => {
      await  loader.dismiss();
      this.constants.presentToast('Unable To Fetch Past Homework Data. Check Your Internet Connection.');
    });
  }
}
