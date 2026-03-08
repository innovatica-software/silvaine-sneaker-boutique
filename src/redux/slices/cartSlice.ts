import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
  slug: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

const loadCartFromStorage = (): CartItem[] => {
  try {
    const stored = localStorage.getItem('silvaine_cart');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveCartToStorage = (items: CartItem[]) => {
  localStorage.setItem('silvaine_cart', JSON.stringify(items));
};

const initialState: CartState = {
  items: loadCartFromStorage(),
  isOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find(
        (item) => item.id === action.payload.id && item.size === action.payload.size && item.color === action.payload.color
      );
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      saveCartToStorage(state.items);
    },
    removeFromCart: (state, action: PayloadAction<{ id: string; size: string; color: string }>) => {
      state.items = state.items.filter(
        (item) => !(item.id === action.payload.id && item.size === action.payload.size && item.color === action.payload.color)
      );
      saveCartToStorage(state.items);
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; size: string; color: string; quantity: number }>) => {
      const item = state.items.find(
        (i) => i.id === action.payload.id && i.size === action.payload.size && i.color === action.payload.color
      );
      if (item) {
        item.quantity = Math.max(1, action.payload.quantity);
      }
      saveCartToStorage(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      saveCartToStorage(state.items);
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, toggleCart, setCartOpen } = cartSlice.actions;

export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((total, item) => total + (item.discountPrice || item.price) * item.quantity, 0);
export const selectCartCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((count, item) => count + item.quantity, 0);

export default cartSlice.reducer;
