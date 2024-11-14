import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject, Injector, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, AbstractControl } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { apiPrefixInterceptor, authInterceptor } from '@app/shared/interceptors';
import { ErrorResponse } from '@app/shared/models';
import { LoginBodyRequest } from '@app/shared/services';
import { UpsertArticleBodyRequest } from '@app/shared/services/article.service';
import { AuthStore } from '@app/shared/store';
import { TypedFormGroup } from '@app/shared/utils';

import { provideComponentStore } from '@ngrx/component-store';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { ArticleListingStore } from './article-listing.store';
import { environment } from '../../../environments/environment';

describe('article-listing.store', () => {
  describe('articleForm validation errors ', () => {
    let TIMEOUT_INTERVAL: number;
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
        imports: [NoopAnimationsModule, TestHelpComponent]
      }).compileComponents();

      helpFixture = TestBed.createComponent(TestHelpComponent);
      helpComponent = helpFixture.componentInstance;

      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(false);

      helpComponent.articleForm.patchValue({ slug: 'a', title: 'a', description: 'a', published: false });

      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should patchValue return form validation errors', fakeAsync(() => {
      tick(20);
      helpFixture.detectChanges();
      expect(helpComponent.articleForm.get('slug')!.errors).toBeTruthy();
      expect(helpComponent.articleForm.get('title')!.errors).toBeTruthy();
      expect(helpComponent.articleForm.get('description')!.errors).toBeTruthy();
    }));
  });

  describe('createArticle 1', () => {
    let TIMEOUT_INTERVAL: number;
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
        imports: [NoopAnimationsModule, TestHelpComponent]
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
      helpComponent.createArticle(
        { slug: 'dotnet-core-testing', title: 'title1', description: 'description1', published: false },
        false
      );
      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should createArticle return validation error', fakeAsync(() => {
      tick(20);
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);

      expect(helpComponent.articleForm.get('slug')!.errors).not.toBeTruthy();
      expect(helpComponent.articleForm.get('title')!.errors).not.toBeTruthy();
      expect(helpComponent.articleForm.get('description')!.errors).not.toBeTruthy();

      expect(helpComponent.articleListingStoreErrors.length).toBe(1);
      expect(helpComponent.articleListingStoreErrors[0]).toBe(`'Article Json Title' must be unique.`);
    }));
  });

  describe('createArticle 2', () => {
    let TIMEOUT_INTERVAL: number;
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
        imports: [NoopAnimationsModule, TestHelpComponent]
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
      helpComponent.createArticle(
        { slug: 'dotnet-core-testing', title: 'title0', description: 'description0', published: false },
        false
      );

      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should createArticle return duplicate error', fakeAsync(() => {
      tick(20);
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);

      expect(helpComponent.articleForm.get('slug')!.errors).not.toBeTruthy();
      expect(helpComponent.articleForm.get('title')!.errors).not.toBeTruthy();
      expect(helpComponent.articleForm.get('description')!.errors).not.toBeTruthy();

      expect(helpComponent.articleListingStoreErrors.length).toBe(1);
      expect(helpComponent.articleListingStoreErrors[0]).toBe(
        `Cannot insert duplicate key row in object 'dbo.Articles' with unique index 'IX_Articles_Slug'. The duplicate key value is (dotnet-core-testing).`
      );
    }));
  });

  describe('setNeedsRefreshToken', () => {
    let TIMEOUT_INTERVAL: number;
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
        imports: [NoopAnimationsModule, TestHelpComponent]
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
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      helpFixture.detectChanges();
      helpComponent.createArticle(
        { slug: 'dotnet-core-testing', title: 'title0', description: 'description0', published: false },
        false
      );

      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should setNeedsRefreshToken return error', fakeAsync(() => {
      tick(20);
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(true);
      expect(helpComponent.articleListingStoreErrors[0]).toBe('Please refresh your JWT token');
    }));
  });
});

@Component({
  providers: [provideComponentStore(ArticleListingStore)],
  standalone: true
})
export class TestHelpComponent implements OnInit, OnDestroy {
  readonly #authStore = inject(AuthStore);
  readonly authStoreError = this.#authStore.selectors.errorResponse;
  readonly isAuthenticated = this.#authStore.selectors.isAuthenticated;
  readonly #articleListingStore = inject(ArticleListingStore);

  readonly articleListConfig = this.#authStore.selectors.articleListConfig;
  readonly articleCount = this.#articleListingStore.selectors.articleCount;
  readonly articleList = this.#articleListingStore.selectors.articleList;
  readonly tagList = this.#articleListingStore.selectors.tags;
  readonly articleListingStoreError = this.#articleListingStore.selectors.errorResponse;
  readonly isLoading = signal<boolean>(false);
  private injector = inject(Injector);
  authStoreErrors: string[] = [];
  articleListingStoreErrors: string[] = [];

  private readonly MinTitleLength = 2;
  private readonly MaxTitleLength = 320;
  private readonly MinDescriptionLength = 2;
  private readonly MaxDescriptionLength = 200000;

  private readonly titleValidator = (control: AbstractControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { error: true, required: true };
    } else if (control.value.length < this.MinTitleLength) {
      return { error: true, min: true };
    } else if (control.value.length > this.MaxTitleLength) {
      return { error: true, max: true };
    }
    return {};
  };
  private readonly descriptionValidator = (control: AbstractControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { error: true, required: true };
    } else if (control.value.length < this.MinDescriptionLength) {
      return { error: true, min: true };
    } else if (control.value.length > this.MaxDescriptionLength) {
      return { error: true, max: true };
    }
    return {};
  };
  readonly articleForm: TypedFormGroup<UpsertArticleBodyRequest> = new FormGroup({
    slug: new FormControl('', {
      nonNullable: true,
      validators: [this.titleValidator]
    }),
    title: new FormControl('', {
      nonNullable: true,
      validators: [this.titleValidator]
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [this.descriptionValidator]
    }),
    published: new FormControl<boolean>(false, {
      nonNullable: true
    })
  });

  createArticle(articleData: UpsertArticleBodyRequest, published: boolean): void {
    if (this.isLoading()) {
      return;
    }
    this.isLoading.set(true);
    this.articleForm.patchValue(articleData);
    this.#articleListingStore.createArticle({
      loading: this.isLoading,
      form: this.articleForm,
      published: published
    });
  }

  editArticle(articleId: number, articleData: UpsertArticleBodyRequest, published: boolean): void {
    if (this.isLoading()) {
      return;
    }
    this.isLoading.set(true);
    this.articleForm.patchValue(articleData);
    this.#articleListingStore.editArticle({
      loading: this.isLoading,
      form: this.articleForm,
      articleId: articleId,
      published: published
    });
  }

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
    let user = this.#authStore.selectors.user();
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
    toObservable(this.articleListingStoreError, { injector: this.injector }).subscribe(
      (errorResponse: ErrorResponse | null) => {
        if (errorResponse) {
          this.articleListingStoreErrors = Object.keys(errorResponse.errors || {}).map(
            key => `${errorResponse.errors[key]}`
          );
        } else {
          this.articleListingStoreErrors = [];
        }
      }
    );

    toObservable(this.authStoreError, { injector: this.injector }).subscribe((errorResponse: ErrorResponse | null) => {
      if (errorResponse) {
        this.authStoreErrors = Object.keys(errorResponse.errors || {}).map(key => `${errorResponse.errors[key]}`);
      } else {
        this.authStoreErrors = [];
      }
    });
  }
}
