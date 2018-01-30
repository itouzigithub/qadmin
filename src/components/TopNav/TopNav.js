import React from 'react'
import { Link } from 'react-router-dom'
import './TopNav.css'

const topnav = () => (
  <nav>
    <Link to="/project">QAdmin</Link>
    <span className="nav-project-name">{ localStorage.projectName }</span>
    <span className="nav-user">Hi, { window.USERINFO.real_name }</span>
  </nav>
)

export default topnav