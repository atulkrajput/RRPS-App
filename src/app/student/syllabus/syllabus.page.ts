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
}
