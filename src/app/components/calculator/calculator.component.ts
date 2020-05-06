import { Component, OnInit } from '@angular/core';
import {Observable} from "rxjs";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Deposit} from "../../interfaces/deposit";
import {DepositService} from "../../services/deposit.service";
import {Param} from "../../interfaces/param";
import {DepositFormValue} from "../../interfaces/depositFormValue";

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss']
})
export class CalculatorComponent implements OnInit {
  public deposits$: Observable<Deposit[]>;
  public deposits: Deposit[] = [];
  public currentDeposit: Deposit;
  private currentPeriod = {};
  public selectedDeposit: string;
  public depositName: string;
  public depositSum: number;
  public depositPeriod: number;
  public periodStarts: number;
  public sumStarts: number;
  public currentRate: number;
  public submitted: boolean = false;
  public revenue: string;

  depositForm: FormGroup = new FormGroup({
    depositName: new FormControl('', [
      Validators.required
    ]),
    depositSum: new FormControl(null, [
      Validators.required
    ]),
    depositPeriod: new FormControl(null, [
      Validators.required
    ])
  });

  public hasError = (controlName: string, errorName: string) => {
    return this.depositForm.controls[controlName].hasError(errorName);
  };

  constructor(private depositService: DepositService) { }

  ngOnInit(): void {
    this.deposits$ =  this.depositService.getDepositsData();
    this.deposits$.subscribe(data => this.deposits = data);
  }

  onDepositNameChange(): void {
    const sumsArray: number[] = [];
    this.currentDeposit = this.deposits.find((d: Deposit) => d.code === this.selectedDeposit);
    this.depositName = this.currentDeposit.name;
    this.periodStarts = this.currentDeposit.param[0].period_from;
    this.currentDeposit.param.forEach(p => sumsArray.push(p.summs_and_rate[0].summ_from));
    this.sumStarts = Math.min(...sumsArray);
    this.depositForm.controls['depositPeriod'].setValidators([Validators.min(this.periodStarts)]);
    this.depositForm.controls['depositSum'].setValidators([Validators.min(this.sumStarts)]);
    this.depositForm.controls['depositPeriod'].updateValueAndValidity();
    this.depositForm.controls['depositSum'].updateValueAndValidity();
  }

  findCurrentPeriod(deposit: Deposit): Param {
    const periodsArray: number[] = [];
    deposit.param.forEach((p: Param) => periodsArray.push(p.period_from));
    for (let i = 0; i < periodsArray.length; i++) {
      if ((this.depositPeriod >= periodsArray[i] && this.depositPeriod < periodsArray[i + 1]) ||
        (this.depositPeriod >= periodsArray[i] && !periodsArray[i + 1])) {
        return this.currentPeriod = deposit.param.find(p => p.period_from === periodsArray[i]);
      }
    }
  }

  onPeriodChange(): void {
    this.findCurrentPeriod(this.currentDeposit);
    if (Object.values(this.currentPeriod).length) {
      this.sumStarts = this.currentPeriod['summs_and_rate'][0].summ_from;
    }
  }

  calculateRevenue(value: DepositFormValue): void {
    const sumsArray: number[] = [];
    this.findCurrentPeriod(this.currentDeposit);

    this.currentPeriod['summs_and_rate'].forEach(s => sumsArray.push(s.summ_from));
    for (let i = 0; i < sumsArray.length; i++) {   //looking for matching sums & rate
      if ((value.depositSum >= sumsArray[i] && value.depositSum < sumsArray[i+1]) ||
        (value.depositSum >=sumsArray[i] && !sumsArray[i+1])) {
        this.currentRate = this.currentPeriod['summs_and_rate'].find(s => s.summ_from === sumsArray[i]).rate;
      }
    }

    this.revenue = ((value.depositSum * (this.currentRate / 100) * value.depositPeriod) / 365).toFixed(2);
    this.submitted = true;
  }

  print() {
    window.print();
  }
}
