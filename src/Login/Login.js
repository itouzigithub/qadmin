import React from 'react'
import './Login.css'

function submit () {
  var form = document.forms.login;
  var username = form.username.value;
  var password = form.password.value;
  if (!username || !password) return;

  window.$.post('/auth/index/login', {
    username: username,
    password: password
  }, res => {
  	if (res.code === 0) {
  		window.location.reload();
  	}
  })
}

const login = () => (
  <div className="login-holder">
    <div className="login-box">
      <form id="login">
        <div className="login-row">
          <input type="text" name="username" />
          <i className="fa fa-user"></i>
        </div>
        <div className="login-row">
          <input type="password" name="password" />
          <i className="fa fa-shield"></i>
        </div>
        <div className="login-btn" onClick={ submit }>login</div>
      </form>
    </div>
  </div> 
)

export default login