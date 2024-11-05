/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { createAction, props } from '@ngrx/store';
import { Profile, Version, User } from '@zorro-example-app/api';

export const getVersion = createAction('[auth] GET_VERSION');
export const setVersion = createAction('[auth] SET_VERSION', props<{ version: Version }>());
export const getVersionSuccess = createAction('[auth] GET_VERSION_SUCCESS', props<{ version: Version }>());
export const getVersionFail = createAction('[auth] GET_VERSION_FAIL', props<{ error: Error }>());

export const getProfile = createAction('[auth] GET_PROFILE', props<{ username: string }>());
export const getProfileSuccess = createAction('[auth] GET_PROFILE_SUCCESS', props<{ profile: Profile }>());
export const setProfile = createAction('[auth] SET_PROFILE', props<{ profile: Profile }>());
export const getProfileFail = createAction('[auth] GET_PROFILE_FAIL', props<{ error: Error }>());

export const updateUser = createAction('[auth] UPDATE_USER');
export const updateUserSuccess = createAction('[auth] UPDATE_USER_SUCCESS', props<{ user: User }>());

export const loginPassword = createAction('[auth] LOGIN_PASSWORD');
export const loginPasswordSuccess = createAction('[auth] LOGIN_PASSWORD_SUCCESS', props<{ user: User }>());

export const login = createAction('[auth] LOGIN');
export const loginSuccess = createAction('[auth] LOGIN_SUCCESS', props<{ user: User }>());

export const register = createAction('[auth] REGISTER');
export const registerSuccess = createAction('[auth] REGISTER_SUCCESS', props<{ user: User }>());

export const logout = createAction('[auth] LOGOUT');
