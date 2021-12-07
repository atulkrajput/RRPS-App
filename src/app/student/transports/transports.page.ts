import { Component, OnInit } from '@angular/core';
import { Storage } from '@capacitor/storage';
import { ApiService } from 'src/app/services/api.service';
import { ConstantsService } from 'src/app/services/constants.service';

@Component({
  selector: 'app-transports',
  templateUrl: './transports.page.html',
  styleUrls: ['./transports.page.scss'],
})
export class TransportsPage implements OnInit {

  transportData = null;
  constructor(
    private constants: ConstantsService,
    private api: ApiService,
  ) { }

  ngOnInit() {
    this.getTransportData();
  }

  async getTransportData(){
    const sData = await Storage.get({ key: 'studentData'});
    const sDetails = JSON.parse(sData.value);
    //console.log(sDetails.id);
    const loader = await this.constants.getLoader();
    await loader.present();
    this.api.transport(sDetails.id).subscribe(async (result: any) => {
      await loader.dismiss();
      // console.log(result.data);
      this.transportData = result.data;
      console.log(this.transportData);
    }, async (error) => {
      await  loader.dismiss();
      this.constants.presentToast('Unable To Fetch Your Transport Data. Check Your Internet Connection.');
    });
  }


}
