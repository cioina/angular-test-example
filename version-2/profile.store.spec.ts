/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject, Injector, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { apiPrefixInterceptor, authInterceptor } from '@app/shared/interceptors';
import { ErrorResponse } from '@app/shared/models';
import { LoginBodyRequest } from '@app/shared/services';
import { AuthStore } from '@app/shared/store';
import { TypedFormGroup } from '@app/shared/utils';
import { provideComponentStore } from '@ngrx/component-store';

import { provideNzNoAnimation } from 'ng-zorro-antd/core/animation';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { ProfileStore } from './profile.store';
import { environment } from '../../environments/environment';

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

describe('profile.store', () => {
  describe('getProfile function 1', () => {
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
      helpComponent.getProfile(environment.testUserProfile);
      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      helpFixture.detectChanges();
      expect(helpComponent.profile()?.username).toBe(environment.testUserProfile);
      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should getProfile return profile', () => {
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
    });
  });

  describe('getProfile function 2', () => {
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
      helpComponent.getProfile('wrong user');
      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      helpFixture.detectChanges();
      expect(helpComponent.profile()?.username).not.toBe(environment.testUserProfile);
      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should getProfile return error', () => {
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
      expect(helpComponent.authStoreError.length).toBe(0);
      expect(helpComponent.profile()).not.toBeTruthy();
    });
  });
});

@Component({
  template: ``,
  providers: [provideComponentStore(ProfileStore)]
})
export class TestHelpComponent implements OnInit, OnDestroy {
  readonly #authStore = inject(AuthStore);
  readonly authStoreError = this.#authStore.selectors.errorResponse;
  readonly isAuthenticated = this.#authStore.selectors.isAuthenticated;
  readonly #profileStore = inject(ProfileStore);
  readonly profile = this.#profileStore.selectors.profile;

  readonly isLoading = signal<boolean>(false);
  private injector = inject(Injector);
  authStoreErrors: string[] = [];

  private readonly loginForm: TypedFormGroup<LoginBodyRequest> = new FormGroup({
    email: new FormControl('', {
      nonNullable: true
    }),
    password: new FormControl('', {
      nonNullable: true
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

  getProfile(username: string): void {
    if (this.isLoading()) {
      return;
    }
    this.isLoading.set(true);
    this.#profileStore.getProfile({ loading: this.isLoading, username: username });
  }

  ngOnDestroy(): void {
    this.#authStore.resetErrorResponse();
  }
  ngOnInit(): void {
    toObservable(this.authStoreError, { injector: this.injector }).subscribe((errorResponse: ErrorResponse | null) => {
      if (errorResponse) {
        this.authStoreErrors = Object.keys(errorResponse.errors || {}).map(key => `${errorResponse.errors[key]}`);
      } else {
        this.authStoreErrors = [];
      }
    });
  }
}
