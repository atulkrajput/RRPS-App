# Implementation Examples

## Example 1: Modernizing a List Page (e.g., Homework Page)

### Before (Old Design)
```html
<ion-header>
  <ion-toolbar>
    <ion-buttons slot="start">
      <ion-back-button></ion-back-button>
    </ion-buttons>
    <ion-title>Homework</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content>
  <ion-list>
    <ion-item *ngFor="let hw of homeworks">
      <ion-label>
        <h2>{{hw.subject}}</h2>
        <p>{{hw.description}}</p>
      </ion-label>
    </ion-item>
  </ion-list>
</ion-content>
```

### After (Modern Design)
```html
<ion-header class="ion-no-border modern-header">
  <ion-toolbar>
    <ion-buttons slot="start">
      <ion-back-button defaultHref="/dashboard"></ion-back-button>
    </ion-buttons>
    <ion-title>Homework</ion-title>
    <ion-buttons slot="end">
      <ion-button fill="clear">
        <ion-icon slot="icon-only" name="filter-outline"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content class="modern-content">
  <div class="page-header">
    <h2>Your Assignments</h2>
    <p>{{homeworks.length}} pending tasks</p>
  </div>

  <div class="modern-list">
    <div class="homework-card" *ngFor="let hw of homeworks" [routerLink]="['/homework', hw.id]">
      <div class="card-header">
        <div class="subject-icon" [style.background]="getSubjectGradient(hw.subject)">
          <ion-icon [name]="getSubjectIcon(hw.subject)"></ion-icon>
        </div>
        <div class="card-info">
          <h3>{{hw.subject}}</h3>
          <p class="due-date">
            <ion-icon name="calendar-outline"></ion-icon>
            Due: {{hw.dueDate | date:'MMM dd, yyyy'}}
          </p>
        </div>
        <span class="modern-badge" [ngClass]="getPriorityClass(hw.priority)">
          {{hw.priority}}
        </span>
      </div>
      <p class="description">{{hw.description}}</p>
      <div class="card-footer">
        <span class="teacher-name">
          <ion-icon name="person-outline"></ion-icon>
          {{hw.teacherName}}
        </span>
        <ion-button fill="clear" size="small">
          View Details
          <ion-icon slot="end" name="arrow-forward"></ion-icon>
        </ion-button>
      </div>
    </div>
  </div>

  <!-- Empty State -->
  <div class="empty-state" *ngIf="homeworks.length === 0">
    <ion-icon name="checkmark-done-circle-outline"></ion-icon>
    <h3>All caught up!</h3>
    <p>No pending homework assignments</p>
  </div>
</ion-content>
```

### SCSS
```scss
.modern-header {
  ion-toolbar {
    --background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    --color: white;
  }
}

.modern-content {
  --background: var(--bg-color);
}

.page-header {
  padding: 24px 16px 16px;
  background: white;
  margin-bottom: 16px;

  h2 {
    margin: 0 0 4px 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }
}

.modern-list {
  padding: 0 16px 16px;
}

.homework-card {
  background: white;
  border-radius: var(--border-radius);
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
  cursor: pointer;

  &:active {
    transform: scale(0.98);
  }

  .card-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 12px;

    .subject-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      ion-icon {
        color: white;
        font-size: 24px;
      }
    }

    .card-info {
      flex: 1;
      min-width: 0;

      h3 {
        margin: 0 0 4px 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .due-date {
        margin: 0;
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.8rem;
        color: var(--text-secondary);

        ion-icon {
          font-size: 0.9rem;
        }
      }
    }
  }

  .description {
    margin: 0 0 12px 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid var(--bg-color);

    .teacher-name {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      color: var(--text-secondary);

      ion-icon {
        font-size: 1rem;
      }
    }

    ion-button {
      --color: var(--primary);
      font-weight: 600;
      font-size: 0.85rem;
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  ion-icon {
    font-size: 80px;
    color: var(--success);
    margin-bottom: 16px;
  }

  h3 {
    margin: 0 0 8px 0;
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  p {
    margin: 0;
    color: var(--text-secondary);
  }
}
```

### TypeScript
```typescript
export class HomeworkPage {
  homeworks: any[] = [];

  getSubjectGradient(subject: string): string {
    const gradients = {
      'Math': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'Science': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'English': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'History': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      'default': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    };
    return gradients[subject] || gradients['default'];
  }

  getSubjectIcon(subject: string): string {
    const icons = {
      'Math': 'calculator-outline',
      'Science': 'flask-outline',
      'English': 'book-outline',
      'History': 'time-outline',
      'default': 'document-text-outline'
    };
    return icons[subject] || icons['default'];
  }

  getPriorityClass(priority: string): string {
    return `badge-${priority.toLowerCase()}`;
  }
}
```

## Example 2: Modernizing a Detail Page (e.g., Profile Page)

