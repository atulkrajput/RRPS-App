/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { LoginFormData } from '../interfaces/login_form_data';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  baseUrl = environment.serverUrl + 'api/';
  profilePicUrl = environment.serverUrl + 'uploads/students/';

  constructor(public http: HttpClient) { }

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

  attendanceDetail(id: number) {
    const link = this.baseUrl + 'studentattendancedetail/';
    return this.http.post(link, { student_id: id });
  }

  studentLeaves(id: number) {
    const link = this.baseUrl + 'studentleaves/';
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

  // Notifications (with pagination support)
  getNotifications(id: number, page: number = 1, perPage: number = 20) {
    const link = this.baseUrl + 'notification/';
    return this.http.post(link, { student_id: id, page, per_page: perPage });
  }

  markNotificationRead(studentId: number, notificationId: number) {
    const link = this.baseUrl + 'marknotificationread/';
    return this.http.post(link, { student_id: studentId, notification_id: notificationId });
  }

  markAllNotificationsRead(studentId: number) {
    const link = this.baseUrl + 'marknotificationread/';
    return this.http.post(link, { student_id: studentId, mark_all: 1 });
  }

  getNotificationUnreadCount(studentId: number) {
    const link = this.baseUrl + 'notificationunreadcount/';
    return this.http.post(link, { student_id: studentId });
  }

  // Messages (Broadcast)
  getMessages(id: number) {
    const link = this.baseUrl + 'broadcastmessages/';
    return this.http.post(link, { student_id: id });
  }

  getMessageDetail(studentId: number, messageId: number) {
    const link = this.baseUrl + 'broadcastmessagedetail/';
    return this.http.post(link, { student_id: studentId, message_id: messageId });
  }

  getUnreadMessageCount(id: number) {
    const link = this.baseUrl + 'broadcastunreadcount/';
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

  // Forgot Password Flow
  forgotPassword(regid: string) {
    const link = this.baseUrl + 'forgot_password/';
    return this.http.post(link, { regid });
  }

  verifyOtp(regid: string, otp: string) {
    const link = this.baseUrl + 'verify_otp/';
    return this.http.post(link, { regid, otp });
  }

  resetPassword(resetToken: string, newPassword: string, confirmPassword: string) {
    const link = this.baseUrl + 'reset_password/';
    return this.http.post(link, { reset_token: resetToken, newPassword, confirmPassword });
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

  // Device Registration V2
  registerDeviceV2(uid: string, fcmToken: string, deviceType: string, model?: string, osVersion?: string, appVersion?: string, studentId?: number) {
    const link = this.baseUrl + 'registerdevicev2/';
    const params: any = { uid, fcm_token: fcmToken, device_type: deviceType };
    if (model) { params.model = model; }
    if (osVersion) { params.os_version = osVersion; }
    if (appVersion) { params.app_version = appVersion; }
    if (studentId) { params.student_id = studentId; }
    return this.http.post(link, params);
  }

  linkDeviceStudent(deviceId: number, studentId: number) {
    const link = this.baseUrl + 'linkdevicestudent/';
    return this.http.post(link, { device_id: deviceId, student_id: studentId });
  }

  unlinkDeviceStudent(deviceId: number, studentId: number) {
    const link = this.baseUrl + 'unlinkdevicestudent/';
    return this.http.post(link, { device_id: deviceId, student_id: studentId });
  }

  getDeviceStudents(deviceId?: number, uid?: string) {
    const link = this.baseUrl + 'getdevicestudents/';
    const params: any = {};
    if (deviceId) { params.device_id = deviceId; }
    if (uid) { params.uid = uid; }
    return this.http.post(link, params);
  }
}
