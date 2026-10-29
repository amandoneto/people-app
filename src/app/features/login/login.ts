import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly formBuilder = inject(FormBuilder);

  protected readonly hasSubmitted = signal(false);
  protected readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(25),
        Validators.pattern(/^[\x21-\x7E]+$/),
      ],
    ],
  });

  protected get validationMessage(): string | null {
    const { email, password } = this.loginForm.controls;

    if ((email.touched || this.hasSubmitted()) && email.invalid) {
      if (email.hasError('required')) return 'Email is required.';
      if (email.hasError('maxlength')) return 'Email must be 150 characters or fewer.';
      if (email.hasError('email')) return 'Enter a valid email address.';
    }

    if ((password.touched || this.hasSubmitted()) && password.invalid) {
      if (password.hasError('required')) return 'Password is required.';
      if (password.hasError('minlength')) return 'Password must be at least 8 characters.';
      if (password.hasError('maxlength')) return 'Password must be 25 characters or fewer.';
      if (password.hasError('pattern')) {
        return 'Use only letters, numbers, and special characters.';
      }
    }

    return null;
  }

  protected onSubmit(): void {
    this.hasSubmitted.set(true);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
    }
  }
}
