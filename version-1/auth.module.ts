/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPipesModule } from 'ng-zorro-antd/pipes';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTransferModule } from 'ng-zorro-antd/transfer';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { AuthEffects } from './+state/auth.effects';
import { AuthFacade } from './+state/auth.facade';
import { authInitialState, authReducer } from './+state/auth.reducer';
import { AuthGuardService } from './auth-guard.service';
import { AuthService } from './auth.service';
import { LocalStorageJwtService } from './local-storage-jwt.service';
import { LoginComponent } from './login.component';
import { ProfileResolverService } from './profile-resolver.service';
import { ProfileSettingsComponent } from './profile-settings.component';
import { ProfileComponent } from './profile.component';
import { RegisterComponent } from './register.component';
import { TokenInterceptorService } from './token-interceptor.service';

const authRouting = RouterModule.forChild([
  {
    path: 'sign-in',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'profile/:username',
    resolve: { ProfileResolverService },
    canActivate: [AuthGuardService],
    component: ProfileComponent
  }
]);

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NzAvatarModule,
    NzButtonModule,
    NzCardModule,
    NzDrawerModule,
    NzDropDownModule,
    NzIconModule,
    NzInputModule,
    NzGridModule,
    NzFormModule,
    NzMessageModule,
    NzModalModule,
    NzSpinModule,
    NzPipesModule,
    NzPopconfirmModule,
    NzSelectModule,
    NzSpaceModule,
    NzSwitchModule,
    NzTableModule,
    NzTransferModule,
    NzToolTipModule,
    NzTypographyModule,
    //NgrxFormsModule,
    authRouting,

    StoreModule.forFeature('auth', authReducer, {
      initialState: authInitialState
    }),
    EffectsModule.forFeature([AuthEffects])
  ],
  providers: [
    AuthFacade,
    AuthEffects,
    AuthGuardService,
    AuthService,

    LocalStorageJwtService,
    ProfileResolverService,

    TokenInterceptorService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true
    }
  ],
  declarations: [LoginComponent, RegisterComponent, ProfileComponent, ProfileSettingsComponent]
})
export class AuthModule {}
