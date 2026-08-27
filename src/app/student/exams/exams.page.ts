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
  reportCard: any = null;
  reportFeedback: any = null;
  reportStudent: any = null;
  studentId: number = null;
  isLoaded = false;

  // Question type mapping
  qTypeMap: any = {};

  constructor(
    private api: ApiService,
    private constants: ConstantsService
  ) { }

  ngOnInit() {
    this.loadExams();
  }

  // Pull to refresh
  doRefresh(event: any) {
    this.isLoaded = false;
    this.loadExams();
    setTimeout(() => {
      event.target.complete();
    }, 1500);
  }

  async loadExams() {
    const sData = await Storage.get({ key: 'studentData' });
    const sDetails = JSON.parse(sData.value);
    this.studentId = sDetails.id;
    const loader = await this.constants.getLoader();
    await loader.present();

    let loadCount = 0;
    const checkDone = async () => {
      loadCount++;
      if (loadCount >= 2) {
        await loader.dismiss();
        this.isLoaded = true;
      }
    };

    // Load upcoming exams
    this.api.upcomingExam(sDetails.id).subscribe(async (result: any) => {
      if (result.status === 1 && result.data) {
        this.upcomingExams = result.data.exam || result.data || [];
        if (result.data.qType) {
          this.qTypeMap = { ...this.qTypeMap, ...result.data.qType };
        }
      } else {
        this.upcomingExams = [];
      }
      await checkDone();
    }, async () => {
      this.upcomingExams = [];
      await checkDone();
    });

    // Load exam history
    this.api.examHistory(sDetails.id).subscribe(async (result: any) => {
      if (result.status === 1 && result.data) {
        this.examHistory = result.data.exam || [];
        this.examTitles = result.data.examTitles || [];
        if (result.data.qType) {
          this.qTypeMap = { ...this.qTypeMap, ...result.data.qType };
        }
      } else {
        this.examHistory = [];
      }
      await checkDone();
    }, async () => {
      this.examHistory = [];
      await checkDone();
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
      if (result.status === 1 && result.data) {
        this.reportCard = result.data.report_card || [];
        this.reportFeedback = result.data.feedback || null;
        this.reportStudent = result.data.student || null;
      } else {
        this.reportCard = [];
        this.constants.presentToast(result.msg || 'No report card data available');
      }
    }, async (error) => {
      await loader.dismiss();
      this.reportCard = [];
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

  // Returns marks in "obtained/total" format
  getMarksDisplay(exam: any): string {
    if (!exam.exam_students || exam.exam_students.length === 0) {
      return 'Pending';
    }
    const student = exam.exam_students[0];
    if (student.status === 0 || student.obtained_marks === 'AB') {
      return 'AB';
    }
    const obtained = student.obtained_marks ?? student.marks_obtained ?? '-';
    const total = student.total_marks || exam.max_marks || '-';
    return `${obtained}/${total}`;
  }

  // Returns just the obtained marks number
  getObtainedMarks(exam: any): string {
    if (!exam.exam_students || exam.exam_students.length === 0) {
      return '-';
    }
    const student = exam.exam_students[0];
    if (student.status === 0 || student.obtained_marks === 'AB') {
      return 'AB';
    }
    return (student.obtained_marks ?? student.marks_obtained ?? '-').toString();
  }

  // Returns percentage for an exam result
  getExamPercentage(exam: any): number {
    if (!exam.exam_students || exam.exam_students.length === 0) { return 0; }
    const student = exam.exam_students[0];
    if (student.percentage) { return student.percentage; }
    const obtained = student.obtained_marks ?? student.marks_obtained ?? 0;
    const total = student.total_marks || exam.max_marks || 1;
    if (obtained === 'AB' || student.status === 0) { return 0; }
    return Math.round((obtained / total) * 100);
  }

  // Returns whether marks are available
  hasMarks(exam: any): boolean {
    return exam.exam_students && exam.exam_students.length > 0 &&
           exam.exam_students[0].status !== 0;
  }

  // Returns whether student was absent
  isAbsent(exam: any): boolean {
    if (!exam.exam_students || exam.exam_students.length === 0) { return false; }
    return exam.exam_students[0].status === 0 ||
           exam.exam_students[0].obtained_marks === 'AB';
  }

  getSubjectIcon(subject: string): string {
    if (!subject) { return 'document-text-outline'; }
    const icons: any = {
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
      EVS: 'earth-outline',
      'Social Science': 'people-outline',
      Sanskrit: 'library-outline',
      GK: 'bulb-outline',
      'General Knowledge': 'bulb-outline',
      Drawing: 'color-palette-outline',
      Art: 'color-palette-outline'
    };
    return icons[subject] || 'document-text-outline';
  }

  getSubjectGradient(subject: string): string {
    if (!subject) { return 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'; }
    const gradients: any = {
      Mathematics: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      Physics: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      Chemistry: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      Biology: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      English: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      Hindi: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      History: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      Science: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      Geography: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      Computer: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      EVS: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      Sanskrit: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
      GK: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      Drawing: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
    };
    return gradients[subject] || 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)';
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

  getRatingStars(val: number): number[] {
    return Array(val).fill(0);
  }

  getMarksByTypeEntries(marksByType: any): { key: string; value: any }[] {
    if (!marksByType) { return []; }
    return Object.keys(marksByType).map(key => ({ key, value: marksByType[key] }));
  }
}
