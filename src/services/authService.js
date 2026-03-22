import { signupAPI, loginAPI } from './domoAPI';

export const AuthService = {
  signup: (username, password) => signupAPI(username, password),
  login:  (username, password) => loginAPI(username, password),
};