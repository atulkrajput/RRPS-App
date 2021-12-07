import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { Storage } from '@capacitor/storage';
@Component({
  selector: 'app-exams',
  templateUrl: './exams.page.html',
  styleUrls: ['./exams.page.scss'],
})
export class ExamsPage implements OnInit {
  examData = null;
  examtitleData = null;
  constructor(
    private router: Router,
    private constants: ConstantsService,
    private api: ApiService,
  ) { }

  ngOnInit() {
    this.getExamData();
  }

  async getExamData()
  {
    const sData = await Storage.get({ key: 'studentData'});
    const sDetails = JSON.parse(sData.value);
    const loader = await this.constants.getLoader();
    this.api.exam(sDetails.id).subscribe(async (result: any) => {
      await loader.dismiss();
      this.examData = result.data.exam;
      this.examtitleData = result.data.examTitles;
      console.log(result.data);
    }, async (error) => {
      await  loader.dismiss();
      this.constants.presentToast('Unable To get Exam Data. Check Your Internet Connection.');
    });
  }
}
