/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync, inject as testInject } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { apiPrefixInterceptor, authInterceptor } from '@app/shared/interceptors';
import { AuthStore } from '@app/shared/store';
import { provideComponentStore } from '@ngrx/component-store';

import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { SettingDrawerComponent } from './setting-drawer.component';

describe('setting-drawer.component', () => {
  describe('changeStyleTheme', () => {
    let TIMEOUT_INTERVAL: number;
    let component: SettingDrawerComponent;
    let fixture: ComponentFixture<SettingDrawerComponent>;
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
        imports: [NoopAnimationsModule, SettingDrawerComponent]
      }).compileComponents();
    }));

    beforeEach(
      testInject([OverlayContainer], (currentOverlayContainer: OverlayContainer) => {
        overlayContainer = currentOverlayContainer;
      })
    );

    beforeEach(waitForAsync(() => {
      fixture = TestBed.createComponent(SettingDrawerComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(overlayContainer.getContainerElement().querySelector('.ant-drawer')).toBeTruthy();

      const buttons = fixture.debugElement.queryAll(By.css('.anticon'));
      expect(buttons.length).toBe(7);

      const buttonElement = buttons[0].nativeElement;
      buttonElement.classList.contains('anticon-setting');
      buttonElement.click();
      fixture.detectChanges();
    }));
    beforeEach(async () => {
      await fixture.whenRenderingDone();
    });

    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      expect(
        overlayContainer.getContainerElement().querySelector('.ant-drawer')!.classList.contains('ant-drawer-open')
      ).toBe(true);

      component.changeStyleTheme('dark');
      fixture.detectChanges();

      component.changeTheme({
        key: 'light',
        image: 'assets/imgs/theme-light.svg',
        title: 'Bright menu style',
        isChecked: false
      });
      fixture.detectChanges();

      component.changeMode({
        key: 'top',
        image: 'assets/imgs/menu-side.svg',
        title: 'Side menu layout works better for desktops',
        isChecked: true
      });
      fixture.detectChanges();

      component.changeTheme({
        key: 'dark',
        image: 'assets/imgs/menu-side.svg',
        title: 'Side menu layout works better for desktops',
        isChecked: true
      });
      fixture.detectChanges();

      component.changePrimaryColor({
        key: 'green',
        color: '#52C41A',
        title: 'Green',
        isChecked: false
      });
      fixture.detectChanges();

      component.changeThemeOptions(false, 'isShowTab');
      fixture.detectChanges();

      component.changeThemeOptions(false, 'fixedHead');
      fixture.detectChanges();

      component.changeSpecialTheme(true, 'color-weak');
      fixture.detectChanges();

      component.changeSpecialTheme(true, 'grey-theme');
      fixture.detectChanges();

      component.resetMenuSettingsToDefault();
      fixture.detectChanges();

      component.dragging = true;
      component.changeCollapsed();
      fixture.detectChanges();

      // Error becouse of setTimeout
      component.dragging = true;
      component.dragEnd();
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

    it('should get 100% coverage-report', fakeAsync(() => {
      tick(20);
      fixture.detectChanges();
    }));
  });
});
