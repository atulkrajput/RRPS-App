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
  examTitles: any[] = [];
  selectedExamTitleId: number = null;
  allExams: any[] = [];
  reportCard: any = null;
  reportFeedback: any = null;
  reportStudent: any = null;
  studentId: number = null;

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
    this.studentId = sDetails.id;
    const loader = await this.constants.getLoader();
    await loader.present();

    // Load upcoming exams
    this.api.upcomingExam(sDetails.id).subscribe((result: any) => {
      if (result.status === 1) {
        this.upcomingExams = result.data || [];
      }
    });

    // Load exam history
    this.api.examHistory(sDetails.id).subscribe((result: any) => {
      if (result.status === 1) {
        this.examHistory = result.data?.exam || [];
        this.examTitles = result.data?.examTitles || [];
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

  onTabChange() {
    if (this.selectedTab === 'reportcard' && !this.reportCard) {
      this.loadReportCard();
    }
  }

  async loadReportCard() {
    if (!this.studentId) { return; }
    const loader = await this.constants.getLoader();
    await loader.present();
    this.api.reportCard(this.studentId).subscribe(async (result: any) => {
      await loader.dismiss();
      if (result.status === 1) {
        this.reportCard = result.data?.report_card || [];
        this.reportFeedback = result.data?.feedback || null;
        this.reportStudent = result.data?.student || null;
      } else {
        this.reportCard = [];
        this.constants.presentToast(result.msg || 'No report card data available');
      }
    }, async (error) => {
      await loader.dismiss();
      this.constants.presentToast('Unable to fetch report card. Check your internet connection.');
    });
  }

  filterByExamTitle(titleId: number) {
    this.selectedExamTitleId = this.selectedExamTitleId === titleId ? null : titleId;
  }

  getFilteredHistory(): any[] {
    if (!this.selectedExamTitleId) { return this.examHistory; }
    return this.examHistory.filter(e => e.exam_title_id === this.selectedExamTitleId);
  }

  getMarks(exam: any): string {
    if (exam.exam_students && exam.exam_students.length > 0) {
      const s = exam.exam_students[0];
      return s.status === 0 ? 'AB' : (s.marks_obtained ?? '-').toString();
    }
    return '-';
  }

  getSubjectIcon(subject: string): string {
    const icons = {
      Mathematics: 'calculator-outline',
      Physics: 'nuclear-outline',
      Chemistry: 'beaker-outline',
      Biology: 'leaf-outline',
      English: 'book-outline',
      Hindi: 'language-outline',
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
      Hindi: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      History: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      Science: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      default: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    };
    return gradients[subject] || gradients.default;
  }

  getPercentageClass(pct: number): string {
    if (pct >= 80) { return 'excellent'; }
    if (pct >= 60) { return 'good'; }
    if (pct >= 40) { return 'average'; }
    return 'poor';
  }

  getRatingLabel(val: number): string {
    if (val >= 5) { return 'Excellent'; }
    if (val >= 4) { return 'Very Good'; }
    if (val >= 3) { return 'Good'; }
    if (val >= 2) { return 'Average'; }
    return 'Needs Improvement';
  }
}
