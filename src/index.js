import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter as Router,
  Route,
  Redirect
} from 'react-router-dom'

import Login from './Login/Login'
import ProjectTable from './ProjectTable'
import App from './App/App'

import './assets/css/base.css';
import './assets/css/component.css';
import './assets/font-awesome/css/font-awesome.min.css'

const RouteView = (props) => {
  let projectID = localStorage.projectID;

  return props.loggedIn 
    ? <Router>
        <div style={{ height: '100%' }}>
          <Route exact path="/" render={ () => projectID ? <Redirect to="/app" /> : <Redirect to="/project" /> } />
          <Route path="/project" component={ ProjectTable } />
          <Route path="/app" component={ App } />
        </div>
      </Router>
    : <Login />
}

window.$ajax({
  url: '/auth/index/getLoginStatus',
  success: res => {
    if (res.code === 0) {
      /* USERINFO: {
       *   id
       *   authority_level { Number } 0 - 普通用户 | 1 - 管理员
       *   role { Number } 0 - 测试 | 1 - 开发
       *   real_name
       * }
       */
      Object.defineProperty(window, 'USERINFO', {
        value: Object.freeze(res.data),
        writable: false,
        enumarable: false,
        configurable: false
      })
      ReactDOM.render(<RouteView loggedIn={ true } />, document.getElementById('app'));
    } else {
      ReactDOM.render(<RouteView loggedIn={ false } />, document.getElementById('app'));
    }
  }
})
