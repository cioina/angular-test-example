/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject, Injector, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';

import {
  MinUserNameLength,
  MaxUserNameLength,
  MinPasswordLength,
  MaxPasswordLength,
  MinEmailLength,
  MaxEmailLength
} from '@app/shared/constants';
import { apiPrefixInterceptor, authInterceptor } from '@app/shared/interceptors';
import { ErrorResponse } from '@app/shared/models';
import {
  LoginBodyRequest,
  UpdateUserBodyRequest,
  PasswordBodyRequest,
  RegisterBodyRequest
} from '@app/shared/services';
import { AuthStore } from '@app/shared/store';
import { TypedFormGroup } from '@app/shared/utils';
import { provideComponentStore } from '@ngrx/component-store';

import { provideNzNoAnimation } from 'ng-zorro-antd/core/animation';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { environment } from '../../../environments/environment';

function createHelpComponent(mustLogin: boolean): {
  helpFixture: ComponentFixture<TestHelpComponent>;
  helpComponent: TestHelpComponent;
} {
  const helpFixture = TestBed.createComponent(TestHelpComponent);
  const helpComponent = helpFixture.componentInstance;

  helpFixture.detectChanges();
  expect(helpComponent.isAuthenticated()).toBe(false);

  if (mustLogin) {
    helpComponent.login({ email: environment.testUserEmail, password: environment.testUserPassword });
    helpFixture.detectChanges();
  }

  return {
    helpFixture,
    helpComponent
  };
}

function compileComponents(): void {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([apiPrefixInterceptor, authInterceptor])),
      provideNzIconsTesting(),
      provideNzNoAnimation(),
      provideComponentStore(AuthStore),
      NzDrawerService
    ],
    imports: [TestHelpComponent]
  }).compileComponents();
}

function jasmineTimeoutInterval(n: number): number {
  localStorage.clear();
  const i = jasmine.DEFAULT_TIMEOUT_INTERVAL;
  jasmine.DEFAULT_TIMEOUT_INTERVAL = n;
  return i;
}

