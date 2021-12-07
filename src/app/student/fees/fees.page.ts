import { Component, OnInit } from '@angular/core';
import { Storage } from '@capacitor/storage';
import { ApiService } from 'src/app/services/api.service';
import { ConstantsService } from 'src/app/services/constants.service';

@Component({
  selector: 'app-fees',
  templateUrl: './fees.page.html',
  styleUrls: ['./fees.page.scss'],
})
export class FeesPage implements OnInit {

  feeHistoryData = null;
  monthData = null;

  constructor(
    private constants: ConstantsService,
    private api: ApiService,
  ) { }

  ngOnInit() {
    this.getFeeDetails();
  }

  async getFeeDetails(){
    const sData = await Storage.get({ key: 'studentData'});
    const sDetails = JSON.parse(sData.value);
    //console.log(sDetails.id);
    const loader = await this.constants.getLoader();
    this.api.feeHistory(sDetails.id).subscribe(async (result: any) => {
      await loader.dismiss();
      //console.log(result.data);
      this.feeHistoryData= result.data.fee;
      this.monthData= result.data.months;
    }, async (error) => {
      await  loader.dismiss();
      this.constants.presentToast('Unable To Login. Check Your Internet Connection.');
    });
  }

}
