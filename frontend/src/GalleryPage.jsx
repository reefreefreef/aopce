import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom';

import './App.css'

import Overlay from './Overlay.jsx'

const APIUrl = window.location.protocol=="http:" ? "http://192.168.50.28:4927/api" : "/api"

async function getGalleryImages(theme, next) {
        fetch(APIUrl + `/themes/${theme}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => {
                return res.json();
            }).then((res) => {
                if (res.error) {
                    alert(res.message)
                } else {
                    next(res)
                }
            })
        }
    

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState('')
  const [galleryImages, setGalleryImages] = useState([])

  const navigate = useNavigate();
  
  //<p className="image-count" aria-live="polite">
            //{filteredImages.length} {filteredImages.length === 1 ? 'image' : 'images'}
          //</p>

          var selectedTheme = window.location.pathname.split("/")
          selectedTheme = selectedTheme[selectedTheme.length-1]

    useEffect(() => {
      if (selectedTheme!="") {
        getGalleryImages(selectedTheme, (res)=>{
          setGalleryImages(res)
          console.log(res)
        })
      }
    }, [selectedTheme])
    console.log(galleryImages.length)
  return (
<div style={{width:"100%"}}>

    <div className='gallery-subtitle back-button' >
        <a onClick={()=>{navigate("/")}}>{"⇦ Themes"}</a>
        </div>
    <div className='gallery-subtitle'>
        
        {selectedTheme}
        </div>
        <div>

      {galleryImages.length > 0 ? (
        <section className="image-grid" aria-label="Image gallery">
          {galleryImages.map((image) => (
            <button
            className="image-card"
            key={image}
            type="button"
            aria-label={`View ${image.name}`}
            onClick={() => {
              setSelectedImage(`${selectedTheme}/${image.name}`)
              
            }}
            >
              <img
                src={`/image/${selectedTheme}/${encodeURIComponent(image.name)}?thumb`}
                alt=""
                loading="lazy"
                decoding="async"
                />
              <span className="image-card__caption">
                {image.name.replace(/\.[^.]+$/, '').replace("_", " ")}
              </span>
            </button>
          ))}
        </section>
      ) : (
        <p className="empty-state">No Images</p>
        
      )}

      {selectedImage && (
        <Overlay image={selectedImage} onClose={() => setSelectedImage(null)} />
      )}

      </div>
</div>
  )
}
