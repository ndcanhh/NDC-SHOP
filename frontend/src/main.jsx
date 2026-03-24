import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider
} from 'react-router-dom'
import App from './App.jsx'
import HomeScreen from './screens/HomeScreen.jsx'
import ProductScreen from './screens/ProductScreen.jsx'
import CartScreen from './screens/CartScreen.jsx'
import LoginScreen from './screens/LoginScreen.jsx'
import RegisterScreen from './screens/RegisterScreen.jsx'
import SearchScreen from './screens/SearchScreen.jsx'
import ProfileScreen from './screens/ProfileScreen.jsx'
import AboutScreen from './screens/AboutScreen.jsx'
import ContactScreen from './screens/ContactScreen.jsx'
import NewsScreen from './screens/NewsScreen.jsx'
import CheckoutScreen from './screens/CheckoutScreen.jsx'
import OrderScreen from './screens/OrderScreen.jsx'

// Import các trang dành cho Admin
import AdminRoute from './components/AdminRoute.jsx'
import AdminLayout from './components/AdminLayout.jsx'
import AdminDashboard from './screens/admin/AdminDashboard.jsx'
import UserListScreen from './screens/admin/UserListScreen.jsx'
import ProductListScreen from './screens/admin/ProductListScreen.jsx'
import OrderListScreen from './screens/admin/OrderListScreen.jsx'

// Các Kho Lưu Trữ Chung (Context)
import { CartProvider } from './context/CartContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css' 

// Khởi tạo các tuyến đường: Gom nhóm thành 2 Layout chính
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      {/* 1. LAYOUT CHO KHÁCH HÀNG (Có Header, Footer, Chatbot) */}
      <Route path='/' element={<App />}>
         <Route index={true} path='/' element={<HomeScreen />} />
         <Route path='/product/:id' element={<ProductScreen />} />
         <Route path='/cart' element={<CartScreen />} />
         <Route path='/login' element={<LoginScreen />} />
         <Route path='/register' element={<RegisterScreen />} />
         <Route path='/search' element={<SearchScreen />} />
         <Route path='/profile' element={<ProfileScreen />} />
         <Route path='/about' element={<AboutScreen />} />
         <Route path='/contact' element={<ContactScreen />} />
         <Route path='/news' element={<NewsScreen />} />
         <Route path='/checkout' element={<CheckoutScreen />} />
         <Route path='/orders' element={<OrderScreen />} />
      </Route>

      {/* 2. LAYOUT CHO ADMIN (Giao diện riêng, Logo ngang) */}
      <Route path='' element={<AdminRoute />}>
         <Route path='/admin' element={<AdminLayout />}>
            <Route path='dashboard' element={<AdminDashboard />} />
            <Route path='userlist' element={<UserListScreen />} />
            <Route path='productlist' element={<ProductListScreen />} />
            <Route path='orderlist' element={<OrderListScreen />} />
         </Route>
      </Route>
    </Route>
  )
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>,
)
