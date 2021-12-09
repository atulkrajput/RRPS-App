/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { LoginFormData } from '../interfaces/login_form_data';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { Device } from '@capacitor/device';
import { Storage } from '@capacitor/storage';

@Injectable({
  providedIn: 'root'
})
export class ApiService {


  // USER_IMAGE_ASSETS = this.SERVER_URL + "assets/users/";
  // USER_PLACE_IMAGE_ASSETS = this.SERVER_URL + "assets/user_places/";
  // OFFERS_IMAGE_ASSETS = this.SERVER_URL + "assets/offers/";

  // INVOICE_URL = this.SERVER_URL + 'invoice/';
  // INVOICE_SUB_URL = this.SERVER_URL + 'subinvoice/'; //subscription invoice

  baseUrl = environment.serverUrl + 'api/';

  profilePicUrl = environment.serverUrl + 'uploads/students/';

  constructor(
    private appVersion: AppVersion,
    public http: HttpClient
  ) { }

  async updateFCMDetails(token: any) {
    console.log('Token', token.value);
    // Save Token to DB
    const version = await this.appVersion.getVersionNumber();
    const info = await Device.getInfo();
    const uuid = await Device.getId();
    const sData = await Storage.get({ key: 'studentData'});
    const sDetails = JSON.parse(sData.value);
    const data = {
      student_id: sDetails.id,
      fcm_token: token,
      uid: uuid.uuid,
      app_version: version,
      os: info.platform,
      model: info.model,
    };
    const link = this.baseUrl + 'updateFCMDetails/';
    return this.http.post(link,data);
  }

  login(formData: LoginFormData){
    const link = this.baseUrl + 'studentLogin/';
    return this.http.post(link, formData);
  }

  feeHistory(id: number)
  {
    const link = this.baseUrl + 'feeHistory/';
    return this.http.post(link, { student_id : id});
  }

  feeDetails(id: number)
  {
    const link = this.baseUrl + 'feedetail/';
    return this.http.post(link, { student_id : id});
  }

  meetings(id: number)
  {
    const link = this.baseUrl + 'meetings/';
    return this.http.post(link, { class_section_id : id});
  }

  attendance(id: number)
  {
    const link = this.baseUrl + 'studentattendance/';
    return this.http.post(link, { student_id : id});
  }

  transport(id: number)
  {
    const link = this.baseUrl + 'transport/';
    return this.http.post(link, { student_id : id});
  }

  dayhomework(id: number)
  {
    const link = this.baseUrl + 'dailyhwtoday/';
    return this.http.post(link, { student_id : id});
  }

  ydayhomework(id: number)
  {
    const link = this.baseUrl + 'dailyhwyesterday/';
    return this.http.post(link, { student_id : id});
  }

  dayhomeworkhistory(id: number)
  {
    const link = this.baseUrl + 'dailyhwhistory/';
    return this.http.post(link, { student_id : id});
  }

  syllabus(id: number)
  {
    const link = this.baseUrl + 'syllabus/';
    return this.http.post(link, { student_id : id});
  }

  syllabusDetails(id: number, sid: number)
  {
    const link = this.baseUrl + 'syllabusdetail/';
    return this.http.post(link, { student_id : id, subject_id : sid});
  }

  complaint(id: number)
  {
    const link = this.baseUrl + 'complaint/';
    return this.http.post(link, { student_id : id});
  }

  feedback(id: number)
  {
    const link = this.baseUrl + 'feedback/';
    return this.http.post(link, { student_id : id});
  }

  exam(id: number)
  {
    const link = this.baseUrl + 'examhistory/';
    return this.http.post(link, { student_id : id});
  }

  changepassword(myData: any) {
    const link = this.baseUrl + 'changepassword/';
    return this.http.post(link, myData);
  }
}
