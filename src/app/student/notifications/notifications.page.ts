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

  notifications: any[] = [];
  unreadCount = 0;
  currentPage = 1;
  totalPages = 0;
  perPage = 20;
  isLoaded = false;
  isLoadingMore = false;
  studentId: number = null;

  constructor(
    private constants: ConstantsService,
    private api: ApiService,
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.loadNotifications();
  }

  async loadNotifications() {
    const sData = await Storage.get({ key: 'studentData' });
    const sDetails = JSON.parse(sData.value);
    this.studentId = sDetails.id;

    const loader = await this.constants.getLoader();
    await loader.present();

    this.currentPage = 1;
    this.api.getNotifications(sDetails.id, this.currentPage, this.perPage).subscribe(async (result: any) => {
      await loader.dismiss();
      this.isLoaded = true;
      if (result.status === 1) {
        this.notifications = result.data || [];
        this.totalPages = result.total_pages || 0;
        this.currentPage = result.current_page || 1;
        this.unreadCount = this.notifications.filter(n => n.is_read === 0).length;
      } else {
        this.notifications = [];
      }
      this.fetchUnreadCount();
    }, async (error) => {
      await loader.dismiss();
      this.isLoaded = true;
      this.constants.presentToast('Unable to get notifications. Check your internet connection.');
    });
  }

  fetchUnreadCount() {
    if (!this.studentId) { return; }
    this.api.getNotificationUnreadCount(this.studentId).subscribe((result: any) => {
      if (result.status === 1 && result.data) {
        this.unreadCount = result.data.unread_count || 0;
      }
    });
  }

  loadMore(event: any) {
    if (this.currentPage >= this.totalPages) {
      event.target.complete();
      event.target.disabled = true;
      return;
    }

    this.currentPage++;
    this.isLoadingMore = true;
    this.api.getNotifications(this.studentId, this.currentPage, this.perPage).subscribe((result: any) => {
      this.isLoadingMore = false;
      event.target.complete();
      if (result.status === 1 && result.data) {
        this.notifications = [...this.notifications, ...result.data];
        this.totalPages = result.total_pages || this.totalPages;
      }
      if (this.currentPage >= this.totalPages) {
        event.target.disabled = true;
      }
    }, () => {
      this.isLoadingMore = false;
      event.target.complete();
    });
  }

  markAsRead(notification: any) {
    if (notification.is_read === 1) { return; }
    this.api.markNotificationRead(this.studentId, notification.id).subscribe((result: any) => {
      if (result.status === 1) {
        notification.is_read = 1;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
    });
  }

  markAllAsRead() {
    if (this.unreadCount === 0) { return; }
    this.api.markAllNotificationsRead(this.studentId).subscribe((result: any) => {
      if (result.status === 1) {
        this.notifications.forEach(n => n.is_read = 1);
        this.unreadCount = 0;
        this.constants.presentToast('All notifications marked as read');
      }
    });
  }

  doRefresh(event: any) {
    this.currentPage = 1;
    this.api.getNotifications(this.studentId, 1, this.perPage).subscribe((result: any) => {
      event.target.complete();
      if (result.status === 1) {
        this.notifications = result.data || [];
        this.totalPages = result.total_pages || 0;
        this.currentPage = result.current_page || 1;
      }
      this.fetchUnreadCount();
    }, () => {
      event.target.complete();
    });
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
}
