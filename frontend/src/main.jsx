import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { Provider } from 'react-redux'
import store from "./redux/store.js"
import Home from './components/Home.jsx'
import AboutUs from './components/AboutUs.jsx'
import Login from './components/Login.jsx'
import Register from "./components/Register.jsx"
import Vehicles from './components/Vehicles.jsx'
import Booking from './components/Booking.jsx'
import Feedback from './components/Feedback.jsx'
import MyRides from './components/MyRides.jsx'
import Leaderboard from './components/Leaderboard.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />
      },
      {
        path: "/about-us",
        element: <AboutUs />
      },
      {
        path: "/login",
        element: <Login />
      },
      {
        path: "/register",
        element: <Register /> 
      },
      {
        path: "/vehicles",
        element: <Vehicles />
      },
      {
        path: "/booking/:vehicleID",
        element: <Booking />
      },
      {
        path: "/feedback/:rideID",
        element: <Feedback />
      },
      {
        path: "/history",
        element: <MyRides />
      },
      {
        path: "/leaderboard",
        element: <Leaderboard />
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
)
