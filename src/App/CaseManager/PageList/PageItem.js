import React from 'react'
import { NavLink } from 'react-router-dom'

class PageItem extends React.Component {
  constructor (props) {
    super();
    const { id, page_name, group_number, isEdit } = props.data
    this.state = {
      id,
      page_name,
      group_number,
      isEdit: isEdit === undefined ? false : isEdit
    }
  }

  handleChange (e) {
    this.setState({
      page_name: e.target.value.trim()
    })
  }

  update () {
    var name = this.state.page_name;
    var id = this.state.id;
    if (!name) return;
    if (name.length > 10) {
      return alert('请勿超过 10 个字')
    }
    // id 不存在表示新增，存在表示更新
    if (!id || id < 0) {
      window.$ajax({
        url: '/pages/index/addPage',
        type: 'post',
        data: {
          project_id: +localStorage.projectID,
          name: name
        },
        success: res => {
          if (res.code === 0) {
      	    this.setState({
              isEdit: false
            })
            // 新增后需重新获取数据，否则新增项没有 id
		        this.props.fetch();
          }
        }
      })
    } else {
    	window.$ajax({
    		url: '/pages/index/updatePageName',
    		type: 'post',
    		data: {
    			id: id,
    			name: name
    		},
    		success: res => {
    			if (res.code === 0) {
    				this.setState({
              isEdit: false
            })
    			}
    		}
    	})
    }
  }

  render () {
    return (
      <li className="page-list-li">
        {
          this.state.isEdit
          ? <div className="ipt-container">
              <input type="text"
                value={ this.state.page_name }
                ref={ input => { this.titleInput = input }}
                onChange={ this.handleChange.bind(this) }
                onBlur={ this.update.bind(this) } />
            </div>
          : <NavLink
              activeClassName="page-list-active"
              to={`${this.props.match.path}/${this.state.id}`} 
              onMouseDown={ 
                (e) => {
                  this.props.setChildState({
                    edit: () => {
                      this.setState({
                        isEdit: true
                      })
                      setTimeout(() => {
                        this.titleInput.focus();
                      }, 0)
                    }
                  })
                  this.props.showPageItemMenu(e, this.state.id) 
                }
              }>
              { this.state.page_name }
            </NavLink>
        }
      </li>
    )
  }
}

export default PageItem