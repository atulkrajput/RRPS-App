import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy, Platform } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { SidemenuComponent } from './components/sidemenu/sidemenu.component';
import { HttpClientModule } from '@angular/common/http';
import { AppRate } from '@ionic-native/app-rate/ngx';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';

@NgModule({
  declarations: [AppComponent, SidemenuComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    AppRate,
    AppVersion,
    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
