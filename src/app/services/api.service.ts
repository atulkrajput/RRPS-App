/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { LoginFormData } from '../interfaces/login_form_data';
import { Device } from '@capacitor/device';
import { Storage } from '@capacitor/storage';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  baseUrl = environment.serverUrl + 'api/';
  profilePicUrl = environment.serverUrl + 'uploads/students/';

  constructor(public http: HttpClient) { }

  // FCM — called from app.component after push registration
  async updateFCMDetails(token: any) {
    const info = await Device.getInfo();
    const uuid = await Device.getId();
    const sData = await Storage.get({ key: 'studentData' });
    const sDetails = JSON.parse(sData.value);
    const data = {
      student_id: sDetails ? sDetails.id : null,
      fcm_token: token.value || token,
      uid: (uuid as any).uuid || (uuid as any).identifier,
      app_version: environment.appVersion,
      os: info.platform,
      model: info.model,
    };
    const link = this.baseUrl + 'updateFCMDetails/';
    return this.http.post(link, data).subscribe();
  }

  // Auth
  login(formData: LoginFormData) {
    const link = this.baseUrl + 'studentlogin/';
    return this.http.post(link, formData);
  }

  // Dashboard
  dashboard(id: number) {
    const link = this.baseUrl + 'studentdashboard/';
    return this.http.post(link, { student_id: id });
  }

  // Houses
  getHouses() {
    const link = this.baseUrl + 'houses/';
    return this.http.post(link, {});
  }

  // Homework
  dayhomework(id: number) {
    const link = this.baseUrl + 'dailyhwtoday/';
    return this.http.post(link, { student_id: id });
  }

  ydayhomework(id: number) {
    const link = this.baseUrl + 'dailyhwyesterday/';
    return this.http.post(link, { student_id: id });
  }

  dayhomeworkhistory(id: number) {
    const link = this.baseUrl + 'dailyhwhistory/';
    return this.http.post(link, { student_id: id });
  }

  // Fees
  feeHistory(id: number) {
    const link = this.baseUrl + 'feehistory/';
    return this.http.post(link, { student_id: id });
  }

  feeDetail(id: number) {
    const link = this.baseUrl + 'feedetail/';
    return this.http.post(link, { student_id: id });
  }

  feeReceipt(id: number) {
    const link = this.baseUrl + 'feereceipt/';
    return this.http.post(link, { student_id: id });
  }

  // Exams
  studentExam(id: number) {
    const link = this.baseUrl + 'studentexam/';
    return this.http.post(link, { student_id: id });
  }

  upcomingExam(id: number) {
    const link = this.baseUrl + 'upcomingexam/';
    return this.http.post(link, { student_id: id });
  }

  examHistory(id: number, examTitleId?: number) {
    const link = this.baseUrl + 'examhistory/';
    const params: any = { student_id: id };
    if (examTitleId) { params.exam_title_id = examTitleId; }
    return this.http.post(link, params);
  }

  examDetail(studentId: number, examId: number) {
    const link = this.baseUrl + 'examdetail/';
    return this.http.post(link, { student_id: studentId, exam_id: examId });
  }

  reportCard(id: number) {
    const link = this.baseUrl + 'reportcard/';
    return this.http.post(link, { student_id: id });
  }

  // Attendance
  attendance(id: number) {
    const link = this.baseUrl + 'studentattendance/';
    return this.http.post(link, { student_id: id });
  }

  // Meetings
  meetings(id: number) {
    const link = this.baseUrl + 'meetings/';
    return this.http.post(link, { class_section_id: id });
  }

  // Transport
  transport(id: number) {
    const link = this.baseUrl + 'transport/';
    return this.http.post(link, { student_id: id });
  }

  // Syllabus
  syllabus(id: number) {
    const link = this.baseUrl + 'syllabus/';
    return this.http.post(link, { student_id: id });
  }

  syllabusDetails(id: number, sid: number) {
    const link = this.baseUrl + 'syllabusdetail/';
    return this.http.post(link, { student_id: id, subject_id: sid });
  }

  // Complaints
  complaint(id: number) {
    const link = this.baseUrl + 'complaint/';
    return this.http.post(link, { student_id: id });
  }

  // Feedback
  feedback(id: number) {
    const link = this.baseUrl + 'feedback/';
    return this.http.post(link, { student_id: id });
  }

  // Calendar
  calendar(id: number) {
    const link = this.baseUrl + 'calendar/';
    return this.http.post(link, { student_id: id });
  }

  // Notifications
  getNotifications(id: number) {
    const link = this.baseUrl + 'notification/';
    return this.http.post(link, { student_id: id });
  }

  // Account
  changePassword(studentId: number, oldPassword: string, newPassword: string, confirmPassword: string) {
    const link = this.baseUrl + 'changepassword/';
    return this.http.post(link, {
      student_id: studentId,
      oldPassword,
      newPassword,
      confirmPassword
    });
  }

  // App Version
  checkAppVersion(currentVersion: string, platform: string = 'android') {
    const link = this.baseUrl + 'appversioncheck/';
    return this.http.post(link, {
      current_version: currentVersion,
      app_type: 'student',
      platform
    });
  }

  getApkDownloadUrl(appType: string = 'student'): string {
    return this.baseUrl + 'downloadapk?app_type=' + appType;
  }

  // Device Registration
  registerDevice(uid: string, fcmToken: string, studentId?: number, appVersion?: string, os?: string, model?: string) {
    const link = this.baseUrl + 'registerDevice/';
    const params: any = { uid, fcm_token: fcmToken, app_version: appVersion, os, model };
    if (studentId) { params.student_id = studentId; }
    return this.http.post(link, params);
  }
}
