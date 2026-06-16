/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject, Injector, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { apiPrefixInterceptor, authInterceptor } from '@app/shared/interceptors';
import { ErrorResponse, Tag, TagFilter } from '@app/shared/models';
import { ArticleGlobalQueryParams } from '@app/shared/services';
import { AuthStore } from '@app/shared/store';
import { provideComponentStore } from '@ngrx/component-store';

import { provideNzNoAnimation } from 'ng-zorro-antd/core/animation';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { HomeStore } from './home.store';

function createHelpComponent(): {
  helpFixture: ComponentFixture<TestHelpComponent>;
  helpComponent: TestHelpComponent;
} {
  const helpFixture = TestBed.createComponent(TestHelpComponent);
  const helpComponent = helpFixture.componentInstance;

  helpFixture.detectChanges();
  expect(helpComponent.isAuthenticated()).toBe(false);

  return {
    helpFixture,
    helpComponent
  };
}

function compileComponents(): void {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([apiPrefixInterceptor, authInterceptor])),
      provideNzIconsTesting(),
      provideNzNoAnimation(),
      provideComponentStore(AuthStore),
      NzDrawerService
    ],
    imports: [TestHelpComponent]
  }).compileComponents();
}

function jasmineTimeoutInterval(n: number): number {
  localStorage.clear();
  const i = jasmine.DEFAULT_TIMEOUT_INTERVAL;
  jasmine.DEFAULT_TIMEOUT_INTERVAL = n;
  return i;
}

