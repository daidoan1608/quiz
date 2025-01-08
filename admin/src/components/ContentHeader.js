import React from "react";
import {  BiNotification } from "react-icons/bi";

export const ContentHeader = () => {
  return (
    <div className="content--header">
      <h1 className="header--title">Education</h1>
      <div className="header--activity">
        <div className="notify">
          <BiNotification className="icon" />
        </div>
        <div className="avatar">
          <img
            src="https://via.placeholder.com/40"
            alt="Avatar"
            className="avatar-img"
          />
        </div>
      </div>
    </div>
  );
};
