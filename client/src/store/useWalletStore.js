import { create } from 'zustand';

export const useWalletStore = create((set) => ({
  coinBalance: 0,
  billingInfo: null,
  setCoinBalance: (coinBalance) => set({ coinBalance }),
  setBillingInfo: (billingInfo) => set({ billingInfo }),
  clearWallet: () => set({ coinBalance: 0, billingInfo: null }),
})); 