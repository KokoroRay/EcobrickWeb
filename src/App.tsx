import { Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Process from './pages/Process';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import HowItWorks from './pages/HowItWorks';
import Rewards from './pages/Rewards';
import Redeem from './pages/Redeem';
import Vouchers from './pages/Vouchers';
import Admin from './pages/Admin';
import { RewardsProvider } from './context/RewardsContext';

export default function App() {
  return (
    <RewardsProvider>
      <div className="app">
        <Header />
        <main className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/process" element={<Process />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/redeem" element={<Redeem />} />
            <Route path="/vouchers" element={<Vouchers />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </RewardsProvider>
  );
}
