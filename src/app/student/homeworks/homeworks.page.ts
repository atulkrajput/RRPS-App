import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@capacitor/storage';
import { ApiService } from 'src/app/services/api.service';
import { ConstantsService } from 'src/app/services/constants.service';

@Component({
  selector: 'app-homeworks',
  templateUrl: './homeworks.page.html',
  styleUrls: ['./homeworks.page.scss'],
})
export class HomeworksPage implements OnInit {
  hwpastData = [];
  hwtodayData = [];
  hwydayData = [];
  homeworkTabs = 'today';

  constructor(
    private router: Router,
    private constants: ConstantsService,
    private api: ApiService,
  ) { }

  ngOnInit() {
    this.loadHomework();
  }

  homeworkDetails(homework?: any) {
    this.router.navigate(['/homework/homework-details']);
  }

  getTotalCount(): number {
    return (this.hwtodayData?.length || 0) + 
           (this.hwydayData?.length || 0) + 
           (this.hwpastData?.length || 0);
  }

  getPendingCount(): number {
    const today = this.hwtodayData?.filter(hw => hw.status === 0).length || 0;
    const yesterday = this.hwydayData?.filter(hw => hw.status === 0).length || 0;
    const past = this.hwpastData?.filter(hw => hw.status === 0).length || 0;
    return today + yesterday + past;
  }

  getCompletedCount(): number {
    const today = this.hwtodayData?.filter(hw => hw.status === 1).length || 0;
    const yesterday = this.hwydayData?.filter(hw => hw.status === 1).length || 0;
    const past = this.hwpastData?.filter(hw => hw.status === 1).length || 0;
    return today + yesterday + past;
  }

  getSubjectIcon(subject: string): string {
    const icons = {
      'Math': 'calculator-outline',
      'Mathematics': 'calculator-outline',
      'Science': 'flask-outline',
      'English': 'book-outline',
      'History': 'time-outline',
      'Geography': 'globe-outline',
      'Physics': 'nuclear-outline',
      'Chemistry': 'beaker-outline',
      'Biology': 'leaf-outline',
      'Computer': 'desktop-outline',
      'default': 'document-text-outline'
    };
    return icons[subject] || icons['default'];
  }

  getSubjectGradient(subject: string): string {
    const gradients = {
      'Math': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'Mathematics': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'Science': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'English': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'History': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      'Geography': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'Physics': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'Chemistry': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'Biology': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'Computer': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'default': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    };
    return gradients[subject] || gradients['default'];
  }

  async loadHomework() {
    const sData = await Storage.get({ key: 'studentData' });
    const sDetails = JSON.parse(sData.value);
    const loader = await this.constants.getLoader();

    // Loading Today Homework
    await loader.present();
    this.api.dayhomework(sDetails.id).subscribe(async (result: any) => {
      await loader.dismiss();
      this.hwtodayData = result.data || [];
    }, async (error) => {
      await loader.dismiss();
      this.constants.presentToast('Unable To Fetch Today Homework Data. Check Your Internet Connection.');
      this.hwtodayData = [];
    });

    // Loading Yesterday Homework
    await loader.present();
    this.api.ydayhomework(sDetails.id).subscribe(async (result: any) => {
      await loader.dismiss();
      this.hwydayData = result.data || [];
    }, async (error) => {
      await loader.dismiss();
      this.constants.presentToast('Unable To Fetch Yesterday Homework Data. Check Your Internet Connection.');
      this.hwydayData = [];
    });

    // Loading Past Home Work
    await loader.present();
    this.api.dayhomeworkhistory(sDetails.id).subscribe(async (result: any) => {
      await loader.dismiss();
      this.hwpastData = result.data || [];
    }, async (error) => {
      await loader.dismiss();
      this.constants.presentToast('Unable To Fetch Past Homework Data. Check Your Internet Connection.');
      this.hwpastData = [];
    });
  }
}
