import './App.css';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';


import ThemePage from './ThemePage.jsx';
import GalleryPage from './GalleryPage.jsx';
import ErrorPage from './ErrorPage.jsx';



const router = createBrowserRouter([
  { path: '/', Component: ThemePage },
  { path: '/theme/:theme', Component: GalleryPage },
  { path: '*', Component: ErrorPage },

]);

function App() {


  return (
<main className="gallery-page">
    <header className="gallery-header">
        <h1>
          <a href="/">
            <img src="/aopce_logo.png" alt="aopce logo"/>
          </a>
          </h1>
        <p className="intro">
        </p>

        <h3>
          About Oliver's Photography Community Event
        </h3>

        <hr className='fade-edge'/>

        

        <div className="gallery-controls">
         
        </div>
      </header>

    <RouterProvider router={router} />

    

    <footer>
      <hr className='fade-edge'/>
      
      @Members of the About Oliver server <br></br>
      Access the <a href="/upload">Media Server</a> to download images the full images

      
      </footer>

    </main>

    )
}
export default App
