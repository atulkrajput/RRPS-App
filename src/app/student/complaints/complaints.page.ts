import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { Storage } from '@capacitor/storage';

@Component({
  selector: 'app-complaints',
  templateUrl: './complaints.page.html',
  styleUrls: ['./complaints.page.scss'],
})
export class ComplaintsPage implements OnInit {

  activeComplainData = null;
  complainData = null;
  isLoaded = false;

  constructor(
    private constants: ConstantsService,
    private api: ApiService,
  ) { }

  ngOnInit() {
    this.getCompnlaint();
  }

  async getCompnlaint()
  {
    const sData = await Storage.get({ key: 'studentData'});
    const sDetails = JSON.parse(sData.value);
    const loader = await this.constants.getLoader();
    await loader.present();
    this.api.complaint(sDetails.id).subscribe(async (result: any) => {
      await loader.dismiss();
      this.isLoaded = true;
      this.activeComplainData = result.data?.activeComplaint || [];
      this.complainData = result.data?.complaintHistory || [];
    }, async (error) => {
      await loader.dismiss();
      this.isLoaded = true;
      this.constants.presentToast('Unable To get Complaints Data. Check Your Internet Connection.');
    });
  }

  getActiveCount(): number {
    return this.activeComplainData ? this.activeComplainData.length : 0;
  }

  getHistoryCount(): number {
    return this.complainData ? this.complainData.length : 0;
  }
}
