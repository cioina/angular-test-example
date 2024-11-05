import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, inject, waitForAsync, flush } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { environment } from '@env/environment';

import { Profile, User } from '@zorro-example-app/api';
import { Errors, NgrxFormsFacade } from '@zorro-example-app/ngrx-forms';
import { NzAvatarComponent } from 'ng-zorro-antd/avatar';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { dispatchMouseEvent } from 'ng-zorro-antd/core/testing';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzSpinComponent } from 'ng-zorro-antd/spin';

import { AuthFacade } from './+state/auth.facade';
import { ProfileComponent } from './profile.component';
import { AppModule } from '../../../../apps/site/src/app/app.module';

describe('profile.component', () => {
  describe('should user be logged on and the drawer open', () => {
    let TIMEOUT_INTERVAL: number;
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;
    let overlayContainer: OverlayContainer;
    let formGroup: FormGroup;

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
        imports: [AppModule]
      }).compileComponents();

      helpFixture = TestBed.createComponent(TestHelpComponent);
      helpComponent = helpFixture.componentInstance;

      helpComponent.ngrxFormsFacade.setData({
        email: environment.testUserEmail,
        password: environment.testUserPassword
      });
      helpComponent.authFacade.login();
      helpFixture.detectChanges();
    }));

    beforeEach(waitForAsync(() => {
      fixture = TestBed.createComponent(ProfileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      expect(component.needModal).toBe(false);
      expect(component.user.email).toBe(environment.testUserEmail);

      component.createComponentModal('username');
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
      const overlayContainerElement = overlayContainer.getContainerElement();
      expect(overlayContainerElement.querySelector('.ant-drawer')!.classList.contains('ant-drawer-open')).toBe(true);

      const buttons = fixture.debugElement.queryAll(By.directive(NzButtonComponent));
      expect(buttons.length).toBe(3);
      expect(buttons[0].nativeElement.firstElementChild!.classList.contains('anticon-audit')).toBe(true);
      expect(buttons[1].nativeElement.firstElementChild!.classList.contains('anticon-audit')).toBe(true);
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

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      component.needModal = true;
      component.createComponentModal('username');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      const modalContentElement = overlayContainer.getContainerElement().querySelector('.ant-modal-content');
      expect(modalContentElement).toBeTruthy();

      const closeButton = overlayContainer.getContainerElement().querySelector('button[nz-modal-close]');
      expect(closeButton).toBeTruthy();

      const buttons = fixture.debugElement.queryAll(By.css('.ant-btn-primary'));
      expect(buttons.length).toBe(2);
      expect(buttons[1]).toBeTruthy();
      const passwordButton = buttons[1].nativeElement;

      expect(passwordButton.classList.contains('ant-btn-loading')).toBe(true);
      expect(passwordButton.firstElementChild!.classList.contains('anticon-loading')).toBe(true);

      formGroup = component.passwordForm;

      formGroup.get('password')!.markAsDirty();
      formGroup.get('password')!.setValue('toSmall');
      formGroup.get('password')!.updateValueAndValidity();

      formGroup.get('password')!.markAsDirty();
      formGroup.get('password')!.setValue(environment.testUserPassword);
      formGroup.get('password')!.updateValueAndValidity();
    }));

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      expect(component.isPasswordFormLoading).toBe(false);
      expect(formGroup.get('password')!.value).toBe(environment.testUserPassword);
      const xButton = overlayContainer.getContainerElement().querySelectorAll('.login-form-button')[0];
      expect(xButton).toBeTruthy;
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    afterEach(inject([OverlayContainer], (currentOverlayContainer: OverlayContainer) => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
      currentOverlayContainer.ngOnDestroy();
      overlayContainer.ngOnDestroy();
    }));

    it('should be logged on', fakeAsync(() => {
      tick(200);
      helpFixture.detectChanges();
      expect(helpComponent.isLoggedOut).toBe(false);
      expect(helpComponent.isLoggedIn).toBe(true);
      expect(helpComponent.profileLoaded).toBe(true);
    }));
  });

  describe('should show confirm password modal', () => {
    let TIMEOUT_INTERVAL: number;
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;
    let localStorageToken: NzSafeAny;
    let overlayContainer: OverlayContainer;

    beforeEach(() => {
      localStorage.removeItem('jwtCioinaToken');
      TIMEOUT_INTERVAL = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 12000;
    });

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TestHelpComponent],
        imports: [AppModule]
      }).compileComponents();

      helpFixture = TestBed.createComponent(TestHelpComponent);
      helpComponent = helpFixture.componentInstance;

      helpFixture.detectChanges();
      helpComponent.ngrxFormsFacade.setData({
        email: environment.testUserEmail,
        password: environment.testUserPassword
      });
      helpComponent.authFacade.login();
      helpFixture.detectChanges();
    }));

    beforeEach(waitForAsync(() => {
      const data = localStorage.getItem('jwtCioinaToken');
      if (data) {
        localStorageToken = JSON.parse(data);
      }

      helpFixture.detectChanges();
      expect(helpComponent.isLoggedIn).toBe(true);
      expect(helpComponent.profile).toBeTruthy();
      expect(helpComponent.profile.username).toBe(localStorageToken.username);

      helpComponent.authFacade.logout();
      helpFixture.detectChanges();
    }));

    beforeEach(waitForAsync(() => {
      expect(localStorageToken.token).not.toBeNull();
      const json = JSON.stringify(localStorageToken);
      localStorage.setItem('jwtCioinaToken', json);

      helpFixture.detectChanges();
      expect(helpComponent.isLoggedIn).toBe(false);

      fixture = TestBed.createComponent(ProfileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.needModal).toBe(true);
      component.createComponentModal('username');
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
      const modalContentElement = overlayContainer.getContainerElement().querySelector('.ant-modal-content');
      expect(modalContentElement).toBeTruthy();

      const closeButton = overlayContainer.getContainerElement().querySelector('button[nz-modal-close]');
      expect(closeButton).toBeTruthy();

      const buttons = fixture.debugElement.queryAll(By.css('.ant-btn-primary'));
      expect(buttons.length).toBe(2);
      expect(buttons[1]).toBeTruthy();
      const passwordButton = buttons[1].nativeElement;

      expect(passwordButton.classList.contains('ant-btn-loading')).toBe(true);
      expect(passwordButton.firstElementChild!.classList.contains('anticon-loading')).toBe(true);

      //const buttonElement = fixture.debugElement.query(By.directive(NzButtonComponent)).nativeElement;
      //expect(buttonElement.classList.contains('ant-btn-loading')).toBe(true);
      //expect(buttonElement.firstElementChild!.classList.contains('anticon-loading')).toBe(true);

      const xButton = overlayContainer.getContainerElement().querySelectorAll('.ant-modal-close')[0];
      expect(xButton).toBeTruthy;
      dispatchMouseEvent(xButton, 'click');

      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
      overlayContainer.ngOnDestroy();
    });

    it('should confirm password modal close', fakeAsync(() => {
      tick(200);
      helpFixture.detectChanges();
      expect(helpComponent.isLoggedIn).toBe(false);
      fixture.detectChanges();
      // See http://mylifeandcode.blogspot.com/2018/05/resolving-n-timers-still-in-queue-error.html
      tick(2000);
      const buttonElement = fixture.debugElement.query(By.directive(NzButtonComponent)).nativeElement;
      expect(buttonElement.classList.contains('ant-btn-loading')).toBe(false);
      expect(buttonElement.firstElementChild!.classList.contains('anticon-loading')).toBe(false);
    }));
  });

  describe('should user be logged on with loginPassword', () => {
    let TIMEOUT_INTERVAL: number;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;
    let localStorageToken: NzSafeAny;

    beforeEach(() => {
      localStorage.removeItem('jwtCioinaToken');
      TIMEOUT_INTERVAL = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 12000;
    });

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TestHelpComponent],
        imports: [AppModule]
      }).compileComponents();

      helpFixture = TestBed.createComponent(TestHelpComponent);
      helpComponent = helpFixture.componentInstance;

      helpFixture.detectChanges();
      helpComponent.ngrxFormsFacade.setData({
        email: environment.testUserEmail,
        password: environment.testUserPassword
      });
      helpComponent.authFacade.login();
      helpFixture.detectChanges();
    }));

    beforeEach(waitForAsync(() => {
      const data = localStorage.getItem('jwtCioinaToken');
      if (data) {
        localStorageToken = JSON.parse(data);
      }

      helpFixture.detectChanges();
      expect(helpComponent.isLoggedOut).toBe(false);
      expect(helpComponent.isLoggedIn).toBe(true);
      expect(helpComponent.profileLoaded).toBe(true);
      expect(helpComponent.profile.username).toBe(localStorageToken.username);

      helpComponent.authFacade.logout();
      helpFixture.detectChanges();
    }));

    beforeEach(waitForAsync(() => {
      expect(localStorageToken.token).not.toBeNull();
      const json = JSON.stringify(localStorageToken);
      localStorage.setItem('jwtCioinaToken', json);

      helpFixture.detectChanges();
      expect(helpComponent.isLoggedOut).toBe(true);
      expect(helpComponent.isLoggedIn).toBe(false);
      expect(helpComponent.profileLoaded).toBe(true);
      expect(helpComponent.profile.username).toBe('');

      helpComponent.ngrxFormsFacade.setData({ password: environment.testUserPassword });
      helpComponent.authFacade.loginPassword();
      helpFixture.detectChanges();
    }));

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should user be logged on', fakeAsync(() => {
      tick(200);
      helpFixture.detectChanges();
      expect(helpComponent.isLoggedOut).toBe(false);
      expect(helpComponent.isLoggedIn).toBe(true);
      expect(helpComponent.profileLoaded).toBe(true);
      expect(helpComponent.profile.username).toBe(localStorageToken.username);
    }));
  });

  describe('should user be logged off when wrong password', () => {
    let TIMEOUT_INTERVAL: number;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;
    let localStorageToken: NzSafeAny;

    beforeEach(() => {
      localStorage.removeItem('jwtCioinaToken');
      TIMEOUT_INTERVAL = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 12000;
    });

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TestHelpComponent],
        imports: [AppModule]
      }).compileComponents();

      helpFixture = TestBed.createComponent(TestHelpComponent);
      helpComponent = helpFixture.componentInstance;

      helpFixture.detectChanges();
      helpComponent.ngrxFormsFacade.setData({
        email: environment.testUserEmail,
        password: environment.testUserPassword
      });
      helpComponent.authFacade.login();
      helpFixture.detectChanges();
    }));

    beforeEach(waitForAsync(() => {
      const data = localStorage.getItem('jwtCioinaToken');
      if (data) {
        localStorageToken = JSON.parse(data);
      }

      helpFixture.detectChanges();
      expect(helpComponent.isLoggedOut).toBe(false);
      expect(helpComponent.isLoggedIn).toBe(true);
      expect(helpComponent.profileLoaded).toBe(true);
      expect(helpComponent.profile.username).toBe(localStorageToken.username);

      helpComponent.authFacade.logout();
      helpFixture.detectChanges();
    }));

    beforeEach(waitForAsync(() => {
      expect(localStorageToken.token).not.toBeNull();
      const json = JSON.stringify(localStorageToken);
      localStorage.setItem('jwtCioinaToken', json);

      helpFixture.detectChanges();
      expect(helpComponent.isLoggedOut).toBe(true);
      expect(helpComponent.isLoggedIn).toBe(false);
      expect(helpComponent.profileLoaded).toBe(true);
      expect(helpComponent.profile.username).toBe('');

      helpComponent.ngrxFormsFacade.setData({ password: 'wrongpassword' });
      helpComponent.authFacade.loginPassword();
      helpFixture.detectChanges();
    }));

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should user be logged off', fakeAsync(() => {
      tick(200);
      helpFixture.detectChanges();
      expect(helpComponent.isLoggedOut).toBe(true);
      expect(helpComponent.isLoggedIn).toBe(false);
      expect(helpComponent.profileLoaded).toBe(true);
      expect(helpComponent.profile.username).toBe('');
      expect(helpComponent.errors[0]).toBe('Invalid credentials.');
    }));
  });

  describe('should not load user profile(canSeeProfile)', () => {
    let TIMEOUT_INTERVAL: number;
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;
    let localStorageToken: NzSafeAny;

    beforeEach(() => {
      localStorage.removeItem('jwtCioinaToken');
      TIMEOUT_INTERVAL = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
    });

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TestHelpComponent],
        imports: [AppModule]
      }).compileComponents();

      helpFixture = TestBed.createComponent(TestHelpComponent);
      helpComponent = helpFixture.componentInstance;

      helpFixture.detectChanges();
      helpComponent.ngrxFormsFacade.setData({
        email: environment.testUserEmail,
        password: environment.testUserPassword
      });
      helpComponent.authFacade.login();
      helpFixture.detectChanges();
    }));

    beforeEach(waitForAsync(() => {
      const data = localStorage.getItem('jwtCioinaToken');
      if (data) {
        localStorageToken = JSON.parse(data);
      }

      helpFixture.detectChanges();
      expect(helpComponent.isLoggedOut).toBe(false);
      expect(helpComponent.isLoggedIn).toBe(true);
      expect(helpComponent.profileLoaded).toBe(true);
      expect(helpComponent.profile.username).toBe(localStorageToken.username);

      helpComponent.authFacade.logout();
      helpFixture.detectChanges();
    }));

    beforeEach(waitForAsync(() => {
      expect(localStorageToken.token).not.toBeNull();
      const json = JSON.stringify(localStorageToken);
      localStorage.setItem('jwtCioinaToken', json);

      helpFixture.detectChanges();
      expect(helpComponent.isLoggedOut).toBe(true);
      expect(helpComponent.isLoggedIn).toBe(false);
      expect(helpComponent.profileLoaded).toBe(true);
      expect(helpComponent.profile.username).toBe('');

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

    it('should user be logged off', fakeAsync(() => {
      tick(200);
      helpFixture.detectChanges();
      expect(helpComponent.isLoggedOut).toBe(true);
      expect(helpComponent.isLoggedIn).toBe(false);
      expect(helpComponent.profileLoaded).toBe(true);
      expect(helpComponent.profile.username).toBe('');

      fixture.detectChanges();
      expect(component.needModal).toBe(true);

      const buttons = fixture.debugElement.queryAll(By.directive(NzButtonComponent));
      expect(buttons.length).toBe(3);
      expect(buttons[0].nativeElement.firstElementChild!.classList.contains('anticon-audit')).toBe(true);
      expect(buttons[1].nativeElement.firstElementChild!.classList.contains('anticon-audit')).toBe(true);
      expect(buttons[2].nativeElement.firstElementChild!.classList.contains('anticon-export')).toBe(true);

      const spin = fixture.debugElement.query(By.directive(NzSpinComponent)); //.nativeElement;
      expect(spin).not.toBeTruthy;
    }));
  });

  describe('should password modal work', () => {
    let TIMEOUT_INTERVAL: number;
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;
    let localStorageToken: NzSafeAny;
    let overlayContainer: OverlayContainer;
    let formGroup: FormGroup;

    beforeEach(() => {
      localStorage.removeItem('jwtCioinaToken');
      TIMEOUT_INTERVAL = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 22000;
    });

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TestHelpComponent],
        imports: [AppModule]
      }).compileComponents();

      helpFixture = TestBed.createComponent(TestHelpComponent);
      helpComponent = helpFixture.componentInstance;

      helpFixture.detectChanges();
      helpComponent.ngrxFormsFacade.setData({
        email: environment.testUserEmail,
        password: environment.testUserPassword
      });
      helpComponent.authFacade.login();
      helpFixture.detectChanges();
    }));

    beforeEach(waitForAsync(() => {
      const data = localStorage.getItem('jwtCioinaToken');
      if (data) {
        localStorageToken = JSON.parse(data);
      }

      helpFixture.detectChanges();
      expect(helpComponent.isLoggedIn).toBe(true);
      expect(helpComponent.profile).toBeTruthy();
      expect(helpComponent.profile.username).toBe(localStorageToken.username);

      helpComponent.authFacade.logout();
      helpFixture.detectChanges();
    }));

    beforeEach(waitForAsync(() => {
      expect(localStorageToken.token).not.toBeNull();
      const json = JSON.stringify(localStorageToken);
      localStorage.setItem('jwtCioinaToken', json);

      helpFixture.detectChanges();
      expect(helpComponent.isLoggedIn).toBe(false);
      expect(helpComponent.profileLoaded).toBe(true);
      helpComponent.authFacade.getProfile(environment.testUserProfile);

      helpFixture.detectChanges();
    }));

    beforeEach(waitForAsync(() => {
      helpFixture.detectChanges();
      expect(helpComponent.isLoggedIn).toBe(false);
      expect(helpComponent.profileLoaded).toBe(true);

      fixture = TestBed.createComponent(ProfileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.needModal).toBe(true);
      component.createComponentModal('username');

      formGroup = component.passwordForm;

      formGroup.get('password')!.markAsDirty();
      formGroup.get('password')!.setValue('toSmall');
      formGroup.get('password')!.updateValueAndValidity();

      formGroup.get('password')!.markAsDirty();
      formGroup.get('password')!.setValue(environment.testUserPassword);
      formGroup.get('password')!.updateValueAndValidity();

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
      const modalContentElement = overlayContainer.getContainerElement().querySelector('.ant-modal-content');
      expect(modalContentElement).toBeTruthy();

      const closeButton = overlayContainer.getContainerElement().querySelector('button[nz-modal-close]');
      expect(closeButton).toBeTruthy();

      const buttons = fixture.debugElement.queryAll(By.css('.ant-btn-primary'));
      expect(buttons.length).toBe(2);
      expect(buttons[1]).toBeTruthy();
      const passwordButton = buttons[1].nativeElement;

      expect(passwordButton.classList.contains('ant-btn-loading')).toBe(true);
      expect(passwordButton.firstElementChild!.classList.contains('anticon-loading')).toBe(true);

      expect(component.isPasswordFormLoading).toBe(false);
      expect(formGroup.get('password')!.value).toBe(environment.testUserPassword);
      const xButton = overlayContainer.getContainerElement().querySelectorAll('.login-form-button')[0];
      expect(xButton).toBeTruthy;
      dispatchMouseEvent(xButton, 'click');
      fixture.detectChanges();
      expect(component.isPasswordFormLoading).toBe(true);
    }));

    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    afterEach(inject([OverlayContainer], (currentOverlayContainer: OverlayContainer) => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
      currentOverlayContainer.ngOnDestroy();
      overlayContainer.ngOnDestroy();
    }));

    it('should be logged on', fakeAsync(() => {
      tick(3000);
      fixture.detectChanges();
      helpFixture.detectChanges();

      const modalContentElement = overlayContainer.getContainerElement().querySelector('.ant-modal-content');
      expect(modalContentElement).not.toBeTruthy();

      const closeButton = overlayContainer.getContainerElement().querySelector('button[nz-modal-close]');
      expect(closeButton).not.toBeTruthy();
      flush();
    }));
  });

  describe('should password modal show error', () => {
    let TIMEOUT_INTERVAL: number;
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;
    let localStorageToken: NzSafeAny;
    let overlayContainer: OverlayContainer;
    let formGroup: FormGroup;

    beforeEach(() => {
      localStorage.removeItem('jwtCioinaToken');
      TIMEOUT_INTERVAL = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 12000;
    });

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TestHelpComponent],
        imports: [AppModule]
      }).compileComponents();

      helpFixture = TestBed.createComponent(TestHelpComponent);
      helpComponent = helpFixture.componentInstance;

      helpFixture.detectChanges();
      helpComponent.ngrxFormsFacade.setData({
        email: environment.testUserEmail,
        password: environment.testUserPassword
      });
      helpComponent.authFacade.login();
      helpFixture.detectChanges();
    }));

    beforeEach(waitForAsync(() => {
      const data = localStorage.getItem('jwtCioinaToken');
      if (data) {
        localStorageToken = JSON.parse(data);
      }

      helpFixture.detectChanges();
      expect(helpComponent.isLoggedIn).toBe(true);
      expect(helpComponent.profile).toBeTruthy();
      expect(helpComponent.profile.username).toBe(localStorageToken.username);

      helpComponent.authFacade.logout();
      helpFixture.detectChanges();
    }));

    beforeEach(waitForAsync(() => {
      expect(localStorageToken.token).not.toBeNull();
      //localStorageToken.token = 'a.b.c';
      const json = JSON.stringify(localStorageToken);
      localStorage.setItem('jwtCioinaToken', json);

      helpFixture.detectChanges();
      expect(helpComponent.isLoggedIn).toBe(false);
      expect(helpComponent.profileLoaded).toBe(true);
      helpComponent.authFacade.getProfile(environment.testUserProfile);

      helpFixture.detectChanges();
    }));

    beforeEach(waitForAsync(() => {
      helpFixture.detectChanges();
      expect(helpComponent.isLoggedIn).toBe(false);
      expect(helpComponent.profileLoaded).toBe(true);

      fixture = TestBed.createComponent(ProfileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.needModal).toBe(true);
      component.createComponentModal('username');

      formGroup = component.passwordForm;

      formGroup.get('password')!.markAsDirty();
      formGroup.get('password')!.setValue('toSmall');
      formGroup.get('password')!.updateValueAndValidity();

      formGroup.get('password')!.markAsDirty();
      formGroup.get('password')!.setValue('wrongIsNotapassword0');
      formGroup.get('password')!.updateValueAndValidity();

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
      const modalContentElement = overlayContainer.getContainerElement().querySelector('.ant-modal-content');
      expect(modalContentElement).toBeTruthy();

      const closeButton = overlayContainer.getContainerElement().querySelector('button[nz-modal-close]');
      expect(closeButton).toBeTruthy();

      const buttons = fixture.debugElement.queryAll(By.css('.ant-btn-primary'));
      expect(buttons.length).toBe(2);
      expect(buttons[1]).toBeTruthy();
      const passwordButton = buttons[1].nativeElement;

      expect(passwordButton.classList.contains('ant-btn-loading')).toBe(true);
      expect(passwordButton.firstElementChild!.classList.contains('anticon-loading')).toBe(true);

      expect(component.isPasswordFormLoading).toBe(false);
      expect(formGroup.get('password')!.value).toBe('wrongIsNotapassword0');
      const xButton = overlayContainer.getContainerElement().querySelectorAll('.login-form-button')[0];
      expect(xButton).toBeTruthy;
      dispatchMouseEvent(xButton, 'click');
      fixture.detectChanges();
      expect(component.isPasswordFormLoading).toBe(true);
    }));

    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    afterEach(inject([OverlayContainer], (currentOverlayContainer: OverlayContainer) => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
      currentOverlayContainer.ngOnDestroy();
      overlayContainer.ngOnDestroy();
    }));

    it('should have error', fakeAsync(() => {
      tick(3000);
      fixture.detectChanges();
      helpFixture.detectChanges();

      expect(helpComponent.errors[0]).toBe('Invalid credentials.');
      expect(component.isPasswordFormLoading).toBe(false);

      const modalContentElement = overlayContainer.getContainerElement().querySelector('.ant-modal-content');
      expect(modalContentElement).toBeTruthy();

      const closeButton = overlayContainer.getContainerElement().querySelector('button[nz-modal-close]');
      expect(closeButton).toBeTruthy();
    }));
  });

  describe('should sign off button work', () => {
    let TIMEOUT_INTERVAL: number;
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;
    let overlayContainer: OverlayContainer;

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
        imports: [AppModule]
      }).compileComponents();

      helpFixture = TestBed.createComponent(TestHelpComponent);
      helpComponent = helpFixture.componentInstance;

      helpFixture.detectChanges();
      helpComponent.ngrxFormsFacade.setData({
        email: environment.testUserEmail,
        password: environment.testUserPassword
      });
      helpComponent.authFacade.login();
      helpFixture.detectChanges();
    }));

    beforeEach(waitForAsync(() => {
      helpFixture.detectChanges();
      expect(helpComponent.isLoggedIn).toBe(true);
      expect(helpComponent.isLoggedOut).toBe(false);

      fixture = TestBed.createComponent(ProfileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.needModal).toBe(false);
      fixture.detectChanges();
      const buttons = fixture.debugElement.queryAll(By.css('.ant-btn-dangerous'));
      expect(buttons[0]).toBeTruthy();
      buttons[0].nativeElement.click();
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

    afterEach(inject([OverlayContainer], (currentOverlayContainer: OverlayContainer) => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
      currentOverlayContainer.ngOnDestroy();
      overlayContainer.ngOnDestroy();
    }));

    it('should user be signed off ', fakeAsync(() => {
      tick(200);
      helpFixture.detectChanges();
      expect(helpComponent.isLoggedOut).toBe(true);
      expect(helpComponent.isLoggedIn).toBe(false);
      expect(helpComponent.profileLoaded).toBe(true);
      expect(helpComponent.profile.username).toBe('');
    }));
  });
});