describe('home.store', () => {
  describe('queryArticle function 1', () => {
    let TIMEOUT_INTERVAL: number;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;

    beforeEach(() => {
      TIMEOUT_INTERVAL = jasmineTimeoutInterval(12_000);
    });
    beforeEach(waitForAsync(() => {
      compileComponents();
      const h = createHelpComponent();
      helpFixture = h.helpFixture;
      helpComponent = h.helpComponent;
      helpComponent.getArticles({
        limit: helpComponent.articleListConfig().filters.limit,
        offset: helpComponent.articleListConfig().filters.offset
      });
      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should getArticles return articles and total', () => {
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(false);
      expect(helpComponent.articleList()?.length).not.toBe(0);
      expect(helpComponent.articleCount()).not.toBe(0);
    });
  });

  describe('queryArticle function 2', () => {
    let TIMEOUT_INTERVAL: number;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;

    beforeEach(() => {
      TIMEOUT_INTERVAL = jasmineTimeoutInterval(12_000);
    });
    beforeEach(waitForAsync(() => {
      compileComponents();
      const h = createHelpComponent();
      helpFixture = h.helpFixture;
      helpComponent = h.helpComponent;
      helpComponent.getArticles({
        limit: helpComponent.articleListConfig().filters.limit,
        offset: 1000
      });
      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should getArticles return zero articles and total', () => {
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(false);
      expect(helpComponent.articleList()?.length).toBe(0);
      expect(helpComponent.articleCount()).not.toBe(0);
    });
  });

  describe('queryArticle function 3', () => {
    let TIMEOUT_INTERVAL: number;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;

    beforeEach(() => {
      TIMEOUT_INTERVAL = jasmineTimeoutInterval(12_000);
    });
    beforeEach(waitForAsync(() => {
      compileComponents();
      const h = createHelpComponent();
      helpFixture = h.helpFixture;
      helpComponent = h.helpComponent;
      helpComponent.getArticles({
        limit: 1,
        offset: helpComponent.articleListConfig().filters.offset
      });
      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should getArticles return one article and total', () => {
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(false);
      expect(helpComponent.articleList()?.length).toBe(1);
      expect(helpComponent.articleCount()).not.toBe(0);
    });
  });

  describe('queryArticle function 4', () => {
    let TIMEOUT_INTERVAL: number;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;

    beforeEach(() => {
      TIMEOUT_INTERVAL = jasmineTimeoutInterval(12_000);
    });
    beforeEach(waitForAsync(() => {
      compileComponents();
      const h = createHelpComponent();
      helpFixture = h.helpFixture;
      helpComponent = h.helpComponent;
      helpComponent.getArticles({
        limit: 1000,
        offset: 1
      });
      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should getArticles return rest articles and total', () => {
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(false);
      expect(helpComponent.articleList()?.length).toBe(helpComponent.articleCount() - 1);
      expect(helpComponent.articleCount()).not.toBe(0);
    });
  });

  describe('queryArticle function 5', () => {
    let TIMEOUT_INTERVAL: number;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;

    beforeEach(() => {
      TIMEOUT_INTERVAL = jasmineTimeoutInterval(12_000);
    });
    beforeEach(waitForAsync(() => {
      compileComponents();
      const h = createHelpComponent();
      helpFixture = h.helpFixture;
      helpComponent = h.helpComponent;
      helpComponent.getArticles({
        limit: 1000,
        offset: 0,
        tags: [3]
      });
      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should getArticles return 2 articles and total equals 2', () => {
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(false);
      expect(helpComponent.articleList()?.length).toBe(2);
      expect(helpComponent.articleCount()).toBe(2);
    });
  });

  describe('queryArticle function 6', () => {
    let TIMEOUT_INTERVAL: number;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;

    beforeEach(() => {
      TIMEOUT_INTERVAL = jasmineTimeoutInterval(12_000);
    });
    beforeEach(waitForAsync(() => {
      compileComponents();
      const h = createHelpComponent();
      helpFixture = h.helpFixture;
      helpComponent = h.helpComponent;
      helpComponent.getArticles({
        limit: 1000,
        offset: 0,
        tags: [1]
      });
      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should getArticles return zero articles and total equals zero', () => {
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(false);
      expect(helpComponent.articleList()?.length).toBe(0);
      expect(helpComponent.articleCount()).toBe(0);
    });
  });

  describe('queryArticle function 7', () => {
    let TIMEOUT_INTERVAL: number;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;

    beforeEach(() => {
      TIMEOUT_INTERVAL = jasmineTimeoutInterval(12_000);
    });
    beforeEach(waitForAsync(() => {
      compileComponents();
      const h = createHelpComponent();
      helpFixture = h.helpFixture;
      helpComponent = h.helpComponent;
      helpComponent.getArticles({
        limit: 1000,
        offset: 0,
        tags: [3],
        published: false
      });
      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should getArticles return 2 articles and total equals 2 and ignore published', () => {
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(false);
      expect(helpComponent.articleList()?.length).toBe(2);
      expect(helpComponent.articleCount()).toBe(2);
    });
  });

  describe('queryArticle function 8', () => {
    let TIMEOUT_INTERVAL: number;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;

    beforeEach(() => {
      TIMEOUT_INTERVAL = jasmineTimeoutInterval(12_000);
    });
    beforeEach(waitForAsync(() => {
      compileComponents();
      const h = createHelpComponent();
      helpFixture = h.helpFixture;
      helpComponent = h.helpComponent;
      helpComponent.getArticles({
        limit: 1000,
        offset: 0,
        tags: [3],
        published: false,
        createdAtAsc: false
      });
      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should getArticles return 2 article and total eqiuals 2 descending', () => {
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(false);
      expect(helpComponent.articleList()?.length).toBe(2);
      expect(helpComponent.articleCount()).toBe(2);
    });
  });

  describe('queryArticle function 9', () => {
    let TIMEOUT_INTERVAL: number;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;

    beforeEach(() => {
      TIMEOUT_INTERVAL = jasmineTimeoutInterval(12_000);
    });
    beforeEach(waitForAsync(() => {
      compileComponents();
      const h = createHelpComponent();
      helpFixture = h.helpFixture;
      helpComponent = h.helpComponent;
      helpComponent.getArticles({
        limit: -1,
        offset: -1
      });
      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should getArticles return error', () => {
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(false);
      expect(helpComponent.articleList()?.length).toBe(0);
      expect(helpComponent.articleCount()).toBe(0);
    });
  });

  describe('onOffsetChange function 1', () => {
    let TIMEOUT_INTERVAL: number;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;

    beforeEach(() => {
      TIMEOUT_INTERVAL = jasmineTimeoutInterval(12_000);
    });
    beforeEach(waitForAsync(() => {
      compileComponents();
      const h = createHelpComponent();
      helpFixture = h.helpFixture;
      helpComponent = h.helpComponent;
      helpComponent.getArticles({
        limit: 1000,
        offset: 0,
        tags: [3]
      });
      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      helpFixture.detectChanges();
      expect(helpComponent.articleList()?.length).toBe(2);
      expect(helpComponent.articleCount()).toBe(2);
      helpComponent.onOffsetChange(2);
      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should getArticles return 0 articles and total equals 2', () => {
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(false);
      expect(helpComponent.articleList()?.length).toBe(0);
      expect(helpComponent.articleCount()).toBe(2);
      expect(helpComponent.authStoreErrors?.length).toBe(0);
    });
  });

  describe('onLimitChange function 1', () => {
    let TIMEOUT_INTERVAL: number;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;

    beforeEach(() => {
      TIMEOUT_INTERVAL = jasmineTimeoutInterval(12_000);
    });
    beforeEach(waitForAsync(() => {
      compileComponents();
      const h = createHelpComponent();
      helpFixture = h.helpFixture;
      helpComponent = h.helpComponent;
      helpComponent.getArticles({
        limit: 1000,
        offset: 0,
        tags: [3]
      });
      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      helpFixture.detectChanges();
      expect(helpComponent.articleList()?.length).toBe(2);
      expect(helpComponent.articleCount()).toBe(2);
      helpComponent.onLimitChange(1);
      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should getArticles return 1 articles and total equals 2', () => {
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(false);
      expect(helpComponent.articleList()?.length).toBe(1);
      expect(helpComponent.articleCount()).toBe(2);
      expect(helpComponent.authStoreErrors?.length).toBe(0);
    });
  });

  describe('getTags function 1', () => {
    let TIMEOUT_INTERVAL: number;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;

    beforeEach(() => {
      TIMEOUT_INTERVAL = jasmineTimeoutInterval(12_000);
    });
    beforeEach(waitForAsync(() => {
      compileComponents();
      const h = createHelpComponent();
      helpFixture = h.helpFixture;
      helpComponent = h.helpComponent;
      helpComponent.getTags({ limit: 1, offset: 0 });
      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should getTags return one tag', () => {
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(false);
      expect(helpComponent.tags()?.length).toBe(1);
    });
  });

  describe('getTags function 2', () => {
    let TIMEOUT_INTERVAL: number;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;

    beforeEach(() => {
      TIMEOUT_INTERVAL = jasmineTimeoutInterval(12_000);
    });
    beforeEach(waitForAsync(() => {
      compileComponents();
      const h = createHelpComponent();
      helpFixture = h.helpFixture;
      helpComponent = h.helpComponent;
      helpComponent.getTags({ limit: 1, offset: 1000 });
      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should getTags return no tags', () => {
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(false);
      expect(helpComponent.tags()?.length).toBe(0);
    });
  });

  describe('getTags function 3', () => {
    let TIMEOUT_INTERVAL: number;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;

    beforeEach(() => {
      TIMEOUT_INTERVAL = jasmineTimeoutInterval(12_000);
    });
    beforeEach(waitForAsync(() => {
      compileComponents();
      const h = createHelpComponent();
      helpFixture = h.helpFixture;
      helpComponent = h.helpComponent;
      helpComponent.getTags({ limit: -1, offset: -1 });
      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should getTags return error', () => {
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(false);
      expect(helpComponent.tags()?.length).toBe(0);
    });
  });

  describe('getTags function 4', () => {
    let TIMEOUT_INTERVAL: number;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;

    beforeEach(() => {
      TIMEOUT_INTERVAL = jasmineTimeoutInterval(12_000);
    });
    beforeEach(waitForAsync(() => {
      compileComponents();
      const h = createHelpComponent();
      helpFixture = h.helpFixture;
      helpComponent = h.helpComponent;
      helpComponent.getTags(null);
      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should getTags return all tags', () => {
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(false);
      expect(helpComponent.tags()?.length).not.toBe(0);
    });
  });

  describe('tagsChanged', () => {
    let TIMEOUT_INTERVAL: number;
    let helpComponent: TestHelpComponent;
    let helpFixture: ComponentFixture<TestHelpComponent>;

    beforeEach(() => {
      TIMEOUT_INTERVAL = jasmineTimeoutInterval(12_000);
    });
    beforeEach(waitForAsync(() => {
      compileComponents();
      const h = createHelpComponent();
      helpFixture = h.helpFixture;
      helpComponent = h.helpComponent;
      helpComponent.getTags(null);
      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      helpFixture.detectChanges();
      helpComponent.tagsChanged = false;
      helpComponent.getTags(null);
      helpFixture.detectChanges();
    }));
    beforeEach(async () => {
      await helpFixture.whenRenderingDone();
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_INTERVAL;
    });

    it('should call getTags twice return tagsChanged = true', () => {
      helpFixture.detectChanges();
      expect(helpComponent.isAuthenticated()).toBe(false);
      expect(helpComponent.tagsChanged).toBe(true);
    });
  });
});

@Component({
  template: ``,
  providers: [provideComponentStore(HomeStore)]
})
export class TestHelpComponent implements OnInit, OnDestroy {
  readonly #authStore = inject(AuthStore);
  readonly authStoreError = this.#authStore.selectors.errorResponse;
  readonly isAuthenticated = this.#authStore.selectors.isAuthenticated;
  readonly articleListConfig = this.#authStore.selectors.articleListConfig;

  readonly #homeStore = inject(HomeStore);
  readonly articleList = this.#homeStore.selectors.articleList;
  readonly articleCount = this.#homeStore.selectors.articleCount;
  readonly tags = this.#homeStore.selectors.tags;

  readonly isLoading = signal<boolean>(false);
  private injector = inject(Injector);
  authStoreErrors: string[] = [];
  tagsChanged = false;

  onOffsetChange(offset: number): void {
    this.#homeStore.onOffsetChange({
      loading: this.isLoading,
      offset: offset
    });
  }

  onLimitChange(limit: number): void {
    this.#homeStore.onLimitChange({
      loading: this.isLoading,
      limit: limit
    });
  }

  getArticles(params: ArticleGlobalQueryParams): void {
    if (this.isLoading()) {
      return;
    }
    this.isLoading.set(true);
    this.#homeStore.queryArticle({
      loading: this.isLoading,
      params: params
    });
  }

  getTags(params: TagFilter | null): void {
    if (this.isLoading()) {
      return;
    }
    this.isLoading.set(true);
    this.#homeStore.getTags({
      loading: this.isLoading,
      params: params
    });
  }

  ngOnDestroy(): void {
    this.#authStore.resetErrorResponse();
  }
  ngOnInit(): void {
    toObservable(this.tags, { injector: this.injector }).subscribe((tags: Tag[] | null) => {
      if (tags && tags.length) {
        this.tagsChanged = true;
      }
    });

    toObservable(this.authStoreError, { injector: this.injector }).subscribe((errorResponse: ErrorResponse | null) => {
      if (errorResponse) {
        this.authStoreErrors = Object.keys(errorResponse.errors || {}).map(key => `${errorResponse.errors[key]}`);
      } else {
        this.authStoreErrors = [];
      }
    });
  }
}
