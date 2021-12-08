import { Component, OnInit } from '@angular/core';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { AppRate } from '@ionic-native/app-rate/ngx';
import { Platform } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  version: string = '';
  constructor(
    private appVersion: AppVersion,
    private platform: Platform,
    private rate: AppRate
  ) { }

  async ngOnInit() {
    this.version = await this.appVersion.getVersionNumber();
  }

  goToBrowser(value: number) {

  }

  async rateApp() {
    console.log("called")
    this.platform.ready().then(()=>{
      console.log("called 1")
      this.rate.setPreferences({
        storeAppURL : environment.storeAppURL,
        usesUntilPrompt : 3,
        promptAgainForEachNewVersion : true,
        simpleMode : true
      })
      this.rate.promptForRating(true);
    });
  }

  async changePasswordPrompt() {

  }

  async changePassword() {

  }

  async changeNotification() {

  }

}
