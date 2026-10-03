import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';

function enterValue(fixture: ComponentFixture<App>, selector: string, value: string): void {
  const input = fixture.nativeElement.querySelector(selector) as HTMLInputElement;
  input.value = value;
  input.dispatchEvent(new Event('input'));
  input.dispatchEvent(new Event('blur'));
  fixture.detectChanges();
}

describe('App', () => {
  beforeEach(async () => {
    localStorage.removeItem('people-app-theme');
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = '';

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the login form with submit disabled until the fields are valid', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain('Welcome back');
    expect(compiled.querySelector('input[type="email"]')).toBeTruthy();
    expect(compiled.querySelector('input[type="password"]')).toBeTruthy();
    expect((compiled.querySelector('button[type="submit"]') as HTMLButtonElement).disabled).toBeTrue();

    enterValue(fixture, 'input[type="email"]', 'person@example.com');
    enterValue(fixture, 'input[type="password"]', 'Abcd123!');

    expect((compiled.querySelector('button[type="submit"]') as HTMLButtonElement).disabled).toBeFalse();
  });

  it('should validate email format and the 150-character limit', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    enterValue(fixture, 'input[type="email"]', 'not-an-email');
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'Enter a valid email address.',
    );

    enterValue(
      fixture,
      'input[type="email"]',
      `${'a'.repeat(63)}@${'b'.repeat(63)}.${'c'.repeat(18)}.com`,
    );
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();

    enterValue(
      fixture,
      'input[type="email"]',
      `${'a'.repeat(63)}@${'b'.repeat(63)}.${'c'.repeat(19)}.com`,
    );
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      '150 characters or fewer',
    );

    enterValue(fixture, 'input[type="email"]', 'person@example.com');
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });

  it('should validate password length and allowed characters', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    enterValue(fixture, 'input[type="password"]', 'Abc123!');
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'at least 8 characters',
    );

    enterValue(fixture, 'input[type="password"]', 'Abc123!'.padEnd(26, 'x'));
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      '25 characters or fewer',
    );

    enterValue(fixture, 'input[type="password"]', 'Abcd 123!');
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'only letters, numbers, and special characters',
    );

    enterValue(fixture, 'input[type="password"]', 'Abcd123!');
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });

  it('should render a registration button that does not submit the form', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const registerButton = fixture.nativeElement.querySelector(
      'section button[type="button"]',
    ) as HTMLButtonElement;

    expect(registerButton.textContent).toContain('Register');
    expect(registerButton.type).toBe('button');
  });

  it('should restore the saved theme on startup', () => {
    localStorage.setItem('people-app-theme', 'dark');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const themeSwitch = fixture.nativeElement.querySelector('[role="switch"]') as HTMLButtonElement;
    expect(themeSwitch.getAttribute('aria-checked')).toBe('true');
    expect(document.documentElement.classList.contains('dark')).toBeTrue();
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('should toggle and persist the theme', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const themeSwitch = fixture.nativeElement.querySelector('[role="switch"]') as HTMLButtonElement;
    themeSwitch.click();
    fixture.detectChanges();

    expect(themeSwitch.getAttribute('aria-checked')).toBe('true');
    expect(localStorage.getItem('people-app-theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBeTrue();

    themeSwitch.click();
    fixture.detectChanges();

    expect(themeSwitch.getAttribute('aria-checked')).toBe('false');
    expect(localStorage.getItem('people-app-theme')).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBeFalse();
  });
});
