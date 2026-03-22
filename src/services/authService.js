// import { AppDBClient } from "@domoinc/toolkit";

// const UsersClient = new AppDBClient.DocumentsClient("ChatUsers");

// // Simple hash — NOT cryptographic, fine for Domo internal apps
// const simpleHash = (str) =>
//   Array.from(str)
//     .reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 0)
//     .toString(36);

// export const AuthService = {
//   signup: async (username, password) => {
//     // Check if username taken
//     const existing = await UsersClient.get({
//       "content.username": { $eq: username },
//     });
//     if (existing.data?.length > 0) throw new Error("Username already taken");

//     const res = await UsersClient.create({
//       username,
//       passwordHash: simpleHash(password),
//       createdAt: new Date().toISOString(),
//     });
//     return { id: res.data.id, username };
//   },

//   login: async (username, password) => {
//     const res = await UsersClient.get({
//       "content.username": { $eq: username },
//     });
//     const users = res.data || [];
//     if (users.length === 0) throw new Error("User not found");

//     const user = users[0];
//     if (user.content.passwordHash !== simpleHash(password))
//       throw new Error("Incorrect password");

//     return { id: user.id, username: user.content.username };
//   },
// };

import { signupAPI, loginAPI } from '../api/domoAPI';

export const AuthService = {
  signup: (username, password) => signupAPI(username, password),
  login: (username, password) => loginAPI(username, password),
};