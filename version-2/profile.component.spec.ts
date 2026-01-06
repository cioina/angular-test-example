/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { provideHttpClient, withInterceptors, HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject, Injector, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync, inject as testInject } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MinUserNameLength, MaxUserNameLength, MinPasswordLength, MaxPasswordLength } from '@app/shared/constants';
import { apiPrefixInterceptor, authInterceptor } from '@app/shared/interceptors';
import { ErrorResponse } from '@app/shared/models';
import { LoginBodyRequest } from '@app/shared/services';
import { AuthStore } from '@app/shared/store';
import { TypedFormGroup } from '@app/shared/utils';
import { provideComponentStore } from '@ngrx/component-store';

import { NzAvatarComponent } from 'ng-zorro-antd/avatar';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { dispatchMouseEvent, dispatchFakeEvent, typeInElement } from 'ng-zorro-antd/core/testing';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import ProfileComponent from './profile.component';
import { environment } from '../../environments/environment';

function getTooltipTrigger(overlayContainer: OverlayContainer, index: number): Element {
  return overlayContainer.getContainerElement().querySelectorAll('.ant-popover-buttons button')[index];
}

function clickYes(fixture: ComponentFixture<ProfileComponent>, overlayContainer: OverlayContainer): void {
  fixture.detectChanges();
  expect(getTooltipTrigger(overlayContainer, 0).textContent).toContain('No');
  expect(getTooltipTrigger(overlayContainer, 1).textContent).toContain('Yes');
  dispatchMouseEvent(getTooltipTrigger(overlayContainer, 1), 'click');
  fixture.detectChanges();
}

function expectDrawerOpen(fixture: ComponentFixture<ProfileComponent>, overlayContainer: OverlayContainer): void {
  fixture.detectChanges();
  expect(
    overlayContainer.getContainerElement().querySelector('.ant-drawer')!.classList.contains('ant-drawer-open')
  ).toBe(true);
  const buttons = fixture.debugElement.queryAll(By.directive(NzButtonComponent));
  expect(buttons.length).toBe(3);
  expect(buttons[0].nativeElement.firstElementChild!.classList.contains('anticon-export')).toBe(true);
  expect(buttons[1].nativeElement.firstElementChild!.classList.contains('anticon-audit')).toBe(true);
  expect(buttons[2].nativeElement.firstElementChild!.classList.contains('ant-btn-loading-icon')).toBe(true);

  const avatar = fixture.debugElement.query(By.directive(NzAvatarComponent)).nativeElement;
  expect(avatar.classList.contains('ant-avatar')).toBe(true);

  const typography = overlayContainer.getContainerElement().querySelector('.ant-typography');
  expect(typography).toBeTruthy();
  expect(typography?.textContent?.trim()).toBe('Update Account');
}

