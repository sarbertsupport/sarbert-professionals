import React from 'react'
import Header from '../shared/Header'
import SearchForm from './Search'
import Details from './Details'
import Statistics from './Statistics'
import TopSkills from './TopSkills '
import Footer from '../shared/Footer'
export default function Home() {
  return (
    <div>
        <div className='header'>
           <Header/>
        </div>
        <div className='search'>
           <SearchForm/>
        </div>
        <div className='details'>
          <Details/>
        </div>
        <div className='details'>
          <Statistics/>
        </div>
        <div className='details'>
          <TopSkills/>
        </div>
        <div className='details'>
          <Footer/>
        </div>
    </div>
  )
}
