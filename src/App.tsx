import { Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
import { Amplify } from 'aws-amplify';
import { signOut, getCurrentUser } from 'aws-amplify/auth';
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

// Protected route component
function ProtectedRoute({ element }: { element: JSX.Element }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsAuthenticated(false);
    window.location.href = '/';
  };

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Login />;

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', padding: '20px' }}>
      <div style={{ textAlign: 'center', padding: '10px', background: '#f0f0f0', marginBottom: '20px' }}>
        <span>Xin chào {user?.username}</span>
        <button onClick={handleSignOut} style={{ marginLeft: '10px', padding: '5px 15px', cursor: 'pointer' }}>
          Đăng xuất
        </button>
      </div>
      {element}
    </div>
  );
}

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
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/rewards" element={<ProtectedRoute element={<Rewards />} />} />
            <Route path="/redeem" element={<ProtectedRoute element={<Redeem />} />} />
            <Route path="/vouchers" element={<ProtectedRoute element={<Vouchers />} />} />
            <Route path="/admin" element={<ProtectedRoute element={<Admin />} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </RewardsProvider>
  );
}
