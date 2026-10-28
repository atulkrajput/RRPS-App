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
  isLoaded = false;
  
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
    const loader = await this.constants.getLoader();
    await loader.present();
    this.api.feedback(sDetails.id).subscribe(async (result: any) => {
      await loader.dismiss();
      this.isLoaded = true;
      this.feedbackData = Array.isArray(result.data) ? result.data : [];
    }, async (error) => {
      await loader.dismiss();
      this.isLoaded = true;
      this.feedbackData = [];
      this.constants.presentToast('Unable To get Feedback Data. Check Your Internet Connection.');
    });
  }

  getFeedbackCount(): number {
    return this.feedbackData ? this.feedbackData.length : 0;
  }

  getFeedbackGradient(index: number): string {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    ];
    return gradients[index % gradients.length];
  }

  // Ratings are given out of 5; used to size the fill bar as a percentage.
  ratingPercent(value: number): number {
    return Math.max(0, Math.min(5, value || 0)) / 5 * 100;
  }

}
