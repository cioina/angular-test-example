/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { createFeatureSelector, createSelector } from '@ngrx/store';

import { Auth } from './auth.reducer';

export const getAuth = createFeatureSelector<Auth>('auth');

export const authUserLoaded = createSelector(getAuth, (auth: Auth) => auth.authUser.loaded);
export const authUserLoading = createSelector(getAuth, (auth: Auth) => auth.authUser.loading);
export const authUserLogout = createSelector(getAuth, (auth: Auth) => auth.authUser.logout);
export const getUser = createSelector(getAuth, (auth: Auth) => auth.authUser.user);
export const getUserName = createSelector(getAuth, (auth: Auth) => auth.authUser.user.username);

export const getProfile = createSelector(getAuth, (auth: Auth) => auth.currentProfile.profile);
export const currentProfileLoaded = createSelector(getAuth, (auth: Auth) => auth.currentProfile.loaded);
export const currentProfileLoading = createSelector(getAuth, (auth: Auth) => auth.currentProfile.loading);

export const getVersionHash = createSelector(getAuth, (auth: Auth) => auth.currentVersion.version.hash);

export const authQuery = {
  getUser,
  getUserName,
  authUserLoaded,
  authUserLoading,
  authUserLogout,
  getProfile,
  currentProfileLoaded,
  currentProfileLoading,
  getVersionHash
};
