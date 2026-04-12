# Design System - Quick Reference Guide

## 🎨 Color Palette

### Primary Colors
```scss
--primary: #6366f1          // Main brand color
--primary-light: #818cf8    // Lighter variant
--primary-dark: #4f46e5     // Darker variant
--secondary: #10b981        // Secondary actions
--secondary-light: #34d399  // Lighter variant
--accent: #f59e0b          // Accent/highlight
```

### Background Colors
```scss
--bg-color: #f8fafc        // Main background
--bg-secondary: #f1f5f9    // Secondary background
--white: #ffffff           // Pure white
```

### Text Colors
```scss
--text-primary: #1e293b    // Main text
--text-secondary: #64748b  // Secondary text
--text-light: #94a3b8      // Light/muted text
```

### Status Colors
```scss
--success: #10b981         // Success states
--warning: #f59e0b         // Warning states
--danger: #ef4444          // Error/danger states
```

## 📐 Spacing & Sizing

### Border Radius
```scss
--border-radius-sm: 8px    // Small elements
--border-radius: 12px      // Standard elements
--border-radius-lg: 16px   // Large elements
```

### Shadows
```scss
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1)
```

## 🧩 Component Classes

### Modern Card
```html
<div class="modern-card">
  <div class="modern-card-header">
    <h3>Card Title</h3>
  </div>
  <p>Card content goes here</p>
</div>
```

### Modern Button
```html
<ion-button class="modern-btn" color="primary">
  <ion-icon slot="start" name="add-outline"></ion-icon>
  Button Text
</ion-button>
```

### Badges
```html
<span class="modern-badge badge-primary">Primary</span>
<span class="modern-badge badge-success">Success</span>
<span class="modern-badge badge-warning">Warning</span>
<span class="modern-badge badge-danger">Danger</span>
```

### Glassmorphism Effect
```html
<div class="glass-effect">
  Content with glass effect
</div>
```

## 📱 Page Header Template

### Standard Header
```html
<ion-header class="ion-no-border modern-header">
  <ion-toolbar>
    <ion-buttons slot="start">
      <ion-back-button defaultHref="/dashboard"></ion-back-button>
    </ion-buttons>
    <ion-title>Page Title</ion-title>
    <ion-buttons slot="end">
      <ion-button fill="clear">
        <ion-icon slot="icon-only" name="ellipsis-vertical"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>
```

### Header with Gradient
```scss
.modern-header {
  ion-toolbar {
    --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --color: white;
  }
}
```

## 📋 List Items

### Modern List Item
```html
<ion-list class="modern-list">
  <ion-item class="modern-list-item" lines="none">
    <div class="item-icon" slot="start">
      <ion-icon name="document-text-outline"></ion-icon>
    </div>
    <ion-label>
      <h3>Item Title</h3>
      <p>Item description</p>
    </ion-label>
    <span class="modern-badge badge-success" slot="end">Active</span>
  </ion-item>
</ion-list>
```

```scss
.modern-list {
  background: transparent;
  padding: 16px;

  .modern-list-item {
    --background: white;
    border-radius: var(--border-radius);
    margin-bottom: 12px;
    box-shadow: var(--shadow);
    padding: 12px;

    .item-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;

      ion-icon {
        color: white;
        font-size: 20px;
      }
    }

    ion-label {
      h3 {
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 4px;
      }

      p {
        color: var(--text-secondary);
        font-size: 0.85rem;
      }
    }
  }
}
```

## 🎴 Card Grid Layout

### Grid Template
```html
<div class="modern-grid">
  <ion-grid>
    <ion-row>
      <ion-col size="12" size-md="6" size-lg="4">
        <div class="info-card">
          <div class="card-icon">
            <ion-icon name="calendar-outline"></ion-icon>
          </div>
          <h4>Card Title</h4>
          <p>Card description</p>
        </div>
      </ion-col>
    </ion-row>
  </ion-grid>
</div>
```

```scss
.info-card {
  background: white;
  border-radius: var(--border-radius);
  padding: 20px;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-4px);
  }

  .card-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;

    ion-icon {
      color: white;
      font-size: 24px;
    }
  }

  h4 {
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  p {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin: 0;
  }
}
```

## 🎭 Animations

### Fade In Up
```scss
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animated-element {
  animation: fadeInUp 0.5s ease-out;
}
```

### Scale on Tap
```scss
.interactive-element {
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.96);
  }
}
```

## 📊 Stats/Info Display

### Stat Card
```html
<div class="stat-card">
  <div class="stat-icon">
    <ion-icon name="checkmark-done-outline"></ion-icon>
  </div>
  <div class="stat-content">
    <h2>95%</h2>
    <p>Attendance</p>
  </div>
</div>
```

```scss
.stat-card {
  background: white;
  border-radius: var(--border-radius);
  padding: 16px;
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  gap: 16px;

  .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    display: flex;
    align-items: center;
    justify-content: center;

    ion-icon {
      color: white;
      font-size: 28px;
    }
  }

  .stat-content {
    h2 {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    p {
      margin: 4px 0 0 0;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
  }
}
```

## 🎯 Form Elements

### Modern Input
```html
<div class="modern-form">
  <ion-item lines="none" class="modern-input">
    <ion-label position="floating">Email</ion-label>
    <ion-input type="email"></ion-input>
  </ion-item>
</div>
```

```scss
.modern-form {
  .modern-input {
    --background: white;
    border-radius: var(--border-radius-sm);
    margin-bottom: 16px;
    box-shadow: var(--shadow-sm);
    padding: 4px 16px;

    ion-label {
      color: var(--text-secondary);
      font-weight: 500;
    }

    ion-input {
      --color: var(--text-primary);
      font-weight: 500;
    }
  }
}
```

## 🎨 Gradient Presets

```scss
// Purple to Pink
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

// Pink to Orange
background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);

// Blue to Cyan
background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);

// Green to Teal
background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);

// Orange to Yellow
background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);

// Purple to Blue
background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);

// Soft Pastel
background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);

// Warm Sunset
background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
```

## 📱 Responsive Breakpoints

```scss
// Mobile First
@media (min-width: 576px) {
  // Small devices (landscape phones)
}

@media (min-width: 768px) {
  // Medium devices (tablets)
}

@media (min-width: 992px) {
  // Large devices (desktops)
}

@media (min-width: 1200px) {
  // Extra large devices (large desktops)
}
```

## ✅ Best Practices

1. **Consistency**: Use design system variables consistently across all pages
2. **Spacing**: Maintain consistent padding and margins (multiples of 4px)
3. **Typography**: Use defined font weights (400, 500, 600, 700)
4. **Colors**: Always use CSS variables, never hardcode colors
5. **Shadows**: Use predefined shadow variables for depth
6. **Animations**: Keep animations subtle and purposeful (200-500ms)
7. **Accessibility**: Ensure sufficient color contrast (WCAG AA minimum)
8. **Performance**: Optimize images and use CSS transforms for animations

## 🔄 Migration Checklist

When updating an existing page:
- [ ] Replace old color variables with new ones
- [ ] Update header to modern-header style
- [ ] Convert lists to modern-list-item format
- [ ] Add modern-card wrapper to content sections
- [ ] Implement smooth animations
- [ ] Add responsive breakpoints
- [ ] Test on multiple screen sizes
- [ ] Verify accessibility
