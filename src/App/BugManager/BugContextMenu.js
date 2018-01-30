import React from 'react'
import ContextMenu from '../../components/ContextMenu/ContextMenu'

export default class BugContextMenu extends React.Component {
  constructor (props) {
    super(props);
    var role = window.USERINFO.role;

    // 针对 QA
    if (role === 0) {
      this.bugContextMenu = [
        {
          icon: 'fa-lock',
          name: '关闭',
          handler: this.closeBug.bind(this)
        },
        { 
          icon: 'fa-trash',
          name: '删除',
          handler: () => {
            this.props.bus.emit('deleBug', this.targetID, this.caseID)
          }
        }
      ]
    }

    // 针对开发
    if (role === 1) {
      this.bugContextMenu = [
        {
          icon: 'fa-smile-o',
          name: '已解决',
          handler: () => {
            this.props.bus.emit('handleBug', 'solved', this.targetID)
          }
        },
        {
          icon: 'fa-frown-o',
          name: '无法解决',
          handler: () => {
            this.props.bus.emit('handleBug', 'unsolved', this.targetID)
          }
        },
        {
          icon: 'fa-meh-o',
          name: 'bug 无效',
          handler: () => {
            this.props.bus.emit('handleBug', 'invalid', this.targetID)
          }
        }
      ]
    }

    this.state = {
      isShowBugMenu: false,
      eventObj: null
    }

    this.targetID = -1;
    this.caseID = -1;

    // 监听来自 BugItem 的点击事件，显示右键菜单
    this.props.bus.on('showBugMenu', this.showBugMenu.bind(this))
  }

  componentDidMount () {
    // 如果用户角色为 QA，则获取项目开发成员用于 bug 右键菜单
    if (window.USERINFO.role === 0) {
      new Promise((resolve, reject) => {
        this.getDeveloperOfProject(resolve, reject);
      })
      .then(data => {
        data.forEach(val => {
          this.bugContextMenu.unshift({
            icon: 'fa-user-secret',
            name: val.real_name,
            handler: () => {
              this.assignBug(val.id, val.real_name)
            }
          })
        })
      })
      .catch(info => {
        alert(info)
      })
    }
  }

  getDeveloperOfProject (resolve, reject) {
    window.$ajax({
      url: '/projects/member/getDeveloperOfProject',
      data: {
        project_id: +localStorage.projectID
      },
      success: res => {
        if (res.code === 0) {
          resolve(res.data)
        } else {
          reject(res.info)
        }
      }
    })
  }

  showBugMenu (payload) {
    var e = payload.event;
    if (e.button === 2) {
      this.targetID = payload.id;
      this.caseID = payload.caseID;
      if (window.USERINFO.role === 0) {
        this.bugContextMenu.slice(-1)[0].disabled = payload.undeletable;
        this.bugContextMenu.slice(-2)[0].disabled = payload.uncloseable;
      }
      this.setState({
        eventObj: e.nativeEvent,
        isShowBugMenu: true
      });
    }
  }

  // 将 bug 指派给开发
  assignBug (devID, devName) {
    var id = this.targetID;
    window.$ajax({
      url: '/bugs/index/assignBug',
      type: 'post',
      data: {
        id: id, // bug 的 id
        dev_id: devID, // 开发的 id
        assigner: window.USERINFO.real_name,
        belong_to: devName
      },
      success: res => {
        if (res.code === 0) {
          this.props.bus.emit('updateBugStatus', id, 1, res.record)
        }
      }
    })
  }

  closeBug () {
    var id = this.targetID;
    window.$ajax({
      url: '/bugs/index/close',
      data: {
        id: id,
        who_close: window.USERINFO.real_name
      },
      success: res => {
        if (res.code === 0) {
          this.props.bus.emit('updateBugStatus', id, 3, res.record)
        }
      }
    })
  }

  render () {
    return (
      <ContextMenu 
        data={ this.bugContextMenu } 
        eventObj={ this.state.eventObj }
        isShow={ this.state.isShowBugMenu }
        hideMenu={
        	() => {
	        	this.setState({
	            isShowBugMenu: false
	          })
        	}
        }
      />
    )
  }
}