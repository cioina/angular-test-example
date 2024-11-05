import { Injectable, inject } from '@angular/core';

import { Store } from '@ngrx/store';
import { Version } from '@zorro-example-app/api';

import * as AuthActions from './auth.actions';
import { AuthState } from './auth.reducer';
import { authQuery } from './auth.selectors';

@Injectable()
export class AuthFacade {
  private readonly store = inject(Store<AuthState>);

  readonly user$ = this.store.select(authQuery.getUser);
  readonly userName$ = this.store.select(authQuery.getUserName);
  readonly authUserLoading$ = this.store.select(authQuery.authUserLoading);
  readonly isLoggedIn$ = this.store.select(authQuery.authUserLoaded);
  readonly isLoggedOut$ = this.store.select(authQuery.authUserLogout);

  readonly versionHash$ = this.store.select(authQuery.getVersionHash);

  readonly profile$ = this.store.select(authQuery.getProfile);
  readonly currentProfileLoaded$ = this.store.select(authQuery.currentProfileLoaded);
  readonly currentProfileLoading$ = this.store.select(authQuery.currentProfileLoading);

  getProfile(username: string): void {
    this.store.dispatch(AuthActions.getProfile({ username: username }));
  }

  getVersion(): void {
    this.store.dispatch(AuthActions.getVersion());
  }
  setVersion(version: Version): void {
    this.store.dispatch(AuthActions.setVersion({ version: version }));
  }

  login(): void {
    this.store.dispatch(AuthActions.login());
  }

  loginPassword(): void {
    this.store.dispatch(AuthActions.loginPassword());
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  register(): void {
    this.store.dispatch(AuthActions.register());
  }

  updateUser(): void {
    this.store.dispatch(AuthActions.updateUser());
  }
}
