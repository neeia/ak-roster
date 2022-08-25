import { getAuth, User } from "firebase/auth";


const getUserStatus = function () {
  return new Promise<User | null>(function (resolve) {
    getAuth().onAuthStateChanged(function (user) {
      if (user) {
        resolve(user);
      } else {
        resolve(null);
      }
    });
  });
};

export { getUserStatus };