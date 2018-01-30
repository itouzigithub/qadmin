import React from 'react'
import './Toolmenu.css'

class PageTools extends React.Component {
  constructor () {
    super();
    this.state = {
      isShowCase: 1,
      isShowBug: 1,
      showAll: 1
    }
  }
  
  toggleCase () {
    if (this.state.isShowCase === 1) {
      this.setState({
        isShowCase: 0
      })
      document.querySelector('article').classList.add('hideCase')
    } else {
      this.setState({
        isShowCase: 1
      })
      document.querySelector('article').classList.remove('hideCase')
    }
  }

  toggleBug () {
  	if (this.state.isShowBug === 1) {
      this.setState({
        isShowBug: 0
      })
      document.querySelector('article').classList.add('hideBug')
    } else {
      this.setState({
        isShowBug: 1
      })
      document.querySelector('article').classList.remove('hideBug')
    }
  }

  onlyMarkedCase () {
    if (this.state.showAll === 1) {
      this.setState({
        showAll: 0
      })
      document.querySelector('article').classList.add('onlyMarked')
    } else {
      this.setState({
        showAll: 1
      })
      document.querySelector('article').classList.remove('onlyMarked')
    }
  }

  render () {
    return (
      <div className="tools-menu">
        {
          window.USERINFO.role === 0 &&
          <div className="tools-menu-item" title="新增用例" onClick={ this.props.addCase }>
            <i className="fa fa-plus"></i>
          </div>
        }
        <div className="tools-menu-item" title="只看P1" onClick={ this.onlyMarkedCase.bind(this) }>
          <i className="fa fa-thumb-tack"></i>
        </div>
        <div className="tools-menu-item" 
          status={ this.state.isShowCase + '' } 
          title={ this.state.isShowCase ? "隐藏描述" : "显示描述" } 
          onClick={ this.toggleCase.bind(this) }>
          <i className="fa fa-flag"></i>
        </div>
        <div className="tools-menu-item"
          status={ this.state.isShowBug + '' } 
          title={ this.state.isShowBug ? "隐藏bug" : "显示bug" } 
          onClick={ this.toggleBug.bind(this) }>
          <i className="fa fa-bug"></i>
        </div>
      </div>
    )
  }
}

export default PageTools