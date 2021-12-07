/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { Component, OnInit } from '@angular/core';
import { CalendarMode, Step } from 'ionic2-calendar/calendar';

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
  constructor() { }

  ngOnInit() {

  }

  onViewTitleChanged(title) {
    console.log('Title', title);
    this.viewTitle = title;
  }

  onChange($event){
    console.log($event);
  }

  today() {
    this.calendar.currentDate = new Date();
  }

}
