import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Register } from './register';
import { routes } from '../../../app.routes';

function enterValue(fixture: ComponentFixture<Register>, id: string, value: string): void {
  const field = fixture.nativeElement.querySelector(`#${id}`) as HTMLInputElement | HTMLSelectElement;
  field.value = value;
  field.dispatchEvent(new Event(field instanceof HTMLSelectElement ? 'change' : 'input'));
  field.dispatchEvent(new Event('blur'));
  fixture.detectChanges();
}

describe('Register', () => {
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter(routes),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTestingController.verify());

  function createFixture(): ComponentFixture<Register> {
    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    return fixture;
  }

  function fillValidForm(fixture: ComponentFixture<Register>): void {
    enterValue(fixture, 'name', 'Alex Smith');
    enterValue(fixture, 'email', 'alex@example.com');
    enterValue(fixture, 'seniority', 'SENIOR');
    enterValue(fixture, 'password', 'Abcd123!');
    enterValue(fixture, 'passwordVerification', 'Abcd123!');
  }

  it('requires all fields and keeps user as the default role', () => {
    const fixture = createFixture();
    const button = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    const role = fixture.nativeElement.querySelector('#role') as HTMLSelectElement;

    expect(role.value).toBe('user');
    expect(button.disabled).toBeTrue();
    expect(fixture.nativeElement.querySelectorAll('#seniority option').length).toBe(4);
  });

  it('validates the name rules and shows errors below the field', () => {
    const fixture = createFixture();
    enterValue(fixture, 'name', '1Alex');

    expect(fixture.nativeElement.querySelector('#name-error')?.textContent).toContain(
      'must start with a letter',
    );

    enterValue(fixture, 'name', 'A'.repeat(151));
    expect(fixture.nativeElement.querySelector('#name-error')?.textContent).toContain(
      '150 characters or fewer',
    );
  });

  it('validates email format and the 150-character limit', () => {
    const fixture = createFixture();
    enterValue(fixture, 'email', 'not-an-email');
    expect(fixture.nativeElement.querySelector('#email-error')?.textContent).toContain(
      'Enter a valid email address',
    );

    enterValue(fixture, 'email', `${'a'.repeat(145)}@x.com`);
    expect(fixture.nativeElement.querySelector('#email-error')?.textContent).toContain(
      '150 characters or fewer',
    );
  });

  it('enforces password length and requires a letter or number and a special character', () => {
    const fixture = createFixture();
    enterValue(fixture, 'password', 'Abc123!');
    expect(fixture.nativeElement.querySelector('#password-error')?.textContent).toContain(
      'at least 8 characters',
    );

    enterValue(fixture, 'password', `A1!${'x'.repeat(23)}`);
    expect(fixture.nativeElement.querySelector('#password-error')?.textContent).toContain(
      '25 characters or fewer',
    );

    enterValue(fixture, 'password', 'OnlyLetters');
    expect(fixture.nativeElement.querySelector('#password-error')?.textContent).toContain(
      'at least one special character',
    );
  });

  it('requires matching passwords with valid length and characters before enabling submit', () => {
    const fixture = createFixture();
    fillValidForm(fixture);
    const button = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;

    expect(button.disabled).toBeFalse();

    enterValue(fixture, 'passwordVerification', 'Different1!');
    expect(button.disabled).toBeTrue();
    expect(fixture.nativeElement.querySelector('#password-verification-error')?.textContent).toContain(
      'Passwords do not match',
    );

    enterValue(fixture, 'password', 'Abcd 123!');
    expect(fixture.nativeElement.querySelector('#password-error')?.textContent).toContain(
      'no spaces',
    );
  });

  it('posts the employee data without password verification', () => {
    const fixture = createFixture();
    fillValidForm(fixture);

    (fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    const request = httpTestingController.expectOne('http://localhost:8080/api/employees');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      name: 'Alex Smith',
      email: 'alex@example.com',
      role: 'user',
      seniority: 'SENIOR',
      password: 'Abcd123!',
    });

    request.flush({});
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]')?.textContent).toContain(
      'Employee registered successfully.',
    );
  });

  it('shows the error message returned by the backend', () => {
    const fixture = createFixture();
    fillValidForm(fixture);
    (fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    httpTestingController
      .expectOne('http://localhost:8080/api/employees')
      .flush(
        {
          status: 409,
          message: 'A record with these details already exists.',
          timestamp: '2026-10-03T22:37:11.656049601',
        },
        { status: 409, statusText: 'Conflict' },
      );
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'A record with these details already exists.',
    );
  });

  it('shows a fallback when the backend response has no usable message', () => {
    const fixture = createFixture();
    fillValidForm(fixture);
    (fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    httpTestingController
      .expectOne('http://localhost:8080/api/employees')
      .flush({ status: 500 }, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'Registration failed. Please try again.',
    );
  });
});