describe('auth.store', () => {
  describe('registerForm validation errors', () => {
    let TIMEOUT_INTERVAL: number;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;

    beforeEach(() => {
      TIMEOUT_INTERVAL = jasmineTimeoutInterval(12_000);
    });
    beforeEach(waitForAsync(() => {
      compileComponents();
      const h = createHelpComponent(false);
      helpFixture = h.helpFixture;
      helpComponent = h.helpComponent;
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should patchValue return form validation required errors', () => {
      helpComponent.registerForm.patchValue({ email: '', username: '', password: '', confirm: '' });
      helpFixture.detectChanges();
      const email = helpComponent.registerForm.get('email')!.errors;
      const username = helpComponent.registerForm.get('username')!.errors;
      const password = helpComponent.registerForm.get('password')!.errors;
      const confirm = helpComponent.registerForm.get('confirm')!.errors;
      expect(email).toBeTruthy();
      expect(username).toBeTruthy();
      expect(password).toBeTruthy();
      expect(confirm).toBeTruthy();
      expect(email!.required).toBe(true);
      expect(username!.required).toBe(true);
      expect(password!.required).toBeTruthy(true);
      expect(confirm!.required).toBe(true);
    });

    it('should patchValue return form validation min errors', () => {
      helpComponent.registerForm.patchValue({ email: 'a@', username: 'a', password: 'a', confirm: 'a' });
      helpFixture.detectChanges();
      const email = helpComponent.registerForm.get('email')!.errors;
      const username = helpComponent.registerForm.get('username')!.errors;
      const password = helpComponent.registerForm.get('password')!.errors;
      const confirm = helpComponent.registerForm.get('confirm')!.errors;
      expect(email).toBeTruthy();
      expect(username).toBeTruthy();
      expect(password).toBeTruthy();
      expect(confirm).toBeTruthy();
      expect(email!.min).toBe(true);
      expect(username!.min).toBe(true);
      expect(password!.min).toBeTruthy(true);
      expect(confirm!.min).toBe(true);
    });

    it('should patchValue return form validation email errors', () => {
      helpComponent.registerForm.patchValue({ email: 'notValidEmail', password: '' });
      helpFixture.detectChanges();
      const email = helpComponent.registerForm.get('email')!.errors;
      expect(email).toBeTruthy();
      expect(email!.email).toBe(true);
    });
  });

  describe('userForm validation errors', () => {
    let TIMEOUT_INTERVAL: number;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;

    beforeEach(() => {
      TIMEOUT_INTERVAL = jasmineTimeoutInterval(12_000);
    });
    beforeEach(waitForAsync(() => {
      compileComponents();
      const h = createHelpComponent(false);
      helpFixture = h.helpFixture;
      helpComponent = h.helpComponent;
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should patchValue return form validation required errors', () => {
      helpComponent.userForm.patchValue({ username: '', password: '', confirm: '' });
      helpFixture.detectChanges();
      const username = helpComponent.userForm.get('username')!.errors;
      const password = helpComponent.userForm.get('password')!.errors;
      const confirm = helpComponent.userForm.get('confirm')!.errors;
      expect(username).toBeTruthy();
      expect(password).toBeTruthy();
      expect(confirm).toBeTruthy();
      expect(username!.required).toBe(true);
      expect(password!.required).toBeTruthy(true);
      expect(confirm!.required).toBe(true);
    });

    it('should patchValue return form validation min errors', () => {
      helpComponent.userForm.patchValue({ username: 'a', password: 'a', confirm: 'a' });
      helpFixture.detectChanges();
      const username = helpComponent.userForm.get('username')!.errors;
      const password = helpComponent.userForm.get('password')!.errors;
      const confirm = helpComponent.userForm.get('confirm')!.errors;
      expect(username).toBeTruthy();
      expect(password).toBeTruthy();
      expect(confirm).toBeTruthy();
      expect(username!.min).toBe(true);
      expect(password!.min).toBeTruthy(true);
      expect(confirm!.min).toBe(true);
    });
  });

  describe('loginForm validation errors', () => {
    let TIMEOUT_INTERVAL: number;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;

    beforeEach(() => {
      TIMEOUT_INTERVAL = jasmineTimeoutInterval(12_000);
    });
    beforeEach(waitForAsync(() => {
      compileComponents();
      const h = createHelpComponent(false);
      helpFixture = h.helpFixture;
      helpComponent = h.helpComponent;
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should patchValue return form validation required errors', () => {
      helpComponent.loginForm.patchValue({ email: '', password: '' });
      helpFixture.detectChanges();
      const email = helpComponent.loginForm.get('email')!.errors;
      const password = helpComponent.loginForm.get('password')!.errors;
      expect(email).toBeTruthy();
      expect(password).toBeTruthy();
      expect(email!.required).toBe(true);
      expect(password!.required).toBeTruthy(true);
    });

    it('should patchValue return form validation min errors', () => {
      helpComponent.loginForm.patchValue({ email: 'a@', password: 'a' });
      helpFixture.detectChanges();
      const email = helpComponent.loginForm.get('email')!.errors;
      const password = helpComponent.loginForm.get('password')!.errors;
      expect(email).toBeTruthy();
      expect(password).toBeTruthy();
      expect(email!.min).toBe(true);
      expect(password!.min).toBeTruthy(true);
    });

    it('should patchValue return form validation email errors', () => {
      helpComponent.loginForm.patchValue({ email: 'notValidEmail', password: '' });
      helpFixture.detectChanges();
      const email = helpComponent.loginForm.get('email')!.errors;
      expect(email).toBeTruthy();
      expect(email!.email).toBe(true);
    });
  });

  describe('passwordForm validation errors', () => {
    let TIMEOUT_INTERVAL: number;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;

    beforeEach(() => {
      TIMEOUT_INTERVAL = jasmineTimeoutInterval(12_000);
    });
    beforeEach(waitForAsync(() => {
      compileComponents();
      const h = createHelpComponent(false);
      helpFixture = h.helpFixture;
      helpComponent = h.helpComponent;
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should patchValue return form validation required errors', () => {
      helpComponent.passwordForm.patchValue({ password: '' });
      helpFixture.detectChanges();
      const password = helpComponent.passwordForm.get('password')!.errors;
      expect(password).toBeTruthy();
      expect(password!.required).toBeTruthy(true);
    });

    it('should patchValue return form validation min errors', () => {
      helpComponent.passwordForm.patchValue({ password: 'a' });
      helpFixture.detectChanges();
      const password = helpComponent.passwordForm.get('password')!.errors;
      expect(password).toBeTruthy();
      expect(password!.min).toBeTruthy(true);
    });
  });

  describe('setVersionWidthSwitcher', () => {
    let TIMEOUT_INTERVAL: number;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;

    beforeEach(() => {
      TIMEOUT_INTERVAL = jasmineTimeoutInterval(12_000);
    });
    beforeEach(waitForAsync(() => {
      compileComponents();
      const h = createHelpComponent(false);
      helpFixture = h.helpFixture;
      helpComponent = h.helpComponent;
      helpComponent.incompleteCoverageTest();
      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should incompleteCoverageTest work', () => {
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(false);
    });
  });

  describe('loginPassword function', () => {
    let TIMEOUT_INTERVAL: number;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;

    beforeEach(() => {
      TIMEOUT_INTERVAL = jasmineTimeoutInterval(12_000);
    });
    beforeEach(waitForAsync(() => {
      compileComponents();
      const h = createHelpComponent(true);
      helpFixture = h.helpFixture;
      helpComponent = h.helpComponent;
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
      localStorage.clear();
      helpComponent.setNeedsRefreshToken();
      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
      helpComponent.loginPassword({ password: environment.testUserPassword });
      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should user be authenticated', () => {
      helpFixture.detectChanges();
      expect(helpComponent.passwordForm.get('password')!.errors).not.toBeTruthy();
      expect(helpComponent.isAuthenticated()).toBe(true);
    });
  });

  describe('login function', () => {
    let TIMEOUT_INTERVAL: number;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;

    beforeEach(() => {
      TIMEOUT_INTERVAL = jasmineTimeoutInterval(12_000);
    });
    beforeEach(waitForAsync(() => {
      compileComponents();
      const h = createHelpComponent(true);
      helpFixture = h.helpFixture;
      helpComponent = h.helpComponent;
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should user be authenticated', () => {
      helpFixture.detectChanges();
      expect(helpComponent.loginForm.get('email')!.errors).not.toBeTruthy();
      expect(helpComponent.loginForm.get('password')!.errors).not.toBeTruthy();
      expect(helpComponent.isAuthenticated()).toBe(true);
    });
  });

  describe('updateUser function', () => {
    let TIMEOUT_INTERVAL: number;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;

    beforeEach(() => {
      TIMEOUT_INTERVAL = jasmineTimeoutInterval(12_000);
    });
    beforeEach(waitForAsync(() => {
      compileComponents();
      const h = createHelpComponent(true);
      helpFixture = h.helpFixture;
      helpComponent = h.helpComponent;
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      helpFixture.detectChanges();
      helpComponent.updateUser({
        username: environment.testUserProfile,
        password: environment.testUserPassword,
        confirm: environment.testUserPassword
      });
      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should updateUser return error', () => {
      helpFixture.detectChanges();
      expect(helpComponent.userForm.get('username')!.errors).not.toBeTruthy();
      expect(helpComponent.userForm.get('password')!.errors).not.toBeTruthy();
      expect(helpComponent.userForm.get('confirm')!.errors).not.toBeTruthy();
      expect(helpComponent.isAuthenticated()).toBe(true);
      expect(helpComponent.errors[0]).toBe(`The user name has been taken.`);
    });
  });

  describe('register function', () => {
    let TIMEOUT_INTERVAL: number;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;

    beforeEach(() => {
      TIMEOUT_INTERVAL = jasmineTimeoutInterval(12_000);
    });
    beforeEach(waitForAsync(() => {
      compileComponents();
      const h = createHelpComponent(true);
      helpFixture = h.helpFixture;
      helpComponent = h.helpComponent;
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      helpFixture.detectChanges();
      helpComponent.register({
        email: environment.testUserEmail,
        username: environment.testUserProfile,
        password: environment.testUserPassword,
        confirm: environment.testUserPassword
      });
      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should register return error', () => {
      helpFixture.detectChanges();
      expect(helpComponent.registerForm.get('email')!.errors).not.toBeTruthy();
      expect(helpComponent.registerForm.get('username')!.errors).not.toBeTruthy();
      expect(helpComponent.registerForm.get('password')!.errors).not.toBeTruthy();
      expect(helpComponent.registerForm.get('confirm')!.errors).not.toBeTruthy();
      expect(helpComponent.isAuthenticated()).toBe(true);
      expect(helpComponent.errors[0]).toBe(`The email has been taken.`);
    });
  });

  describe('setNeedsRefreshToken', () => {
    let TIMEOUT_INTERVAL: number;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;

    beforeEach(() => {
      TIMEOUT_INTERVAL = jasmineTimeoutInterval(12_000);
    });
    beforeEach(waitForAsync(() => {
      compileComponents();
      const h = createHelpComponent(true);
      helpFixture = h.helpFixture;
      helpComponent = h.helpComponent;
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
      localStorage.clear();
      helpComponent.setNeedsRefreshToken();
      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should not setNeedsRefreshToken return error', () => {
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
      expect(helpComponent.errors.length).toBe(0);
    });
  });
});

@Component({
  template: ``
})
export class TestHelpComponent implements OnInit, OnDestroy {
  readonly #authStore = inject(AuthStore);
  readonly errorResponse = this.#authStore.selectors.errorResponse;
  readonly isAuthenticated = this.#authStore.selectors.isAuthenticated;
  readonly isLoading = signal<boolean>(false);
  private injector = inject(Injector);
  errors: string[] = [];

  private readonly confirmValidator = (control: AbstractControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { error: true, required: true };
    } else if (control.value.length < MinPasswordLength) {
      return { error: true, min: true };
    } else if (control.value.length > MaxPasswordLength) {
      return { error: true, max: true };
    } else if (control.value !== this.userForm.controls.password.value) {
      return { error: true, confirm: true };
    }
    return {};
  };
  private readonly passwordValidator = (control: AbstractControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { error: true, required: true };
    } else if (control.value.length < MinPasswordLength) {
      return { error: true, min: true };
    } else if (control.value.length > MaxPasswordLength) {
      return { error: true, max: true };
    }
    return {};
  };
  private readonly nameValidator = (control: AbstractControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { error: true, required: true };
    } else if (control.value.length < MinUserNameLength) {
      return { error: true, min: true };
    } else if (control.value.length > MaxUserNameLength) {
      return { error: true, max: true };
    }
    return {};
  };
  readonly userForm: TypedFormGroup<UpdateUserBodyRequest> = new FormGroup({
    password: new FormControl('', {
      nonNullable: true,
      validators: [this.passwordValidator]
    }),
    confirm: new FormControl('', {
      nonNullable: true,
      validators: [this.confirmValidator]
    }),
    username: new FormControl('', {
      nonNullable: true,
      validators: [this.nameValidator]
    })
  });
  updateUser(userData: UpdateUserBodyRequest): void {
    if (this.isLoading()) {
      return;
    }
    this.isLoading.set(true);
    this.userForm.patchValue(userData);
    this.#authStore.updateUser({
      loading: this.isLoading,
      form: this.userForm
    });
  }

  private readonly emailValidator = (control: AbstractControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { error: true, required: true };
    } else if (control.value.length < MinEmailLength) {
      return { error: true, min: true };
    } else if (control.value.length > MaxEmailLength) {
      return { error: true, max: true };
    }
    return {};
  };
  readonly loginForm: TypedFormGroup<LoginBodyRequest> = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.email, this.emailValidator]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [this.passwordValidator]
    })
  });
  login(loginData: LoginBodyRequest): void {
    if (this.isLoading()) {
      return;
    }
    this.isLoading.set(true);
    this.loginForm.patchValue(loginData);
    this.#authStore.login({ loading: this.isLoading, form: this.loginForm });
  }

  private readonly registerValidator = (control: AbstractControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { error: true, required: true };
    } else if (control.value.length < MinPasswordLength) {
      return { error: true, min: true };
    } else if (control.value.length > MaxPasswordLength) {
      return { error: true, max: true };
    } else if (control.value !== this.registerForm.controls.password.value) {
      return { error: true, confirm: true };
    }
    return {};
  };
  readonly registerForm: TypedFormGroup<RegisterBodyRequest> = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.email, this.emailValidator]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [this.passwordValidator]
    }),
    confirm: new FormControl('', {
      nonNullable: true,
      validators: [this.registerValidator]
    }),
    username: new FormControl('', {
      nonNullable: true,
      validators: [this.nameValidator]
    })
  });
  register(registerData: RegisterBodyRequest): void {
    if (this.isLoading()) {
      return;
    }
    this.isLoading.set(true);
    this.registerForm.patchValue(registerData);
    this.#authStore.register({ loading: this.isLoading, form: this.registerForm });
  }

  readonly passwordForm: TypedFormGroup<PasswordBodyRequest> = new FormGroup({
    password: new FormControl('', {
      nonNullable: true,
      validators: [this.passwordValidator]
    })
  });
  loginPassword(passwordData: PasswordBodyRequest): void {
    if (this.isLoading()) {
      return;
    }
    this.isLoading.set(true);
    this.passwordForm.patchValue(passwordData);
    this.#authStore.loginPassword({ loading: this.isLoading, form: this.passwordForm });
  }

  setNeedsRefreshToken(): void {
    if (this.isLoading()) {
      return;
    }
    this.isLoading.set(true);
    const user = this.#authStore.selectors.user();
    user!.token = environment.testRefreshToken;
    this.#authStore.checkProfile({ loading: this.isLoading, user: user! });
  }

  incompleteCoverageTest(): void {
    this.#authStore.setVersion('version');
    this.#authStore.getVersion();

    this.#authStore.setWidth(200);
    this.#authStore.setHeight(200);
    this.#authStore.setSwitcher(true);
    this.#authStore.setUrlPath('path');
    this.#authStore.setIsCompactTheme(true);
    this.#authStore.setIsNightTheme(true);
    this.#authStore.setMenu([]);
  }

  ngOnDestroy(): void {
    this.#authStore.resetErrorResponse();
  }
  ngOnInit(): void {
    toObservable(this.errorResponse, { injector: this.injector }).subscribe((errorResponse: ErrorResponse | null) => {
      if (errorResponse) {
        this.errors = Object.keys(errorResponse.errors || {}).map(key => `${errorResponse.errors[key]}`);
      } else {
        this.errors = [];
      }
    });
  }
}
