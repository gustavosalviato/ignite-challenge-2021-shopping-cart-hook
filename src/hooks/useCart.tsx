import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';
import { produce, } from 'immer'
import { MdAddModerator } from 'react-icons/md';
import { networkInterfaces } from 'os';

const LOCAL_STORAGE_KEY = '@RocketShoes:cart'



interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const savedCartItems = localStorage.getItem(LOCAL_STORAGE_KEY)

    if (savedCartItems) {
      return JSON.parse(savedCartItems)
    }

    return []
  });

  function setAndSaveCartItems(cartItems: Product[]) {
    setCart(cartItems)

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cartItems))
  }


  const addProduct = async (productId: number) => {
    try {
      const updatedProduct = [...cart]

      const productAlreadyExists = updatedProduct
        .find((product) => product.id === productId)

      const productStock = await api.get(`/stock/${productId}`)
      const stockAmount = productStock.data.amount
      const currentAmount = productAlreadyExists ? productAlreadyExists.amount : 0
      const wishedAmount = currentAmount + 1

      if (wishedAmount > stockAmount) {
        toast.error('Quantidade solicitada fora de estoque');
        return
      }

      if (productAlreadyExists) {
        const wishedAmount = currentAmount + 1
        productAlreadyExists.amount = wishedAmount
      } else {
        const product = await api.get(`/products/${productId}`)

        const newProduct = {
          ...product.data,
          amount: 1
        }
        updatedProduct.push(newProduct)
      }

      setAndSaveCartItems(updatedProduct)

    } catch {
      toast.error('Erro na adição do produto');
    }

  };

  const removeProduct = (productId: number) => {
    try {
      const updatedCart = [...cart]

      const productExists = updatedCart
        .find((product) => product.id === productId)

      if (!productExists) {
        toast.error('Erro na remoção do produto');
        return
      }

      const newCart = updatedCart
        .filter((product) => product.id !== productId)

      setAndSaveCartItems(newCart)

    } catch {
      toast.error('Erro na remoção do produto');
    }

  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount <= 0) {
        return
      }

      const stock = await api.get(`/stock/${productId}`)
      const stockAmount = stock.data.amount

      if (amount > stockAmount) {
        toast.error('Quantidade solicitada fora de estoque');
        return
      }

      const updatedCart = [...cart]
      const productAlreadyExists = updatedCart
        .find((product) => product.id === productId)

      if (productAlreadyExists) {
        productAlreadyExists.amount = amount
        setAndSaveCartItems(updatedCart)
      } else {
        throw Error('')
      }
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };



  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}
export const useCart = () => useContext(CartContext)