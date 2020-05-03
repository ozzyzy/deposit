import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {map} from "rxjs/operators";
import {Deposit} from "../interfaces/deposit";

@Injectable({
  providedIn: 'root'
})
export class DepositService {

  constructor(private http: HttpClient) {
  }

  getDepositsData(): Observable<Deposit[]> {
    return this.http.get('../assets/depcalc.json').pipe(
      map(data => data['deposits']));
  }
}
