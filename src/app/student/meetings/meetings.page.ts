import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { Storage } from '@capacitor/storage';

@Component({
  selector: 'app-meetings',
  templateUrl: './meetings.page.html',
  styleUrls: ['./meetings.page.scss'],
})
export class MeetingsPage implements OnInit {
  newmeetingsData = null;
  meetingsData = null;
  constructor(
    private constants: ConstantsService,
    private api: ApiService,
  ) { }

  ngOnInit() {
    this.getMeetings();
  }

  async getMeetings(){
    const sData = await Storage.get({ key: 'studentData'});
    const sDetails = JSON.parse(sData.value);
    //console.log(sDetails.id);
    const loader = await this.constants.getLoader();
    this.api.meetings(sDetails.class_section_id).subscribe(async (result: any) => {
      await loader.dismiss();
      //console.log(sDetails.class_section_id);
      this.newmeetingsData = result.data.upcomingmeeting;
      this.meetingsData = result.data.meetinghistory;
    }, async (error) => {
      await  loader.dismiss();
      this.constants.presentToast('Unable To get Meetings Data. Check Your Internet Connection.');
    });
  }

}
