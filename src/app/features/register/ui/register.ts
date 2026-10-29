import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { EmployeeService } from '../data-access/employee.service';
import { EmployeeSeniority } from '../models/employee-registration';

const matchingPasswords: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const passwordVerification = control.get('passwordVerification')?.value;

  return password === passwordVerification ? null : { passwordMismatch: true };
};

function getServerErrorMessage(error: unknown): string | null {
  if (!(error instanceof HttpErrorResponse) || typeof error.error !== 'object' || error.error === null) {
    return null;
  }

  const message = (error.error as { message?: unknown }).message;
  return typeof message === 'string' && message.trim() ? message : null;
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {
  private readonly formBuilder = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);

  protected readonly isSubmitting = signal(false);
  protected readonly submissionMessage = signal('');
  protected readonly submissionFailed = signal(false);
  protected readonly seniorities: EmployeeSeniority[] = ['JUNIOR', 'SENIOR', 'SPECIALIST'];
  protected readonly registerForm = this.formBuilder.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.maxLength(150), Validators.pattern(/^[A-Za-z][A-Za-z ]*$/)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      role: ['user' as const, Validators.required],
      seniority: ['' as EmployeeSeniority, Validators.required],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(25),
          Validators.pattern(/^(?=.*[A-Za-z0-9])(?=.*[^A-Za-z0-9])[!-~]+$/),
        ],
      ],
      passwordVerification: ['', Validators.required],
    },
    { validators: matchingPasswords },
  );
  private readonly formStatus = toSignal(this.registerForm.statusChanges, {
    initialValue: this.registerForm.status,
  });

  protected readonly canRegister = computed(
    () => this.formStatus() === 'VALID' && !this.isSubmitting(),
  );

  protected onSubmit(): void {
    if (this.registerForm.invalid || this.isSubmitting()) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.submissionMessage.set('');
    this.submissionFailed.set(false);
    this.isSubmitting.set(true);

    const { name, email, role, seniority, password } = this.registerForm.getRawValue();
    this.employeeService
      .register({ name, email, role, seniority, password })
      .subscribe({
        next: () => {
          this.submissionMessage.set('Employee registered successfully.');
          this.isSubmitting.set(false);
        },
        error: (error: unknown) => {
          this.submissionMessage.set(
            getServerErrorMessage(error) ?? 'Registration failed. Please try again.',
          );
          this.submissionFailed.set(true);
          this.isSubmitting.set(false);
        },
      });
  }
}
