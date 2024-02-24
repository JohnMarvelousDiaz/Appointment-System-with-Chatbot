import React, { useState } from 'react';
import { Slide } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';
import image1 from './images/1.jpg';
import image2 from './images/2.jpg';
import image3 from './images/3.jpg';



const FirstSlideShow = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const properties = {
    transitionDuration: 300, 
    indicators: true,
    onChange: (oldIndex, newIndex) => {
      setActiveIndex(newIndex);
    },
  };

  const slideImages = [image1, image2, image3];

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

export default FirstSlideShow;
