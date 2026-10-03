---
name: security

description: Automated and structured code review utility designed to audit Angular components, services, guards, interceptors, and templates against **OWASP Top 10 Security Risks**, **Angular 20 Modern Standards**, **RxJS/Signal Memory Leak Guidelines**, and **Performance Best Practices**.

---

## 2. Audit Matrix & Categories
**Target Framework:** Angular 20.x (20.0 - 20.3+)

### Category A: OWASP & Security Standards

#### A.1 Cross-Site Scripting (XSS) & Sanitization Bypass
- **Check 1.1:** Usage of `DomSanitizer` methods (`bypassSecurityTrustHtml`, `bypassSecurityTrustScript`, `bypassSecurityTrustStyle`, `bypassSecurityTrustUrl`).
  - *Severity:* **CRITICAL**
  - *Rule:* Flag any bypass call unless strictly justified with explicit input validation or static sanitization.
- **Check 1.2:** Direct DOM Manipulation via `ElementRef`.
  - *Severity:* **HIGH**
  - *Rule:* Flag `elementRef.nativeElement.innerHTML`, `.outerHTML`, or `.insertAdjacentHTML`. Recommend `Renderer2` or native Angular template binding.
- **Check 1.3:** Binding untrusted data to `[innerHTML]`.
  - *Severity:* **HIGH**
  - *Rule:* Ensure properties bound to `[innerHTML]` pass through a trusted sanitization pipeline or dedicated pipe.

#### A.2 Authentication & Authorization (Broken Access Control)
- **Check 2.1:** Deprecated Class-based Guards (`CanActivate`, `CanDeactivate`).
  - *Severity:* **MEDIUM**
  - *Rule:* Require functional guards (`CanActivateFn`, `CanDeactivateFn`) using `inject()`.
- **Check 2.2:** Insecure Token Storage in `localStorage` / `sessionStorage`.
  - *Severity:* **HIGH**
  - *Rule:* Flag sensitive tokens (JWT, session IDs) stored in browser web storage. Recommend HttpOnly, Secure, SameSite cookies or in-memory Signal storage with HTTP interceptors.
- **Check 2.3:** Unprotected Routes in `ProvideRouter` configuration.
  - *Severity:* **MEDIUM**
  - *Rule:* Audit route definitions for missing `canActivate` or `canMatch` arrays on administrative or user-specific routes.

#### A.3 Injection & Network Security
- **Check 3.1:** Dynamic Script or Style Injection.
  - *Severity:* **CRITICAL**
  - *Rule:* Detect runtime creation of `<script>` or `<link>` tags via `document.createElement()` without strict URL allowlisting.
- **Check 3.2:** HTTP Interceptor Security (`HttpInterceptorFn`).
  - *Severity:* **MEDIUM**
  - *Rule:* Verify HTTP interceptors correctly append `Authorization` headers and handle `401/403` status codes safely without infinite retry loops.

---

### Category B: Angular 20.x Modern Idioms & Syntax

#### B.1 Control Flow Syntax
- **Check 1.1:** Legacy Structural Directives (`*ngIf`, `*ngFor`, `*ngSwitch`).
  - *Severity:* **MEDIUM**
  - *Rule:* Flag legacy directives. Require native built-in control flow: `@if`, `@else`, `@for`, and `@switch`.
- **Check 1.2:** Mandatory `track` Expression in `@for`.
  - *Severity:* **HIGH**
  - *Rule:* Every `@for` loop must include a unique `track` key (e.g., `@for (item of items(); track item.id)`). Disallow `track $index` unless items are primitive and immutable.

#### B.2 Reactive Primitive Usage (Signals & RxJS)
- **Check 2.1:** Property/Decorator Modernization.
  - *Severity:* **LOW / MEDIUM**
  - *Rule:* Flag `@Input()`, `@Output()`, `@ViewChild()`, `@HostBinding()`. Require signal inputs (`input()`, `input.required()`), signal outputs (`output()`), signal queries (`viewChild()`), and host directives/bindings.
- **Check 2.2:** Advanced Signal Integration (`linkedSignal`, `resource`).
  - *Severity:* **LOW**
  - *Rule:* Flag complex `computed()` or `effect()` calls used purely for synchronizing writable state or async data fetching. Recommend `linkedSignal()` for state synchronization and `resource()` / `rxResource()` for async queries.
- **Check 2.3:** Dependency Injection via `inject()`.
  - *Severity:* **LOW**
  - *Rule:* Prefer function-based `inject(Service)` over constructor parameter injection for better readability and field initialization consistency.

---

### Category C: Performance, Memory & Hydration Safety

#### C.1 Memory Leak & Subscription Auditing
- **Check 1.1:** Unhandled RxJS Subscriptions.
  - *Severity:* **HIGH**
  - *Rule:* Flag manual `.subscribe()` calls without `takeUntilDestroyed()`, `take(1)`, or conversion to Signal via `toSignal()`.
- **Check 1.2:** `effect()` Misuse.
  - *Severity:* **HIGH**
  - *Rule:* Disallow updating writable signals (`signal.set()`, `signal.update()`) inside `effect()` blocks unless `allowSignalWrites: true` is explicitly passed (and even then, prefer `computed()` or `linkedSignal()`).

