import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.scss'],
})
export class SidemenuComponent implements OnInit {

  //public version: string = '0.7.2';

  activePageTitle = 'Dashboard';
  public appPages = [
    {
      title: 'Dashboard',
      url: 'dashboard',
      icon: 'list'
    },
    {
      title: 'Profile',
      url: 'profile',
      icon: 'people'
    },
    {
      title: 'Homeworks',
      url: 'homework',
      icon: 'people'
    },
    {
      title: 'Fees',
      url: 'fees',
      icon: 'cash'
    },
    {
      title: 'Syllabus',
      url: 'syllabus',
      icon: 'document'
    },
    {
      title: 'Exam',
      url: 'exams',
      icon: 'watch'
    },
    {
      title: 'Attendances',
      url: 'attendance',
      icon: 'person-add'
    },
    {
      title: 'Calendar',
      url: 'calender',
      icon: 'calendar'
    },
    {
      title: 'Transport',
      url: 'transports',
      icon: 'bus'
    },
    {
      title: 'Meetings',
      url: 'meetings',
      icon: 'people'
    },
    {
      title: 'Complaint',
      url: 'complaints',
      icon: 'alert-circle'
    },
    {
      title: 'Feedback',
      url: 'feedbacks',
      icon: 'alert'
    },
    {
      title: 'Messages',
      url: 'messages',
      icon: 'chatbubbles'
    },
    {
      title: 'Settings',
      url: 'settings',
      icon: 'cog'
    }
  ];
  constructor() { }

  ngOnInit() {}

  leaveAReview() { }

  openFacebookProfile() { }

  openInstagramProfile() { }

  openTwitterProfile() { }

  openWebsite() { }

}
