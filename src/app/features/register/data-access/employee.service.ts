import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { EmployeeRegistration } from '../models/employee-registration';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly employeesUrl = `${environment.API_BASE_URL}employees`;

  register(employee: EmployeeRegistration): Observable<void> {
    return this.http.post<void>(this.employeesUrl, employee);
  }
}
