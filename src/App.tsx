import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ModalProvider } from './contexts/ModalContext';
import Dashboard from './components/Dashboard';
import AdminLogin from './components/Admin/AdminLogin';
import AdminDashboard from './components/Admin/Dashboard/AdminDashboard';
import ProtectedAdminRoute from './components/Admin/ProtectedAdminRoute';
import SuccessStoryPage from './components/SuccessStory/SuccessStoryPage';
import ProfilePage from './components/ProfilePage';
import ResetPassword from './components/AuthComponents/ResetPassword';
import Logout from './components/AuthComponents/Logout';
import SuccessPage from './components/dashboard/CreatorDashboard/Success';
import Pricing from './components/Pricing/Pricing';
import PurchaseCredits from './components/Pricing/PurchaseCredits';
import ViewMou from './components/Mou/ViewMou';
import CareerPage from './components/Careers/CareerPage';
import FAQ from './components/FAQ/FAQ';
import NotFound from './components/NotFound';
import Home from './components/HomePage/Home';
import SuccessStories from './components/SuccessStory/SuccessStories';
import HowWeWork from './pages/HowWeWork';
import Trending from './pages/TrendingEvents';
import ContactUs from './pages/ContactUs';
import Blogs from './pages/Blogs';

// Export FormData interface for use in components
export interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  organization_type: string;
}

function App() {
  return (
    <AuthProvider>
      <ModalProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            {/* <Route path="/profile/:userId" element={<ProfilePage />} /> */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/logout" element={<Logout />} />
            {/* <Route path="/success" element={<SuccessPage onSubmit={() => {}} />} /> */}
            <Route path="/faq" element={<FAQ />} />
            <Route path="/purchase" element={<PurchaseCredits />} />
            <Route path="/view-mou" element={<ViewMou />} />

            <Route path="/how-we-work" element={<HowWeWork />} />
            <Route path="/trending-events" element={<Trending />} />
            <Route path='/Contact-us' element={<ContactUs />} />
            <Route path='/blogs' element={<Blogs />} />
            <Route path='/blog/:id' element={<SuccessStoryPage />} />



            <Route
              path="/admin/*"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />
            <Route path="/stories/:id" element={<SuccessStoryPage />} />
            <Route path="/stories" element={<SuccessStories />} />
            {/* <Route path="/Careers" element={<CareerPage />} /> */}
            <Route path="*" element={<NotFound />} />
          </Routes>


        </Router>
        <Toaster
          position="bottom-center"
          // toastOptions={{
          //   duration: 4000,
          //   style: {
          //     background: '#f0faf5',
          //     color: '#047857',
          //     maxWidth: '500px',
          //     padding: '16px',
          //     borderRadius: '8px',
          //   },
          //   success: {
          //     duration: 3000,
          //     iconTheme: {
          //       primary: '#4ade80',
          //       secondary: '#fff',
          //     },
          //   },
          //   error: {
          //     duration: 4000,
          //     iconTheme: {
          //       primary: '#ef4444',
          //       secondary: '#fff',
          //     },
          //   },
          // }}
        />
      </ModalProvider>
    </AuthProvider>
  );
}

export default App;