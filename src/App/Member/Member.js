import React from 'react'
import { Route, NavLink, Redirect } from 'react-router-dom'
import List from './List'

var Member = function ({ match }) {
  return (
    <main>
      <menu className="page-list">
        <ul>
          <li className="page-list-li">
            <NavLink activeClassName="page-list-active" to={`${match.url}/qa`}>QA</NavLink>
          </li>
          <li className="page-list-li">
            <NavLink activeClassName="page-list-active" to={`${match.url}/dev`}>开发</NavLink>
          </li>
        </ul>
      </menu>
      <Route path={`${match.url}/:type`} component={ List } />
      <Route exact path={`${match.url}`} render={ () => <Redirect to={ `${match.url}/qa` } /> } />
    </main>
  )
}

export default Member