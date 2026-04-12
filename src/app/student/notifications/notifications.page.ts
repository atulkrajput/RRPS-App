import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { Storage } from '@capacitor/storage';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {

  notificationData = null;
  constructor(
    private constants: ConstantsService,
    private api: ApiService,
  ) { }

  ngOnInit() {
    this.getNotification();
  }

  async getNotification()
  {
    const sData = await Storage.get({ key: 'studentData'});
    const sDetails = JSON.parse(sData.value);
    //console.log(sDetails.id);
    const loader = await this.constants.getLoader();
    this.api.notifications(sDetails.id).subscribe(async (result: any) => {
      await loader.dismiss();
      //console.log(result.data);
      this.notificationData = result.data;
    }, async (error) => {
      await  loader.dismiss();
      this.constants.presentToast('Unable To get Notification Data. Check Your Internet Connection.');
    });
  }

}
