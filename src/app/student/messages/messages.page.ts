import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@capacitor/storage';
import { ApiService } from 'src/app/services/api.service';
import { ConstantsService } from 'src/app/services/constants.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
})
export class MessagesPage implements OnInit {
  messages: any[] = [];
  studentId: number = null;

  constructor(
    private api: ApiService,
    private constants: ConstantsService,
    private router: Router
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.loadMessages();
  }

  async loadMessages() {
    const sData = await Storage.get({ key: 'studentData' });
    const sDetails = JSON.parse(sData.value);
    this.studentId = sDetails.id;
    const loader = await this.constants.getLoader();
    await loader.present();
    this.api.getMessages(sDetails.id).subscribe(async (result: any) => {
      await loader.dismiss();
      if (result.status === 1) {
        this.messages = result.data || [];
      } else {
        this.messages = [];
      }
    }, async (error) => {
      await loader.dismiss();
      this.constants.presentToast('Unable to fetch messages. Check your internet connection.');
    });
  }

  openMessage(msg: any) {
    this.router.navigate(['/messages/detail'], {
      queryParams: { message_id: msg.id }
    });
  }

  getUnreadCount(): number {
    return this.messages.filter(m => m.is_read === 0).length;
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

  getTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) { return 'Just now'; }
    if (mins < 60) { return mins + 'm ago'; }
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) { return hrs + 'h ago'; }
    const days = Math.floor(hrs / 24);
    if (days < 7) { return days + 'd ago'; }
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  doRefresh(event: any) {
    this.api.getMessages(this.studentId).subscribe((result: any) => {
      event.target.complete();
      if (result.status === 1) {
        this.messages = result.data || [];
      }
    }, () => {
      event.target.complete();
    });
  }
}
