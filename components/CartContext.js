'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('pintu_besi_cart')
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (e) {
        console.error('Failed to parse cart:', e)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save cart to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('pintu_besi_cart', JSON.stringify(cart))
    }
  }, [cart, isLoaded])

  function addToCart(product, quantity = 1) {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product_id === product.id)
      if (existing) {
        return prevCart.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [
        ...prevCart,
        {
          product_id: product.id,
          name: product.name,
          price: product.price,
          original_price: product.original_price || null,
          image: product.product_images?.[0]?.image_url || null,
          slug: product.slug,
          stock: product.stock,
          quantity,
        },
      ]
    })
  }

  function removeFromCart(productId) {
    setCart((prevCart) => prevCart.filter((item) => item.product_id !== productId))
  }

  function updateQuantity(productId, quantity) {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product_id === productId ? { ...item, quantity } : item
      )
    )
  }

  function clearCart() {
    setCart([])
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoaded,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
