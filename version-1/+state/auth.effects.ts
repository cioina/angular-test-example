import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, concatMap, exhaustMap, map, tap, withLatestFrom } from 'rxjs/operators';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { setErrors, ngrxFormsQuery } from '@zorro-example-app/ngrx-forms';
import { NzMessageService } from 'ng-zorro-antd/message';

import * as AuthActions from './auth.actions';
import { AuthService } from '../auth.service';
import { LocalStorageJwtService } from '../local-storage-jwt.service';

@Injectable()
export class AuthEffects {
  private readonly localStorageJwtService = inject(LocalStorageJwtService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly nzMessageService = inject(NzMessageService);

  readonly getVersion$ = createEffect((actions$ = inject(Actions)) => {
    return actions$.pipe(
      ofType(AuthActions.getVersion),
      concatMap(() =>
        this.authService.getVersion().pipe(
          map(response => AuthActions.getVersionSuccess({ version: response.version })),
          catchError(error => of(AuthActions.getVersionFail(error)))
        )
      )
    );
  });

  readonly getProfile$ = createEffect((actions$ = inject(Actions)) => {
    return actions$.pipe(
      ofType(AuthActions.getProfile),
      concatMap(action =>
        this.authService.getProfile(action.username).pipe(
          map(response => AuthActions.getProfileSuccess({ profile: response.profile })),
          catchError(error => of(AuthActions.getProfileFail(error)))
        )
      )
    );
  });

  readonly logout$ = createEffect(
    (actions$ = inject(Actions)) => {
      return actions$.pipe(
        ofType(AuthActions.logout, AuthActions.getProfileFail),
        tap(() => {
          this.localStorageJwtService.removeItem();
          this.nzMessageService.warning('You have been signed off');
          this.router.navigate(['articles']);
        })
      );
    },
    { dispatch: false }
  );

  readonly loginOrRegisterSuccess$ = createEffect(
    (actions$ = inject(Actions), store = inject(Store)) => {
      return actions$.pipe(
        ofType(
          AuthActions.loginSuccess,
          AuthActions.registerSuccess,
          AuthActions.loginPasswordSuccess,
          AuthActions.updateUserSuccess
        ),
        tap(action => {
          this.localStorageJwtService.setItem({
            token: action.user.token,
            username: action.user.username
          });

          store.dispatch(
            AuthActions.setProfile({
              profile: {
                username: action.user.username,
                bio: action.user.bio,
                image: action.user.image
              }
            })
          );

          let message: string;
          switch (action.type) {
            case '[auth] LOGIN_PASSWORD_SUCCESS':
            case '[auth] LOGIN_SUCCESS':
              message = 'You have been signed on successfully';
              break;
            case '[auth] UPDATE_USER_SUCCESS':
              message = 'User updated successfully';
              break;
            case '[auth] REGISTER_SUCCESS':
              message = 'You have been registered successfully';
              break;
            default:
              message = '[auth] SUCCESS';
              break;
          }

          this.nzMessageService.info(message);

          if (action.type !== '[auth] LOGIN_PASSWORD_SUCCESS') {
            this.router.navigate(['articles']);
          }
        })
      );
    },
    { dispatch: false }
  );

  readonly updateUser$ = createEffect((actions$ = inject(Actions), store = inject(Store)) => {
    return actions$.pipe(
      ofType(AuthActions.updateUser),
      withLatestFrom(store.select(ngrxFormsQuery.getData)),
      exhaustMap(([action, data]) =>
        this.authService.updateUser(data).pipe(
          map(response => AuthActions.updateUserSuccess({ user: response.user })),
          catchError(result => of(setErrors({ errors: result.error.errors, errorActionType: action.type })))
        )
      )
    );
  });

  readonly loginPassword$ = createEffect((actions$ = inject(Actions), store = inject(Store)) => {
    return actions$.pipe(
      ofType(AuthActions.loginPassword),
      withLatestFrom(store.select(ngrxFormsQuery.getData)),
      exhaustMap(([action, data]) =>
        this.authService.loginPassword(data).pipe(
          map(response => AuthActions.loginPasswordSuccess({ user: response.user })),
          catchError(result => of(setErrors({ errors: result.error.errors, errorActionType: action.type })))
        )
      )
    );
  });

  readonly login$ = createEffect((actions$ = inject(Actions), store = inject(Store)) => {
    return actions$.pipe(
      ofType(AuthActions.login),
      withLatestFrom(store.select(ngrxFormsQuery.getData)),
      exhaustMap(([action, data]) =>
        this.authService.login(data).pipe(
          map(response => AuthActions.loginSuccess({ user: response.user })),
          catchError(result => of(setErrors({ errors: result.error.errors, errorActionType: action.type })))
        )
      )
    );
  });

  readonly register$ = createEffect((actions$ = inject(Actions), store = inject(Store)) => {
    return actions$.pipe(
      ofType(AuthActions.register),
      withLatestFrom(store.select(ngrxFormsQuery.getData)),
      exhaustMap(([action, data]) =>
        this.authService.register(data).pipe(
          map(response => AuthActions.registerSuccess({ user: response.user })),
          catchError(result => of(setErrors({ errors: result.error.errors, errorActionType: action.type })))
        )
      )
    );
  });
}
