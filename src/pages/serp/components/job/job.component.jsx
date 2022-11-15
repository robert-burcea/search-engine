import React from 'react';
import './job.style.scss';

import mapPin from '../../../../assets/svgs/map_pin.svg';
import arrowRight from '../../../../assets/svgs/arrow_right.svg';

export const Job = ({ jobTitle, company, location, link }) => {

  return (
    <section className='job'>
      <h2 className='position'>{jobTitle}</h2>
      <p className='company'>{company}</p>
      <p className='location'><img src={mapPin} alt='map pin' className='icon' />{location}</p>
      <div className='button-position'>
        <a href={link} target="_blank" rel="noreferrer" className='btn-yellow btn'>Vezi postul <img src={arrowRight} alt='arrow right' className='icon' /></a>
      </div>
    </section>
  )
}