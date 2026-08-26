import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Feature {
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
})
export class SplashPage implements OnInit, OnDestroy {
  currentSlide = 0;
  private timer?: ReturnType<typeof setInterval>;

  features: Feature[] = [
    {
      title: 'Exams & Results',
      description: 'View exam schedules, take online tests and check results.',
      icon: 'document-text-outline'
    },
    {
      title: 'Attendance',
      description: 'Track your daily attendance and view monthly reports.',
      icon: 'calendar-outline'
    },
    {
      title: 'Fee Details',
      description: 'Check fee status, pending dues and payment history.',
      icon: 'wallet-outline'
    },
    {
      title: 'Study Material',
      description: 'Access notes, syllabus and chapter-wise resources.',
      icon: 'book-outline'
    },
    {
      title: 'Transport Info',
      description: 'View your route, bus timings and driver details.',
      icon: 'bus-outline'
    },
    {
      title: 'Notices & Updates',
      description: 'Stay updated with school announcements and events.',
      icon: 'notifications-outline'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  startAutoSlide(): void {
    this.stopAutoSlide();
    this.timer = setInterval(() => {
      if (this.currentSlide < this.features.length - 1) {
        this.currentSlide++;
      } else {
        this.stopAutoSlide();
      }
    }, 3500);
  }

  stopAutoSlide(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  next(): void {
    if (this.currentSlide < this.features.length - 1) {
      this.currentSlide++;
      this.startAutoSlide();
      return;
    }
    this.getStarted();
  }

  goToSlide(index: number): void {
    if (index < 0 || index >= this.features.length) {
      return;
    }
    this.currentSlide = index;
    this.startAutoSlide();
  }

  skip(): void {
    this.getStarted();
  }

  getStarted(): void {
    this.stopAutoSlide();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
