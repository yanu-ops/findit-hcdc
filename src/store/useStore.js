import { create } from 'zustand'

const useStore = create((set) => ({
  user: null,
  profile: null,
  unreadCount: 0,
  notifCount: 0,
  threads: [],

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setUnreadCount: (count) => set({ unreadCount: count }),
  setNotifCount: (count) => set({ notifCount: count }),
  setThreads: (threads) => set({ threads }),
  clearUser: () => set({ user: null, profile: null, unreadCount: 0, notifCount: 0, threads: [] }),
}))

export default useStore