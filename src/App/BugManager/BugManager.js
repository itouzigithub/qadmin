import React from 'react'
import { Route, NavLink, Redirect } from 'react-router-dom'
import List from './List'

const BugManager = ({match}) => (
  <main>
    <menu className="page-list">
      <ul>
        {
          window.USERINFO.role === 0 &&
          <li className="page-list-li">
            <NavLink activeClassName="page-list-active" to={`${match.url}/0`}>待分配</NavLink>
          </li>
        }
        <li className="page-list-li">
          <NavLink activeClassName="page-list-active" to={`${match.url}/1`}>待修复</NavLink>
        </li>
        <li className="page-list-li">
          <NavLink activeClassName="page-list-active" to={`${match.url}/2`}>已修复</NavLink>
        </li>
        <li className="page-list-li">
          <NavLink activeClassName="page-list-active" to={`${match.url}/3`}>已关闭</NavLink>
        </li>
      </ul>
    </menu>
    <Route path={`${match.url}/:type`} component={ List } />
    <Route exact path={`${match.url}`} render={ 
      () => {
        return window.USERINFO.role === 0
        ? <Redirect to={ `${match.url}/0` } />
        : <Redirect to={ `${match.url}/1` } />
      }
    } />
  </main>
)

export default BugManager