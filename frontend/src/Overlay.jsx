import { useEffect, useState } from 'react'
import './Overlay.css'

export default function Overlay({ image, onClose }) {
  const [dimensions, setDimensions] = useState(null)
  const imageSrc = `/image/${(image)}`
  const imageName = image.replace(/\.[^.]+$/, '').replace("_", " ").split("/")[1]
  const imageFormat = image.split('.').pop()?.toUpperCase() ?? 'Unknown'

  const [imageInfo, setImageInfo] = useState(null)

  useEffect(() => {

      fetch(imageSrc+"?info",
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
                    setImageInfo(res)
                }
            })
  }, [])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <div className="image-overlay" onClick={onClose}>
      <section
        className="image-overlay__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-overlay-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="image-overlay__close"
          type="button"
          onClick={onClose}
          aria-label="Close image viewer"
          autoFocus
        >
          &times;
        </button>
        <div className="image-overlay__preview">
          <img
            src={imageSrc}
            alt={imageName}
            onLoad={(event) => {
              const { naturalWidth, naturalHeight } = event.currentTarget
              setDimensions(`${naturalWidth} × ${naturalHeight} px`)
            }}
          />
        </div>
        <aside className="image-overlay__details">
          <p className="image-overlay__eyebrow">Image details</p>
          <h2 id="image-overlay-title">{imageName}</h2>
          <dl>
            {imageInfo!=null ? Object.keys(imageInfo.primaryInfo).map(info => {
              return (
              <div>
                <dt>{info}</dt>
                <dd>{imageInfo.primaryInfo[info]}</dd>
            </div>
                )
            }):""}
            
          </dl>
          {imageInfo != null  && Object.keys(imageInfo.extraInfo).length>0 && (
            <details className="image-overlay__extra-info">
              <summary>More details</summary>
              <dl className='extra-info'>
                {Object.keys(imageInfo.extraInfo).map(info => (
                  <div key={info}>
                    <dt>{info}</dt>
                    <dd>{imageInfo.extraInfo[info]}</dd>
                  </div>
                ))}
              </dl>
            </details>
          )}
        </aside>
      </section>
    </div>
  )
}
