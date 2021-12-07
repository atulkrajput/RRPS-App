/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { LoginFormData } from '../interfaces/login_form_data';

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

  constructor(public http: HttpClient) { }

  updateFCMDetails(myData: any) {
    const link = this.baseUrl + 'updateFCMDetails/';
    return this.http.post(link,myData);
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
}
