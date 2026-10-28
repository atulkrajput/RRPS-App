import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ConstantsService } from 'src/app/services/constants.service';
import { ApiService } from 'src/app/services/api.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.scss'],
})
export class SidemenuComponent implements OnInit {

  studentName = '';
  regId = '';
  classSection = '';
  profilePic: string = null;
  houseGradient = ConstantsService.DEFAULT_HOUSE_GRADIENT;
  appVersion = environment.appVersion;

  public appPages = [
    { title: 'Dashboard', url: 'dashboard', icon: 'grid' },
    { title: 'Profile', url: 'profile', icon: 'person' },
    { title: 'Homework', url: 'homework', icon: 'book' },
    { title: 'Attendance', url: 'attendance', icon: 'checkmark-done' },
    { title: 'Exams & Results', url: 'exams', icon: 'document-text' },
    { title: 'Syllabus', url: 'syllabus', icon: 'library' },
    { title: 'Fees', url: 'fees', icon: 'card' },
    { title: 'Transport', url: 'transports', icon: 'bus' },
    { title: 'Calendar', url: 'calender', icon: 'calendar' },
    { title: 'PTM', url: 'meetings', icon: 'people' },
    { title: 'Complaint', url: 'complaints', icon: 'chatbubble-ellipses' },
    { title: 'Report Card', url: 'feedbacks', icon: 'ribbon' },
    { title: 'Messages', url: 'messages', icon: 'chatbubbles' },
    { title: 'Settings', url: 'settings', icon: 'settings' },
  ];

  constructor(private api: ApiService, private router: Router) { }

  ngOnInit() {
    this.refreshStudentInfo();
    // Side menu is created once with the app shell, so re-sync student info
    // on every navigation (e.g. right after login, or after profile pic updates).
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => this.refreshStudentInfo());
  }

  private refreshStudentInfo() {
    const student = ConstantsService.studentBasicData;
    if (!student) { return; }

    this.studentName = `${student.prefix || ''} ${student.sname || ''}`.trim();
    this.regId = student.reg_id;
    this.classSection = `${student.class} - ${student.section}`;
    this.profilePic = this.api.profilePicUrl + student.profilePic + '?Date=' + Date.now();
    this.houseGradient = ConstantsService.getHouseGradient();
  }

}
