import React from 'react';
import { Route, Redirect } from 'react-router-dom'

import TopNav from '../components/TopNav/TopNav'
import SideMenu from '../components/SideMenu/SideMenu'
import CaseManager from './CaseManager/CaseManager'
import BugManager from './BugManager/BugManager'
import Member from './Member/Member'
import Stats from './Stats/Stats'

const App = ({ match }) => {
  // 如果没有项目 id 则退回项目列表
  var id = localStorage.projectID;
  return id === null || id === undefined || typeof parseInt(id, 10) !== 'number'
  ? <Redirect to="/project" />
  : (
    <div className="app-holder">
      <TopNav />
      <SideMenu match={match} />
      <Route exact path={`${match.url}`} render={ () => <Redirect to={`${match.url}/case`} />} />
      <Route path={`${match.url}/case`} component={ CaseManager } />
      <Route path={`${match.url}/bug`} component={ BugManager } />
      <Route path={`${match.url}/member`} component={ Member } />
      <Route path={`${match.url}/stats`} component={ Stats } />
    </div>
  )
}

export default App