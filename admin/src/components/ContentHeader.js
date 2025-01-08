import React from 'react';
import {BiSearch, BiNotification} from 'react-icons/bi';

export const ContentHeader = () => {
  return (
    <div className='content--header'>
        <h1 className='header--title'>Education</h1>
        <div className='header--activity'>
            {/* <div className='search-box'>
                <input type='text' placeholder='Search here...'/>
                <BiSearch className='icon' />
            </div> */}
            <div className='notify'>
                <BiNotification className='icon'/>
            </div>
                    {/* Phần avatar người dùng */}
        <div className='avatar'>
          <img 
            src="https://via.placeholder.com/40" // Đổi đường dẫn tới avatar của bạn
            alt="Avatar" 
            className="avatar-img"
          />
        </div>
        </div>
    </div>
  )
}