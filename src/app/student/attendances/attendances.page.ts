import { Component, OnInit } from '@angular/core';
import { Storage } from '@capacitor/storage';
import { ApiService } from 'src/app/services/api.service';
import { ConstantsService } from 'src/app/services/constants.service';

@Component({
  selector: 'app-attendances',
  templateUrl: './attendances.page.html',
  styleUrls: ['./attendances.page.scss'],
})
export class AttendancesPage implements OnInit {
  monthlyData: any[] = [];
  cumulativeData: any = null;
  sessionName = '';
  isLoaded = false;

  constructor(
    private constants: ConstantsService,
    private api: ApiService,
  ) { }

  ngOnInit() {
    this.getAttendance();
  }

  // Pull to refresh
  doRefresh(event: any) {
    this.getAttendance();
    setTimeout(() => {
      event.target.complete();
    }, 1500);
  }

  getPercentage(present: number, workingDays: number): number {
    if (!workingDays || workingDays === 0) { return 0; }
    return Math.round((present / workingDays) * 100 * 10) / 10;
  }

  getAttendanceClass(percentage: number): string {
    if (percentage >= 90) { return 'excellent'; }
    if (percentage >= 75) { return 'good'; }
    if (percentage >= 60) { return 'warning'; }
    return 'poor';
  }

  getOverallPercentage(): number {
    if (this.cumulativeData) {
      return this.cumulativeData.percentage || 0;
    }
    return 0;
  }

  getTotalPresent(): number {
    if (this.cumulativeData) {
      return this.cumulativeData.total_present || 0;
    }
    return 0;
  }

  getTotalAbsent(): number {
    if (this.cumulativeData) {
      return this.cumulativeData.total_absent || 0;
    }
    return 0;
  }

  getTotalLate(): number {
    if (this.cumulativeData) {
      return this.cumulativeData.total_late || 0;
    }
    return 0;
  }

  getTotalLeaves(): number {
    if (this.cumulativeData) {
      return this.cumulativeData.total_leaves || 0;
    }
    return 0;
  }

  getTotalWorkingDays(): number {
    if (this.cumulativeData) {
      return this.cumulativeData.total_working_days || 0;
    }
    return 0;
  }

  async getAttendance() {
    const sData = await Storage.get({ key: 'studentData' });
    const sDetails = JSON.parse(sData.value);
    const loader = await this.constants.getLoader();
    await loader.present();

    this.api.attendanceDetail(sDetails.id).subscribe(async (result: any) => {
      await loader.dismiss();
      this.isLoaded = true;
      if (result.status === 1 && result.data) {
        this.monthlyData = result.data.monthly || [];
        this.cumulativeData = result.data.cumulative || null;
        this.sessionName = result.data.session || '';
      } else {
        this.monthlyData = [];
        this.cumulativeData = null;
        if (result.msg) {
          this.constants.presentToast(result.msg);
        }
      }
    }, async (error) => {
      await loader.dismiss();
      this.isLoaded = true;
      this.constants.presentToast('Unable to fetch attendance. Please check your internet connection.');
      this.monthlyData = [];
      this.cumulativeData = null;
    });
  }
}
