import './About.css';
import check from '../../assets/icons/check-circle.svg'
import gallery from '../../Utils/gallery'
import { useState, useEffect } from 'react';

export default function About() {
  const [currentBg, setCurrentBg] = useState(gallery[0]?.src || '');

  useEffect(() => {
    const interval = setTimeout(() => {
      const currentIndex = gallery.findIndex(item => item.src === currentBg);
      const nextIndex = (currentIndex + 1) % gallery.length;
      setCurrentBg(gallery[nextIndex]?.src || '');
    }, 15000);
  }, [currentBg]);
  
 return (
  <section id="about">
   <div className="home-section-header">
    <h2 className="text-headline-lg">Our Legacy &amp; Vision</h2>
    <p className="text-secondary text-body-md">Founded in the heart of Niger State, built on a foundation of
     rigorous academic pursuit and unwavering commitment to public health.</p>
   </div>
   <div className="about-grid">
    <div className="about-image">
     <div className="about-image-bg"
      style={{backgroundImage: `url(${currentBg})`}}>
     </div>
    </div>
    <div className="about-content">
     <h3 className="text-headline-md">Fostering Academic Excellence</h3>
     <p className="text-body-md text-secondary">NANMS was established to provide a supportive network for
      medical students originating from Niger State and studying in UDUS. We bridge the gap between rigorous
      medical training and professional development.</p>
     <p className="text-body-md text-secondary">Our mission extends beyond the classroom. We envision a
      healthier future driven by competent, compassionate scholar-physicians who are deeply connected
      to their communities.</p>
     <ul className="feature-list">
      <li className="feature-item">
       <img style={{width: '20px'}} src={check} alt="check" />
       <span className="text-label-sm">Academic Mentorship</span>
      </li>
      <li className="feature-item">
      <img style={{width: '20px'}} src={check} alt="check" />
       <span className="text-label-sm">Clinical Skills Workshops</span>
      </li>
      <li className="feature-item">
      <img style={{width: '20px'}} src={check} alt="check" />
       <span className="text-label-sm">Professional Networking</span>
      </li>
     </ul>
    </div>
   </div>
  </section>
 );
};