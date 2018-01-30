import React from 'react'
import { NavLink } from 'react-router-dom'
import './SideMenu.css'

function Sidemenu ({match}) {
  return (
    <aside>
      <NavLink to={`${match.path}/case`} activeClassName="sidemenu-active" className="sidemenu-item fa fa-flag" />
      <NavLink to={`${match.path}/bug`} activeClassName="sidemenu-active" className="sidemenu-item fa fa-bug" />
      {
      	window.USERINFO.authority_level > 0 &&
	      <NavLink to={`${match.path}/member`} activeClassName="sidemenu-active" className="sidemenu-item fa fa-user" />
      }
      <NavLink to={`${match.path}/stats`} activeClassName="sidemenu-active" className="sidemenu-item fa fa-line-chart" />
    </aside>
  )
}

export default Sidemenu