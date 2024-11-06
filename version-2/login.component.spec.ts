import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject, Injector } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { apiPrefixInterceptor, authInterceptor } from '@app/shared/interceptors';
import { ErrorResponse } from '@app/shared/models';
import { AuthStore } from '@app/shared/store';

import { provideComponentStore } from '@ngrx/component-store';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzFormControlComponent, NzFormItemComponent } from 'ng-zorro-antd/form';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import LoginComponent from './login.component';
import { environment } from '../../environments/environment';

const statusMap = {
  warning: 'ant-form-item-has-warning',
  validating: 'ant-form-item-is-validating',
  pending: 'ant-form-item-is-validating',
  error: 'ant-form-item-has-error',
  success: 'ant-form-item-has-success'
};

describe('login.component', () => {
  describe('reactive login.component status', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let formGroup: FormGroup;

    beforeEach(() => {
      localStorage.clear();

      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(withInterceptors([apiPrefixInterceptor, authInterceptor])),
          provideNzIconsTesting(),
          provideComponentStore(AuthStore),
          NzDrawerService
        ],
        imports: [NoopAnimationsModule, LoginComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(LoginComponent);
      component = fixture.componentInstance;
      formGroup = component.loginForm;
    });
    it('should init status work', () => {
      fixture.detectChanges();

      const formItems = fixture.debugElement.queryAll(By.directive(NzFormItemComponent));
      expect(formItems[0].nativeElement.classList).toContain('ant-form-item');
      expect(formItems[1].nativeElement.classList).toContain('ant-form-item');
      expect(formItems[2].nativeElement.classList).toContain('ant-form-item');

      const formControls = fixture.debugElement.queryAll(By.directive(NzFormControlComponent));
      expect(formControls[0].nativeElement.classList).toContain('ant-form-item-control');
      expect(formControls[1].nativeElement.classList).toContain('ant-form-item-control');
      expect(formControls[2].nativeElement.classList).toContain('ant-form-item-control');
    });
    it('should valid email and password work', () => {
      formGroup.get('email')!.markAsDirty();
      formGroup.get('email')!.setValue('email@server');
      formGroup.get('email')!.updateValueAndValidity();

      formGroup.get('password')!.markAsDirty();
      formGroup.get('password')!.setValue(environment.testUserPassword);
      formGroup.get('password')!.updateValueAndValidity();

      fixture.detectChanges();

      const formItems = fixture.debugElement.queryAll(By.directive(NzFormItemComponent));
      expect(formItems[0].nativeElement.classList).toContain(statusMap.success);
      expect(formItems[1].nativeElement.classList).toContain(statusMap.success);
    });
    it('should invalid password work', () => {
      formGroup.get('password')!.markAsDirty();
      formGroup.get('password')!.setValue('toShort');
      formGroup.get('password')!.updateValueAndValidity();

      fixture.detectChanges();

      const formItems = fixture.debugElement.queryAll(By.directive(NzFormItemComponent));
      expect(formItems[1].nativeElement.classList).toContain(statusMap.error);
    });
    it('should setValue work', () => {
      formGroup.get('email')!.markAsDirty();
      formGroup.get('email')!.setValue('');
      formGroup.get('email')!.updateValueAndValidity();

      formGroup.get('password')!.markAsDirty();
      formGroup.get('password')!.setValue('');
      formGroup.get('password')!.updateValueAndValidity();

      fixture.detectChanges();

      const formItems = fixture.debugElement.queryAll(By.directive(NzFormItemComponent));
      expect(formItems[0].nativeElement.classList).toContain(statusMap.error);
      expect(formItems[1].nativeElement.classList).toContain(statusMap.error);
    });
    it('should markAsDirty and markAsPristine work', () => {
      formGroup.get('email')!.markAsDirty();
      formGroup.get('password')!.markAsDirty();
      formGroup.get('email')!.updateValueAndValidity();
      formGroup.get('password')!.updateValueAndValidity();

      fixture.detectChanges();

      const formItems = fixture.debugElement.queryAll(By.directive(NzFormItemComponent));
      expect(formItems[0].nativeElement.classList).toContain(statusMap.error);
      expect(formItems[1].nativeElement.classList).toContain(statusMap.error);

      formGroup.get('email')!.markAsPristine();
      formGroup.get('password')!.markAsPristine();
      formGroup.get('email')!.updateValueAndValidity();
      formGroup.get('password')!.updateValueAndValidity();

      fixture.detectChanges();

      const formItems1 = fixture.debugElement.queryAll(By.directive(NzFormItemComponent));
      expect(formItems1[0].nativeElement.classList).not.toContain(statusMap.error);
      expect(formItems1[1].nativeElement.classList).not.toContain(statusMap.error);
    });
    it('should markAsPending work', () => {
      formGroup.get('email')!.markAsPending();
      formGroup.get('password')!.markAsPending();
      formGroup.get('email')!.updateValueAndValidity();
      formGroup.get('password')!.updateValueAndValidity();

      fixture.detectChanges();

      const formItems = fixture.debugElement.queryAll(By.directive(NzFormItemComponent));
      expect(formItems[0].nativeElement.classList).not.toContain(statusMap.error);
      expect(formItems[1].nativeElement.classList).not.toContain(statusMap.error);
    });
  });

  describe('should log on work', () => {
    let TIMEOUT_INTERVAL: number;
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;

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
        imports: [NoopAnimationsModule, TestHelpComponent, LoginComponent]
      }).compileComponents();

      helpFixture = TestBed.createComponent(TestHelpComponent);
      helpComponent = helpFixture.componentInstance;

      fixture = TestBed.createComponent(LoginComponent);
      component = fixture.componentInstance;

      const formGroup = component.loginForm;

      formGroup.get('email')!.markAsDirty();
      formGroup.get('email')!.setValue(environment.testUserEmail);
      formGroup.get('email')!.updateValueAndValidity();

      formGroup.get('password')!.markAsDirty();
      formGroup.get('password')!.setValue(environment.testUserPassword);
      formGroup.get('password')!.updateValueAndValidity();

      fixture.detectChanges();

      const formItems = fixture.debugElement.queryAll(By.directive(NzFormItemComponent));
      expect(formItems[0].nativeElement.classList).toContain(statusMap.success);
      expect(formItems[1].nativeElement.classList).toContain(statusMap.success);

      const buttons = fixture.debugElement.queryAll(By.directive(NzButtonComponent));
      expect(buttons[0]).toBeTruthy();
      expect(buttons[1]).toBeTruthy();

      const buttonElement = buttons[1].nativeElement;
      expect(buttonElement.classList.contains('ant-btn-loading')).toBe(false);
      expect(buttonElement.firstElementChild!.classList.contains('anticon-loading')).toBe(false);

      buttonElement.click();
      fixture.detectChanges();

      expect(buttonElement.classList.contains('ant-btn-loading')).toBe(true);
      expect(buttonElement.firstElementChild!.classList.contains('anticon-loading')).toBe(true);

      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should user be logged on', fakeAsync(() => {
      tick(200);
      helpFixture.detectChanges();
      expect(helpComponent.errors.length).toBe(0);
      expect(helpComponent.isAuthenticated()).toBe(true);
    }));
  });

  describe('should have error', () => {
    let TIMEOUT_INTERVAL: number;
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;
    let formGroup: FormGroup;

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
        imports: [NoopAnimationsModule, TestHelpComponent, LoginComponent]
      }).compileComponents();

      helpFixture = TestBed.createComponent(TestHelpComponent);
      helpComponent = helpFixture.componentInstance;

      fixture = TestBed.createComponent(LoginComponent);
      component = fixture.componentInstance;

      formGroup = component.loginForm;

      formGroup.get('email')!.markAsDirty();
      formGroup.get('email')!.setValue('incorrect@user');
      formGroup.get('email')!.updateValueAndValidity();

      formGroup.get('password')!.markAsDirty();
      formGroup.get('password')!.setValue(environment.testUserPassword);
      formGroup.get('password')!.updateValueAndValidity();

      fixture.detectChanges();

      const formItems = fixture.debugElement.queryAll(By.directive(NzFormItemComponent));
      expect(formItems[0].nativeElement.classList).toContain(statusMap.success);
      expect(formItems[1].nativeElement.classList).toContain(statusMap.success);

      const buttons = fixture.debugElement.queryAll(By.directive(NzButtonComponent));
      expect(buttons[0]).toBeTruthy();
      expect(buttons[1]).toBeTruthy();

      const buttonElement = buttons[1].nativeElement;
      expect(buttonElement.classList.contains('ant-btn-loading')).toBe(false);
      expect(buttonElement.firstElementChild!.classList.contains('anticon-loading')).toBe(false);

      buttonElement.click();
      fixture.detectChanges();

      expect(buttonElement.classList.contains('ant-btn-loading')).toBe(true);
      expect(buttonElement.firstElementChild!.classList.contains('anticon-loading')).toBe(true);

      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should not user be logged on', fakeAsync(() => {
      tick(200);
      helpFixture.detectChanges();
      expect(helpComponent.errors[0]).toBe('Invalid credentials.');
      expect(helpComponent.isAuthenticated()).toBe(false);

      fixture.detectChanges();
      expect(formGroup.get('email')!.value).not.toBe('incorrect@user');
      expect(formGroup.get('password')!.value).not.toBe(environment.testUserPassword);
    }));
  });
});

@Component({
  standalone: true
})
export class TestHelpComponent implements OnInit, OnDestroy {
  readonly #authStore = inject(AuthStore);
  readonly errorResponse = this.#authStore.selectors.errorResponse;
  readonly isAuthenticated = this.#authStore.selectors.isAuthenticated;
  private injector = inject(Injector);
  errors: string[] = [];

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
