
import { useEffect, useRef, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const categories = ['All', 'Brownies', 'Chocolates', 'Cookies'];

const money = (value) => `₹${value}`;

const picture = (filename) => `/images/${filename}`;

// PRODUCT CARD
function ProductCard({ product, onAdd }) {
  return (
    <article className="product-card">
      <img
        src={picture(product.image)}
        alt={product.name}
        loading="lazy"
      />

      <div className="product-details">
        <p className="product-category">{product.category}</p>
        <h3>{product.name}</h3>
        <p className="description">{product.description}</p>

        <div className="product-bottom">
          <strong>{money(product.price)}</strong>

          <button
            type="button"
            onClick={() => onAdd(product._id)}
          >
            Add +
          </button>
        </div>
      </div>
    </article>
  );
}

// MAIN APPLICATION
export default function App() {
  const [page, setPage] = useState('home');
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('All');

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // CART
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bakery-cart')) || [];
    } catch {
      return [];
    }
  });

  // CUSTOMER INFORMATION
  const [customer, setCustomer] = useState({
    customerName: '',
    phone: '',
    address: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState('');
  const [orderSuccess, setOrderSuccess] = useState('');

  // TOAST NOTIFICATION
  const [showToast, setShowToast] = useState(false);
  const toastTimer = useRef(null);

  // FETCH PRODUCTS FROM BACKEND
  useEffect(() => {
    fetch(`${API}/api/products`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('API request failed');
        }

        return response.json();
      })
      .then(setProducts)
      .catch(() =>
        setLoadError(
          'Could not load products. Start MongoDB and the backend server.'
        )
      )
      .finally(() => setLoading(false));
  }, []);

  // SAVE CART TO LOCAL STORAGE
  useEffect(() => {
    localStorage.setItem('bakery-cart', JSON.stringify(cart));
  }, [cart]);

  // CLEAN UP TOAST TIMER
  useEffect(() => {
    return () => clearTimeout(toastTimer.current);
  }, []);

  // NAVIGATION
  const go = (next) => {
    setPage(next);

    if (next !== 'cart') {
      setOrderSuccess('');
    }

    setNotice('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // ADD TO CART
  const addToCart = (productId) => {
    setCart((old) => {
      const exists = old.find(
        (item) => item.productId === productId
      );

      if (exists) {
        return old.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: Math.min(item.quantity + 1, 30)
              }
            : item
        );
      }

      return [...old, { productId, quantity: 1 }];
    });

    // SHOW "TREAT SECURED!" NOTIFICATION
    setShowToast(true);

    // RESET TIMER ON EVERY CLICK
    clearTimeout(toastTimer.current);

    toastTimer.current = setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  // CHANGE CART QUANTITY
  const changeQuantity = (productId, difference) => {
    setCart((old) =>
      old
        .map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: item.quantity + difference
              }
            : item
        )
        .filter(
          (item) => item.quantity > 0 && item.quantity <= 30
        )
    );
  };

  // CART ITEMS
  const cartItems = cart
    .map((item) => ({
      ...item,
      product: products.find(
        (product) => product._id === item.productId
      )
    }))
    .filter((item) => item.product);

  // TOTAL AMOUNT
  const total = cartItems.reduce(
    (sum, item) =>
      sum + item.product.price * item.quantity,
    0
  );

  // CART COUNT
  const count = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // FILTER PRODUCTS
  const filteredProducts =
    category === 'All'
      ? products
      : products.filter(
          (product) => product.category === category
        );

  // PLACE ORDER
  const submitOrder = async (event) => {
    event.preventDefault();

    if (!cartItems.length) return;

    setSubmitting(true);
    setNotice('');

    try {
      const response = await fetch(`${API}/api/orders`, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          ...customer,

          items: cartItems.map(({ productId, quantity }) => ({
            productId,
            quantity
          }))
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Order failed');
      }

      setCart([]);

      setCustomer({
        customerName: '',
        phone: '',
        address: ''
      });

      setOrderSuccess(result.orderId);

    } catch (error) {
      setNotice(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* ADD TO CART NOTIFICATION */}
      {showToast && (
        <div
          className="cart-toast"
          role="status"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            background: '#783e4c',
            color: '#fff9f8',
            padding: '15px 24px',
            borderRadius: '14px',
            fontWeight: 700,
            fontSize: '15px',
            boxShadow: '0 8px 24px rgba(83, 43, 53, 0.25)'
          }}
        >
          Treat secured! ♡
        </div>
      )}

      {/* ANNOUNCEMENT BAR */}
      <div className="announcement">
        ♡ Homemade goodies, baked with love ♡
      </div>

      {/* NAVBAR */}
      <header className="site-header">
        <button
          className="logo"
          onClick={() => go('home')}
        >
          Buraunī <span>&</span> Chokorēto
        </button>

        <nav aria-label="Main navigation">
          <button
            className={page === 'home' ? 'active' : ''}
            onClick={() => go('home')}
          >
            Home
          </button>

          <button
            className={page === 'shop' ? 'active' : ''}
            onClick={() => go('shop')}
          >
            Shop
          </button>

          <button
            className={page === 'cart' ? 'active' : ''}
            onClick={() => go('cart')}
          >
            Cart ({count})
          </button>
        </nav>
      </header>

      {/* HOME PAGE */}
      {page === 'home' && (
        <main>
          <section className="hero container">
            <div className="hero-copy">
              <p className="eyebrow">
                WELCOME TO OUR LITTLE BAKERY
              </p>

              <h1>
                Little bites,
                <br />
                <em>big smiles.</em> ♡
              </h1>

              <p>
                Handmade brownies, colourful chocolates,
                and yummy cookies — made with lots of love.
              </p>

              <button
                className="main-button"
                onClick={() => go('shop')}
              >
                Explore our goodies →
              </button>
            </div>

            {/* HOMEPAGE BROWNIE IMAGE */}
            <div className="hero-picture">
              <img
                src="/images/home-brownie.png"
                alt="Kawaii Chocolate Brownie Stack"
              />

              <div className="picture-tag">
                Freshly made with love ♡
              </div>
            </div>
          </section>

          {/* CATEGORIES */}
          <section className="container welcome">
            <h2>Something sweet for everyone ♡</h2>

            <div className="labs">
              <button
                onClick={() => {
                  setCategory('Brownies');
                  go('shop');
                }}
              >
                <span>🍫</span>
                <b>Buraunī Lab</b>
                <small>Fudgy brownie bites</small>
              </button>

              <button
                onClick={() => {
                  setCategory('Chocolates');
                  go('shop');
                }}
              >
                <span>🍓</span>
                <b>Chokorēto Lab</b>
                <small>Little chocolates, big happiness</small>
              </button>

              <button
                onClick={() => {
                  setCategory('Cookies');
                  go('shop');
                }}
              >
                <span>🍪</span>
                <b>Kukkī Lab</b>
                <small>Simple cookies, special moments</small>
              </button>
            </div>
          </section>

          <section className="note-banner">
            <div className="container">
              ♡ Home baked &nbsp; · &nbsp; Freshly made
              &nbsp; · &nbsp; Perfect for gifting ♡
            </div>
          </section>
        </main>
      )}

      {/* SHOP PAGE */}
      {page === 'shop' && (
        <main className="container shop-page">
          <p className="eyebrow">
            THE SWEET COLLECTION
          </p>

          <h1>Our Goodies ♡</h1>

          <p className="shop-intro">
            Pick your favourites from our three little labs.
          </p>

          {/* CATEGORY FILTERS */}
          <div
            className="filters"
            aria-label="Filter products"
          >
            {categories.map((name) => (
              <button
                key={name}
                className={
                  category === name ? 'selected' : ''
                }
                onClick={() => setCategory(name)}
              >
                {name}
              </button>
            ))}
          </div>

          {notice && (
            <p className="notice" role="status">
              {notice}
            </p>
          )}

          {loading && (
            <p>Loading products...</p>
          )}

          {loadError && (
            <p className="error" role="alert">
              {loadError}
            </p>
          )}

          {/* PRODUCT GRID */}
          {!loading && !loadError && (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAdd={addToCart}
                />
              ))}
            </div>
          )}
        </main>
      )}

      {/* CART PAGE */}
      {page === 'cart' && (
        <main className="container cart-page">
          <p className="eyebrow">
            YOUR SWEET TREATS
          </p>

          <h1>Your Cart ♡</h1>

          {/* SUCCESS MESSAGE */}
          {orderSuccess && (
            <div className="success" role="status">
              <h2>Thank you for ordering! ♡</h2>

              <p>
                Your demo order has been saved in MongoDB.
              </p>

              <p>
                Order ID: <code>{orderSuccess}</code>
              </p>

              <button
                className="main-button"
                onClick={() => {
                  setOrderSuccess('');
                  go('shop');
                }}
              >
                Shop again
              </button>
            </div>
          )}

          {/* EMPTY CART */}
          {!orderSuccess && cartItems.length === 0 && (
            <div className="empty-cart">
              <div className="empty-symbol">♡</div>

              <h2>Your cart is empty</h2>

              <p>Go find something sweet!</p>

              <button
                className="main-button"
                onClick={() => go('shop')}
              >
                Browse goodies →
              </button>
            </div>
          )}

          {/* CART CONTENT */}
          {!orderSuccess && cartItems.length > 0 && (
            <div className="checkout-layout">

              {/* CART PRODUCTS */}
              <section
                className="cart-items"
                aria-label="Cart items"
              >
                {cartItems.map(
                  ({ productId, quantity, product }) => (
                    <div
                      className="cart-row"
                      key={productId}
                    >
                      <img
                        src={picture(product.image)}
                        alt={product.name}
                      />

                      <div className="cart-item-name">
                        <h3>{product.name}</h3>

                        <p>{product.description}</p>

                        <strong>
                          {money(product.price)}
                        </strong>
                      </div>

                      {/* QUANTITY CONTROLS */}
                      <div className="quantity">
                        <button
                          onClick={() =>
                            changeQuantity(productId, -1)
                          }
                          aria-label={`Remove one ${product.name}`}
                        >
                          −
                        </button>

                        <span>{quantity}</span>

                        <button
                          onClick={() =>
                            changeQuantity(productId, 1)
                          }
                          disabled={quantity >= 30}
                          aria-label={`Add one ${product.name}`}
                        >
                          +
                        </button>
                      </div>

                      <b>
                        {money(quantity * product.price)}
                      </b>
                    </div>
                  )
                )}

                {/* CART TOTAL */}
                <div className="cart-total">
                  <span>Total</span>

                  <strong>{money(total)}</strong>
                </div>
              </section>

              {/* ORDER FORM */}
              <form
                className="order-form"
                onSubmit={submitOrder}
              >
                <h2>Place a simple order</h2>

                <p>
                  Made with love, packed with care ♡
                </p>

                <label htmlFor="customerName">
                  Full name
                </label>

                <input
                  id="customerName"
                  required
                  maxLength="80"
                  value={customer.customerName}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      customerName: e.target.value
                    })
                  }
                  placeholder="Your name"
                />

                <label htmlFor="phone">
                  Phone number
                </label>

                <input
                  id="phone"
                  required
                  type="tel"
                  pattern="[0-9]{10}"
                  maxLength="10"
                  value={customer.phone}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      phone: e.target.value
                    })
                  }
                  placeholder="10-digit phone number"
                />

                <label htmlFor="address">
                  Delivery address
                </label>

                <textarea
                  id="address"
                  required
                  rows="3"
                  maxLength="500"
                  value={customer.address}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      address: e.target.value
                    })
                  }
                  placeholder="Your address"
                />

                {notice && (
                  <p className="error" role="alert">
                    {notice}
                  </p>
                )}

                <button
                  className="main-button full"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting
                    ? 'Placing order...'
                    : `Place order · ${money(total)}`}
                </button>
              </form>
            </div>
          )}
        </main>
      )}

      {/* FOOTER */}
      <footer>
        <strong>
          Buraunī <span>&</span> Chokorēto
        </strong>
        <p>little bites, big smiles ♡</p>
      </footer>
    </>
  );
}