describe('profile.component', () => {
  describe('change password', () => {
    let TIMEOUT_INTERVAL: number;
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;
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
        imports: [NoopAnimationsModule, TestHelpComponent, ProfileComponent]
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
      fixture = TestBed.createComponent(ProfileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.user()?.email).toBe(environment.testUserEmail);
      expect(overlayContainer.getContainerElement().querySelector('.ant-drawer')).not.toBeTruthy();

      component.createComponentModal('password');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      expectDrawerOpen(fixture, overlayContainer);

      const inputs = overlayContainer.getContainerElement().querySelectorAll('input[nz-input]');
      expect(inputs.length).toBe(3);
      expect(inputs[1].id.trim()).toBe('password');
      const password = inputs[1];
      dispatchFakeEvent(password, 'focusin');
      fixture.detectChanges();
      typeInElement('m'.repeat(MinPasswordLength - 1), password as HTMLInputElement);
      fixture.detectChanges();

      expect(inputs[2].id.trim()).toBe('confirm');
      const confirm = inputs[2];
      dispatchFakeEvent(confirm, 'focusin');
      fixture.detectChanges();
      typeInElement('m'.repeat(MinPasswordLength - 1), confirm as HTMLInputElement);
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      const errors = overlayContainer.getContainerElement().querySelectorAll('.ant-form-item-explain-error');
      expect(errors.length).toBe(2);
      expect(errors[0].textContent?.trim()).toBe('The password must be at least 16 characters long.');
      expect(errors[1].textContent?.trim()).toBe('The password must be at least 16 characters long.');

      const inputs = overlayContainer.getContainerElement().querySelectorAll('input[nz-input]');
      expect(inputs.length).toBe(3);
      expect(inputs[1].id.trim()).toBe('password');
      const password = inputs[1];
      dispatchFakeEvent(password, 'focusin');
      fixture.detectChanges();
      typeInElement('m'.repeat(MaxPasswordLength + 1), password as HTMLInputElement);
      fixture.detectChanges();

      expect(inputs[2].id.trim()).toBe('confirm');
      const confirm = inputs[2];
      dispatchFakeEvent(confirm, 'focusin');
      fixture.detectChanges();
      typeInElement('m'.repeat(MaxPasswordLength + 1), confirm as HTMLInputElement);
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      expectDrawerOpen(fixture, overlayContainer);

      const errors = overlayContainer.getContainerElement().querySelectorAll('.ant-form-item-explain-error');
      expect(errors.length).toBe(2);
      expect(errors[0].textContent?.trim()).toBe('The password must be at most 32 characters long.');
      expect(errors[1].textContent?.trim()).toBe('The password must be at most 32 characters long.');
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

    it('do not uncomment', fakeAsync(() => {
      tick(20);
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
      expect(component.user()?.email).toBe(environment.testUserEmail);
    }));
  });

  describe('logout confirm password drawer should open on top of drawer Update Account', () => {
    let TIMEOUT_INTERVAL: number;
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;
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
        imports: [NoopAnimationsModule, TestHelpComponent, ProfileComponent]
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
      fixture = TestBed.createComponent(ProfileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.user()?.email).toBe(environment.testUserEmail);
      expect(overlayContainer.getContainerElement().querySelector('.ant-drawer')).not.toBeTruthy();

      component.createComponentModal('username');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      expectDrawerOpen(fixture, overlayContainer);

      helpComponent.logout();
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
      expect(overlayContainer.getContainerElement().querySelector('.ant-drawer')).toBeTruthy();
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      const inputs = overlayContainer.getContainerElement().querySelectorAll('input[nz-input]');
      expect(inputs.length).toBe(4);
      dispatchFakeEvent(inputs[3], 'focusin');
      fixture.detectChanges();
      typeInElement(`${environment.testUserPassword}a`, inputs[3] as HTMLInputElement);
      fixture.detectChanges();
      const xButtons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn');
      expect(xButtons.length).toBe(7);
      const submitConfirmPassword = xButtons[5];
      expect(submitConfirmPassword.textContent?.trim()).toBe('Submit');
      dispatchMouseEvent(submitConfirmPassword, 'click');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      clickYes(fixture, overlayContainer);
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      const xButtons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn[disabled]');
      expect(xButtons.length).toBe(0);
      expect(helpComponent.isAuthenticated()).toBe(true);
      const messages = overlayContainer
        .getContainerElement()
        .querySelectorAll('h5.ant-typography.ant-typography-danger');
      expect(messages.length).toBe(2);
      expect(messages[0].textContent?.trim()).toBe('Invalid credentials.');
      expect(messages[1].textContent?.trim()).toBe('Invalid credentials.');

      expect(overlayContainer.getContainerElement().querySelector('.ant-drawer')).toBeTruthy();
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      const inputs = overlayContainer.getContainerElement().querySelectorAll('input[nz-input]');
      expect(inputs.length).toBe(4);
      dispatchFakeEvent(inputs[3], 'focusin');
      fixture.detectChanges();
      typeInElement('m'.repeat(MinPasswordLength - 1), inputs[3] as HTMLInputElement);
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      const errors = overlayContainer.getContainerElement().querySelectorAll('.ant-form-item-explain-error');
      expect(errors.length).toBe(1);
      expect(errors[0].textContent?.trim()).toBe('The password must be at least 16 characters long.');

      const inputs = overlayContainer.getContainerElement().querySelectorAll('input[nz-input]');
      expect(inputs.length).toBe(4);
      dispatchFakeEvent(inputs[3], 'focusin');
      fixture.detectChanges();
      typeInElement('m'.repeat(MaxPasswordLength + 1), inputs[3] as HTMLInputElement);
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      const errors = overlayContainer.getContainerElement().querySelectorAll('.ant-form-item-explain-error');
      expect(errors.length).toBe(1);
      expect(errors[0].textContent?.trim()).toBe('The password must be at most 32 characters long.');

      const buttons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn[disabled]');
      expect(buttons.length).toBe(1);
      expect(buttons[0].textContent?.trim()).toBe('Submit');

      const inputs = overlayContainer.getContainerElement().querySelectorAll('input[nz-input]');
      expect(inputs.length).toBe(4);
      dispatchFakeEvent(inputs[3], 'focusin');
      fixture.detectChanges();
      typeInElement(environment.testUserPassword, inputs[3] as HTMLInputElement);
      fixture.detectChanges();
      const xButtons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn');
      expect(xButtons.length).toBe(7);
      const signOutConfirmPassword = xButtons[4];
      expect(signOutConfirmPassword.textContent?.trim()).toBe('Sign Out');
      dispatchMouseEvent(signOutConfirmPassword, 'click');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      clickYes(fixture, overlayContainer);
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

    it('should click submit and signOut buttons work for ConfirmPassword', fakeAsync(() => {
      tick(20);
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(false);
      expect(helpComponent.errors.length).toBe(0);
    }));
  });

  describe('close confirm password drawer should open on top of drawer Update Account', () => {
    let TIMEOUT_INTERVAL: number;
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;
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
        imports: [NoopAnimationsModule, TestHelpComponent, ProfileComponent]
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
      fixture = TestBed.createComponent(ProfileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.user()?.email).toBe(environment.testUserEmail);
      expect(overlayContainer.getContainerElement().querySelector('.ant-drawer')).not.toBeTruthy();

      component.createComponentModal('username');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      expectDrawerOpen(fixture, overlayContainer);
      helpComponent.setNeedsRefreshToken();

      const xButtons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn');
      expect(xButtons.length).toBe(4);
      const submitProfile = xButtons[2];
      dispatchMouseEvent(submitProfile, 'click');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      clickYes(fixture, overlayContainer);
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
      expect(overlayContainer.getContainerElement().querySelector('.ant-drawer')).toBeTruthy();
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      const inputs = overlayContainer.getContainerElement().querySelectorAll('input[nz-input]');
      expect(inputs.length).toBe(4);
      dispatchFakeEvent(inputs[3], 'focusin');
      fixture.detectChanges();
      typeInElement(`${environment.testUserPassword}a`, inputs[3] as HTMLInputElement);
      fixture.detectChanges();
      const xButtons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn');
      expect(xButtons.length).toBe(7);
      const submitConfirmPassword = xButtons[5];
      expect(submitConfirmPassword.textContent?.trim()).toBe('Submit');
      dispatchMouseEvent(submitConfirmPassword, 'click');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      clickYes(fixture, overlayContainer);
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      const xButtons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn[disabled]');
      expect(xButtons.length).toBe(0);
      expect(helpComponent.isAuthenticated()).toBe(true);
      const messages = overlayContainer
        .getContainerElement()
        .querySelectorAll('h5.ant-typography.ant-typography-danger');
      expect(messages.length).toBe(2);
      expect(messages[0].textContent?.trim()).toBe('Invalid credentials.');
      expect(messages[1].textContent?.trim()).toBe('Invalid credentials.');

      expect(overlayContainer.getContainerElement().querySelector('.ant-drawer')).toBeTruthy();
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      const inputs = overlayContainer.getContainerElement().querySelectorAll('input[nz-input]');
      expect(inputs.length).toBe(4);
      dispatchFakeEvent(inputs[3], 'focusin');
      fixture.detectChanges();
      typeInElement('m', inputs[3] as HTMLInputElement);
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      const errors = overlayContainer.getContainerElement().querySelectorAll('.ant-form-item-explain-error');
      expect(errors.length).toBe(1);
      expect(errors[0].textContent?.trim()).toBe('The password must be at least 16 characters long.');

      const buttons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn[disabled]');
      expect(buttons.length).toBe(1);
      expect(buttons[0].textContent?.trim()).toBe('Submit');

      const inputs = overlayContainer.getContainerElement().querySelectorAll('input[nz-input]');
      expect(inputs.length).toBe(4);
      dispatchFakeEvent(inputs[3], 'focusin');
      fixture.detectChanges();
      typeInElement(environment.testUserPassword, inputs[3] as HTMLInputElement);
      fixture.detectChanges();
      const xButtons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn');
      expect(xButtons.length).toBe(7);
      const signOutConfirmPassword = xButtons[4];
      expect(signOutConfirmPassword.textContent?.trim()).toBe('Close');
      dispatchMouseEvent(signOutConfirmPassword, 'click');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      clickYes(fixture, overlayContainer);
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

    it('should click submit and close buttons work for ConfirmPassword', fakeAsync(() => {
      tick(20);
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
      expect(component.user()?.email).toBe(environment.testUserEmail);
      expect(helpComponent.errors.length).toBe(0);
    }));
  });

  describe('cancel confirm password drawer should open on top of drawer Update Account', () => {
    let TIMEOUT_INTERVAL: number;
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;
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
        imports: [NoopAnimationsModule, TestHelpComponent, ProfileComponent]
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
      fixture = TestBed.createComponent(ProfileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.user()?.email).toBe(environment.testUserEmail);
      expect(overlayContainer.getContainerElement().querySelector('.ant-drawer')).not.toBeTruthy();

      component.createComponentModal('username');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      expectDrawerOpen(fixture, overlayContainer);
      helpComponent.setNeedsRefreshToken();

      const xButtons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn');
      expect(xButtons.length).toBe(4);
      const submitProfile = xButtons[2];
      dispatchMouseEvent(submitProfile, 'click');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      clickYes(fixture, overlayContainer);
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      const inputs = overlayContainer.getContainerElement().querySelectorAll('input[nz-input]');
      expect(inputs.length).toBe(4);
      dispatchFakeEvent(inputs[3], 'focusin');
      fixture.detectChanges();
      typeInElement(environment.testUserPassword, inputs[3] as HTMLInputElement);
      fixture.detectChanges();
      const xButtons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn');
      expect(xButtons.length).toBe(7);
      const closeConfirmPassword = xButtons[4];
      expect(closeConfirmPassword.textContent?.trim()).toBe('Close');
      dispatchMouseEvent(closeConfirmPassword, 'click');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      clickYes(fixture, overlayContainer);
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      expectDrawerOpen(fixture, overlayContainer);

      const xButtons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn');
      expect(xButtons.length).toBe(4);
      const submitProfile = xButtons[2];
      dispatchMouseEvent(submitProfile, 'click');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      clickYes(fixture, overlayContainer);
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      expect(overlayContainer.getContainerElement().querySelector('.ant-drawer')).toBeTruthy();
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      const inputs = overlayContainer.getContainerElement().querySelectorAll('input[nz-input]');
      expect(inputs.length).toBe(4);
      dispatchFakeEvent(inputs[3], 'focusin');
      fixture.detectChanges();
      typeInElement(`${environment.testUserPassword}a`, inputs[3] as HTMLInputElement);
      fixture.detectChanges();
      const xButtons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn');
      expect(xButtons.length).toBe(7);
      const submitConfirmPassword = xButtons[5];
      expect(submitConfirmPassword.textContent?.trim()).toBe('Submit');
      dispatchMouseEvent(submitConfirmPassword, 'click');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      clickYes(fixture, overlayContainer);
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      const xButtons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn[disabled]');
      expect(xButtons.length).toBe(0);
      expect(helpComponent.isAuthenticated()).toBe(true);
      const messages = overlayContainer
        .getContainerElement()
        .querySelectorAll('h5.ant-typography.ant-typography-danger');
      expect(messages.length).toBe(2);
      expect(messages[0].textContent?.trim()).toBe('Invalid credentials.');
      expect(messages[1].textContent?.trim()).toBe('Invalid credentials.');

      expect(overlayContainer.getContainerElement().querySelector('.ant-drawer')).toBeTruthy();
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

    it('should click submit button return invalid error', fakeAsync(() => {
      tick(20);
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
      expect(component.user()?.email).toBe(environment.testUserEmail);
      expect(helpComponent.errors[0]).toBe('Invalid credentials.');
    }));
  });

  describe('confirm password drawer should open on top of drawer Update Account', () => {
    let TIMEOUT_INTERVAL: number;
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;
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
        imports: [NoopAnimationsModule, TestHelpComponent, ProfileComponent]
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
      fixture = TestBed.createComponent(ProfileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.user()?.email).toBe(environment.testUserEmail);
      expect(overlayContainer.getContainerElement().querySelector('.ant-drawer')).not.toBeTruthy();

      component.createComponentModal('username');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      expectDrawerOpen(fixture, overlayContainer);

      helpComponent.setNeedsRefreshToken();

      const xButtons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn');
      expect(xButtons.length).toBe(4);
      const submitProfile = xButtons[2];
      dispatchMouseEvent(submitProfile, 'click');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      clickYes(fixture, overlayContainer);
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      const inputs = overlayContainer.getContainerElement().querySelectorAll('input[nz-input]');
      expect(inputs.length).toBe(4);
      dispatchFakeEvent(inputs[3], 'focusin');
      fixture.detectChanges();
      typeInElement(environment.testUserPassword, inputs[3] as HTMLInputElement);
      fixture.detectChanges();
      const xButtons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn');
      expect(xButtons.length).toBe(7);
      const resetConfirmPasssword = xButtons[6];
      dispatchMouseEvent(resetConfirmPasssword, 'click');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      clickYes(fixture, overlayContainer);
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      const inputs = overlayContainer.getContainerElement().querySelectorAll('input[nz-input]');
      expect(inputs.length).toBe(4);
      dispatchFakeEvent(inputs[3], 'focusin');
      fixture.detectChanges();
      typeInElement(environment.testUserPassword, inputs[3] as HTMLInputElement);
      fixture.detectChanges();
      const xButtons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn');
      expect(xButtons.length).toBe(7);
      const submitConfirmPassword = xButtons[5];
      dispatchMouseEvent(submitConfirmPassword, 'click');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      clickYes(fixture, overlayContainer);
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      expectDrawerOpen(fixture, overlayContainer);

      const inputs = overlayContainer.getContainerElement().querySelectorAll('input[nz-input]');
      expect(inputs.length).toBe(3);
      expect(inputs[0].id.trim()).toBe('username');
      const username = inputs[0];
      dispatchFakeEvent(username, 'focusin');
      fixture.detectChanges();
      typeInElement('m'.repeat(MinUserNameLength - 1), username as HTMLInputElement);
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      const errors = overlayContainer.getContainerElement().querySelectorAll('.ant-form-item-explain-error');
      expect(errors.length).toBe(1);
      expect(errors[0].textContent?.trim()).toBe('The username must be at least 2 characters long.');

      const inputs = overlayContainer.getContainerElement().querySelectorAll('input[nz-input]');
      expect(inputs.length).toBe(3);
      expect(inputs[0].id.trim()).toBe('username');
      const username = inputs[0];
      dispatchFakeEvent(username, 'focusin');
      fixture.detectChanges();
      typeInElement('m'.repeat(MaxUserNameLength + 1), username as HTMLInputElement);
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      expectDrawerOpen(fixture, overlayContainer);

      const errors = overlayContainer.getContainerElement().querySelectorAll('.ant-form-item-explain-error');
      expect(errors.length).toBe(1);
      expect(errors[0].textContent?.trim()).toBe('The username must be at most 100 characters long.');

      const inputs = overlayContainer.getContainerElement().querySelectorAll('input[nz-input]');
      expect(inputs.length).toBe(3);
      expect(inputs[0].id.trim()).toBe('username');
      const username = inputs[0];
      dispatchFakeEvent(username, 'focusin');
      fixture.detectChanges();
      typeInElement(environment.testUserProfile, username as HTMLInputElement);
      fixture.detectChanges();

      const xButtons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn');
      expect(xButtons.length).toBe(4);
      const submitProfile = xButtons[2];
      dispatchMouseEvent(submitProfile, 'click');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      clickYes(fixture, overlayContainer);
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      expect(overlayContainer.getContainerElement().querySelector('.ant-drawer')).toBeTruthy();
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

    it('should click submit button refresh token and return error', fakeAsync(() => {
      tick(20);
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
      expect(component.user()?.email).toBe(environment.testUserEmail);
      expect(helpComponent.errors[0]).toBe('The user name has been taken.');
    }));
  });

  describe('no profile if user is not authenticated', () => {
    let TIMEOUT_INTERVAL: number;
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;
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
        imports: [NoopAnimationsModule, TestHelpComponent, ProfileComponent]
      }).compileComponents();

      helpFixture = TestBed.createComponent(TestHelpComponent);
      helpComponent = helpFixture.componentInstance;

      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(false);
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture = TestBed.createComponent(ProfileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should profile be null and user not authenticated', fakeAsync(() => {
      tick(20);
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(false);
      expect(component.profile()).not.toBeTruthy();
    }));
  });

  describe('has profile if user is authenticated and localStorage.clear()', () => {
    let TIMEOUT_INTERVAL: number;
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;
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
        imports: [NoopAnimationsModule, TestHelpComponent, ProfileComponent]
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

    beforeEach(waitForAsync(() => {
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
      localStorage.clear();

      fixture = TestBed.createComponent(ProfileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should has profile and user authenticated', fakeAsync(() => {
      tick(20);
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
      expect(component.profile()).toBeTruthy();
    }));
  });

  describe('should not activate profile.component when wrong token', () => {
    let TIMEOUT_INTERVAL: number;
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;
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
        imports: [NoopAnimationsModule, TestHelpComponent, ProfileComponent]
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

    beforeEach(waitForAsync(() => {
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
      localStorage.clear();
      helpComponent.setNeedsRefreshToken();
      helpFixture.detectChanges();

      fixture = TestBed.createComponent(ProfileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      expect(component.profile()).not.toBeTruthy();
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should profile be null', fakeAsync(() => {
      tick(20);
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
      expect(component.profile()).not.toBeTruthy();
    }));
  });

  describe('close button should work for drawer Update Account', () => {
    let TIMEOUT_INTERVAL: number;
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;
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
        imports: [NoopAnimationsModule, TestHelpComponent, ProfileComponent]
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
      fixture = TestBed.createComponent(ProfileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.user()?.email).toBe(environment.testUserEmail);
      expect(overlayContainer.getContainerElement().querySelector('.ant-drawer')).not.toBeTruthy();

      component.createComponentModal('username');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      expectDrawerOpen(fixture, overlayContainer);

      const xButtons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn');
      expect(xButtons.length).toBe(4);
      const submitProfile = xButtons[2];
      dispatchMouseEvent(submitProfile, 'click');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      clickYes(fixture, overlayContainer);
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      expect(overlayContainer.getContainerElement().querySelector('.ant-drawer')).toBeTruthy();
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      expectDrawerOpen(fixture, overlayContainer);

      const xButton = overlayContainer.getContainerElement().querySelector('.ant-btn-dangerous');
      expect(xButton).toBeTruthy();
      dispatchMouseEvent(xButton!, 'click');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      clickYes(fixture, overlayContainer);
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      expect(overlayContainer.getContainerElement().querySelector('.ant-drawer')).not.toBeTruthy();
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

    it('should click close button close drawer', fakeAsync(() => {
      tick(20);
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
      expect(component.user()?.email).toBe(environment.testUserEmail);
    }));
  });

  describe('submit button should work for drawer Update Account', () => {
    let TIMEOUT_INTERVAL: number;
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;
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
        imports: [NoopAnimationsModule, TestHelpComponent, ProfileComponent]
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
      fixture = TestBed.createComponent(ProfileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.user()?.email).toBe(environment.testUserEmail);
      expect(overlayContainer.getContainerElement().querySelector('.ant-drawer')).not.toBeTruthy();

      component.createComponentModal('username');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      expectDrawerOpen(fixture, overlayContainer);

      const xButtons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn');
      expect(xButtons.length).toBe(4);
      dispatchMouseEvent(xButtons[2], 'click');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      clickYes(fixture, overlayContainer);
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      expect(overlayContainer.getContainerElement().querySelector('.ant-drawer')).toBeTruthy();
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

    it('should click submit button return error', fakeAsync(() => {
      tick(20);
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
      expect(component.user()?.email).toBe(environment.testUserEmail);
      expect(helpComponent.errors[0]).toBe('The user name has been taken.');
    }));
  });

  describe('reset button should work for drawer Update Account', () => {
    let TIMEOUT_INTERVAL: number;
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;
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
        imports: [NoopAnimationsModule, TestHelpComponent, ProfileComponent]
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
      fixture = TestBed.createComponent(ProfileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.user()?.email).toBe(environment.testUserEmail);
      expect(overlayContainer.getContainerElement().querySelector('.ant-drawer')).not.toBeTruthy();

      component.createComponentModal('username');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      expectDrawerOpen(fixture, overlayContainer);

      const xButtons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn');
      expect(xButtons.length).toBe(4);
      dispatchMouseEvent(xButtons[3], 'click');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      clickYes(fixture, overlayContainer);
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      expect(overlayContainer.getContainerElement().querySelector('.ant-drawer')).toBeTruthy();
      const xButtons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn[disabled]');
      expect(xButtons.length).toBe(1);
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

    it('should click reset button disable submit button', fakeAsync(() => {
      tick(20);
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
      expect(component.user()?.email).toBe(environment.testUserEmail);
    }));
  });

  describe('undo button should work for drawer Update Account', () => {
    let TIMEOUT_INTERVAL: number;
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;
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
        imports: [NoopAnimationsModule, TestHelpComponent, ProfileComponent]
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
      fixture = TestBed.createComponent(ProfileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.user()?.email).toBe(environment.testUserEmail);
      expect(overlayContainer.getContainerElement().querySelector('.ant-drawer')).not.toBeTruthy();

      component.createComponentModal('username');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      expectDrawerOpen(fixture, overlayContainer);

      const xButtons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn');
      expect(xButtons.length).toBe(4);
      dispatchMouseEvent(xButtons[3], 'click');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      clickYes(fixture, overlayContainer);
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      expect(overlayContainer.getContainerElement().querySelector('.ant-drawer')).toBeTruthy();
      const xButton = overlayContainer.getContainerElement().querySelector('.ant-btn[disabled]');
      expect(xButton).toBeTruthy();
      const xButtons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn');
      expect(xButtons.length).toBe(4);
      dispatchMouseEvent(xButtons[0], 'click');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      clickYes(fixture, overlayContainer);
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      expect(overlayContainer.getContainerElement().querySelector('.ant-drawer')).toBeTruthy();
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

    it('should click undo button enable submit button', fakeAsync(() => {
      tick(20);
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
      expect(component.user()?.email).toBe(environment.testUserEmail);
    }));
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

  private readonly loginForm: TypedFormGroup<LoginBodyRequest> = new FormGroup({
    email: new FormControl('', {
      nonNullable: true
    }),
    password: new FormControl('', {
      nonNullable: true
    })
  });

  logout(): void {
    this.#authStore.logout(new HttpErrorResponse({ error: { errors: { securityTokenRefreshRate: true } } }));
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
