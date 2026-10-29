import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EmployeeRegistration } from '../models/employee-registration';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly employeesUrl = 'http://localhost:8080/api/employees';

  register(employee: EmployeeRegistration): Observable<void> {
    return this.http.post<void>(this.employeesUrl, employee);
  }
}