#### C.2 Change Detection & Rendering Optimization
- **Check 2.1:** Default Change Detection Strategy.
  - *Severity:* **MEDIUM**
  - *Rule:* Components must explicitly set `changeDetection: ChangeDetectionStrategy.OnPush`.
- **Check 2.2:** Heavy Computations in Template Expressions.
  - *Severity:* **HIGH**
  - *Rule:* Disallow method calls inside template expressions (e.g., `<div>{{ calculateTotal() }}</div>`). Method execution runs on every change detection cycle step ($O(N)$ overhead). Must be replaced with `computed()` signals or pure pipes.

#### C.3 Server-Side Rendering (SSR) & Hydration Safety
- **Check 3.1:** Unprotected Access to Browser Globals (`window`, `document`, `localStorage`).
  - *Severity:* **HIGH**
  - *Rule:* Flag direct references to global objects during component instantiation or initialization. Require platform checks (`isPlatformBrowser`) or execution lifecycle hooks (`afterNextRender`, `afterRender`).

---

## 3. Severity Scoring & Classification Matrix

| Severity Level | Description                                                                                    | Action Required                         |
| :------------- | :--------------------------------------------------------------------------------------------- | :-------------------------------------- |
| **CRITICAL**   | Direct security vulnerability (XSS, arbitrary code execution) or fatal app crash.              | Must fix immediately before deployment. |
| **HIGH**       | Potential security risk (XSS exposure, token leak), memory leak, or broken Angular 20 feature. | Must resolve prior to release.          |
| **MEDIUM**     | Violation of Angular 20 best practices (OnPush, control flow syntax, deprecated APIs).         | Recommended to refactor during review.  |
| **LOW**        | Code style or modern idiomatic enhancement (Signals vs RxJS, `inject()` usage).                | Consider addressing for maintenance.    |

---

## 4. Code Comparison Reference

### ❌ Non-Compliant Code (Legacy / Flawed)

```typescript
import { Component, Input, OnInit, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  template: `
    <div *ngIf="user">
      <h2 [innerHTML]="sanitizer.bypassSecurityTrustHtml(user.bio)"></h2>
      <ul *ngFor="let item of user.items">
        <li>{{ item.name }} - {{ calculateScore(item) }}</li>
      </ul>
    </div>
  `
})
export class UserProfileComponent implements OnInit {
  @Input() userId!: string;
  user: any;

  constructor(
    private http: HttpClient,
    public sanitizer: DomSanitizer,
    private el: ElementRef
  ) {}

  ngOnInit() {
    // ❌ Memory leak: unhandled subscription
    // ❌ Direct window reference without SSR check
    localStorage.setItem('lastView', Date.now().toString());
    
    this.http.get(`/api/users/${this.userId}`).subscribe(data => {
      this.user = data;
    });
  }

  calculateScore(item: any): number {
    // ❌ Called on every change detection cycle
    return item.points * 2;
  }
}
```

---

### ✅ Compliant Code (Angular 20.x Standard)

```typescript
import { 
  Component, 
  ChangeDetectionStrategy, 
  inject, 
  input, 
  computed, 
  afterNextRender 
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';

export interface UserItem {
  id: string;
  name: string;
  points: number;
}

export interface User {
  id: string;
  bio: string;
  items: UserItem[];
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (userResource.value(); as user) {
      <div>
        <h2>{{ user.bio }}</h2>
        <ul>
          @for (item of user.items; track item.id) {
            <li>{{ item.name }} - {{ getItemScore(item.points) }}</li>
          }
        </ul>
      </div>
    } @else if (userResource.isLoading()) {
      <p>Loading profile...</p>
    }
  `
})
export class UserProfileComponent {
  private readonly http = inject(HttpClient);

  // Signal Input
  readonly userId = input.required<string>();

  // RxResource for automatic async signal management
  readonly userResource = rxResource({
    request: () => ({ id: this.userId() }),
    loader: ({ request }) => this.http.get<User>(`/api/users/${request.id}`)
  });

  constructor() {
    // SSR Safe Browser lifecycle check
    afterNextRender(() => {
      localStorage.setItem('lastView', Date.now().toString());
    });
  }

  // Pure method helper for immutable calculation or computed primitive
  getItemScore(points: number): number {
    return points * 2;
  }
}
```

---

## 5. Execution Steps for Auditing

When executing an audit using this skill:
1. **Scan Security Directives**: Check for `DomSanitizer` bypasses and raw DOM innerHTML bindings.
2. **Verify Change Detection & SSR**: Confirm `OnPush` strategy and browser global safety (`afterNextRender`, `isPlatformBrowser`).
3. **Audit Signals & Control Flow**: Ensure modern `@if` / `@for` (with `track`) syntax, signal inputs/outputs, and `rxResource`/`linkedSignal` usage.
4. **Identify Memory Leaks**: Verify every RxJS observable is managed via `toSignal()`, `takeUntilDestroyed()`, or async bindings.
5. **Generate Summary**: Output findings categorized by severity (**CRITICAL**, **HIGH**, **MEDIUM**, **LOW**) with actionable remediation code snippets.