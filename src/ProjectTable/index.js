import React from 'react'
import { NavLink } from 'react-router-dom'
import MessageBox from '../components/MessageBox/MessageBox'
import './index.css'

class ProjectTable extends React.Component {
  constructor () {
    super();
    this.state = {
      list: [],
      isShow: false,
      targetID: -1,
      projectName: ''
    }
  }

  componentDidMount () {
    this.fetch()
  }

  fetch () {
    window.$ajax({
      url: '/projects/index/index',
      success: res => {
        if (res.code === 0) {
          this.setState({
            list: res.data
          })
        }
      }
    })
  }

  updateProject () {
    var name = this.state.projectName;
    var id = this.state.targetID;
    if (!name) return;
    if (id < 0) {
      window.$ajax({
        url: '/projects/index/createProject', 
        type: 'post',
        data: {
          name: name
        },
        success: res => {
          if (res.code === 0) {
            this.setState({
              projectName: ''
            })
            this.fetch()
          }
        }
      })
    } else {
      window.$ajax({
        url: '/projects/index/updateProject', 
        type: 'post',
        data: {
          name: name,
          id: id
        },
        success: res => {
          if (res.code === 0) {
            this.setState({
              projectName: ''
            })
            this.fetch()
          }
        }
      })
    }
  }

  handleChange (e) {
    this.setState({
      projectName: e.target.value.trim()
    })
  }

  render () {
    return (
      <div className="project-wrap">
        <div className="project-table">
        	{
        		this.state.list.map(val => (
        			<NavLink className="project-item"
                key={ val.id }
        				onMouseDown={ 
                  () => {
                    localStorage.projectID = val.id;
                    localStorage.projectName = val.project_name;
                  }
                }
        			  to={ '/app' }>
                <p>
          			  { val.project_name }
                </p>
        			</NavLink>
        		))
        	}
          {
            window.USERINFO.authority_level === 1 && 
            <div className="project-item" onClick={ 
              () => {
                this.setState({
                  isShow: true
                })
              }}>
              <p>+</p>
            </div>
          }
        </div>

        <MessageBox 
          isShow={ this.state.isShow }
          title="项目名称"
          type="info"
          confirm={ this.updateProject.bind(this) }
          hideBox={
            () => { 
              this.setState({
                isShow: false
              }) 
            }
          }>
          <input type="text" value={ this.state.projectName } onChange={ this.handleChange.bind(this) } />
        </MessageBox>
      </div>
    )
  }
}

export default ProjectTable