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
  isLoaded = false;
  
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
    const loader = await this.constants.getLoader();
    await loader.present();
    this.api.meetings(sDetails.class_section_id).subscribe(async (result: any) => {
      await loader.dismiss();
      this.isLoaded = true;
      this.newmeetingsData = result.data?.upcomingmeeting || [];
      this.meetingsData = result.data?.meetinghistory || [];
    }, async (error) => {
      await loader.dismiss();
      this.isLoaded = true;
      this.constants.presentToast('Unable To get Meetings Data. Check Your Internet Connection.');
    });
  }

  getUpcomingCount(): number {
    return this.newmeetingsData ? this.newmeetingsData.length : 0;
  }

  getHistoryCount(): number {
    return this.meetingsData ? this.meetingsData.length : 0;
  }

}