### HTML
```html
<ion-header class="ion-no-border modern-header">
  <ion-toolbar>
    <ion-buttons slot="start">
      <ion-back-button defaultHref="/dashboard"></ion-back-button>
    </ion-buttons>
    <ion-title>Profile</ion-title>
    <ion-buttons slot="end">
      <ion-button fill="clear" (click)="editProfile()">
        <ion-icon slot="icon-only" name="create-outline"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content class="modern-content">
  <!-- Profile Header -->
  <div class="profile-header">
    <div class="profile-avatar-large">
      <img [src]="profilePic" alt="Profile">
      <button class="avatar-edit-btn" (click)="changePhoto()">
        <ion-icon name="camera"></ion-icon>
      </button>
    </div>
    <h2>{{studentData.name}}</h2>
    <p>{{studentData.class}} - {{studentData.section}}</p>
  </div>

  <!-- Info Cards -->
  <div class="info-section">
    <h3 class="section-title">Personal Information</h3>
    
    <div class="info-card">
      <div class="info-item">
        <div class="info-icon">
          <ion-icon name="card-outline"></ion-icon>
        </div>
        <div class="info-content">
          <span class="info-label">Registration ID</span>
          <span class="info-value">{{studentData.regId}}</span>
        </div>
      </div>

      <div class="info-item">
        <div class="info-icon">
          <ion-icon name="calendar-outline"></ion-icon>
        </div>
        <div class="info-content">
          <span class="info-label">Date of Birth</span>
          <span class="info-value">{{studentData.dob | date:'MMM dd, yyyy'}}</span>
        </div>
      </div>

      <div class="info-item">
        <div class="info-icon">
          <ion-icon name="mail-outline"></ion-icon>
        </div>
        <div class="info-content">
          <span class="info-label">Email</span>
          <span class="info-value">{{studentData.email}}</span>
        </div>
      </div>

      <div class="info-item">
        <div class="info-icon">
          <ion-icon name="call-outline"></ion-icon>
        </div>
        <div class="info-content">
          <span class="info-label">Phone</span>
          <span class="info-value">{{studentData.phone}}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Stats Section -->
  <div class="stats-section">
    <h3 class="section-title">Academic Stats</h3>
    
    <ion-grid>
      <ion-row>
        <ion-col size="6">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
              <ion-icon name="checkmark-done-outline"></ion-icon>
            </div>
            <div class="stat-content">
              <h2>{{stats.attendance}}%</h2>
              <p>Attendance</p>
            </div>
          </div>
        </ion-col>
        <ion-col size="6">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%)">
              <ion-icon name="trophy-outline"></ion-icon>
            </div>
            <div class="stat-content">
              <h2>{{stats.grade}}</h2>
              <p>Average Grade</p>
            </div>
          </div>
        </ion-col>
      </ion-row>
    </ion-grid>
  </div>
</ion-content>
```

### SCSS
```scss
.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  text-align: center;
  border-radius: 0 0 24px 24px;
  margin-bottom: 24px;

  .profile-avatar-large {
    position: relative;
    width: 120px;
    height: 120px;
    margin: 0 auto 16px;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    }

    .avatar-edit-btn {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: white;
      border: none;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      ion-icon {
        color: var(--primary);
        font-size: 20px;
      }
    }
  }

  h2 {
    margin: 0 0 4px 0;
    color: white;
    font-size: 1.5rem;
    font-weight: 700;
  }

  p {
    margin: 0;
    color: rgba(255, 255, 255, 0.9);
    font-size: 1rem;
  }
}

.info-section,
.stats-section {
  padding: 0 16px 24px;

  .section-title {
    margin: 0 0 16px 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
  }
}

.info-card {
  background: white;
  border-radius: var(--border-radius);
  padding: 8px;
  box-shadow: var(--shadow);

  .info-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px;
    border-bottom: 1px solid var(--bg-color);

    &:last-child {
      border-bottom: none;
    }

    .info-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: var(--bg-color);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      ion-icon {
        color: var(--primary);
        font-size: 20px;
      }
    }

    .info-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;

      .info-label {
        font-size: 0.8rem;
        color: var(--text-secondary);
      }

      .info-value {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--text-primary);
      }
    }
  }
}

.stat-card {
  background: white;
  border-radius: var(--border-radius);
  padding: 16px;
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  gap: 12px;

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    ion-icon {
      color: white;
      font-size: 24px;
    }
  }

  .stat-content {
    h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    p {
      margin: 4px 0 0 0;
      color: var(--text-secondary);
      font-size: 0.8rem;
    }
  }
}
```

## Example 3: Adding Loading States

### HTML
```html
<!-- Loading Skeleton -->
<div class="skeleton-list" *ngIf="loading">
  <div class="skeleton-card" *ngFor="let item of [1,2,3,4,5]">
    <div class="skeleton-header">
      <div class="skeleton-avatar"></div>
      <div class="skeleton-text">
        <div class="skeleton-line short"></div>
        <div class="skeleton-line"></div>
      </div>
    </div>
    <div class="skeleton-content">
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
    </div>
  </div>
</div>

<!-- Actual Content -->
<div *ngIf="!loading">
  <!-- Your content here -->
</div>
```

### SCSS
```scss
@keyframes shimmer {
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
}

.skeleton-list {
  padding: 16px;
}

.skeleton-card {
  background: white;
  border-radius: var(--border-radius);
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow);
}

.skeleton-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(to right, #f0f0f0 8%, #f8f8f8 18%, #f0f0f0 33%);
  background-size: 800px 104px;
  animation: shimmer 1.5s infinite;
}

.skeleton-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(to right, #f0f0f0 8%, #f8f8f8 18%, #f0f0f0 33%);
  background-size: 800px 104px;
  animation: shimmer 1.5s infinite;

  &.short {
    width: 60%;
  }
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
```

These examples demonstrate how to apply the modern design system to different types of pages in your application. Use them as templates when updating other pages!
