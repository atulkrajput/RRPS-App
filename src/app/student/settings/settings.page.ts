import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  goToBrowser(value: number) {

  }
  async rateApp() {

  }
  fetchAppVersion() {
    return '1.0.1';
  }


  async changePasswordPrompt() {

  }

  async changePassword() {

  }

  async changeNotification() {

  }

}
