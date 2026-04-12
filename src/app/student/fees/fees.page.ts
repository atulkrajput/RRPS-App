import { Component, OnInit } from '@angular/core';
import { Storage } from '@capacitor/storage';
import { ApiService } from 'src/app/services/api.service';
import { ConstantsService } from 'src/app/services/constants.service';

@Component({
  selector: 'app-fees',
  templateUrl: './fees.page.html',
  styleUrls: ['./fees.page.scss'],
})
export class FeesPage implements OnInit {

  feeHistoryData = null;
  monthData = null;

  pendingFees = {
    oldBalance: 0,
    monthlyFee: 6018,
    transportFee: 0
  };

  constructor(
    private constants: ConstantsService,
    private api: ApiService,
  ) { }

  ngOnInit() {
    this.getFeeDetails();
  }

  async getFeeDetails(){
    const sData = await Storage.get({ key: 'studentData'});
    const sDetails = JSON.parse(sData.value);
    //console.log(sDetails.id);
    const loader = await this.constants.getLoader();
    this.api.feeHistory(sDetails.id).subscribe(async (result: any) => {
      await loader.dismiss();
      //console.log(result.data);
      this.feeHistoryData= result.data.fee;
      this.monthData= result.data.months;
    }, async (error) => {
      await  loader.dismiss();
      this.constants.presentToast('Unable To Login. Check Your Internet Connection.');
    });
  }

  getTotalPending(): number {
    return (this.pendingFees.oldBalance || 0) + 
           (this.pendingFees.monthlyFee || 0) + 
           (this.pendingFees.transportFee || 0);
  }

  getTotalPaid(): number {
    if (!this.feeHistoryData || this.feeHistoryData.length === 0) return 0;
    return this.feeHistoryData.reduce((sum, fee) => sum + parseFloat(fee.fees_deposited || 0), 0);
  }

  getPaymentCount(): number {
    return this.feeHistoryData ? this.feeHistoryData.length : 0;
  }

  getFeeTypeGradient(feeType: string): string {
    const gradients = {
      'monthly': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'admission': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'transport': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'exam': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'library': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'sports': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      'default': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    };
    const type = feeType ? feeType.toLowerCase() : 'default';
    return gradients[type] || gradients['default'];
  }

  getFeeTypeIcon(feeType: string): string {
    const icons = {
      'monthly': 'calendar-outline',
      'admission': 'school-outline',
      'transport': 'bus-outline',
      'exam': 'document-text-outline',
      'library': 'book-outline',
      'sports': 'football-outline',
      'default': 'card-outline'
    };
    const type = feeType ? feeType.toLowerCase() : 'default';
    return icons[type] || icons['default'];
  }

  getFeeTypeName(feeType: string): string {
    if (!feeType) return 'Fee Payment';
    return feeType.charAt(0).toUpperCase() + feeType.slice(1) + ' Fee';
  }

}
