/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { Component, OnDestroy, inject, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync, inject as testInject } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MinTitleLength, MaxTitleLength } from '@app/shared/constants';
import { apiPrefixInterceptor, authInterceptor } from '@app/shared/interceptors';
import { LoginBodyRequest } from '@app/shared/services';
import { AuthStore } from '@app/shared/store';
import { TypedFormGroup } from '@app/shared/utils';
import { provideComponentStore } from '@ngrx/component-store';

import { NzButtonComponent } from 'ng-zorro-antd/button';
import { dispatchMouseEvent, dispatchFakeEvent, typeInElement } from 'ng-zorro-antd/core/testing';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import ArticleListingComponent from './article-listing.component';
import { environment } from '../../../environments/environment';

function getTooltipTrigger(overlayContainer: OverlayContainer, index: number): Element {
  return overlayContainer.getContainerElement().querySelectorAll('.ant-popover-buttons button')[index];
}

function clickYes(fixture: ComponentFixture<ArticleListingComponent>, overlayContainer: OverlayContainer): void {
  fixture.detectChanges();
  expect(getTooltipTrigger(overlayContainer, 0).textContent).toContain('No');
  expect(getTooltipTrigger(overlayContainer, 1).textContent).toContain('Yes');
  dispatchMouseEvent(getTooltipTrigger(overlayContainer, 1), 'click');
  fixture.detectChanges();
}

function clickMonacoEditor(
  fixture: ComponentFixture<ArticleListingComponent>,
  component: ArticleListingComponent
): void {
  fixture.detectChanges();
  expect(component.articleList().length).not.toBe(0);
  expect(component.tagList().length).not.toBe(0);
  const buttons = fixture.debugElement.queryAll(By.directive(NzButtonComponent));
  expect(buttons.length).not.toBe(0);
  buttons[5].nativeElement.click();
  fixture.detectChanges();
}

function createComponent(overlayContainer: OverlayContainer): {
  fixture: ComponentFixture<ArticleListingComponent>;
  component: ArticleListingComponent;
} {
  const fixture = TestBed.createComponent(ArticleListingComponent);
  const component = fixture.componentInstance;
  expect(component.user()?.email).toBe(environment.testUserEmail);
  expect(overlayContainer.getContainerElement().querySelector('.ant-drawer')).not.toBeTruthy();
  fixture.detectChanges();
  return {
    fixture,
    component
  };
}

function createHelpComponent(): {
  helpFixture: ComponentFixture<TestHelpComponent>;
  helpComponent: TestHelpComponent;
} {
  const helpFixture = TestBed.createComponent(TestHelpComponent);
  const helpComponent = helpFixture.componentInstance;

  helpFixture.detectChanges();
  expect(helpComponent.isAuthenticated()).toBe(false);

  helpComponent.login({ email: environment.testUserEmail, password: environment.testUserPassword });
  helpFixture.detectChanges();
  return {
    helpFixture,
    helpComponent
  };
}

function expectDrawerOpen(
  fixture: ComponentFixture<ArticleListingComponent>,
  overlayContainer: OverlayContainer
): void {
  fixture.detectChanges();
  expect(
    overlayContainer.getContainerElement().querySelector('.ant-drawer')!.classList.contains('ant-drawer-open')
  ).toBe(true);
  const buttons = fixture.debugElement.queryAll(By.directive(NzButtonComponent));
  expect(buttons.length).not.toBe(0);
  expect(buttons[2].nativeElement.firstElementChild!.classList.contains('anticon-loading')).toBe(true);

  const typography = overlayContainer.getContainerElement().querySelector('.ant-typography');
  expect(typography).toBeTruthy();
  expect(typography?.textContent?.trim()).toBe('Edit Article');
}

