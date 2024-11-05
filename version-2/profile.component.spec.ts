import { OverlayContainer } from '@angular/cdk/overlay';
import { HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject, Injector, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync, inject as testInject } from '@angular/core/testing';
import { FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { apiPrefixInterceptor, authInterceptor } from '@app/shared/interceptors';
import { ErrorResponse } from '@app/shared/models';
import { LoginBodyRequest } from '@app/shared/services';
import { AuthStore } from '@app/shared/store';
import { TypedFormGroup } from '@app/shared/utils';

import { provideComponentStore } from '@ngrx/component-store';
import { NzAvatarComponent } from 'ng-zorro-antd/avatar';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { dispatchMouseEvent } from 'ng-zorro-antd/core/testing';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import ProfileComponent from './profile.component';
import { environment } from '../../environments/environment';

describe('profile.component', () => {
  describe('should user be logged on and the drawer open/close', () => {
    let TIMEOUT_INTERVAL: number;
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

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
        imports: [NoopAnimationsModule, HttpClientModule, TestHelpComponent, ProfileComponent]
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
        overlayContainerElement = currentOverlayContainer.getContainerElement();
      })
    );

    beforeEach(waitForAsync(() => {
      fixture = TestBed.createComponent(ProfileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.user()?.email).toBe(environment.testUserEmail);
      const overlayContainerElement = overlayContainer.getContainerElement();
      expect(overlayContainerElement.querySelector('.ant-drawer')).not.toBeTruthy();

      component.createComponentModal('username');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      const overlayContainerElement = overlayContainer.getContainerElement();
      expect(overlayContainerElement.querySelector('.ant-drawer')!.classList.contains('ant-drawer-open')).toBe(true);

      fixture.detectChanges();
      const buttons = fixture.debugElement.queryAll(By.directive(NzButtonComponent));
      expect(buttons.length).toBe(3);
      expect(buttons[0].nativeElement.firstElementChild!.classList.contains('anticon-audit')).toBe(true);
      expect(buttons[1].nativeElement.firstElementChild!.classList.contains('anticon-loading')).toBe(true);
      expect(buttons[2].nativeElement.firstElementChild!.classList.contains('anticon-export')).toBe(true);

      const avatar = fixture.debugElement.query(By.directive(NzAvatarComponent)).nativeElement;
      expect(avatar.classList.contains('ant-avatar')).toBe(true);

      const xButton = overlayContainer.getContainerElement().querySelector('.ant-btn-dangerous');
      expect(xButton).toBeTruthy();
      dispatchMouseEvent(xButton!, 'click');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      expect(getTooltipTrigger(0).textContent).toContain('No');
      expect(getTooltipTrigger(1).textContent).toContain('Yes');
      dispatchMouseEvent(getTooltipTrigger(1), 'click');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      const overlayContainerElement = overlayContainer.getContainerElement();
      expect(overlayContainerElement.querySelector('.ant-drawer')).not.toBeTruthy();
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

    it('should be logged on', fakeAsync(() => {
      tick(200);
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
      expect(component.user()?.email).toBe(environment.testUserEmail);
    }));
  });

  describe('submit button should work', () => {
    let TIMEOUT_INTERVAL: number;
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

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
        imports: [NoopAnimationsModule, HttpClientModule, TestHelpComponent, ProfileComponent]
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
        overlayContainerElement = currentOverlayContainer.getContainerElement();
      })
    );

    beforeEach(waitForAsync(() => {
      fixture = TestBed.createComponent(ProfileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.user()?.email).toBe(environment.testUserEmail);
      const overlayContainerElement = overlayContainer.getContainerElement();
      expect(overlayContainerElement.querySelector('.ant-drawer')).not.toBeTruthy();

      component.createComponentModal('username');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      const overlayContainerElement = overlayContainer.getContainerElement();
      expect(overlayContainerElement.querySelector('.ant-drawer')!.classList.contains('ant-drawer-open')).toBe(true);

      fixture.detectChanges();
      const buttons = fixture.debugElement.queryAll(By.directive(NzButtonComponent));
      expect(buttons.length).toBe(3);
      expect(buttons[0].nativeElement.firstElementChild!.classList.contains('anticon-audit')).toBe(true);
      expect(buttons[1].nativeElement.firstElementChild!.classList.contains('anticon-loading')).toBe(true);
      expect(buttons[2].nativeElement.firstElementChild!.classList.contains('anticon-export')).toBe(true);

      const avatar = fixture.debugElement.query(By.directive(NzAvatarComponent)).nativeElement;
      expect(avatar.classList.contains('ant-avatar')).toBe(true);

      const xButtons = overlayContainerElement.querySelectorAll('.ant-btn');
      expect(xButtons.length).toBe(4);
      dispatchMouseEvent(xButtons[2], 'click');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      expect(getTooltipTrigger(0).textContent).toContain('No');
      expect(getTooltipTrigger(1).textContent).toContain('Yes');
      dispatchMouseEvent(getTooltipTrigger(1), 'click');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      const overlayContainerElement = overlayContainer.getContainerElement();
      expect(overlayContainerElement.querySelector('.ant-drawer')).toBeTruthy();
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

    it('should be logged on and show error', fakeAsync(() => {
      tick(200);
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
      expect(component.user()?.email).toBe(environment.testUserEmail);
      expect(helpComponent.errors[0]).toBe('The user name has been taken.');
    }));
  });

  describe('reset button should work', () => {
    let TIMEOUT_INTERVAL: number;
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

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
        imports: [NoopAnimationsModule, HttpClientModule, TestHelpComponent, ProfileComponent]
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
        overlayContainerElement = currentOverlayContainer.getContainerElement();
      })
    );

    beforeEach(waitForAsync(() => {
      fixture = TestBed.createComponent(ProfileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.user()?.email).toBe(environment.testUserEmail);
      const overlayContainerElement = overlayContainer.getContainerElement();
      expect(overlayContainerElement.querySelector('.ant-drawer')).not.toBeTruthy();

      component.createComponentModal('username');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      const overlayContainerElement = overlayContainer.getContainerElement();
      expect(overlayContainerElement.querySelector('.ant-drawer')!.classList.contains('ant-drawer-open')).toBe(true);

      fixture.detectChanges();
      const buttons = fixture.debugElement.queryAll(By.directive(NzButtonComponent));
      expect(buttons.length).toBe(3);
      expect(buttons[0].nativeElement.firstElementChild!.classList.contains('anticon-audit')).toBe(true);
      expect(buttons[1].nativeElement.firstElementChild!.classList.contains('anticon-loading')).toBe(true);
      expect(buttons[2].nativeElement.firstElementChild!.classList.contains('anticon-export')).toBe(true);

      const avatar = fixture.debugElement.query(By.directive(NzAvatarComponent)).nativeElement;
      expect(avatar.classList.contains('ant-avatar')).toBe(true);

      const xButtons = overlayContainerElement.querySelectorAll('.ant-btn');
      expect(xButtons.length).toBe(4);
      dispatchMouseEvent(xButtons[3], 'click');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      expect(getTooltipTrigger(0).textContent).toContain('No');
      expect(getTooltipTrigger(1).textContent).toContain('Yes');
      dispatchMouseEvent(getTooltipTrigger(1), 'click');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      const overlayContainerElement = overlayContainer.getContainerElement();
      expect(overlayContainerElement.querySelector('.ant-drawer')).toBeTruthy();
      const xButton = overlayContainer.getContainerElement().querySelector('.ant-btn[disabled]');
      expect(xButton).toBeTruthy();
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

    it('should be logged on and the form empty', fakeAsync(() => {
      tick(200);
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
      expect(component.user()?.email).toBe(environment.testUserEmail);
    }));
  });

  describe('undo button should work', () => {
    let TIMEOUT_INTERVAL: number;
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

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
        imports: [NoopAnimationsModule, HttpClientModule, TestHelpComponent, ProfileComponent]
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
        overlayContainerElement = currentOverlayContainer.getContainerElement();
      })
    );

    beforeEach(waitForAsync(() => {
      fixture = TestBed.createComponent(ProfileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.user()?.email).toBe(environment.testUserEmail);
      const overlayContainerElement = overlayContainer.getContainerElement();
      expect(overlayContainerElement.querySelector('.ant-drawer')).not.toBeTruthy();

      component.createComponentModal('username');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      const overlayContainerElement = overlayContainer.getContainerElement();
      expect(overlayContainerElement.querySelector('.ant-drawer')!.classList.contains('ant-drawer-open')).toBe(true);

      fixture.detectChanges();
      const buttons = fixture.debugElement.queryAll(By.directive(NzButtonComponent));
      expect(buttons.length).toBe(3);
      expect(buttons[0].nativeElement.firstElementChild!.classList.contains('anticon-audit')).toBe(true);
      expect(buttons[1].nativeElement.firstElementChild!.classList.contains('anticon-loading')).toBe(true);
      expect(buttons[2].nativeElement.firstElementChild!.classList.contains('anticon-export')).toBe(true);

      const avatar = fixture.debugElement.query(By.directive(NzAvatarComponent)).nativeElement;
      expect(avatar.classList.contains('ant-avatar')).toBe(true);

      const xButtons = overlayContainerElement.querySelectorAll('.ant-btn');
      expect(xButtons.length).toBe(4);
      dispatchMouseEvent(xButtons[3], 'click');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      expect(getTooltipTrigger(0).textContent).toContain('No');
      expect(getTooltipTrigger(1).textContent).toContain('Yes');
      dispatchMouseEvent(getTooltipTrigger(1), 'click');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      const overlayContainerElement = overlayContainer.getContainerElement();
      expect(overlayContainerElement.querySelector('.ant-drawer')).toBeTruthy();
      const xButton = overlayContainer.getContainerElement().querySelector('.ant-btn[disabled]');
      expect(xButton).toBeTruthy();
      const xButtons = overlayContainerElement.querySelectorAll('.ant-btn');
      expect(xButtons.length).toBe(4);
      dispatchMouseEvent(xButtons[0], 'click');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      expect(getTooltipTrigger(0).textContent).toContain('No');
      expect(getTooltipTrigger(1).textContent).toContain('Yes');
      dispatchMouseEvent(getTooltipTrigger(1), 'click');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      const overlayContainerElement = overlayContainer.getContainerElement();
      expect(overlayContainerElement.querySelector('.ant-drawer')).toBeTruthy();
      const xButton = overlayContainer.getContainerElement().querySelector('.ant-btn[disabled]');
      expect(xButton).not.toBeTruthy();
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

    it('should be logged on and the form not empty', fakeAsync(() => {
      tick(200);
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
      expect(component.user()?.email).toBe(environment.testUserEmail);
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
  readonly isLoading = signal<boolean>(false);
  private injector = inject(Injector);
  errors: string[] = [];

  readonly MinEmailLength = 3;
  readonly MaxEmailLength = 50;
  readonly MinPasswordLength = 16;
  readonly MaxPasswordLength = 32;

  passwordValidator = (control: AbstractControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { error: true, required: true };
    } else if (control.value.length < this.MinPasswordLength) {
      return { error: true, min: true };
    } else if (control.value.length > this.MaxPasswordLength) {
      return { error: true, max: true };
    }
    return {};
  };
  emailValidator = (control: AbstractControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { error: true, required: true };
    } else if (control.value.length < this.MinEmailLength) {
      return { error: true, min: true };
    } else if (control.value.length > this.MaxEmailLength) {
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
