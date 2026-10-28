import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-homework-details',
  templateUrl: './homework-details.page.html',
  styleUrls: ['./homework-details.page.scss'],
})
export class HomeworkDetailsPage implements OnInit {
  homework: any = null;

  constructor(private router: Router) {
    const state = this.router.getCurrentNavigation()?.extras?.state;
    this.homework = state?.homework ?? history.state?.homework ?? null;
  }

  ngOnInit() { }

  getSubjectIcon(subject: string): string {
    const icons = {
      'Math': 'calculator-outline',
      'Mathematics': 'calculator-outline',
      'Science': 'flask-outline',
      'English': 'book-outline',
      'History': 'time-outline',
      'Geography': 'globe-outline',
      'Physics': 'nuclear-outline',
      'Chemistry': 'beaker-outline',
      'Biology': 'leaf-outline',
      'Computer': 'desktop-outline',
      'default': 'document-text-outline'
    };
    return icons[subject] || icons.default;
  }

  getSubjectGradient(subject: string): string {
    const gradients = {
      'Math': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'Mathematics': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'Science': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'English': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'History': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      'Geography': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'Physics': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'Chemistry': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'Biology': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'Computer': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'default': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    };
    return gradients[subject] || gradients.default;
  }
}
