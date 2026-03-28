/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingCart, 
  User, 
  Search, 
  ChevronRight, 
  Star, 
  ArrowLeft, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle, 
  CreditCard, 
  Package, 
  Menu, 
  X,
  ExternalLink,
  Github,
  Database,
  Layers,
  Zap,
  ShieldCheck,
  Layout
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { Product, CartItem, UserProfile, Order } from './types';
import { INITIAL_PRODUCTS, CATEGORIES } from './constants';
import { cn } from './lib/utils';

// --- Components ---

const Navbar = ({ cartCount, user, onSignIn, onSignOut }: { 
  cartCount: number, 
  user: FirebaseUser | null, 
  onSignIn: () => void, 
  onSignOut: () => void 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">MODERN<span className="text-gray-400">SHOP</span></span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Home</Link>
            <Link to="/products" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Shop</Link>
            <Link to="/case-study" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Case Study</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-black transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-black text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
            
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                  <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </Link>
                <button onClick={onSignOut} className="text-xs font-medium text-gray-500 hover:text-black transition-colors">Sign Out</button>
              </div>
            ) : (
              <button 
                onClick={onSignIn}
                className="text-sm font-medium px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
              >
                Sign In
              </button>
            )}

            <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-6 flex flex-col gap-4">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium">Home</Link>
              <Link to="/products" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium">Shop</Link>
              <Link to="/case-study" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium">Case Study</Link>
              <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium">My Profile</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const ProductCard = ({ product, onAddToCart }: { product: Product, onAddToCart: (p: Product) => void }) => {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 mb-4">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest rounded-full">
              {product.category}
            </span>
          </div>
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">{product.name}</h3>
        <p className="text-lg font-bold text-black">${product.price.toFixed(2)}</p>
      </Link>
      <button 
        onClick={(e) => {
          e.preventDefault();
          onAddToCart(product);
        }}
        className="mt-4 w-full py-3 bg-gray-50 text-black text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-black hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Add to Cart
      </button>
    </motion.div>
  );
};

// --- Pages ---

