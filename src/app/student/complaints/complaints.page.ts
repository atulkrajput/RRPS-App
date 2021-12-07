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
    //console.log(sDetails.id);
    const loader = await this.constants.getLoader();
    this.api.complaint(sDetails.id).subscribe(async (result: any) => {
      await loader.dismiss();
      console.log(result.data);
      this.activeComplainData = result.data.activeComplaint;
      this.complainData = result.data.complaintHistory;
    }, async (error) => {
      await  loader.dismiss();
      this.constants.presentToast('Unable To get Meetings Data. Check Your Internet Connection.');
    });
  }
}
