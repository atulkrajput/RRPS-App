import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { Storage } from '@capacitor/storage';

@Component({
  selector: 'app-feedbacks',
  templateUrl: './feedbacks.page.html',
  styleUrls: ['./feedbacks.page.scss'],
})
export class FeedbacksPage implements OnInit {
  feedbackData = null;
  constructor(
    private constants: ConstantsService,
    private api: ApiService,
  ) { }

  ngOnInit() {
    this.getFeedbacks();
  }

  async getFeedbacks()
  {
    const sData = await Storage.get({ key: 'studentData'});
    const sDetails = JSON.parse(sData.value);
    //console.log(sDetails.id);
    const loader = await this.constants.getLoader();
    this.api.feedback(sDetails.id).subscribe(async (result: any) => {
      await loader.dismiss();
      console.log(result.data);
      this.feedbackData = result.data;
    }, async (error) => {
      await  loader.dismiss();
      this.constants.presentToast('Unable To get Feedback Data. Check Your Internet Connection.');
    });
  }

}