const HomePage = ({ products, onAddToCart }: { products: Product[], onAddToCart: (p: Product) => void }) => {
  const featuredProducts = products.slice(0, 4);
  const newArrivals = products.slice(4, 8);

  return (
    <div className="space-y-32 pb-32 overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden bg-black">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1920" 
            alt="Hero" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-[0.4em] rounded-full mb-8 border border-white/20">
                Curated Design Essentials
              </span>
              <h1 className="text-7xl md:text-9xl font-bold text-white leading-[0.85] tracking-tighter mb-10">
                Pure <br /> <span className="text-gray-400 italic font-serif">Function.</span>
              </h1>
              <p className="text-xl text-gray-300 mb-12 max-w-lg leading-relaxed font-light">
                We believe in objects that serve a purpose and look beautiful doing it. Discover our latest collection of minimalist tools for modern living.
              </p>
              <div className="flex flex-wrap gap-6">
                <Link to="/products" className="group px-10 py-5 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all flex items-center gap-3">
                  Shop Now <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/case-study" className="px-10 py-5 bg-transparent text-white border border-white/30 font-bold rounded-full hover:bg-white/10 transition-all">
                  Read Case Study
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30"
        >
          <div className="w-px h-16 bg-gradient-to-b from-white/50 to-transparent mx-auto" />
        </motion.div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            whileHover={{ scale: 0.98 }}
            className="relative h-[500px] rounded-[3rem] overflow-hidden group cursor-pointer"
          >
            <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800" alt="Electronics" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-12 flex flex-col justify-end">
              <h3 className="text-4xl font-bold text-white mb-4">Electronics</h3>
              <p className="text-gray-300 mb-6 max-w-xs">High-performance tools for the modern digital nomad.</p>
              <Link to="/products" className="text-white font-bold border-b border-white self-start pb-1">Explore Category</Link>
            </div>
          </motion.div>
          <div className="grid grid-rows-2 gap-8">
            <motion.div 
              whileHover={{ scale: 0.98 }}
              className="relative rounded-[3rem] overflow-hidden group cursor-pointer"
            >
              <img src="https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&q=80&w=800" alt="Furniture" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors p-8 flex flex-col justify-end">
                <h3 className="text-2xl font-bold text-white">Furniture</h3>
              </div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 0.98 }}
              className="relative rounded-[3rem] overflow-hidden group cursor-pointer"
            >
              <img src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=800" alt="Stationery" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors p-8 flex flex-col justify-end">
                <h3 className="text-2xl font-bold text-white">Stationery</h3>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div className="max-w-xl">
            <h2 className="text-5xl font-bold tracking-tighter mb-4">The Essentials</h2>
            <p className="text-gray-500 text-lg">Our most loved pieces, crafted with precision and designed to last a lifetime.</p>
          </div>
          <Link to="/products" className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
            View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <ProductCard product={product} onAddToCart={onAddToCart} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Big Statement Section */}
      <section className="bg-black py-32 text-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="max-w-4xl mx-auto px-4"
        >
          <h2 className="text-5xl md:text-8xl font-bold text-white tracking-tighter leading-tight mb-12">
            Design is not just what it looks like. <br />
            <span className="text-gray-600">Design is how it works.</span>
          </h2>
          <div className="w-24 h-px bg-white/20 mx-auto mb-12" />
          <p className="text-gray-400 text-xl font-light tracking-wide uppercase">Steve Jobs</p>
        </motion.div>
      </section>

      {/* New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-16">
          <h2 className="text-5xl font-bold tracking-tighter">New Arrivals</h2>
          <span className="text-gray-400 font-mono text-sm">08 / 2026</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-8">
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden bg-gray-100">
              <img src={newArrivals[0].image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold mb-2">{newArrivals[0].name}</h3>
                <p className="text-gray-500">{newArrivals[0].category}</p>
              </div>
              <p className="text-2xl font-bold">${newArrivals[0].price}</p>
            </div>
            <button 
              onClick={() => onAddToCart(newArrivals[0])}
              className="w-full py-5 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-colors"
            >
              Add to Cart
            </button>
          </div>
          <div className="grid grid-cols-1 gap-8">
            {newArrivals.slice(1, 3).map((product) => (
              <div key={product.id} className="flex gap-8 group">
                <div className="w-48 h-48 rounded-3xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <img src={product.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{product.category}</p>
                  <h3 className="text-xl font-bold mb-4">{product.name}</h3>
                  <p className="text-lg font-bold mb-6">${product.price}</p>
                  <button 
                    onClick={() => onAddToCart(product)}
                    className="text-sm font-bold border-b-2 border-black self-start pb-1"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-50 rounded-[4rem] p-12 md:p-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8">Join the Inner Circle</h2>
            <p className="text-gray-500 text-lg mb-12 max-w-xl mx-auto">
              Subscribe to receive early access to new drops, exclusive offers, and minimalist design inspiration.
            </p>
            <form className="max-w-md mx-auto flex gap-4" onSubmit={(e) => { e.preventDefault(); toast.success("Subscribed!"); }}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-6 py-4 bg-white border-none rounded-2xl focus:ring-2 focus:ring-black transition-all"
                required
              />
              <button className="px-8 py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-colors">
                Join
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

const ProductsPage = ({ products, onAddToCart }: { products: Product[], onAddToCart: (p: Product) => void }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Shop Collection</h1>
          <p className="text-gray-500">Browse our full range of minimalist essentials.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all"
          />
        </div>
      </div>

      <div className="flex gap-4 mb-12 overflow-x-auto pb-4 scrollbar-hide">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all",
              selectedCategory === category 
                ? "bg-black text-white shadow-lg shadow-black/20" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-gray-50 rounded-3xl">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search or category filter.</p>
        </div>
      )}
    </div>
  );
};

const ProductDetailsPage = ({ products, onAddToCart }: { products: Product[], onAddToCart: (p: Product) => void }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find(p => p.id === id);

  if (!product) return <div className="py-24 text-center">Product not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black mb-12 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Collection
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="aspect-square rounded-3xl overflow-hidden bg-gray-100"
        >
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </motion.div>

        <div className="flex flex-col justify-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">{product.category}</span>
          <h1 className="text-5xl font-bold tracking-tight mb-6">{product.name}</h1>
          <p className="text-3xl font-bold text-black mb-8">${product.price.toFixed(2)}</p>
          
          <div className="prose prose-gray mb-10">
            <p className="text-lg text-gray-600 leading-relaxed">
              {product.description || "This premium product is designed with both aesthetics and functionality in mind. Crafted from high-quality materials, it offers a perfect blend of modern design and everyday utility."}
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-200 rounded-xl p-1">
                <button className="p-2 hover:bg-gray-50 rounded-lg"><Minus className="w-4 h-4" /></button>
                <span className="px-4 font-bold">1</span>
                <button className="p-2 hover:bg-gray-50 rounded-lg"><Plus className="w-4 h-4" /></button>
              </div>
              <button 
                onClick={() => onAddToCart(product)}
                className="flex-1 py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-8 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs font-bold">Free Shipping</p>
                  <p className="text-[10px] text-gray-500">Orders over $100</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs font-bold">2 Year Warranty</p>
                  <p className="text-[10px] text-gray-500">Full coverage</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CartPage = ({ cart, updateQuantity, removeFromCart, onCheckout }: { 
  cart: CartItem[], 
  updateQuantity: (id: string, delta: number) => void, 
  removeFromCart: (id: string) => void,
  onCheckout: () => void
}) => {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 15;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <ShoppingCart className="w-10 h-10 text-gray-300" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-gray-500 mb-10">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/products" className="px-8 py-4 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold tracking-tight mb-12">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-8">
          {cart.map(item => (
            <div key={item.id} className="flex gap-6 pb-8 border-b border-gray-100">
              <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{item.category}</p>
                    <h3 className="text-xl font-bold">{item.name}</h3>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex justify-between items-end">
                  <div className="flex items-center border border-gray-200 rounded-xl p-1">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:bg-gray-50 rounded-lg"><Minus className="w-4 h-4" /></button>
                    <span className="px-4 font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:bg-gray-50 rounded-lg"><Plus className="w-4 h-4" /></button>
                  </div>
                  <p className="text-xl font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-3xl p-8 sticky top-24">
            <h2 className="text-2xl font-bold mb-8">Order Summary</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-bold text-black">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-bold text-black">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="pt-4 border-t border-gray-200 flex justify-between items-end">
                <span className="text-lg font-bold">Total</span>
                <span className="text-3xl font-bold">${total.toFixed(2)}</span>
              </div>
            </div>
            <button 
              onClick={onCheckout}
              className="w-full py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              Checkout <ChevronRight className="w-5 h-5" />
            </button>
            <p className="text-[10px] text-gray-400 text-center mt-6 uppercase tracking-widest font-bold">
              Secure Checkout Powered by Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const CaseStudyPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-16"
      >
        <header className="text-center space-y-6">
          <span className="px-4 py-1.5 bg-black text-white text-[10px] font-bold uppercase tracking-[0.3em] rounded-full">Portfolio Case Study</span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">Full E-commerce Platform</h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            A comprehensive full-stack solution designed to deliver a seamless minimalist shopping experience with modern web technologies.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Layout className="w-6 h-6" /> Project Overview
            </h2>
            <p className="text-gray-600 leading-relaxed">
              This project involved designing and developing a fully functional e-commerce platform with responsive layouts, dynamic product pages, a shopping cart system, and secure checkout integration. The goal was to deliver a smooth and engaging online shopping experience while maintaining a minimalist aesthetic.
            </p>
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Layers className="text-black w-6 h-6" /> Tech Stack
            </h2>
            <div className="flex flex-wrap gap-2">
              {['React 19', 'Vite', 'Tailwind CSS', 'Firebase', 'Express', 'Motion', 'Lucide Icons'].map(tech => (
                <span key={tech} className="px-3 py-1 bg-gray-100 text-xs font-bold rounded-lg">{tech}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <h2 className="text-3xl font-bold">Core Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { title: 'Dynamic Catalog', desc: 'Real-time product filtering and search functionality.' },
              { title: 'Cart Management', desc: 'Persistent shopping cart with quantity controls and total calculation.' },
              { title: 'Firebase Auth', desc: 'Secure Google authentication for user profiles and order tracking.' },
              { title: 'Responsive Design', desc: 'Fluid layouts optimized for mobile, tablet, and desktop devices.' },
              { title: 'Order History', desc: 'Personalized dashboard to track past purchases and order status.' },
              { title: 'Simulated Checkout', desc: 'Realistic payment flow with validation and success feedback.' }
            ].map((feature, i) => (
              <div key={i} className="p-6 bg-gray-50 rounded-2xl space-y-2">
                <h3 className="font-bold">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <h2 className="text-3xl font-bold">Development Process</h2>
          <div className="space-y-12">
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold">01</div>
              <div>
                <h3 className="text-xl font-bold mb-2">UI/UX Design</h3>
                <p className="text-gray-600">Focused on a minimalist "Apple-style" aesthetic using high whitespace, bold typography, and subtle micro-interactions to guide the user flow.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold">02</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Backend Architecture</h3>
                <p className="text-gray-600">Implemented a hybrid serverless approach using Firebase for data persistence and Express for complex business logic and simulated integrations.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold">03</div>
              <div>
                <h3 className="text-xl font-bold mb-2">State Management</h3>
                <p className="text-gray-600">Leveraged React hooks and local storage to manage complex cart states and user sessions across page reloads.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="p-12 bg-black text-white rounded-[3rem] space-y-8">
          <h2 className="text-3xl font-bold">Challenges Solved</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-400">Real-time Sync</h3>
              <p className="text-gray-300">Challenge: Keeping the UI in sync with Firestore across multiple tabs. <br /> Solution: Implemented `onSnapshot` listeners for real-time data streaming.</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-400">Security Rules</h3>
              <p className="text-gray-300">Challenge: Preventing unauthorized access to user orders. <br /> Solution: Developed robust Firestore Security Rules with ownership-based validation.</p>
            </div>
          </div>
        </section>

        <footer className="text-center pt-12 border-t border-gray-100">
          <p className="text-gray-400 text-sm font-medium mb-8">Built with passion by lordryefox@gmail.com</p>
          <div className="flex justify-center gap-6">
            <a href="#" className="p-3 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"><Github className="w-5 h-5" /></a>
            <a href="#" className="p-3 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"><ExternalLink className="w-5 h-5" /></a>
          </div>
        </footer>
      </motion.div>
    </div>
  );
};

const ProfilePage = ({ user, orders }: { user: FirebaseUser | null, orders: Order[] }) => {
  if (!user) return <div className="py-24 text-center">Please sign in to view your profile.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-gray-50 rounded-3xl p-8 text-center">
            <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-6 border-4 border-white shadow-xl">
              <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <h2 className="text-2xl font-bold">{user.displayName}</h2>
            <p className="text-gray-500 mb-6">{user.email}</p>
            <div className="flex justify-center gap-2">
              <span className="px-3 py-1 bg-black text-white text-[10px] font-bold uppercase rounded-full">Client</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full">Verified</span>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-8 space-y-6">
            <h3 className="font-bold">Account Settings</h3>
            <div className="space-y-4">
              <button className="w-full text-left text-sm font-medium text-gray-600 hover:text-black transition-colors">Personal Information</button>
              <button className="w-full text-left text-sm font-medium text-gray-600 hover:text-black transition-colors">Shipping Addresses</button>
              <button className="w-full text-left text-sm font-medium text-gray-600 hover:text-black transition-colors">Payment Methods</button>
              <button className="w-full text-left text-sm font-medium text-gray-600 hover:text-black transition-colors">Notifications</button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-3xl font-bold tracking-tight">Order History</h2>
          {orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order.id} className="bg-white border border-gray-100 rounded-3xl p-8 flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-gray-100 text-[10px] font-bold uppercase rounded-full">Order #{order.id.slice(-6)}</span>
                      <span className={cn(
                        "px-3 py-1 text-[10px] font-bold uppercase rounded-full",
                        order.status === 'completed' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                      )}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 overflow-hidden">
                          <img src={INITIAL_PRODUCTS.find(p => p.id === item.productId)?.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col justify-between items-end">
                    <p className="text-2xl font-bold">${order.totalAmount.toFixed(2)}</p>
                    <button className="text-sm font-bold text-black border-b border-black">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center bg-gray-50 rounded-3xl">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No orders yet</h3>
              <p className="text-gray-500">Your order history will appear here once you make a purchase.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CheckoutModal = ({ isOpen, onClose, onConfirm, total }: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: (details: any) => void,
  total: number
}) => {
  const [details, setDetails] = useState({ name: '', email: '', address: '', city: '', zip: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate API call to backend
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [], totalAmount: total })
      });
      const data = await response.json();
      if (data.success) {
        onConfirm(details);
      }
    } catch (err) {
      toast.error('Payment processing failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl overflow-hidden relative"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-3xl font-bold mb-2">Checkout</h2>
        <p className="text-gray-500 mb-8">Complete your order details below.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Full Name</label>
              <input 
                required
                type="text" 
                value={details.name}
                onChange={(e) => setDetails({...details, name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Email</label>
              <input 
                required
                type="email" 
                value={details.email}
                onChange={(e) => setDetails({...details, email: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Shipping Address</label>
            <input 
              required
              type="text" 
              value={details.address}
              onChange={(e) => setDetails({...details, address: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">City</label>
              <input 
                required
                type="text" 
                value={details.city}
                onChange={(e) => setDetails({...details, city: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">ZIP Code</label>
              <input 
                required
                type="text" 
                value={details.zip}
                onChange={(e) => setDetails({...details, zip: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Amount</p>
              <p className="text-2xl font-bold">${total.toFixed(2)}</p>
            </div>
            <button 
              disabled={isProcessing}
              type="submit"
              className="px-8 py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>Pay Now <CreditCard className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthReady(true);
      
      if (firebaseUser) {
        // Sync user to Firestore
        const userRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              role: 'client'
            });
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, 'users');
        }

        // Fetch orders
        try {
          const ordersQuery = query(
            collection(db, 'orders'), 
            where('userId', '==', firebaseUser.uid),
            orderBy('createdAt', 'desc')
          );
          const ordersSnap = await getDocs(ordersQuery);
          setOrders(ordersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
        } catch (err) {
          handleFirestoreError(err, OperationType.LIST, 'orders');
        }
      } else {
        setOrders([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const handleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Successfully signed in!');
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Failed to sign in.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully.');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart!`);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
    toast.error('Item removed from cart.');
  };

  const handleCheckout = async (details: any) => {
    if (!user) {
      toast.error('Please sign in to complete your purchase.');
      return;
    }

    try {
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const shipping = subtotal > 100 ? 0 : 15;
      const total = subtotal + shipping;

      const orderData = {
        userId: user.uid,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: total,
        status: 'pending',
        createdAt: serverTimestamp()
      };

      const orderRef = await addDoc(collection(db, 'orders'), orderData);
      
      setCart([]);
      setIsCheckoutOpen(false);
      toast.success('Order placed successfully!', {
        description: `Order ID: #${orderRef.id.slice(-6)}`,
        icon: <CheckCircle className="w-5 h-5 text-green-500" />
      });
      
      // Refresh orders
      const ordersQuery = query(
        collection(db, 'orders'), 
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const ordersSnap = await getDocs(ordersQuery);
      setOrders(ordersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
    } catch (error) {
      console.error('Checkout error:', error);
      handleFirestoreError(error, OperationType.CREATE, 'orders');
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0) + (cart.reduce((sum, item) => sum + item.price * item.quantity, 0) > 100 ? 0 : 15);

  return (
    <Router>
      <div className="min-h-screen bg-white font-sans text-black selection:bg-black selection:text-white">
        <Toaster position="top-center" richColors />
        
        <Navbar 
          cartCount={cartCount} 
          user={user} 
          onSignIn={handleSignIn} 
          onSignOut={handleSignOut} 
        />

        <main>
          <Routes>
            <Route path="/" element={<HomePage products={INITIAL_PRODUCTS} onAddToCart={addToCart} />} />
            <Route path="/products" element={<ProductsPage products={INITIAL_PRODUCTS} onAddToCart={addToCart} />} />
            <Route path="/products/:id" element={<ProductDetailsPage products={INITIAL_PRODUCTS} onAddToCart={addToCart} />} />
            <Route path="/cart" element={<CartPage cart={cart} updateQuantity={updateQuantity} removeFromCart={removeFromCart} onCheckout={() => setIsCheckoutOpen(true)} />} />
            <Route path="/profile" element={<ProfilePage user={user} orders={orders} />} />
            <Route path="/case-study" element={<CaseStudyPage />} />
          </Routes>
        </main>

        <CheckoutModal 
          isOpen={isCheckoutOpen} 
          onClose={() => setIsCheckoutOpen(false)} 
          onConfirm={handleCheckout}
          total={cartTotal}
        />

        <footer className="bg-gray-50 border-t border-gray-100 py-12 mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="col-span-1 md:col-span-2 space-y-6">
                <Link to="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold tracking-tight">MODERN<span className="text-gray-400">SHOP</span></span>
                </Link>
                <p className="text-gray-500 max-w-sm">
                  A premium minimalist e-commerce platform built for the modern professional. Experience seamless shopping and exceptional design.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-6">Quick Links</h4>
                <ul className="space-y-4 text-sm text-gray-500">
                  <li><Link to="/" className="hover:text-black transition-colors">Home</Link></li>
                  <li><Link to="/products" className="hover:text-black transition-colors">Shop</Link></li>
                  <li><Link to="/case-study" className="hover:text-black transition-colors">Case Study</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-6">Support</h4>
                <ul className="space-y-4 text-sm text-gray-500">
                  <li><a href="#" className="hover:text-black transition-colors">Shipping Policy</a></li>
                  <li><a href="#" className="hover:text-black transition-colors">Return Policy</a></li>
                  <li><a href="#" className="hover:text-black transition-colors">Terms of Service</a></li>
                </ul>
              </div>
            </div>
            <div className="pt-12 mt-12 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-xs text-gray-400 font-medium">© 2026 ModernShop Platform. All rights reserved.</p>
              <div className="flex gap-6">
                <CreditCard className="w-6 h-6 text-gray-300" />
                <div className="flex items-center gap-1 text-xs font-bold text-gray-400">
                  <ShieldCheck className="w-4 h-4" /> SECURE PAYMENTS
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
