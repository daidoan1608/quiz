import React from "react";
import {  BiNotification } from "react-icons/bi";

export const ContentHeader = () => {
  return (
    <div className="content--header">
      <h1 className="header--title">VNUA Education Manager</h1>
      <div className="header--activity">
        <div className="notify">
          <BiNotification className="icon" />
        </div>
        <div className="avatar">
          <img
            src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp"
            alt="Avatar"
            className="avatar-img"
          />
        </div>
      </div>
    </div>
  );
};
