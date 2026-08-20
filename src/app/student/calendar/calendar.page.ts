/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { Component, OnInit } from '@angular/core';
import { CalendarMode, Step } from 'ionic2-calendar/calendar';
import { Storage } from '@capacitor/storage';
import { ApiService } from 'src/app/services/api.service';
import { ConstantsService } from 'src/app/services/constants.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage implements OnInit {
  date: string;
  type: 'string';

  eventSource;
  viewTitle;
  calendarEvents: any[] = [];

  isToday: boolean;
  calendar = {
    mode: 'month' as CalendarMode,
    step: 30 as Step,
    currentDate: new Date(),
    dateFormatter: {
      formatMonthViewDay(date: Date) {
        return date.getDate().toString();
      },
      formatMonthViewDayHeader(date: Date) {
        return 'MonMH';
      },
      formatMonthViewTitle(date: Date) {
        return 'testMT';
      },
      formatWeekViewDayHeader(date: Date) {
        return 'MonWH';
      },
      formatWeekViewTitle(date: Date) {
        return 'testWT';
      },
      formatWeekViewHourColumn(date: Date) {
        return 'testWH';
      },
      formatDayViewHourColumn(date: Date) {
        return 'testDH';
      },
      formatDayViewTitle(date: Date) {
        return 'testDT';
      }
    }
  };

  constructor(
    private api: ApiService,
    private constants: ConstantsService
  ) { }

  ngOnInit() {
    this.loadCalendarEvents();
  }

  async loadCalendarEvents() {
    const sData = await Storage.get({ key: 'studentData' });
    const sDetails = JSON.parse(sData.value);
    this.api.calendar(sDetails.id).subscribe((result: any) => {
      if (result.status === 1) {
        this.calendarEvents = result.data || [];
      } else {
        this.calendarEvents = [];
      }
    }, () => {
      this.constants.presentToast('Unable to fetch calendar events.');
      this.calendarEvents = [];
    });
  }

  onViewTitleChanged(title) {
    this.viewTitle = title;
  }

  onChange($event) {
    console.log($event);
  }

  today() {
    this.calendar.currentDate = new Date();
  }

  getUpcomingEventsCount(): number {
    return this.calendarEvents ? this.calendarEvents.length : 0;
  }
}
