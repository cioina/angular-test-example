import { OverlayContainer } from '@angular/cdk/overlay';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { Component, OnDestroy, inject, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync, inject as testInject } from '@angular/core/testing';
import { FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

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

describe('article-listing.component', () => {
  describe('close button should work for drawer Article Tags', () => {
    let TIMEOUT_INTERVAL: number;
    let component: ArticleListingComponent;
    let fixture: ComponentFixture<ArticleListingComponent>;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;
    let overlayContainer: OverlayContainer;

    function getTooltipTrigger(index: number): Element {
      return overlayContainer.getContainerElement().querySelectorAll('.ant-popover-buttons button')[index];
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
        imports: [NoopAnimationsModule, TestHelpComponent, ArticleListingComponent]
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
      fixture = TestBed.createComponent(ArticleListingComponent);
      component = fixture.componentInstance;
      expect(component.user()?.email).toBe(environment.testUserEmail);
      const overlayContainerElement = overlayContainer.getContainerElement();
      expect(overlayContainerElement.querySelector('.ant-drawer')).not.toBeTruthy();
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      const buttons = fixture.debugElement.queryAll(By.directive(NzButtonComponent));
      expect(buttons.length).not.toBe(0);
      buttons[1].nativeElement.click();
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      const overlayContainerElement = overlayContainer.getContainerElement();
      expect(overlayContainerElement.querySelector('.ant-drawer')!.classList.contains('ant-drawer-open')).toBe(true);
      const buttons = fixture.debugElement.queryAll(By.directive(NzButtonComponent));
      expect(buttons.length).not.toBe(0);
      expect(buttons[1].nativeElement.firstElementChild!.classList.contains('anticon-loading')).toBe(true);

      const typography = overlayContainer.getContainerElement().querySelector('.ant-typography');
      expect(typography).toBeTruthy();
      expect(typography?.textContent?.trim()).toBe('Article Tags');

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

    it('should click close button close drawer Article Tags', fakeAsync(() => {
      tick(200);
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
      expect(component.user()?.email).toBe(environment.testUserEmail);
    }));
  });

  describe('close button should work for drawer New Article', () => {
    let TIMEOUT_INTERVAL: number;
    let component: ArticleListingComponent;
    let fixture: ComponentFixture<ArticleListingComponent>;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;
    let overlayContainer: OverlayContainer;

    function getTooltipTrigger(index: number): Element {
      return overlayContainer.getContainerElement().querySelectorAll('.ant-popover-buttons button')[index];
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
        imports: [NoopAnimationsModule, TestHelpComponent, ArticleListingComponent]
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
      fixture = TestBed.createComponent(ArticleListingComponent);
      component = fixture.componentInstance;
      expect(component.user()?.email).toBe(environment.testUserEmail);
      const overlayContainerElement = overlayContainer.getContainerElement();
      expect(overlayContainerElement.querySelector('.ant-drawer')).not.toBeTruthy();
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      const buttons = fixture.debugElement.queryAll(By.directive(NzButtonComponent));
      expect(buttons.length).not.toBe(0);
      buttons[2].nativeElement.click();
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      const overlayContainerElement = overlayContainer.getContainerElement();
      expect(overlayContainerElement.querySelector('.ant-drawer')!.classList.contains('ant-drawer-open')).toBe(true);
      const buttons = fixture.debugElement.queryAll(By.directive(NzButtonComponent));
      expect(buttons.length).not.toBe(0);
      expect(buttons[2].nativeElement.firstElementChild!.classList.contains('anticon-loading')).toBe(true);

      const typography = overlayContainer.getContainerElement().querySelector('.ant-typography');
      expect(typography).toBeTruthy();
      expect(typography?.textContent?.trim()).toBe('New Article');

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

    it('should click close button close drawer New Article', fakeAsync(() => {
      tick(200);
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
      expect(component.user()?.email).toBe(environment.testUserEmail);
    }));
  });

  describe('submit button should work for drawer New Article', () => {
    let TIMEOUT_INTERVAL: number;
    let component: ArticleListingComponent;
    let fixture: ComponentFixture<ArticleListingComponent>;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;
    let overlayContainer: OverlayContainer;

    function getTooltipTrigger(index: number): Element {
      return overlayContainer.getContainerElement().querySelectorAll('.ant-popover-buttons button')[index];
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
        imports: [NoopAnimationsModule, TestHelpComponent, ArticleListingComponent]
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
      fixture = TestBed.createComponent(ArticleListingComponent);
      component = fixture.componentInstance;
      expect(component.user()?.email).toBe(environment.testUserEmail);
      const overlayContainerElement = overlayContainer.getContainerElement();
      expect(overlayContainerElement.querySelector('.ant-drawer')).not.toBeTruthy();
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      expect(component.articleList().length).not.toBe(0);
      expect(component.tagList().length).not.toBe(0);
      const buttons = fixture.debugElement.queryAll(By.directive(NzButtonComponent));
      expect(buttons.length).not.toBe(0);
      buttons[2].nativeElement.click();
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      const overlayContainerElement = overlayContainer.getContainerElement();
      expect(overlayContainerElement.querySelector('.ant-drawer')!.classList.contains('ant-drawer-open')).toBe(true);
      const buttons = fixture.debugElement.queryAll(By.directive(NzButtonComponent));
      expect(buttons.length).not.toBe(0);
      expect(buttons[2].nativeElement.firstElementChild!.classList.contains('anticon-loading')).toBe(true);

      const typography = overlayContainer.getContainerElement().querySelector('.ant-typography');
      expect(typography).toBeTruthy();
      expect(typography?.textContent?.trim()).toBe('New Article');

      const inputs = overlayContainer.getContainerElement().querySelectorAll('textarea.ant-input');
      expect(inputs.length).toBe(3);
      dispatchFakeEvent(inputs[0], 'focusin');
      fixture.detectChanges();
      typeInElement('dotnet-core-testing', inputs[0] as HTMLInputElement);
      fixture.detectChanges();
      dispatchFakeEvent(inputs[1], 'focusin');
      fixture.detectChanges();
      typeInElement('value', inputs[1] as HTMLInputElement);
      fixture.detectChanges();
      dispatchFakeEvent(inputs[2], 'focusin');
      fixture.detectChanges();
      typeInElement('value', inputs[2] as HTMLInputElement);
      fixture.detectChanges();
      const xButtons = overlayContainerElement.querySelectorAll('.ant-btn');
      expect(xButtons.length).toBe(3);

      dispatchMouseEvent(xButtons[1], 'click');
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

    it('should click submit button return error', fakeAsync(() => {
      tick(200);
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
      fixture.detectChanges();
      const errors = Object.keys(component.errorResponse()?.errors || {}).map(
        key => `${component.errorResponse()!.errors[key]}`
      );
      expect(errors[0]).toBe(
        `Cannot insert duplicate key row in object 'dbo.Articles' with unique index 'IX_Articles_Slug'. The duplicate key value is (dotnet-core-testing).`
      );
      expect(component.user()?.email).toBe(environment.testUserEmail);
    }));
  });
});

@Component({
  standalone: true
})
export class TestHelpComponent implements OnDestroy {
  readonly #authStore = inject(AuthStore);
  readonly isAuthenticated = this.#authStore.selectors.isAuthenticated;
  readonly isLoading = signal<boolean>(false);
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
    this.isLoading.set(true);
    this.loginForm.patchValue(loginData);
    this.#authStore.login({ loading: this.isLoading, form: this.loginForm });
  }

  ngOnDestroy(): void {
    this.#authStore.resetErrorResponse();
  }
}
