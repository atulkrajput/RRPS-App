import { Component, OnInit } from '@angular/core';
import { Storage } from '@capacitor/storage';
import { AlertController, MenuController, NavController } from '@ionic/angular';
import { StudentBasicData } from 'src/app/interfaces/student_basic_data';
import { ApiService } from 'src/app/services/api.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { PushNotificationService } from 'src/app/services/push-notification.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  studentBasicData: StudentBasicData;
  profilePic: string = null;
  houseGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  houseName = 'No House';
  todayExams = 0;
  upcomingExams = 0;
  unreadNotifications = 0;
  attendancePercentage = 0;
  isDefaulter = false;

  menuItems = [
    // Daily
    { title: 'Homework', subtitle: 'Daily tasks', icon: 'book-outline', route: '/homework', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { title: 'Attendance', subtitle: 'Your record', icon: 'calendar-outline', route: '/attendance', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { title: 'Calendar', subtitle: 'Events & holidays', icon: 'today-outline', route: '/calender', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
    { title: 'Messages', subtitle: 'School updates', icon: 'chatbubbles-outline', route: '/messages', gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' },
    // Academics
    { title: 'Exams & Results', subtitle: 'Tests & marks', icon: 'document-text-outline', route: '/exams', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { title: 'Syllabus', subtitle: 'Study material', icon: 'library-outline', route: '/syllabus', gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
    // School Services
    { title: 'Fees', subtitle: 'Fee status', icon: 'card-outline', route: '/fees', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { title: 'Transport', subtitle: 'Bus details', icon: 'bus-outline', route: '/transports', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { title: 'PTM', subtitle: 'Parent meetings', icon: 'people-outline', route: '/meetings', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
    { title: 'Complaints', subtitle: 'Raise issue', icon: 'chatbubble-ellipses-outline', route: '/complaints', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
    { title: 'Report Card', subtitle: 'Performance', icon: 'ribbon-outline', route: '/feedbacks', gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
    { title: 'Settings', subtitle: 'Account', icon: 'settings-outline', route: '/settings', gradient: 'linear-gradient(135deg, #c3cfe2 0%, #f5f7fa 100%)' },
  ];

  constructor(
    private api: ApiService,
    private alertCtrl: AlertController,
    private menuController: MenuController,
    private navCtrl: NavController,
    private pushService: PushNotificationService
  ) {
    this.menuController.enable(true);
    this.studentBasicData = ConstantsService.studentBasicData;
  }

  ngOnInit() { }

  ionViewWillEnter() {
    this.studentBasicData = ConstantsService.studentBasicData;
    this.profilePic = this.api.profilePicUrl + this.studentBasicData.profilePic + '?Date=' + Date.now();

    // Set house theme
    if (this.studentBasicData.house_color_code) {
      this.houseGradient = `linear-gradient(135deg, ${this.studentBasicData.house_color_code} 0%, ${this.studentBasicData.house_color_code}cc 100%)`;
    }
    if (this.studentBasicData.house_name) {
      this.houseName = this.studentBasicData.house_name;
    }

    this.loadDashboardData();
  }

  loadDashboardData() {
    // Load dashboard data
    this.api.dashboard(this.studentBasicData.id).subscribe((result: any) => {
      if (result.status === 1 && result.data) {
        this.todayExams = result.data.todayExam || 0;
        this.upcomingExams = result.data.upcomingExam || 0;
        this.unreadNotifications = result.data.unread_messages || 0;

        // Attendance from dashboard API
        if (result.data.attendance) {
          this.attendancePercentage = result.data.attendance.percentage || 0;
        }
      }
    });

    // Check defaulter status from profile data
    const profileData = ConstantsService.studentProfileData;
    if (profileData && profileData.defaulter) {
      this.isDefaulter = true;
    }

    // Fetch notification unread count
    this.api.getNotificationUnreadCount(this.studentBasicData.id).subscribe((result: any) => {
      if (result.status === 1 && result.data) {
        this.unreadNotifications = result.data.unread_count || 0;
      }
    });
  }

  // Pull to refresh handler
  doRefresh(event: any) {
    this.loadDashboardData();
    // Complete the refresh after a brief delay
    setTimeout(() => {
      event.target.complete();
    }, 1500);
  }

  async logOut() {
    const alert = await this.alertCtrl.create({
      header: 'Confirmation',
      message: 'Are you sure you want to log out?',
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Yes',
          handler: async () => {
            // Unlink device from student before clearing storage
            const studentId = ConstantsService.studentBasicData?.id;
            if (studentId) {
              await this.pushService.unlinkStudentFromDevice(studentId);
            }
            // Keep device_id and device_uid for re-registration
            const deviceId = await Storage.get({ key: 'device_id' });
            const deviceUid = await Storage.get({ key: 'device_uid' });
            const fcmToken = await Storage.get({ key: 'fcm_token' });
            await Storage.clear();
            if (deviceId.value) { await Storage.set({ key: 'device_id', value: deviceId.value }); }
            if (deviceUid.value) { await Storage.set({ key: 'device_uid', value: deviceUid.value }); }
            if (fcmToken.value) { await Storage.set({ key: 'fcm_token', value: fcmToken.value }); }
            ConstantsService.studentBasicData = undefined;
            ConstantsService.studentProfileData = undefined;
            this.navCtrl.navigateRoot(['/login']);
          }
        }
      ]
    });
    await alert.present();
  }
}
