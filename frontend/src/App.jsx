import React from 'react'
import { Outlet } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import Header from './components/Header'
import Footer from './components/Footer'
import Chatbot from './components/Chatbot'

const App = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="py-3 flex-grow-1">
        <Container>
          {/* Nơi chứa nội dung thay đổi (Trang chủ, chi tiết, v.v...) */}
          <Outlet />
        </Container>
      </main>
      <Chatbot />
      <Footer />
    </div>
  )
}

export default App;
