import React, { useState } from 'react';
import { Slide } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';
import image4 from './images/4.jpg';
import image5 from './images/5.jpg';
import image6 from './images/6.jpg';
import image7 from './images/7.jpg';
import image8 from './images/8.jpg';

const ThirdSlideShow = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const properties = {
    transitionDuration: 500, 
    indicators: true,
    onChange: (oldIndex, newIndex) => {
      setActiveIndex(newIndex);
    },
  };

  const slideImages = [image4, image5, image6, image7, image8];

  return (
    <div>
      <Slide {...properties}>
        {slideImages.map((url, index) => (
          <div key={index} className="each-slide-effect">
            <div
              style={{
                backgroundImage: `url(${url})`,
              }}
            >
            </div>
          </div>
        ))}
      </Slide>
      <div className="dot-indicators">
        {slideImages.map((_, index) => (
          <span
            key={index}
            className={`dot-indicator ${index === activeIndex ? 'active' : ''}`}
            onClick={() => setActiveIndex(index)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default ThirdSlideShow;
