import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, OnDestroy, OnInit, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, inject, waitForAsync } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { environment } from '@env/environment';

import { Errors, NgrxFormsFacade } from '@zorro-example-app/ngrx-forms';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import {
  dispatchMouseEvent,
  ɵComponentBed as ComponentBed,
  ɵcreateComponentBed as createComponentBed
} from 'ng-zorro-antd/core/testing';
import { NzFormControlComponent, NzFormItemComponent } from 'ng-zorro-antd/form';

import { AuthFacade } from './+state/auth.facade';
import { AuthModule } from './auth.module';
import { RegisterComponent } from './register.component';
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

describe('register.component', () => {
  describe('reactive status', () => {
    let testBed: ComponentBed<RegisterComponent>;
    let formGroup: FormGroup;
    let formItems: DebugElement[];
    let formControls: DebugElement[];

    beforeEach(() => {
      localStorage.removeItem('jwtCioinaToken');
      testBed = createComponentBed(RegisterComponent, testBedOptions);
      formGroup = testBed.component.validateForm;
      formItems = testBed.fixture.debugElement.queryAll(By.directive(NzFormItemComponent));
      formControls = testBed.fixture.debugElement.queryAll(By.directive(NzFormControlComponent));
    });

    it('should init status correct', () => {
      expect(formItems[0].nativeElement.classList).toContain('ant-form-item');
      expect(formItems[1].nativeElement.classList).toContain('ant-form-item');
      expect(formItems[2].nativeElement.classList).toContain('ant-form-item');
      expect(formItems[3].nativeElement.classList).toContain('ant-form-item');
      expect(formItems[4].nativeElement.classList).toContain('ant-form-item');

      expect(formControls[0].nativeElement.classList).toContain('ant-form-item-control');
      expect(formControls[1].nativeElement.classList).toContain('ant-form-item-control');
      expect(formControls[2].nativeElement.classList).toContain('ant-form-item-control');
      expect(formControls[3].nativeElement.classList).toContain('ant-form-item-control');
      expect(formControls[4].nativeElement.classList).toContain('ant-form-item-control');
    });
    it('should valid work', () => {
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

      testBed.fixture.detectChanges();

      expect(formItems[0].nativeElement.classList).toContain(statusMap.success);
      expect(formItems[1].nativeElement.classList).toContain(statusMap.success);
      expect(formItems[2].nativeElement.classList).toContain(statusMap.success);
      expect(formItems[3].nativeElement.classList).toContain(statusMap.success);
    });
    it('should passwordValidator work', () => {
      formGroup.get('password')!.markAsDirty();
      formGroup.get('password')!.setValue('toShort');
      formGroup.get('password')!.updateValueAndValidity();

      testBed.fixture.detectChanges();

      expect(formItems[2].nativeElement.classList).toContain(statusMap.error);
    });

    it('should confirmValidator work', () => {
      formGroup.get('password')!.markAsDirty();
      formGroup.get('password')!.setValue(environment.testUserPassword);
      formGroup.get('password')!.updateValueAndValidity();

      formGroup.get('confirm')!.markAsDirty();
      formGroup.get('confirm')!.setValue('thisIsDiffrent');
      formGroup.get('confirm')!.updateValueAndValidity();

      testBed.fixture.detectChanges();

      expect(formItems[2].nativeElement.classList).toContain(statusMap.success);
      expect(formItems[3].nativeElement.classList).toContain(statusMap.error);
    });

    it('should invalid work', () => {
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

      testBed.fixture.detectChanges();

      expect(formItems[0].nativeElement.classList).toContain(statusMap.error);
      expect(formItems[1].nativeElement.classList).toContain(statusMap.error);
      expect(formItems[2].nativeElement.classList).toContain(statusMap.error);
      expect(formItems[3].nativeElement.classList).toContain(statusMap.error);
    });
    it('should dirty work', () => {
      formGroup.get('username')!.markAsDirty();
      formGroup.get('username')!.updateValueAndValidity();

      formGroup.get('email')!.markAsDirty();
      formGroup.get('email')!.updateValueAndValidity();

      formGroup.get('password')!.markAsDirty();
      formGroup.get('password')!.updateValueAndValidity();

      formGroup.get('confirm')!.markAsDirty();
      formGroup.get('confirm')!.updateValueAndValidity();

      testBed.fixture.detectChanges();

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

      testBed.fixture.detectChanges();

      expect(formItems[0].nativeElement.classList).not.toContain(statusMap.error);
      expect(formItems[1].nativeElement.classList).not.toContain(statusMap.error);
      expect(formItems[2].nativeElement.classList).not.toContain(statusMap.error);
      expect(formItems[3].nativeElement.classList).not.toContain(statusMap.error);
    });
    it('should pending work', () => {
      formGroup.get('username')!.markAsPending();
      formGroup.get('username')!.updateValueAndValidity();

      formGroup.get('email')!.markAsPending();
      formGroup.get('email')!.updateValueAndValidity();

      formGroup.get('password')!.markAsPending();
      formGroup.get('password')!.updateValueAndValidity();

      formGroup.get('confirm')!.markAsPending();
      formGroup.get('confirm')!.updateValueAndValidity();

      testBed.fixture.detectChanges();

      expect(formItems[0].nativeElement.classList).not.toContain(statusMap.error);
      expect(formItems[1].nativeElement.classList).not.toContain(statusMap.error);
      expect(formItems[2].nativeElement.classList).not.toContain(statusMap.error);
      expect(formItems[3].nativeElement.classList).not.toContain(statusMap.error);
    });
  });
});

