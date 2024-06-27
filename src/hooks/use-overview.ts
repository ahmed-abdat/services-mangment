// import { create } from "zustand";
// import { createJSONStorage, persist } from "zustand/middleware";


// type UserState = {
//   user: User | null,
//   setUser: (user: User | null) => void,
//   updateUser : (propertie : Partial<User> ) => void,
//   clearUser: () => void,
// };

// export const useUser = create<UserState>()(
//   persist(
//     (set) => ({
//       user: null,
//       setUser: (user) => set({ user }),
//       clearUser: () => set({ user: null }),
//       updateUser: (propertie) => set((state) => ({ user: { ...state.user, ...propertie } })),
//     }),
//     {
//       name: 'user-storage', // name of the item in the storage (must be unique)
//       storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
//     },
//   ),
// )
