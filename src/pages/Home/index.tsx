import React, { useState, useEffect } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';
import { Product } from '../../types';


interface CartItemsAmount {
  [key: number]: number;
}
const Home = (): JSX.Element => {
  const [products, setProducts] = useState<Product[]>([]);
  const { addProduct, cart } = useCart();

  const cartItemsAmount = cart.reduce((sumAmount, product) => {
    const newSumAmout = { ...sumAmount }
    newSumAmout[product.id] = product.amount
    return newSumAmout
  }, {} as CartItemsAmount)


  useEffect(() => {
    async function loadProducts() {
      const response = await api.get('/products')

      setProducts(response.data)

    }

    loadProducts();
  }, []);

  function handleAddProduct(productId: number) {

    addProduct(productId)
  }

  return (
    <ProductList>
      {products.map((product) => {
        return (
          <li key={product.id}>
            <img src={product.image} alt={product.title} />
            <strong>{product.title}</strong>
            <span>{formatPrice.format(product.price)}</span>
            <button
              type="button"
              data-testid="add-product-button"
              onClick={() => handleAddProduct(product.id)}
            >
              <div data-testid="cart-product-quantity">
                <MdAddShoppingCart size={16} color="#FFF" />
                {cartItemsAmount[product.id] ?? 0}
              </div>

              <span>ADICIONAR AO CARRINHO</span>
            </button>
          </li>
        )
      })}
    </ProductList>
  );
};

export default Home;
