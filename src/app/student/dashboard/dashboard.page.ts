import { Component, OnInit } from '@angular/core';
import { Storage } from '@capacitor/storage';
import { AlertController, MenuController, NavController } from '@ionic/angular';
import { StudentBasicData } from 'src/app/interfaces/student_basic_data';
import { ApiService } from 'src/app/services/api.service';
import { ConstantsService } from 'src/app/services/constants.service';

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

  menuItems = [
    { title: 'Homework', subtitle: 'Daily tasks', icon: 'book-outline', route: '/homeworks', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { title: 'Exams', subtitle: 'Tests & results', icon: 'document-text-outline', route: '/exams', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { title: 'Fees', subtitle: 'Payment info', icon: 'card-outline', route: '/fees', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { title: 'Attendance', subtitle: 'Your records', icon: 'calendar-outline', route: '/attendances', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { title: 'Transport', subtitle: 'Bus details', icon: 'bus-outline', route: '/transports', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { title: 'Syllabus', subtitle: 'Study material', icon: 'library-outline', route: '/syllabus', gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
    { title: 'Calendar', subtitle: 'Events', icon: 'today-outline', route: '/calendar', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
    { title: 'Meetings', subtitle: 'PTM schedule', icon: 'people-outline', route: '/meetings', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
    { title: 'Feedback', subtitle: 'Report card', icon: 'chatbubble-outline', route: '/feedbacks', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
    { title: 'Settings', subtitle: 'Preferences', icon: 'settings-outline', route: '/settings', gradient: 'linear-gradient(135deg, #c3cfe2 0%, #f5f7fa 100%)' },
  ];

  constructor(
    private api: ApiService,
    private alertCtrl: AlertController,
    private menuController: MenuController,
    private navCtrl: NavController
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

    // Load dashboard data
    this.api.dashboard(this.studentBasicData.id).subscribe((result: any) => {
      if (result.status === 1) {
        this.todayExams = result.data.todayExam || 0;
        this.upcomingExams = result.data.upcomingExam || 0;
      }
    });
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
            await Storage.clear();
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
