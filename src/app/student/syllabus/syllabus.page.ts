import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { Storage } from '@capacitor/storage';
import { Router } from '@angular/router';

@Component({
  selector: 'app-syllabus',
  templateUrl: './syllabus.page.html',
  styleUrls: ['./syllabus.page.scss'],
})
export class SyllabusPage implements OnInit {
  syllabusData = null;
  
  constructor(
    private router: Router,
    private constants: ConstantsService,
    private api: ApiService,
  ) { }

  ngOnInit() {
    this.getSyllabusData();
  }

  async getSyllabusData()
  {
    const sData = await Storage.get({ key: 'studentData'});
    const sDetails = JSON.parse(sData.value);
    const loader = await this.constants.getLoader();
    this.api.syllabus(sDetails.id).subscribe(async (result: any) => {
      await loader.dismiss();
      this.syllabusData = result.data;
      //console.log(result.data);
    }, async (error) => {
      await  loader.dismiss();
      this.constants.presentToast('Unable To get Syllabus Data. Check Your Internet Connection.');
    });
  }

  syllabusDetails(id: number)
  {
    this.router.navigate(['/syllabus/syllabus-details/'+id]);
  }

  getTotalSubjects(): number {
    return this.syllabusData ? this.syllabusData.length : 0;
  }

  getTotalUnits(): number {
    if (!this.syllabusData || this.syllabusData.length === 0) return 0;
    return this.syllabusData.reduce((sum, syllabus) => sum + parseInt(syllabus.units || 0), 0);
  }

  getTotalChapters(): number {
    if (!this.syllabusData || this.syllabusData.length === 0) return 0;
    return this.syllabusData.reduce((sum, syllabus) => sum + parseInt(syllabus.chapters || 0), 0);
  }

  getSubjectIcon(subject: string): string {
    const icons = {
      'Mathematics': 'calculator-outline',
      'Physics': 'nuclear-outline',
      'Chemistry': 'beaker-outline',
      'Biology': 'leaf-outline',
      'English': 'book-outline',
      'History': 'time-outline',
      'Geography': 'globe-outline',
      'Computer': 'desktop-outline',
      'Science': 'flask-outline',
      'Hindi': 'language-outline',
      'default': 'document-text-outline'
    };
    
    for (const key in icons) {
      if (subject && subject.toLowerCase().includes(key.toLowerCase())) {
        return icons[key];
      }
    }
    return icons['default'];
  }

  getSubjectGradient(subject: string): string {
    const gradients = {
      'Mathematics': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'Physics': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'Chemistry': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'Biology': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'English': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'History': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      'Geography': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'Computer': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'Science': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'Hindi': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'default': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    };
    
    for (const key in gradients) {
      if (subject && subject.toLowerCase().includes(key.toLowerCase())) {
        return gradients[key];
      }
    }
    return gradients['default'];
  }
}
