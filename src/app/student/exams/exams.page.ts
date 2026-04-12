import { Component, OnInit } from '@angular/core';
import { Storage } from '@capacitor/storage';
import { ApiService } from 'src/app/services/api.service';
import { ConstantsService } from 'src/app/services/constants.service';

@Component({
  selector: 'app-exams',
  templateUrl: './exams.page.html',
  styleUrls: ['./exams.page.scss'],
})
export class ExamsPage implements OnInit {
  selectedTab = 'upcoming';
  upcomingExams: any[] = [];
  examHistory: any[] = [];
  allExams: any[] = [];

  constructor(
    private api: ApiService,
    private constants: ConstantsService
  ) { }

  ngOnInit() {
    this.loadExams();
  }

  async loadExams() {
    const sData = await Storage.get({ key: 'studentData' });
    const sDetails = JSON.parse(sData.value);
    const loader = await this.constants.getLoader();
    await loader.present();

    // Load upcoming exams
    this.api.upcomingExam(sDetails.id).subscribe(async (result: any) => {
      if (result.status === 1) {
        this.upcomingExams = result.data || [];
      }
    });

    // Load exam history
    this.api.examHistory(sDetails.id).subscribe(async (result: any) => {
      if (result.status === 1) {
        this.examHistory = result.data || [];
      }
    });

    // Load all exams
    this.api.studentExam(sDetails.id).subscribe(async (result: any) => {
      await loader.dismiss();
      if (result.status === 1) {
        this.allExams = result.data || [];
      }
    }, async (error) => {
      await loader.dismiss();
      this.constants.presentToast('Unable to fetch exam data. Check your internet connection.');
    });
  }

  getSubjectIcon(subject: string): string {
    const icons = {
      Mathematics: 'calculator-outline',
      Physics: 'nuclear-outline',
      Chemistry: 'beaker-outline',
      Biology: 'leaf-outline',
      English: 'book-outline',
      History: 'time-outline',
      Geography: 'globe-outline',
      Computer: 'desktop-outline',
      Science: 'flask-outline',
      default: 'document-text-outline'
    };
    return icons[subject] || icons.default;
  }

  getSubjectGradient(subject: string): string {
    const gradients = {
      Mathematics: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      Physics: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      Chemistry: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      Biology: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      English: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      History: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      default: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    };
    return gradients[subject] || gradients.default;
  }
}