describe('should reset button work', () => {
  let TIMEOUT_INTERVAL: number;
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let overlayContainer: OverlayContainer;
  let formGroup: FormGroup;
  let formItems: DebugElement[];
  let buttons: DebugElement[];

  function getTooltipTrigger(index: number): Element {
    return overlayContainer.getContainerElement().querySelectorAll('.ant-popover-buttons button')[index];
  }

  beforeEach(() => {
    localStorage.removeItem('jwtCioinaToken');
    TIMEOUT_INTERVAL = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 12000;
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TestHelpComponent],
      imports: [AppModule, AuthModule, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    formGroup = component.validateForm;
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

  beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
    overlayContainer = oc;
  }));

  beforeEach(waitForAsync(() => {
    fixture.detectChanges();
    expect(getTooltipTrigger(0).textContent).toContain('No');
    expect(getTooltipTrigger(1).textContent).toContain('Yes');
    dispatchMouseEvent(getTooltipTrigger(1), 'click');
  }));
  beforeEach(async () => {
    await fixture.whenRenderingDone();
  });

  afterEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    overlayContainer.ngOnDestroy();
  });

  it('should be empty', fakeAsync(() => {
    tick(200);
    fixture.detectChanges();
    expect(formGroup.get('username')!.value).not.toBe('username1');
    expect(formGroup.get('email')!.value).not.toBe('email@server');
    expect(formGroup.get('password')!.value).not.toBe(environment.testUserPassword);
    expect(formGroup.get('confirm')!.value).not.toBe(environment.testUserPassword);
  }));
});

describe('should register button work', () => {
  let TIMEOUT_INTERVAL: number;
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let helpComponent: TestHelpComponent;
  let helpFixture: ComponentFixture<TestHelpComponent>;
  let overlayContainer: OverlayContainer;
  let formGroup: FormGroup;
  let formItems: DebugElement[];
  let buttons: DebugElement[];

  function getTooltipTrigger(index: number): Element {
    return overlayContainer.getContainerElement().querySelectorAll('.ant-popover-buttons button')[index];
  }

  beforeEach(() => {
    localStorage.removeItem('jwtCioinaToken');
    TIMEOUT_INTERVAL = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 12000;
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TestHelpComponent],
      imports: [AppModule, AuthModule, NoopAnimationsModule]
    }).compileComponents();

    helpFixture = TestBed.createComponent(TestHelpComponent);
    helpComponent = helpFixture.componentInstance;

    helpFixture.detectChanges();
  }));

  beforeEach(waitForAsync(() => {
    helpFixture.detectChanges();
    expect(helpComponent.isLoggedIn).toBe(false);

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    formGroup = component.validateForm;
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

  beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
    overlayContainer = oc;
  }));

  beforeEach(waitForAsync(() => {
    fixture.detectChanges();
    expect(getTooltipTrigger(0).textContent).toContain('No');
    expect(getTooltipTrigger(1).textContent).toContain('Yes');
    dispatchMouseEvent(getTooltipTrigger(1), 'click');
  }));

  beforeEach(async () => {
    await fixture.whenRenderingDone();
  });

  afterEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    overlayContainer.ngOnDestroy();
  });

  it('should have error', fakeAsync(() => {
    tick(200);
    helpFixture.detectChanges();
    expect(helpComponent.authUserLoading).toBe(true);
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
  let helpComponent: TestHelpComponent;
  let helpFixture: ComponentFixture<TestHelpComponent>;

  beforeEach(() => {
    localStorage.removeItem('jwtCioinaToken');
    TIMEOUT_INTERVAL = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 12000;
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TestHelpComponent],
      imports: [AppModule, AuthModule, NoopAnimationsModule]
    }).compileComponents();

    helpFixture = TestBed.createComponent(TestHelpComponent);
    helpComponent = helpFixture.componentInstance;

    helpFixture.detectChanges();
    helpComponent.ngrxFormsFacade.setData({
      username: 'notImplemented',
      email: environment.testUserEmail,
      password: environment.testUserPassword
    });
    helpComponent.authFacade.register();
    helpFixture.detectChanges();
  }));

  beforeEach(async () => {
    await helpFixture.whenRenderingDone();
  });

  afterEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
  });

  it('should have validation error', fakeAsync(() => {
    tick(200);
    helpFixture.detectChanges();
    expect(helpComponent.authUserLoading).toBe(true);
    expect(helpComponent.errors[0]).toBe('The email has been taken.');
  }));
});

@Component({})
export class TestHelpComponent implements OnInit, OnDestroy {
  unsubscribe$: Subject<void> = new Subject();
  isLoggedIn: boolean = false;
  isLoggedOut: boolean = true;
  authUserLoading: boolean = false;
  errors: string[] = [];

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  ngOnInit(): void {
    this.authFacade.isLoggedIn$?.pipe(takeUntil(this.unsubscribe$)).subscribe((logged: boolean) => {
      this.isLoggedIn = logged;
    });

    this.authFacade.isLoggedOut$?.pipe(takeUntil(this.unsubscribe$)).subscribe((loggedOut: boolean) => {
      this.isLoggedOut = loggedOut;
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
