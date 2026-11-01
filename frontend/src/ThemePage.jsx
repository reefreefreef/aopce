import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom';

import './App.css'

const APIUrl = window.location.protocol=="http:" ? "http://192.168.50.28:4927/api" : "/api"

async function getThemes(next) {
        fetch(APIUrl + `/themes`,
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
    

export default function ThemePage() {
  const [selectedTheme, setSelectedTheme] = useState('')
  const [themes, setThemes] = useState([])

      const navigate = useNavigate();

  
  //<p className="image-count" aria-live="polite">
            //{filteredImages.length} {filteredImages.length === 1 ? 'image' : 'images'}
          //</p>


  useEffect(() => {
        getThemes((res)=>{
          setThemes(res)
          console.log(res)
        })
    }, [])
    
  return (
    
      <div>

        <div className='gallery-subtitle'>Themes</div>
      {
          themes.length > 0 ? (
              <section className="image-grid" style={{gap: "30px"}} aria-label="Image gallery">
          {themes.map((theme) => (
              <button
              className="image-card theme-card"
              key={theme}
              type="button"
              aria-label={`View ${theme}`}
              onClick={() => {
                  navigate(`/theme/${theme}`)
                }}
                >
              <span className='theme-text'>{theme}</span>
            </button>
          ))}
        </section>
      ) : (
          <p className="empty-state">No Themes</p>
        )
        
    }


    </div>
    
  )
}