describe('article-listing-monaco-editor.component', () => {
  describe('Load Monaco Editor should fail for the first time, but should work for next tests', () => {
    let TIMEOUT_INTERVAL: number;
    let component: ArticleListingComponent;
    let fixture: ComponentFixture<ArticleListingComponent>;
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
        imports: [NoopAnimationsModule, TestHelpComponent, ArticleListingComponent]
      }).compileComponents();

      const h = createHelpComponent();
      helpFixture = h.helpFixture;
      helpComponent = h.helpComponent;
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
      const c = createComponent(overlayContainer);
      fixture = c.fixture;
      component = c.component;
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      clickMonacoEditor(fixture, component);
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      expectDrawerOpen(fixture, overlayContainer);

      const xButtons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn');
      expect(xButtons.length).toBe(5);
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

    it('should retrun Timeout - Async function did not complete within 12000ms', fakeAsync(() => {
      tick(20);
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
      expect(component.user()?.email).toBe(environment.testUserEmail);
    }));
  });

  describe('Monaco Editor form validation should work for drawer Edit Article', () => {
    let TIMEOUT_INTERVAL: number;
    let component: ArticleListingComponent;
    let fixture: ComponentFixture<ArticleListingComponent>;
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
        imports: [NoopAnimationsModule, TestHelpComponent, ArticleListingComponent]
      }).compileComponents();

      const h = createHelpComponent();
      helpFixture = h.helpFixture;
      helpComponent = h.helpComponent;
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
      const c = createComponent(overlayContainer);
      fixture = c.fixture;
      component = c.component;
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      clickMonacoEditor(fixture, component);
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      expectDrawerOpen(fixture, overlayContainer);

      const xButtons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn');
      expect(xButtons.length).toBe(5);
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();

      const inputs = overlayContainer.getContainerElement().querySelectorAll('textarea.ant-input');
      expect(inputs.length).toBe(2);
      dispatchFakeEvent(inputs[0], 'focusin');
      fixture.detectChanges();
      typeInElement('m'.repeat(MinTitleLength - 1), inputs[0] as HTMLInputElement);
      fixture.detectChanges();
      dispatchFakeEvent(inputs[1], 'focusin');
      fixture.detectChanges();
      typeInElement('m'.repeat(MinTitleLength - 1), inputs[1] as HTMLInputElement);
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      const errors = overlayContainer.getContainerElement().querySelectorAll('.ant-form-item-explain-error');
      expect(errors.length).toBe(2);
      expect(errors[0].textContent?.trim()).toBe('The slug must be at least 2 characters long.');
      expect(errors[1].textContent?.trim()).toBe('The title must be at least 2 characters long.');
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();

      const inputs = overlayContainer.getContainerElement().querySelectorAll('textarea.ant-input');
      expect(inputs.length).toBe(2);
      dispatchFakeEvent(inputs[0], 'focusin');
      fixture.detectChanges();
      typeInElement('m'.repeat(MaxTitleLength + 1), inputs[0] as HTMLInputElement);
      fixture.detectChanges();
      dispatchFakeEvent(inputs[1], 'focusin');
      fixture.detectChanges();
      typeInElement('m'.repeat(MaxTitleLength + 1), inputs[1] as HTMLInputElement);
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      expectDrawerOpen(fixture, overlayContainer);

      const errors = overlayContainer.getContainerElement().querySelectorAll('.ant-form-item-explain-error');
      expect(errors.length).toBe(2);
      expect(errors[0].textContent?.trim()).toBe('The slug must be at most 320 characters long.');
      expect(errors[1].textContent?.trim()).toBe('The title must be at most 320 characters long.');

      const xButtons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn');
      expect(xButtons.length).toBe(5);
      fixture.detectChanges();
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

    it('should form textarea validation work', fakeAsync(() => {
      tick(20);
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
      expect(component.user()?.email).toBe(environment.testUserEmail);
    }));
  });

  describe('Monaco Editor undo and close button should work for drawer Edit Article', () => {
    let TIMEOUT_INTERVAL: number;
    let component: ArticleListingComponent;
    let fixture: ComponentFixture<ArticleListingComponent>;
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
        imports: [NoopAnimationsModule, TestHelpComponent, ArticleListingComponent]
      }).compileComponents();

      const h = createHelpComponent();
      helpFixture = h.helpFixture;
      helpComponent = h.helpComponent;
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
      const c = createComponent(overlayContainer);
      fixture = c.fixture;
      component = c.component;
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      clickMonacoEditor(fixture, component);
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      expectDrawerOpen(fixture, overlayContainer);

      const xButtons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn');
      expect(xButtons.length).toBe(5);
      const undo = xButtons[1];
      expect(undo.textContent?.trim()).toBe('Undo');
      dispatchMouseEvent(undo, 'click');

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

      const xButtons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn');
      expect(xButtons.length).toBe(5);
      const close = xButtons[2];
      expect(close.textContent?.trim()).toBe('Close');
      dispatchMouseEvent(close, 'click');

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

    it('should click undo and close button work', fakeAsync(() => {
      tick(20);
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
      expect(component.user()?.email).toBe(environment.testUserEmail);
    }));
  });

  describe('Monaco Editor submit and close button should work for drawer Edit Article', () => {
    let TIMEOUT_INTERVAL: number;
    let component: ArticleListingComponent;
    let fixture: ComponentFixture<ArticleListingComponent>;
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
        imports: [NoopAnimationsModule, TestHelpComponent, ArticleListingComponent]
      }).compileComponents();

      const h = createHelpComponent();
      helpFixture = h.helpFixture;
      helpComponent = h.helpComponent;
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
      const c = createComponent(overlayContainer);
      fixture = c.fixture;
      component = c.component;
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      clickMonacoEditor(fixture, component);
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      const inputs = overlayContainer.getContainerElement().querySelectorAll('textarea.ant-input');
      expect(inputs.length).toBe(2);
      dispatchFakeEvent(inputs[0], 'focusin');
      fixture.detectChanges();
      typeInElement('dotnet-core-testing', inputs[0] as HTMLInputElement);
      fixture.detectChanges();
      dispatchFakeEvent(inputs[1], 'focusin');
      fixture.detectChanges();
      typeInElement('value', inputs[1] as HTMLInputElement);
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      expectDrawerOpen(fixture, overlayContainer);

      const xButtons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn');
      expect(xButtons.length).toBe(5);
      const submit = xButtons[3];
      expect(submit.textContent?.trim()).toBe('Submit');
      dispatchMouseEvent(submit, 'click');
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

      const xButtons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn');
      expect(xButtons.length).toBe(5);
      const submit = xButtons[2];
      expect(submit.textContent?.trim()).toBe('Close');
      dispatchMouseEvent(submit, 'click');
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

    it('should click submit and close button work', fakeAsync(() => {
      tick(20);
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
      expect(component.user()?.email).toBe(environment.testUserEmail);
    }));
  });

  describe('Monaco Editor submit button should work for drawer Edit Article', () => {
    let TIMEOUT_INTERVAL: number;
    let component: ArticleListingComponent;
    let fixture: ComponentFixture<ArticleListingComponent>;
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
        imports: [NoopAnimationsModule, TestHelpComponent, ArticleListingComponent]
      }).compileComponents();

      const h = createHelpComponent();
      helpFixture = h.helpFixture;
      helpComponent = h.helpComponent;
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
      const c = createComponent(overlayContainer);
      fixture = c.fixture;
      component = c.component;
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      clickMonacoEditor(fixture, component);
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      expectDrawerOpen(fixture, overlayContainer);

      const xButtons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn');
      expect(xButtons.length).toBe(5);
      const submit = xButtons[3];
      expect(submit.textContent?.trim()).toBe('Submit');
      dispatchMouseEvent(submit, 'click');
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

    it('should click submit and close button work', fakeAsync(() => {
      tick(20);
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
      expect(component.user()?.email).toBe(environment.testUserEmail);
    }));
  });

  describe('Monaco Editor confirm password drawer should open on top of drawer Create/Edit Article', () => {
    let TIMEOUT_INTERVAL: number;
    let component: ArticleListingComponent;
    let fixture: ComponentFixture<ArticleListingComponent>;
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
        imports: [NoopAnimationsModule, TestHelpComponent, ArticleListingComponent]
      }).compileComponents();

      const h = createHelpComponent();
      helpFixture = h.helpFixture;
      helpComponent = h.helpComponent;
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
      const c = createComponent(overlayContainer);
      fixture = c.fixture;
      component = c.component;
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      clickMonacoEditor(fixture, component);
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      const inputs = overlayContainer.getContainerElement().querySelectorAll('textarea.ant-input');
      expect(inputs.length).toBe(2);
      dispatchFakeEvent(inputs[0], 'focusin');
      fixture.detectChanges();
      typeInElement('dotnet-core-testing', inputs[0] as HTMLInputElement);
      fixture.detectChanges();
      dispatchFakeEvent(inputs[1], 'focusin');
      fixture.detectChanges();
      typeInElement('value', inputs[1] as HTMLInputElement);
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      helpComponent.setNeedsRefreshToken();
      expectDrawerOpen(fixture, overlayContainer);

      const xButtons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn');
      expect(xButtons.length).toBe(5);
      const submit = xButtons[3];
      expect(submit.textContent?.trim()).toBe('Submit');
      dispatchMouseEvent(submit, 'click');

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
      expect(inputs.length).toBe(1);
      dispatchFakeEvent(inputs[0], 'focusin');
      fixture.detectChanges();
      typeInElement(`${environment.testUserPassword}a`, inputs[0] as HTMLInputElement);
      fixture.detectChanges();
      const xButtons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn');
      expect(xButtons.length).toBe(8);
      const submitConfirmPassword = xButtons[6];
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
      const messages = overlayContainer
        .getContainerElement()
        .querySelectorAll('.ant-typography.ant-typography-danger.ng-star-inserted');
      expect(messages.length).toBe(4);
      expect(messages[3].textContent?.trim()).toBe('Invalid credentials.');
      const inputs = overlayContainer.getContainerElement().querySelectorAll('input[nz-input]');
      expect(inputs.length).toBe(1);
      dispatchFakeEvent(inputs[0], 'focusin');
      fixture.detectChanges();
      typeInElement(environment.testUserPassword, inputs[0] as HTMLInputElement);
      fixture.detectChanges();
      const xButtons = overlayContainer.getContainerElement().querySelectorAll('.ant-btn');
      expect(xButtons.length).toBe(8);
      const submitConfirmPassword = xButtons[6];
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

    afterEach(
      testInject([OverlayContainer], (currentOverlayContainer: OverlayContainer) => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
        currentOverlayContainer.ngOnDestroy();
        overlayContainer.ngOnDestroy();
      })
    );

    it('should click submit button should show confirm password', fakeAsync(() => {
      tick(20);
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
      expect(component.user()?.email).toBe(environment.testUserEmail);
    }));
  });
});

@Component({})
export class TestHelpComponent implements OnDestroy {
  readonly #authStore = inject(AuthStore);
  readonly isAuthenticated = this.#authStore.selectors.isAuthenticated;
  readonly isLoading = signal<boolean>(false);
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
}
