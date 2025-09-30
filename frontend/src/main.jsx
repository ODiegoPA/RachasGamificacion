import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.jsx'
import LoginPage from './pages/login.jsx';
import RegisterPage from './pages/register.jsx';
import MainPage from './pages/inicio.jsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RankingsPage from './pages/rankingMensual.jsx';
import HistorialPage from './pages/historial.jsx';
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/login',
    element: <LoginPage/>
  },
  {
    path: '/register',
    element: <RegisterPage/>
  },
  {
    path: '/inicio',
    element: <MainPage/>
  },
  {
    path: '/rankings',
    element: <RankingsPage/>
  },
  {
    path: '/historial',
    element: <HistorialPage/>
  },
  
])
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
