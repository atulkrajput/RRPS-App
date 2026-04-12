import { Component, OnInit } from '@angular/core';
import { Storage } from '@capacitor/storage';
import { ApiService } from 'src/app/services/api.service';
import { ConstantsService } from 'src/app/services/constants.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {
  selectedFilter = 'all';
  notifications: any[] = [];
  filteredNotifications: any[] = [];

  constructor(
    private api: ApiService,
    private constants: ConstantsService
  ) { }

  ngOnInit() {
    this.loadNotifications();
  }

  async loadNotifications() {
    const sData = await Storage.get({ key: 'studentData' });
    const sDetails = JSON.parse(sData.value);
    const loader = await this.constants.getLoader();
    await loader.present();
    this.api.getNotifications(sDetails.id).subscribe(async (result: any) => {
      await loader.dismiss();
      if (result.status === 1) {
        this.notifications = result.data || [];
      } else {
        this.notifications = [];
      }
      this.filterNotifications();
    }, async (error) => {
      await loader.dismiss();
      this.constants.presentToast('Unable to fetch notifications. Check your internet connection.');
      this.notifications = [];
      this.filterNotifications();
    });
  }

  filterNotifications() {
    switch (this.selectedFilter) {
      case 'unread':
        this.filteredNotifications = this.notifications.filter(n => n.status === 1);
        break;
      default:
        this.filteredNotifications = [...this.notifications];
    }
  }

  getNotificationIcon(notification: any): string {
    return 'notifications-outline';
  }

  getNotificationGradient(): string {
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }

  openNotification(notification: any) {
    notification.status = 0;
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.status = 0);
    this.filterNotifications();
  }
}
