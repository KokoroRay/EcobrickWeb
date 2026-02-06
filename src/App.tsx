import { Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Process from './pages/Process';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import HowItWorks from './pages/HowItWorks';
import Rewards from './pages/Rewards';
import Redeem from './pages/Redeem';
import Vouchers from './pages/Vouchers';
import Admin from './pages/Admin';
import TestRole from './pages/TestRole';
import { RewardsProvider } from './context/RewardsContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';

const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;
const redirectSignIn = import.meta.env.VITE_COGNITO_REDIRECT_SIGNIN;
const redirectSignOut = import.meta.env.VITE_COGNITO_REDIRECT_SIGNOUT;

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
      region: import.meta.env.VITE_AWS_REGION,
      ...(cognitoDomain && redirectSignIn && redirectSignOut
        ? {
            loginWith: {
              oauth: {
                domain: cognitoDomain,
                scopes: ['email', 'openid', 'profile'],
                redirectSignIn: [redirectSignIn],
                redirectSignOut: [redirectSignOut],
                responseType: 'code',
              },
            },
          }
        : {}),
    }
  }
});

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
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
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                
                {/* Test Role - Kiểm tra role & token */}
                <Route path="/test-role" element={<ProtectedRoute><TestRole /></ProtectedRoute>} />
                
                {/* Protected Routes - Yêu cầu đăng nhập */}
                <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
                <Route path="/redeem" element={<ProtectedRoute><Redeem /></ProtectedRoute>} />
                <Route path="/vouchers" element={<ProtectedRoute><Vouchers /></ProtectedRoute>} />
                
                {/* Admin Routes - Yêu cầu đăng nhập + role admin */}
                <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
              </Routes>
            </main>
            <Footer />
          </div>
        </RewardsProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
