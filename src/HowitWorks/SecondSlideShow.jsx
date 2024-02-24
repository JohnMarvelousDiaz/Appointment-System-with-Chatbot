import React, { useState } from 'react';
import { Slide } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';
import image9 from './images/9.jpg';
import image10 from './images/10.jpg';
import image11 from './images/11.jpg';

const SecondSlideShow = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const properties = {
    transitionDuration: 300, 
    indicators: true,
    onChange: (oldIndex, newIndex) => {
      setActiveIndex(newIndex);
    },
  };

  const slideImages = [image9, image10, image11];

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

export default SecondSlideShow;
