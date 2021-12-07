import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { ConstantsService } from 'src/app/services/constants.service';

@Component({
  selector: 'app-syllabus-details',
  templateUrl: './syllabus-details.page.html',
  styleUrls: ['./syllabus-details.page.scss'],
})
export class SyllabusDetailsPage implements OnInit {

  syllabusId = null;
  syllabusData = null;
  constructor(
    private route: ActivatedRoute,
    private constants: ConstantsService,
    private api: ApiService,
  ) { }

  ngOnInit() {
    this.syllabusId = this.route.snapshot.params.id;
    this.getSyllabusData(this.syllabusId);
  }
  async getSyllabusData(id)
  {
    const loader = await this.constants.getLoader();
    this.api.syllabus(id).subscribe(async (result: any) => {
      await loader.dismiss();
      this.syllabusData = result.data;
    }, async (error) => {
      await  loader.dismiss();
      this.constants.presentToast('Unable To get Syllabus Details. Check Your Internet Connection.');
    });
  }

}
