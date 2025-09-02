# Testing Angular Applications

[![test-run](/version-2/test-run.png?raw=true)](https://github.com/cioina/angular-test-example/blob/main/version-2/test-run.png)

## Introduction

[Our Angular app](https://cioina.azurewebsites.net/) Is based on [ng-antd-admin](https://github.com/huajian123/ng-antd-admin) combined with [angular-conduit-signals](https://github.com/AndyT2503/angular-conduit-signals). In addition, we use following Angular libraries direct form sources: [NG-ZORRO components src](https://github.com/NG-ZORRO/ng-zorro-antd/tree/master/components), [icons-angular src](https://github.com/ant-design/ant-design-icons/tree/master/packages/icons-angular/src) and [component-store src](https://github.com/ngrx/platform/tree/main/modules/component-store/src) with some minor changes. All our reactive states look similar to [auth.store.ts](https://github.com/AndyT2503/angular-conduit-signals/blob/dev/src/app/shared/store/auth.store.ts)
The app communicates with the server via REST API controllers built on top of .NET Core 9. The compiled bin code is on [our GitHub repository](https://github.com/cioina/cioina.azurewebsites.net/tree/main/bin/Release/net9.0) together with [compiled Angular app](https://github.com/cioina/cioina.azurewebsites.net/tree/main/bin/Release/net9.0/wwwroot)

## Testing tools for Angular

We use the same tools/packages as in [NG-ZORRO](https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/package.json), which are the same as in [TEST_DEPS](https://github.com/angular/angular/blob/main/adev/BUILD.bazel) plus `puppeteer`. In addition, Angular and NG-ZORRO have a lot of classes and functions ready to use right out of the box:

```javascript
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync, inject as testInject } from '@angular/core/testing';
import { dispatchMouseEvent, dispatchFakeEvent, typeInElement } from 'ng-zorro-antd/core/testing';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';
```

## Testing Angular app together with .NET Core app

Our actual(up to date) [test project](https://github.com/cioina/MyTested-test-project-example/tree/main/src/BlogAngular.Test/Test) for our .NET Core app uses in memory database which is very convenient for testing (read more about it [here](https://cioina.azurewebsites.net/articles/dotnet-core-testing) ) Next, would be great to test on a real database. So, all our Angular test from [our GitHub repository](https://github.com/cioina/angular-test-example/tree/main/version-2) will connect with our .NET Core app which is connected to real MS SQL database. Therefore, it represents a type of integration test.
All the files ending in [*.store.spec.ts](https://github.com/cioina/angular-test-example/blob/main/version-2/home.store.spec.ts) can be considered as real API testing which is an alternative to [Newman](https://github.com/gothinkster/realworld/blob/main/api/run-api-tests.sh), [Storybook](https://github.com/cioina/angular-vite-storybook/blob/main/src/stories/page.stories.ts) or [Playwright](https://github.com/stefanoslig/angular-ngrx-nx-realworld-example-app/blob/main/apps/conduit-e2e/src/auth/auth.spec.ts)

## Using Signal type in Angular together with Reactive State library

[![vs](/vs.png?raw=true)](https://github.com/cioina/angular-test-example/blob/main/vs.png)

Before Signal type became native in Angular, we used [Reactive State library]( https://github.com/ngrx/platform) for [our integration tests](https://github.com/cioina/angular-test-example/tree/main/version-1). Now, the library has implemented two ways of using Signals: [@ngrx/signals](https://github.com/stefanoslig/angular-ngrx-nx-realworld-example-app/blob/main/libs/auth/data-access/src/auth.store.ts) and [@ngrx/component-store](https://github.com/AndyT2503/angular-conduit-signals/blob/dev/src/app/shared/store/auth.store.ts). We use the second one direct from sources.

## Credits

- [Angular contributors](https://github.com/angular/angular/graphs/contributors)
- [NG-ZORRO contributors](https://github.com/NG-ZORRO/ng-zorro-antd/graphs/contributors)
- [Ant Design contributors](https://github.com/ant-design/ant-design-icons/graphs/contributors)
- [Reactive State for Angular contributors](https://github.com/ngrx/platform/graphs/contributors)
- [hua jian](https://github.com/huajian123)
- [Andy Tu Hoang](https://github.com/AndyT2503)
- [Stefanos Lignos](https://github.com/stefanoslig)

