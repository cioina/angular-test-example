/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject, Injector, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync, inject as testInject } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { apiPrefixInterceptor, authInterceptor } from '@app/shared/interceptors';
import { ErrorResponse } from '@app/shared/models';
import { LoginBodyRequest } from '@app/shared/services';
import { AuthStore } from '@app/shared/store';
import { TypedFormGroup } from '@app/shared/utils';
import { provideComponentStore } from '@ngrx/component-store';

import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { SettingDrawerComponent } from './setting-drawer.component';
import { environment } from '../../../../environments/environment';

describe('setting-drawer.component', () => {
  describe('changeStyleTheme', () => {
    let TIMEOUT_INTERVAL: number;
    let component: SettingDrawerComponent;
    let fixture: ComponentFixture<SettingDrawerComponent>;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;
    let overlayContainer: OverlayContainer;

    beforeEach(() => {
      localStorage.clear();
      TIMEOUT_INTERVAL = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 12000;
    });

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(withInterceptors([apiPrefixInterceptor, authInterceptor])),
          provideNzIconsTesting(),
          provideComponentStore(AuthStore),
          NzDrawerService
        ],
        imports: [NoopAnimationsModule, TestHelpComponent, SettingDrawerComponent]
      }).compileComponents();

      helpFixture = TestBed.createComponent(TestHelpComponent);
      helpComponent = helpFixture.componentInstance;

      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(false);

      helpComponent.login({ email: environment.testUserEmail, password: environment.testUserPassword });
      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    beforeEach(
      testInject([OverlayContainer], (currentOverlayContainer: OverlayContainer) => {
        overlayContainer = currentOverlayContainer;
      })
    );

    beforeEach(waitForAsync(() => {
      fixture = TestBed.createComponent(SettingDrawerComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(overlayContainer.getContainerElement().querySelector('.ant-drawer')).toBeTruthy();

      const buttons = fixture.debugElement.queryAll(By.css('.anticon'));
      expect(buttons.length).toBe(7);

      const buttonElement = buttons[0].nativeElement;
      buttonElement.click();

      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      expect(
        overlayContainer.getContainerElement().querySelector('.ant-drawer')!.classList.contains('ant-drawer-open')
      ).toBe(true);

      const buttons = fixture.debugElement.queryAll(By.css('.anticon'));
      expect(buttons.length).toBe(7);

      component.changeStyleTheme('dark');

      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    afterEach(
      testInject([OverlayContainer], (currentOverlayContainer: OverlayContainer) => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
        currentOverlayContainer.ngOnDestroy();
        overlayContainer.ngOnDestroy();
      })
    );

    it('should changeStyleTheme to dark', fakeAsync(() => {
      tick(20);
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
    }));
  });

  describe('changeMode', () => {
    let TIMEOUT_INTERVAL: number;
    let component: SettingDrawerComponent;
    let fixture: ComponentFixture<SettingDrawerComponent>;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;
    let overlayContainer: OverlayContainer;

    beforeEach(() => {
      localStorage.clear();
      TIMEOUT_INTERVAL = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 12000;
    });

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(withInterceptors([apiPrefixInterceptor, authInterceptor])),
          provideNzIconsTesting(),
          provideComponentStore(AuthStore),
          NzDrawerService
        ],
        imports: [NoopAnimationsModule, TestHelpComponent, SettingDrawerComponent]
      }).compileComponents();

      helpFixture = TestBed.createComponent(TestHelpComponent);
      helpComponent = helpFixture.componentInstance;

      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(false);

      helpComponent.login({ email: environment.testUserEmail, password: environment.testUserPassword });
      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    beforeEach(
      testInject([OverlayContainer], (currentOverlayContainer: OverlayContainer) => {
        overlayContainer = currentOverlayContainer;
      })
    );

    beforeEach(waitForAsync(() => {
      fixture = TestBed.createComponent(SettingDrawerComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(overlayContainer.getContainerElement().querySelector('.ant-drawer')).toBeTruthy();

      const buttons = fixture.debugElement.queryAll(By.css('.anticon'));
      expect(buttons.length).toBe(7);

      const buttonElement = buttons[0].nativeElement;
      buttonElement.click();

      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      expect(
        overlayContainer.getContainerElement().querySelector('.ant-drawer')!.classList.contains('ant-drawer-open')
      ).toBe(true);

      const buttons = fixture.debugElement.queryAll(By.css('.anticon'));
      expect(buttons.length).toBe(7);

      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      component.changeMode({
        key: 'top',
        image: 'assets/imgs/menu-side.svg',
        title: 'Side menu layout works better for desktops',
        isChecked: false
      });
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    afterEach(
      testInject([OverlayContainer], (currentOverlayContainer: OverlayContainer) => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
        currentOverlayContainer.ngOnDestroy();
        overlayContainer.ngOnDestroy();
      })
    );

    it('should changeMode to top', fakeAsync(() => {
      tick(20);
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
    }));
  });
});

@Component({})
export class TestHelpComponent implements OnInit, OnDestroy {
  readonly #authStore = inject(AuthStore);
  readonly errorResponse = this.#authStore.selectors.errorResponse;
  readonly isAuthenticated = this.#authStore.selectors.isAuthenticated;
  readonly isLoading = signal<boolean>(false);
  private injector = inject(Injector);
  errors: string[] = [];

  private readonly loginForm: TypedFormGroup<LoginBodyRequest> = new FormGroup({
    email: new FormControl('', {
      nonNullable: true
    }),
    password: new FormControl('', {
      nonNullable: true
    })
  });

  setNeedsRefreshToken(): void {
    if (this.isLoading()) {
      return;
    }
    this.isLoading.set(true);
    const user = this.#authStore.selectors.user();
    user!.token = environment.testRefreshToken;
    this.#authStore.checkProfile({ loading: this.isLoading, user: user! });
  }

  login(loginData: LoginBodyRequest): void {
    if (this.isLoading()) {
      return;
    }
    this.isLoading.set(true);
    this.loginForm.patchValue(loginData);
    this.#authStore.login({ loading: this.isLoading, form: this.loginForm });
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
