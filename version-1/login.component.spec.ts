import { Component, DebugElement, OnDestroy, OnInit } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { environment } from '@env/environment';

import { Errors, NgrxFormsFacade } from '@zorro-example-app/ngrx-forms';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { ɵComponentBed as ComponentBed, ɵcreateComponentBed as createComponentBed } from 'ng-zorro-antd/core/testing';
import { NzFormControlComponent, NzFormItemComponent } from 'ng-zorro-antd/form';

import { AuthFacade } from './+state/auth.facade';
import { AuthModule } from './auth.module';
import { LoginComponent } from './login.component';
import { AppModule } from '../../../../apps/site/src/app/app.module';

const testBedOptions = {
  imports: [AppModule, AuthModule, NoopAnimationsModule]
};
const statusMap = {
  warning: 'ant-form-item-has-warning',
  validating: 'ant-form-item-is-validating',
  pending: 'ant-form-item-is-validating',
  error: 'ant-form-item-has-error',
  success: 'ant-form-item-has-success'
};

describe('login.component', () => {
  describe('should log on', () => {
    let TIMEOUT_INTERVAL: number;
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;

    beforeEach(() => {
      localStorage.removeItem('jwtCioinaToken');
      TIMEOUT_INTERVAL = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 12000;
    });

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TestHelpComponent, LoginComponent],
        imports: [AppModule, AuthModule]
      }).compileComponents();

      helpFixture = TestBed.createComponent(TestHelpComponent);
      helpComponent = helpFixture.componentInstance;

      fixture = TestBed.createComponent(LoginComponent);
      component = fixture.componentInstance;

      const formGroup = component.validateForm;

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
      expect(helpComponent.isLoggedIn).toBe(true);
      expect(helpComponent.isLoggedOut).toBe(false);
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
      localStorage.removeItem('jwtCioinaToken');
      TIMEOUT_INTERVAL = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 12000;
    });

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TestHelpComponent, LoginComponent],
        imports: [AppModule, AuthModule]
      }).compileComponents();

      helpFixture = TestBed.createComponent(TestHelpComponent);
      helpComponent = helpFixture.componentInstance;

      fixture = TestBed.createComponent(LoginComponent);
      component = fixture.componentInstance;

      formGroup = component.validateForm;

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
      expect(helpComponent.authUserLoading).toBe(true);
      expect(helpComponent.errors[0]).toBe('Invalid credentials.');

      fixture.detectChanges();
      expect(formGroup.get('email')!.value).not.toBe('incorrect@user');
      expect(formGroup.get('password')!.value).not.toBe(environment.testUserPassword);
    }));
  });

  describe('reactive status', () => {
    let testBed: ComponentBed<LoginComponent>;
    let formGroup: FormGroup;
    let formItems: DebugElement[];
    let formControls: DebugElement[];
    beforeEach(() => {
      localStorage.removeItem('jwtCioinaToken');

      testBed = createComponentBed(LoginComponent, testBedOptions);
      formGroup = testBed.component.validateForm;
      formItems = testBed.fixture.debugElement.queryAll(By.directive(NzFormItemComponent));
      formControls = testBed.fixture.debugElement.queryAll(By.directive(NzFormControlComponent));
    });
    it('should init status correct', () => {
      expect(formItems[0].nativeElement.classList).toContain('ant-form-item');
      expect(formItems[1].nativeElement.classList).toContain('ant-form-item');
      expect(formItems[2].nativeElement.classList).toContain('ant-form-item');
      expect(formControls[0].nativeElement.classList).toContain('ant-form-item-control');
      expect(formControls[1].nativeElement.classList).toContain('ant-form-item-control');
      expect(formControls[2].nativeElement.classList).toContain('ant-form-item-control');
    });
    it('should valid work', () => {
      formGroup.get('email')!.markAsDirty();
      formGroup.get('email')!.setValue('email@server');
      formGroup.get('email')!.updateValueAndValidity();

      formGroup.get('password')!.markAsDirty();
      formGroup.get('password')!.setValue(environment.testUserPassword);
      formGroup.get('password')!.updateValueAndValidity();

      testBed.fixture.detectChanges();

      expect(formItems[0].nativeElement.classList).toContain(statusMap.success);
      expect(formItems[1].nativeElement.classList).toContain(statusMap.success);
    });
    it('should passwordValidator work', () => {
      formGroup.get('password')!.markAsDirty();
      formGroup.get('password')!.setValue('toShort');
      formGroup.get('password')!.updateValueAndValidity();

      testBed.fixture.detectChanges();

      expect(formItems[1].nativeElement.classList).toContain(statusMap.error);
    });
    it('should invalid work', () => {
      formGroup.get('email')!.markAsDirty();
      formGroup.get('email')!.setValue('');
      formGroup.get('email')!.updateValueAndValidity();

      formGroup.get('password')!.markAsDirty();
      formGroup.get('password')!.setValue('');
      formGroup.get('password')!.updateValueAndValidity();

      testBed.fixture.detectChanges();

      expect(formItems[0].nativeElement.classList).toContain(statusMap.error);
      expect(formItems[1].nativeElement.classList).toContain(statusMap.error);
    });
    it('should dirty work', () => {
      formGroup.get('email')!.markAsDirty();
      formGroup.get('password')!.markAsDirty();
      formGroup.get('email')!.updateValueAndValidity();
      formGroup.get('password')!.updateValueAndValidity();

      testBed.fixture.detectChanges();

      expect(formItems[0].nativeElement.classList).toContain(statusMap.error);
      expect(formItems[1].nativeElement.classList).toContain(statusMap.error);

      formGroup.get('email')!.markAsPristine();
      formGroup.get('password')!.markAsPristine();
      formGroup.get('email')!.updateValueAndValidity();
      formGroup.get('password')!.updateValueAndValidity();

      testBed.fixture.detectChanges();

      expect(formItems[0].nativeElement.classList).not.toContain(statusMap.error);
      expect(formItems[1].nativeElement.classList).not.toContain(statusMap.error);
    });
    it('should pending work', () => {
      formGroup.get('email')!.markAsPending();
      formGroup.get('password')!.markAsPending();
      formGroup.get('email')!.updateValueAndValidity();
      formGroup.get('password')!.updateValueAndValidity();

      testBed.fixture.detectChanges();

      expect(formItems[0].nativeElement.classList).not.toContain(statusMap.error);
      expect(formItems[1].nativeElement.classList).not.toContain(statusMap.error);
    });
  });
});

@Component({})
export class TestHelpComponent implements OnInit, OnDestroy {
  unsubscribe$: Subject<void> = new Subject();
  authUserLoading: boolean = false;
  isLoggedIn: boolean = false;
  isLoggedOut: boolean = true;
  errors: string[] = [];

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  ngOnInit(): void {
    this.authFacade.isLoggedOut$?.pipe(takeUntil(this.unsubscribe$)).subscribe((isLogged: boolean) => {
      this.isLoggedOut = isLogged;
    });

    this.authFacade.isLoggedIn$?.pipe(takeUntil(this.unsubscribe$)).subscribe((isLogged: boolean) => {
      this.isLoggedIn = isLogged;
    });

    this.authFacade.authUserLoading$?.pipe(takeUntil(this.unsubscribe$)).subscribe((loading: boolean) => {
      this.authUserLoading = loading;
    });

    this.ngrxFormsFacade.errors$?.pipe(takeUntil(this.unsubscribe$)).subscribe((e: Errors) => {
      this.errors = Object.keys(e || {}).map(key => `${e[key]}`);
    });
  }

  constructor(
    public authFacade: AuthFacade,
    public ngrxFormsFacade: NgrxFormsFacade
  ) {}
}
