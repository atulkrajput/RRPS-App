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
    this.api.syllabusDetails(sDetails.id,sid).subscribe(async (result: any) => {
      await loader.dismiss();
      //console.log(result.data[0].subject.subject_name);
      this.syllabusData = result.data;
      this.subjectName = result.data[0].subject.subject_name;
    }, async (error) => {
      await  loader.dismiss();
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
}
