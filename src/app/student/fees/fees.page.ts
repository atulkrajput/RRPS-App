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
    tuitionFee: 0,
    regFee: 0,
    admissionFee: 0,
    hasTransport: false,
    transportFeeMonthly: 0,
    transportRoute: '',
    transportStop: '',
    transportFeeTotal: 0,
    transportFeePaid: 0,
    transportFeePending: 0
  };

  paymentModes: any = {};
  paymentTypes: any = {};
  previousPayments: any[] = [];

  constructor(
    private constants: ConstantsService,
    private api: ApiService,
  ) { }

  ngOnInit() {
    this.getFeeDetails();
  }

  async getFeeDetails() {
    const sData = await Storage.get({ key: 'studentData' });
    const sDetails = JSON.parse(sData.value);
    const loader = await this.constants.getLoader();
    await loader.present();

    // Load fee history
    this.api.feeHistory(sDetails.id).subscribe((result: any) => {
      if (result.status === 1) {
        this.feeHistoryData = result.data.fee;
        this.monthData = result.data.months;
      }
    });

    // Load fee detail (pending fees + transport)
    this.api.feeDetail(sDetails.id).subscribe(async (result: any) => {
      await loader.dismiss();
      if (result.status === 1) {
        const d = result.data;
        this.pendingFees.oldBalance = d.old_balance || 0;
        this.pendingFees.tuitionFee = d.tuition_fee || 0;
        this.pendingFees.regFee = d.reg_fee || 0;
        this.pendingFees.admissionFee = d.admission_fee || 0;
        this.pendingFees.hasTransport = d.has_transport || false;
        this.pendingFees.transportFeeMonthly = d.transport_fee_monthly || 0;
        this.pendingFees.transportRoute = d.transport_route || '';
        this.pendingFees.transportStop = d.transport_stop || '';
        this.pendingFees.transportFeeTotal = d.transport_fee_total || 0;
        this.pendingFees.transportFeePaid = d.transport_fee_paid || 0;
        this.pendingFees.transportFeePending = d.transport_fee_pending || 0;
        this.paymentModes = d.payment_mode || {};
        this.paymentTypes = d.payment_type || {};
        this.previousPayments = d.previous_payment || [];
      }
    }, async (error) => {
      await loader.dismiss();
      this.constants.presentToast('Unable to fetch fee details. Check your internet connection.');
    });
  }

  getTotalPending(): number {
    return (this.pendingFees.oldBalance || 0) +
           (this.pendingFees.tuitionFee || 0) +
           (this.pendingFees.transportFeePending || 0);
  }

  getTotalPaid(): number {
    if (!this.feeHistoryData || this.feeHistoryData.length === 0) { return 0; }
    return this.feeHistoryData.reduce((sum, fee) => sum + parseFloat(fee.fees_deposited || 0), 0);
  }

  getPaymentCount(): number {
    return this.feeHistoryData ? this.feeHistoryData.length : 0;
  }

  getFeeTypeGradient(feeType: string): string {
    const gradients = {
      monthly: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      admission: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      transport: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      exam: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      library: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      sports: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      default: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    };
    const type = feeType ? feeType.toLowerCase() : 'default';
    return gradients[type] || gradients.default;
  }

  getFeeTypeIcon(feeType: string): string {
    const icons = {
      monthly: 'calendar-outline',
      admission: 'school-outline',
      transport: 'bus-outline',
      exam: 'document-text-outline',
      library: 'book-outline',
      sports: 'football-outline',
      default: 'card-outline'
    };
    const type = feeType ? feeType.toLowerCase() : 'default';
    return icons[type] || icons.default;
  }

  getFeeTypeName(feeType: string): string {
    if (!feeType) { return 'Fee Payment'; }
    return feeType.charAt(0).toUpperCase() + feeType.slice(1) + ' Fee';
  }
}
