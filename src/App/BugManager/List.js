import React from 'react'
import BugItem from './BugItem/BugItem'
import BugContextMenu from './BugContextMenu'
import BugMessageBox from './BugMessageBox'
import BugRecord from './BugRecord'
import ImageViewer from '../../components/ImageViewer/ImageViewer'
import Bus from '../../assets/js/bus'
import { deleteBug } from './curd'

export default class List extends React.Component
{
  constructor () {
    super();
    this.state = {
      bugs: []
    }
    this.project_id = +localStorage.projectID;
    this.bus = new Bus();
    this.bus.on('deleBug', this.deleBug.bind(this));
    this.bus.on('updateBugStatus', this.updateBugStatus.bind(this));
  }

  componentDidMount () {
    var type = this.props.match.params.type;
    this.fetch(type);
  }

  componentWillReceiveProps (nextProps) {
    const prevType = this.props.match.params.type;
    const type = nextProps.match.params.type;
    if (type === prevType) return;
    this.fetch(type)
  }

  /*
   * type 0 - 待指派 | 1 - 待修复 | 2 - 已修复待验证 | 3 - 已关闭
   */
  fetch (type) {
    var data = {
      project_id: this.project_id,
      type: type
    }
    if (window.USERINFO.role === 1) {
      data.dev_id = window.USERINFO.id
    }
    window.$ajax({
      url: '/bugs/index/getBugsByProjectID',
      data: data,
      success: res => {
        if (res.code === 0) {
          this.setState({
            bugs: res.data
          })
        }
      }
    })
  }

  deleBug (id) {
    if (this.state.bugs.length === 0) return;
    deleteBug(id, () => {
      var bugs = this.state.bugs.slice();
      for (var i = 0; i < bugs.length; i++) {
        if (bugs[i].id === id) {
          bugs.splice(i, 1);
          return this.setState({
            bugs: bugs
          })
        }
      }
    })
  }

  updateBugStatus (id) {
    var bugs = this.state.bugs.slice();
    for (var i = 0; i < bugs.length; i++) {
      if (bugs[i].id === id) {
        bugs.splice(i, 1);
        return this.setState({
          bugs: bugs
        })
      }
    }
  }

  render () {
    return (
      <article className="container" style={{paddingTop: '10px'}}>
        <ul className='bug-wrapper'>
          {
            this.state.bugs.map(val =>
              <BugItem key={ val.id }
                data={ val }
                bus={ this.bus } 
              />
            )
          }
        </ul>
        
        <BugContextMenu bus={ this.bus } />
        <BugMessageBox bus={ this.bus } />
        <BugRecord bus={ this.bus } />
        <ImageViewer bus={ this.bus } />
      </article>
    )
  }
}