import { useEffect, useState } from 'react'
import Header from "./components/Header.jsx"
import Footer from "./components/Footer"
import { Outlet } from 'react-router-dom'
import './index.css'
import { useDispatch } from 'react-redux'
import { login } from './redux/authSlice.js'

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    const auth = localStorage.getItem('auth')

    if (auth) {
      const authData = JSON.parse(auth)

      dispatch(login({
        user: authData.userData,
        token: authData.token
      }))
    }
  },[dispatch])

  return (
    <div className='min-h-screen flex flex-wrap content-between'>
      <Header />
      <main className='mx-auto'>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default App
