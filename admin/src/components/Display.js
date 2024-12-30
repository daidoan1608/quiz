import React from 'react'
import Sidebar from './Sidebar'
import Content from './Content'
import Profile from './Profile'
import '../styles/dashboard.css'

export default function Display() {
  return (
    <div className='dashboard'>
      <Sidebar />
      <div className='dashboard--content'>
        <Content />
        <Profile />
      </div>
    </div>
  )
}
