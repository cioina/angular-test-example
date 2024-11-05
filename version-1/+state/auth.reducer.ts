/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Action, createReducer, on } from '@ngrx/store';
import { Profile, Version, User } from '@zorro-example-app/api';

import * as AuthActions from './auth.actions';

export interface Auth {
  authUser: AuthUser;
  currentProfile: CurrentProfile;
  currentVersion: CurrentVersion;
}

export interface AuthUser {
  user: User;
  loaded: boolean;
  loading: boolean;
  logout: boolean;
}

export interface CurrentProfile {
  profile: Profile;
  loaded: boolean;
  loading: boolean;
}

export interface CurrentVersion {
  version: Version;
  loaded: boolean;
  loading: boolean;
}

export interface AuthState {
  readonly auth: Auth;
}

export const authInitialState: Auth = {
  authUser: {
    user: {
      email: '',
      token: '',
      username: '',
      bio: '',
      image: ''
    },
    loaded: false,
    loading: false,
    logout: true
  },
  currentProfile: {
    profile: {
      username: '',
      bio: '',
      image: ''
    },
    loaded: false,
    loading: false
  },
  currentVersion: {
    version: {
      hash: ''
    },
    loaded: false,
    loading: false
  }
};

const reducer = createReducer(
  authInitialState,

  on(AuthActions.loginPassword, AuthActions.login, AuthActions.register, AuthActions.updateUser, (state, _) => {
    const authUser = {
      ...state.authUser,
      loading: true,
      loaded: false
    };
    return { ...state, authUser };
  }),

  on(
    AuthActions.loginPasswordSuccess,
    AuthActions.loginSuccess,
    AuthActions.registerSuccess,
    AuthActions.updateUserSuccess,
    (state, action) => {
      const authUser = {
        ...state.authUser,
        user: action.user,
        logout: false,
        loading: false,
        loaded: true
      };
      return { ...state, authUser };
    }
  ),

  on(AuthActions.getProfile, (state, _) => {
    const currentProfile = {
      ...state.currentProfile,
      loading: true
    };
    return { ...state, currentProfile };
  }),

  on(AuthActions.getProfileSuccess, AuthActions.setProfile, (state, action) => {
    const currentProfile = {
      ...state.currentProfile,
      profile: action.profile,
      loading: false,
      loaded: true
    };
    return { ...state, currentProfile };
  }),

  on(AuthActions.logout, AuthActions.getProfileFail, (state, _) => {
    const currentProfile = {
      ...state.currentProfile,
      profile: {
        username: '',
        bio: '',
        image: ''
      },
      loading: false,
      loaded: true
    };
    const authUser = {
      ...state.authUser,
      loaded: false,
      logout: true
    };
    return { ...state, currentProfile, authUser };
  }),

  on(AuthActions.getVersion, (state, _) => {
    const currentVersion = {
      ...state.currentVersion,
      loading: true
    };
    return { ...state, currentVersion };
  }),

  on(AuthActions.getVersionSuccess, AuthActions.setVersion, (state, action) => {
    const currentVersion = {
      ...state.currentVersion,
      version: action.version,
      loading: false,
      loaded: true
    };
    return { ...state, currentVersion };
  }),

  on(AuthActions.getVersionFail, (state, _) => {
    const currentVersion = {
      ...state.currentVersion,
      version: {
        hash: ''
      },
      loading: false,
      loaded: true
    };
    return { ...state, currentVersion };
  })
);

export function authReducer(state: Auth | undefined, action: Action): Auth {
  return reducer(state, action);
}
