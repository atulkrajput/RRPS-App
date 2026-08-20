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
  isLoaded = false;

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
    const loader = await this.constants.getLoader();
    await loader.present();
    this.api.transport(sDetails.id).subscribe(async (result: any) => {
      await loader.dismiss();
      this.isLoaded = true;
      this.transportData = result.data;
    }, async (error) => {
      await loader.dismiss();
      this.isLoaded = true;
      this.constants.presentToast('Unable To Fetch Your Transport Data. Check Your Internet Connection.');
    });
  }


}
