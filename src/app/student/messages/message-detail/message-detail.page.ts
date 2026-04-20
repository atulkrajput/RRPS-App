import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Storage } from '@capacitor/storage';
import { ApiService } from 'src/app/services/api.service';
import { ConstantsService } from 'src/app/services/constants.service';

@Component({
  selector: 'app-message-detail',
  templateUrl: './message-detail.page.html',
  styleUrls: ['./message-detail.page.scss'],
})
export class MessageDetailPage implements OnInit {
  message: any = null;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private constants: ConstantsService
  ) {}

  ngOnInit() {
    this.loadDetail();
  }

  async loadDetail() {
    const messageId = +this.route.snapshot.queryParamMap.get('message_id');
    if (!messageId) { return; }
    const sData = await Storage.get({ key: 'studentData' });
    const sDetails = JSON.parse(sData.value);
    const loader = await this.constants.getLoader();
    await loader.present();
    this.api.getMessageDetail(sDetails.id, messageId).subscribe(async (result: any) => {
      await loader.dismiss();
      if (result.status === 1) {
        this.message = result.data;
      } else {
        this.constants.presentToast(result.msg || 'Message not found');
      }
    }, async (error) => {
      await loader.dismiss();
      this.constants.presentToast('Unable to load message.');
    });
  }

  getSenderIcon(senderType: string): string {
    const icons = {
      class_teacher: 'school-outline',
      subject_teacher: 'book-outline',
      reception: 'business-outline',
      principal: 'ribbon-outline',
      system: 'notifications-outline'
    };
    return icons[senderType] || 'mail-outline';
  }

  getSenderGradient(senderType: string): string {
    const gradients = {
      class_teacher: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      subject_teacher: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      reception: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      principal: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      system: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    };
    return gradients[senderType] || 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
  }
}