@Component({})
export class TestHelpComponent implements OnInit, OnDestroy {
  private readonly unsubscribe$: Subject<void> = new Subject();
  isLoggedIn: boolean = false;
  isLoggedOut: boolean = true;
  profileLoaded: boolean = false;
  user: NzSafeAny;
  profile: NzSafeAny;
  errors: string[] = [];

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  ngOnInit(): void {
    this.authFacade.user$?.pipe(takeUntil(this.unsubscribe$)).subscribe((user: User) => {
      this.user = user;
    });

    this.authFacade.isLoggedIn$?.pipe(takeUntil(this.unsubscribe$)).subscribe((isLogged: boolean) => {
      this.isLoggedIn = isLogged;
    });

    this.authFacade.isLoggedOut$?.pipe(takeUntil(this.unsubscribe$)).subscribe((isLogged: boolean) => {
      this.isLoggedOut = isLogged;
    });

    this.ngrxFormsFacade.errors$?.pipe(takeUntil(this.unsubscribe$)).subscribe((e: Errors) => {
      this.errors = Object.keys(e || {}).map(key => `${e[key]}`);
    });

    this.authFacade.profile$?.pipe(takeUntil(this.unsubscribe$)).subscribe((profile: Profile) => {
      this.profile = profile;
    });

    this.authFacade.currentProfileLoaded$?.pipe(takeUntil(this.unsubscribe$)).subscribe((loaded: boolean) => {
      this.profileLoaded = loaded;
    });
  }
  constructor(
    public authFacade: AuthFacade,
    public ngrxFormsFacade: NgrxFormsFacade
  ) {}
}
