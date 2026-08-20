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
  attendancesData = [];
  isLoaded = false;

  constructor(
    private constants: ConstantsService,
    private api: ApiService,
  ) { }

  ngOnInit() {
    this.getAttandances();
  }

  getPercentage(present: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((present / total) * 100);
  }

  getAttendanceClass(present: number, total: number): string {
    const percentage = this.getPercentage(present, total);
    if (percentage >= 90) return 'excellent';
    if (percentage >= 75) return 'good';
    if (percentage >= 60) return 'warning';
    return 'poor';
  }

  getOverallPercentage(): number {
    if (!this.attendancesData || this.attendancesData.length === 0) return 0;
    
    const totalPresent = this.attendancesData.reduce((sum, data) => sum + data.present, 0);
    const totalDays = this.attendancesData.reduce((sum, data) => sum + data.total, 0);
    
    return this.getPercentage(totalPresent, totalDays);
  }

  getTotalPresent(): number {
    if (!this.attendancesData || this.attendancesData.length === 0) return 0;
    return this.attendancesData.reduce((sum, data) => sum + data.present, 0);
  }

  getTotalAbsent(): number {
    if (!this.attendancesData || this.attendancesData.length === 0) return 0;
    return this.attendancesData.reduce((sum, data) => {
      return sum + (data.total - data.present - data.holidays);
    }, 0);
  }

  getTotalDays(): number {
    if (!this.attendancesData || this.attendancesData.length === 0) return 0;
    return this.attendancesData.reduce((sum, data) => sum + (data.total - data.holidays), 0);
  }

  async getAttandances() {
    const sData = await Storage.get({ key: 'studentData' });
    const sDetails = JSON.parse(sData.value);
    const loader = await this.constants.getLoader();
    await loader.present();
    this.api.attendance(sDetails.id).subscribe(async (result: any) => {
      await loader.dismiss();
      this.isLoaded = true;
      this.attendancesData = result.data || [];
    }, async (error) => {
      await loader.dismiss();
      this.isLoaded = true;
      this.constants.presentToast('Unable To Fetch Your Attendance. Check Your Internet Connection.');
      this.attendancesData = [];
    });
  }
}
