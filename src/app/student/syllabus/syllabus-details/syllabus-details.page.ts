import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { Storage } from '@capacitor/storage';

@Component({
  selector: 'app-syllabus-details',
  templateUrl: './syllabus-details.page.html',
  styleUrls: ['./syllabus-details.page.scss'],
})
export class SyllabusDetailsPage implements OnInit {
  sylExpand: boolean[] = [ false, false, false, false, false, false, false, false, false, false, false, false];
  syllabusId = null;
  syllabusData = null;
  subjectName = '...';
  isLoaded = false;

  constructor(
    private route: ActivatedRoute,
    private constants: ConstantsService,
    private api: ApiService,
  ) { }

  ngOnInit() {
    this.syllabusId = this.route.snapshot.params.id;
    this.getSyllabusData(this.syllabusId);
  }
  async getSyllabusData(sid: number)
  {
    const sData = await Storage.get({ key: 'studentData'});
    const sDetails = JSON.parse(sData.value);
    const loader = await this.constants.getLoader();
    await loader.present();
    this.api.syllabusDetails(sDetails.id, sid).subscribe(async (result: any) => {
      await loader.dismiss();
      this.isLoaded = true;
      this.syllabusData = result.data;
      if (result.data && result.data.length > 0) {
        this.subjectName = result.data[0].subject.subject_name;
      }
    }, async (error) => {
      await loader.dismiss();
      this.isLoaded = true;
      this.constants.presentToast('Unable To get Syllabus Details. Check Your Internet Connection.');
    });
  }
  reset() {
    for (let index = 0; index < 12; index++) {
      this.sylExpand[index] = false;
    }
  }

  show(index: number) {
    this.sylExpand[index] = !this.sylExpand[index];
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
    return gradients.default;
  }
}
