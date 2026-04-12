import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@capacitor/storage';
import { AlertController, MenuController } from '@ionic/angular';
import { StudentBasicData } from 'src/app/interfaces/student_basic_data';
import { ApiService } from 'src/app/services/api.service';
import { ConstantsService } from 'src/app/services/constants.service';

interface MenuItem {
  title: string;
  subtitle: string;
  icon: string;
  route: string;
  gradient: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  studentBasicData: StudentBasicData;
  profilePic: string = null;
  houseGradient: string;
  houseColor: string;
  houseName: string;

  // Dashboard data from API
  todayExams = 0;
  upcomingExams = 0;
  paperHistory = 0;
  examAttend = 0;

  menuItems: MenuItem[] = [
    {
      title: 'Profile',
      subtitle: 'View details',
      icon: 'person-outline',
      route: '/profile',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Homework',
      subtitle: 'Assignments',
      icon: 'book-outline',
      route: '/homework',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      title: 'Fees',
      subtitle: 'Payment info',
      icon: 'card-outline',
      route: '/fees',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      title: 'Syllabus',
      subtitle: 'Course content',
      icon: 'library-outline',
      route: '/syllabus',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    },
    {
      title: 'Exams',
      subtitle: 'Test schedule',
      icon: 'document-text-outline',
      route: '/exams',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
    {
      title: 'Attendance',
      subtitle: 'Track record',
      icon: 'checkmark-done-outline',
      route: '/attendance',
      gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
    },
    {
      title: 'Calendar',
      subtitle: 'Events',
      icon: 'calendar-outline',
      route: '/calender',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    },
    {
      title: 'Transport',
      subtitle: 'Bus routes',
      icon: 'bus-outline',
      route: '/transports',
      gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
    },
    {
      title: 'Meetings',
      subtitle: 'Schedule',
      icon: 'people-outline',
      route: '/meetings',
      gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    },
    {
      title: 'Complaints',
      subtitle: 'Report issues',
      icon: 'alert-circle-outline',
      route: '/complaints',
      gradient: 'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)'
    },
    {
      title: 'Feedback',
      subtitle: 'Share thoughts',
      icon: 'chatbubbles-outline',
      route: '/feedbacks',
      gradient: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)'
    },
    {
      title: 'Settings',
      subtitle: 'Preferences',
      icon: 'settings-outline',
      route: '/settings',
      gradient: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }
  ];

  constructor(
    private api: ApiService,
    private alertCtrl: AlertController,
    private menuController: MenuController,
    private router: Router
  ) {
    this.menuController.enable(true);
    this.studentBasicData = ConstantsService.studentBasicData;
    this.houseGradient = ConstantsService.getHouseGradient();
    this.houseColor = ConstantsService.getHouseColorCode();
    this.houseName = ConstantsService.getHouseName();
  }

  ngOnInit() {
    this.loadDashboard();
  }

  ionViewWillEnter() {
    this.studentBasicData = ConstantsService.studentBasicData;
    this.profilePic = this.api.profilePicUrl + this.studentBasicData.profilePic + '?Date=' + Date.now();
    this.houseGradient = ConstantsService.getHouseGradient();
    this.houseColor = ConstantsService.getHouseColorCode();
    this.houseName = ConstantsService.getHouseName();
  }

  async loadDashboard() {
    if (!this.studentBasicData) { return; }
    this.api.dashboard(this.studentBasicData.id).subscribe((result: any) => {
      if (result.status === 1) {
        this.todayExams = result.data.todayExam || 0;
        this.upcomingExams = result.data.upcomingExam || 0;
        this.paperHistory = result.data.paperHistory || 0;
        this.examAttend = result.data.examAttend || 0;
      }
    });
  }

  async logOut() {
    const alert = await this.alertCtrl.create({
      header: 'Confirmation',
      message: 'Are you sure you want to log out ?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: async () => {
            await Storage.clear();
            ConstantsService.studentBasicData = undefined;
            this.router.navigate(['/login']);
          }
        }
      ]
    });
    await alert.present();
  }
}
