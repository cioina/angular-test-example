import { OverlayContainer } from '@angular/cdk/overlay';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject, Injector, DebugElement } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync, inject as testInject } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { apiPrefixInterceptor, authInterceptor } from '@app/shared/interceptors';
import { ErrorResponse } from '@app/shared/models';
import { AuthStore } from '@app/shared/store';

import { provideComponentStore } from '@ngrx/component-store';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { dispatchMouseEvent } from 'ng-zorro-antd/core/testing';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzFormControlComponent, NzFormItemComponent } from 'ng-zorro-antd/form';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import RegisterComponent from './register.component';
import { environment } from '../../../environments/environment';

const statusMap = {
  warning: 'ant-form-item-has-warning',
  validating: 'ant-form-item-is-validating',
  pending: 'ant-form-item-is-validating',
  error: 'ant-form-item-has-error',
  success: 'ant-form-item-has-success'
};

describe('register.component', () => {
  describe('reactive register.component status', () => {
    let component: RegisterComponent;
    let fixture: ComponentFixture<RegisterComponent>;
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
        imports: [NoopAnimationsModule, RegisterComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(RegisterComponent);
      component = fixture.componentInstance;
      formGroup = component.registerForm;
    });

    it('should init status work', () => {
      fixture.detectChanges();

      const formItems = fixture.debugElement.queryAll(By.directive(NzFormItemComponent));
      expect(formItems[0].nativeElement.classList).toContain('ant-form-item');
      expect(formItems[1].nativeElement.classList).toContain('ant-form-item');
      expect(formItems[2].nativeElement.classList).toContain('ant-form-item');
      expect(formItems[3].nativeElement.classList).toContain('ant-form-item');
      expect(formItems[4].nativeElement.classList).toContain('ant-form-item');

      const formControls = fixture.debugElement.queryAll(By.directive(NzFormControlComponent));
      expect(formControls[0].nativeElement.classList).toContain('ant-form-item-control');
      expect(formControls[1].nativeElement.classList).toContain('ant-form-item-control');
      expect(formControls[2].nativeElement.classList).toContain('ant-form-item-control');
      expect(formControls[3].nativeElement.classList).toContain('ant-form-item-control');
      expect(formControls[4].nativeElement.classList).toContain('ant-form-item-control');
    });
    it('should valid data work', () => {
      formGroup.get('username')!.markAsDirty();
      formGroup.get('username')!.setValue('username1');
      formGroup.get('username')!.updateValueAndValidity();

      formGroup.get('email')!.markAsDirty();
      formGroup.get('email')!.setValue('email@server');
      formGroup.get('email')!.updateValueAndValidity();

      formGroup.get('password')!.markAsDirty();
      formGroup.get('password')!.setValue(environment.testUserPassword);
      formGroup.get('password')!.updateValueAndValidity();

      formGroup.get('confirm')!.markAsDirty();
      formGroup.get('confirm')!.setValue(environment.testUserPassword);
      formGroup.get('confirm')!.updateValueAndValidity();

      fixture.detectChanges();

      const formItems = fixture.debugElement.queryAll(By.directive(NzFormItemComponent));
      expect(formItems[0].nativeElement.classList).toContain(statusMap.success);
      expect(formItems[1].nativeElement.classList).toContain(statusMap.success);
      expect(formItems[2].nativeElement.classList).toContain(statusMap.success);
      expect(formItems[3].nativeElement.classList).toContain(statusMap.success);
    });
    it('should invalid password work', () => {
      formGroup.get('password')!.markAsDirty();
      formGroup.get('password')!.setValue('toShort');
      formGroup.get('password')!.updateValueAndValidity();

      fixture.detectChanges();

      const formItems = fixture.debugElement.queryAll(By.directive(NzFormItemComponent));
      expect(formItems[2].nativeElement.classList).toContain(statusMap.error);
    });

    it('should invalid password and confirm work', () => {
      formGroup.get('password')!.markAsDirty();
      formGroup.get('password')!.setValue(environment.testUserPassword);
      formGroup.get('password')!.updateValueAndValidity();

      formGroup.get('confirm')!.markAsDirty();
      formGroup.get('confirm')!.setValue('thisIsDiffrent');
      formGroup.get('confirm')!.updateValueAndValidity();

      fixture.detectChanges();

      const formItems = fixture.debugElement.queryAll(By.directive(NzFormItemComponent));
      expect(formItems[2].nativeElement.classList).toContain(statusMap.success);
      expect(formItems[3].nativeElement.classList).toContain(statusMap.error);
    });

    it('should setValue work', () => {
      formGroup.get('username')!.markAsDirty();
      formGroup.get('username')!.setValue('');
      formGroup.get('username')!.updateValueAndValidity();

      formGroup.get('email')!.markAsDirty();
      formGroup.get('email')!.setValue('');
      formGroup.get('email')!.updateValueAndValidity();

      formGroup.get('password')!.markAsDirty();
      formGroup.get('password')!.setValue('');
      formGroup.get('password')!.updateValueAndValidity();

      formGroup.get('confirm')!.markAsDirty();
      formGroup.get('confirm')!.setValue('');
      formGroup.get('confirm')!.updateValueAndValidity();

      fixture.detectChanges();

      const formItems = fixture.debugElement.queryAll(By.directive(NzFormItemComponent));
      expect(formItems[0].nativeElement.classList).toContain(statusMap.error);
      expect(formItems[1].nativeElement.classList).toContain(statusMap.error);
      expect(formItems[2].nativeElement.classList).toContain(statusMap.error);
      expect(formItems[3].nativeElement.classList).toContain(statusMap.error);
    });
    it('should markAsDirty and markAsPristine work', () => {
      formGroup.get('username')!.markAsDirty();
      formGroup.get('username')!.updateValueAndValidity();

      formGroup.get('email')!.markAsDirty();
      formGroup.get('email')!.updateValueAndValidity();

      formGroup.get('password')!.markAsDirty();
      formGroup.get('password')!.updateValueAndValidity();

      formGroup.get('confirm')!.markAsDirty();
      formGroup.get('confirm')!.updateValueAndValidity();

      fixture.detectChanges();

      const formItems = fixture.debugElement.queryAll(By.directive(NzFormItemComponent));
      expect(formItems[0].nativeElement.classList).toContain(statusMap.error);
      expect(formItems[1].nativeElement.classList).toContain(statusMap.error);
      expect(formItems[2].nativeElement.classList).toContain(statusMap.error);
      expect(formItems[3].nativeElement.classList).toContain(statusMap.error);

      formGroup.get('username')!.markAsPristine();
      formGroup.get('username')!.updateValueAndValidity();

      formGroup.get('email')!.markAsPristine();
      formGroup.get('email')!.updateValueAndValidity();

      formGroup.get('password')!.markAsPristine();
      formGroup.get('password')!.updateValueAndValidity();

      formGroup.get('confirm')!.markAsPristine();
      formGroup.get('confirm')!.updateValueAndValidity();

      fixture.detectChanges();

      const formItems1 = fixture.debugElement.queryAll(By.directive(NzFormItemComponent));
      expect(formItems1[0].nativeElement.classList).not.toContain(statusMap.error);
      expect(formItems1[1].nativeElement.classList).not.toContain(statusMap.error);
      expect(formItems1[2].nativeElement.classList).not.toContain(statusMap.error);
      expect(formItems1[3].nativeElement.classList).not.toContain(statusMap.error);
    });
    it('should markAsPending work', () => {
      formGroup.get('username')!.markAsPending();
      formGroup.get('username')!.updateValueAndValidity();

      formGroup.get('email')!.markAsPending();
      formGroup.get('email')!.updateValueAndValidity();

      formGroup.get('password')!.markAsPending();
      formGroup.get('password')!.updateValueAndValidity();

      formGroup.get('confirm')!.markAsPending();
      formGroup.get('confirm')!.updateValueAndValidity();

      fixture.detectChanges();

      const formItems = fixture.debugElement.queryAll(By.directive(NzFormItemComponent));
      expect(formItems[0].nativeElement.classList).not.toContain(statusMap.error);
      expect(formItems[1].nativeElement.classList).not.toContain(statusMap.error);
      expect(formItems[2].nativeElement.classList).not.toContain(statusMap.error);
      expect(formItems[3].nativeElement.classList).not.toContain(statusMap.error);
    });
  });

  describe('reset button should work', () => {
    let TIMEOUT_INTERVAL: number;
    let component: RegisterComponent;
    let fixture: ComponentFixture<RegisterComponent>;
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let formGroup: FormGroup;
    let formItems: DebugElement[];
    let buttons: DebugElement[];

    function getTooltipTrigger(index: number): Element {
      return overlayContainerElement.querySelectorAll('.ant-popover-buttons button')[index];
    }

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
        imports: [NoopAnimationsModule, RegisterComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(RegisterComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      formGroup = component.registerForm;
      formItems = fixture.debugElement.queryAll(By.directive(NzFormItemComponent));

      formGroup.get('username')!.markAsDirty();
      formGroup.get('username')!.setValue('username1');
      formGroup.get('username')!.updateValueAndValidity();

      formGroup.get('email')!.markAsDirty();
      formGroup.get('email')!.setValue('email@server');
      formGroup.get('email')!.updateValueAndValidity();

      formGroup.get('password')!.markAsDirty();
      formGroup.get('password')!.setValue(environment.testUserPassword);
      formGroup.get('password')!.updateValueAndValidity();

      formGroup.get('confirm')!.markAsDirty();
      formGroup.get('confirm')!.setValue(environment.testUserPassword);
      formGroup.get('confirm')!.updateValueAndValidity();

      fixture.detectChanges();

      expect(formItems[0].nativeElement.classList).toContain(statusMap.success);
      expect(formItems[1].nativeElement.classList).toContain(statusMap.success);
      expect(formItems[2].nativeElement.classList).toContain(statusMap.success);
      expect(formItems[3].nativeElement.classList).toContain(statusMap.success);

      buttons = fixture.debugElement.queryAll(By.directive(NzButtonComponent));
      expect(buttons[0]).toBeTruthy();
      expect(buttons[1]).toBeTruthy();
      expect(buttons[2]).toBeTruthy();

      buttons[2].nativeElement.click();
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(
      testInject([OverlayContainer], (currentOverlayContainer: OverlayContainer) => {
        overlayContainer = currentOverlayContainer;
        overlayContainerElement = currentOverlayContainer.getContainerElement();
      })
    );

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      expect(getTooltipTrigger(0).textContent).toContain('No');
      expect(getTooltipTrigger(1).textContent).toContain('Yes');
      dispatchMouseEvent(getTooltipTrigger(1), 'click');
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

    it('should be empty', fakeAsync(() => {
      tick(200);
      fixture.detectChanges();
      expect(formGroup.get('username')!.value).not.toBe('username1');
      expect(formGroup.get('email')!.value).not.toBe('email@server');
      expect(formGroup.get('password')!.value).not.toBe(environment.testUserPassword);
      expect(formGroup.get('confirm')!.value).not.toBe(environment.testUserPassword);
    }));
  });

  describe('register button should work', () => {
    let TIMEOUT_INTERVAL: number;
    let component: RegisterComponent;
    let fixture: ComponentFixture<RegisterComponent>;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let formGroup: FormGroup;
    let formItems: DebugElement[];
    let buttons: DebugElement[];

    function getTooltipTrigger(index: number): Element {
      return overlayContainerElement.querySelectorAll('.ant-popover-buttons button')[index];
    }

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
        imports: [NoopAnimationsModule, TestHelpComponent, RegisterComponent]
      }).compileComponents();

      helpFixture = TestBed.createComponent(TestHelpComponent);
      helpComponent = helpFixture.componentInstance;

      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(false);

      fixture = TestBed.createComponent(RegisterComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      formGroup = component.registerForm;
      formItems = fixture.debugElement.queryAll(By.directive(NzFormItemComponent));

      formGroup.get('username')!.markAsDirty();
      formGroup.get('username')!.setValue('username1');
      formGroup.get('username')!.updateValueAndValidity();

      formGroup.get('email')!.markAsDirty();
      formGroup.get('email')!.setValue('email@server');
      formGroup.get('email')!.updateValueAndValidity();

      formGroup.get('password')!.markAsDirty();
      formGroup.get('password')!.setValue(environment.testUserPassword);
      formGroup.get('password')!.updateValueAndValidity();

      formGroup.get('confirm')!.markAsDirty();
      formGroup.get('confirm')!.setValue(environment.testUserPassword);
      formGroup.get('confirm')!.updateValueAndValidity();

      fixture.detectChanges();

      expect(formItems[0].nativeElement.classList).toContain(statusMap.success);
      expect(formItems[1].nativeElement.classList).toContain(statusMap.success);
      expect(formItems[2].nativeElement.classList).toContain(statusMap.success);
      expect(formItems[3].nativeElement.classList).toContain(statusMap.success);

      buttons = fixture.debugElement.queryAll(By.directive(NzButtonComponent));
      expect(buttons[0]).toBeTruthy();
      expect(buttons[1]).toBeTruthy();
      expect(buttons[2]).toBeTruthy();

      buttons[1].nativeElement.click();
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(
      testInject([OverlayContainer], (currentOverlayContainer: OverlayContainer) => {
        overlayContainer = currentOverlayContainer;
        overlayContainerElement = currentOverlayContainer.getContainerElement();
      })
    );

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      expect(getTooltipTrigger(0).textContent).toContain('No');
      expect(getTooltipTrigger(1).textContent).toContain('Yes');
      dispatchMouseEvent(getTooltipTrigger(1), 'click');
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

    it('should have error', fakeAsync(() => {
      tick(200);
      helpFixture.detectChanges();
      expect(helpComponent.errors[0]).toBe('Register is not implemented yet.');

      fixture.detectChanges();
      expect(formGroup.get('username')!.value).toBe('username1');
      expect(formGroup.get('email')!.value).toBe('email@server');
      expect(formGroup.get('password')!.value).toBe(environment.testUserPassword);
      expect(formGroup.get('confirm')!.value).toBe(environment.testUserPassword);
    }));
  });

  describe('should register return validation error', () => {
    let TIMEOUT_INTERVAL: number;
    let component: RegisterComponent;
    let fixture: ComponentFixture<RegisterComponent>;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let formGroup: FormGroup;
    let formItems: DebugElement[];
    let buttons: DebugElement[];

    function getTooltipTrigger(index: number): Element {
      return overlayContainerElement.querySelectorAll('.ant-popover-buttons button')[index];
    }

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
        imports: [NoopAnimationsModule, TestHelpComponent, RegisterComponent]
      }).compileComponents();

      helpFixture = TestBed.createComponent(TestHelpComponent);
      helpComponent = helpFixture.componentInstance;

      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(false);

      fixture = TestBed.createComponent(RegisterComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      formGroup = component.registerForm;
      formItems = fixture.debugElement.queryAll(By.directive(NzFormItemComponent));

      formGroup.get('username')!.markAsDirty();
      formGroup.get('username')!.setValue('username1');
      formGroup.get('username')!.updateValueAndValidity();

      formGroup.get('email')!.markAsDirty();
      formGroup.get('email')!.setValue(environment.testUserEmail);
      formGroup.get('email')!.updateValueAndValidity();

      formGroup.get('password')!.markAsDirty();
      formGroup.get('password')!.setValue(environment.testUserPassword);
      formGroup.get('password')!.updateValueAndValidity();

      formGroup.get('confirm')!.markAsDirty();
      formGroup.get('confirm')!.setValue(environment.testUserPassword);
      formGroup.get('confirm')!.updateValueAndValidity();

      fixture.detectChanges();

      expect(formItems[0].nativeElement.classList).toContain(statusMap.success);
      expect(formItems[1].nativeElement.classList).toContain(statusMap.success);
      expect(formItems[2].nativeElement.classList).toContain(statusMap.success);
      expect(formItems[3].nativeElement.classList).toContain(statusMap.success);

      buttons = fixture.debugElement.queryAll(By.directive(NzButtonComponent));
      expect(buttons[0]).toBeTruthy();
      expect(buttons[1]).toBeTruthy();
      expect(buttons[2]).toBeTruthy();

      buttons[1].nativeElement.click();
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(
      testInject([OverlayContainer], (currentOverlayContainer: OverlayContainer) => {
        overlayContainer = currentOverlayContainer;
        overlayContainerElement = currentOverlayContainer.getContainerElement();
      })
    );

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      expect(getTooltipTrigger(0).textContent).toContain('No');
      expect(getTooltipTrigger(1).textContent).toContain('Yes');
      dispatchMouseEvent(getTooltipTrigger(1), 'click');
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

    it('should have error', fakeAsync(() => {
      tick(200);
      helpFixture.detectChanges();
      expect(helpComponent.errors[0]).toBe('The email has been taken.');

      fixture.detectChanges();
      expect(formGroup.get('username')!.value).toBe('username1');
      expect(formGroup.get('email')!.value).toBe(environment.testUserEmail);
      expect(formGroup.get('password')!.value).toBe(environment.testUserPassword);
      expect(formGroup.get('confirm')!.value).toBe(environment.testUserPassword);
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
