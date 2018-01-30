import React from 'react'
import PageItem from './PageItem'
import ContextMenu from '../../../components/ContextMenu/ContextMenu'
import MessageBox from '../../../components/MessageBox/MessageBox'

class PageList extends React.Component {
  constructor () {
    super();
    this.state = {
      list: [],
      isShowPageItemMenu: false,
      isShowPageListMenu: false,
      isShowMessageBox: false,
      eventObj: null,
      showTip: false
    }

    this.targetID = -1;

    this.childState = {};

    this.pageItemContextMenu = [
      {
        icon: 'fa-edit',
        name: '编辑',
        handler: () => {
          this.childState.edit()
        }
      },
      {
        icon: 'fa-trash',
        name: '删除',
        handler: () => {
          this.setState({
            isShowMessageBox: true
          })
        },
        disabled: false
      }
    ]

    this.pageListContextMenu = [
      {
        icon: 'fa-plus',
        name: '添加',
        handler: () => {
          if (this.state.list.length > 0 && this.state.list.slice(-1)[0].id === -1) return;
          var list = this.state.list.slice();
          list.push({
            id: -1,
            page_name: '',
            group_number: 0,
            isEdit: true
          })
          this.setState({
            list: list
          })
        }
      },
      {
        icon: 'fa-bars',
        name: '分组',
        handler: () => {
          
        }
      }
    ]
  }

  componentDidMount () {
    this.fetch()
  }

  fetch () {
    const id = localStorage.projectID;
    window.$ajax({
      url: '/pages', 
      data: { id: id }, 
      success: res => {
        if (res.code === 0) {
          var data = res.data;
          if (data.length === 0) {
            return this.setState({
              showTip: true
            })
          }
          for (var i = 0; i < data.length; i++) {
            data[i].isEdit = false
          }
          this.setState({
            list: data
          })
        }
      }
    })
  }

  handleDeletion () {
    window.$ajax({
      url: '/pages/index/deletePage',
      type: 'post',
      data: {
        id: this.targetID
      },
      success: res => {
        if (res.code === 0) {
          this.fetch()
        } else {
          alert(res.info)
        }
      }
    })
  }

  hideMenu () {
    this.setState({
      isShowPageItemMenu: false,
      isShowPageListMenu: false
    })
  }

  showPageItemMenu (e, id) {
    e.stopPropagation();
    if (e.button === 2) {
      this.targetID = id;
      this.setState({
        eventObj: e.nativeEvent,
        isShowPageItemMenu: true
      })
    }
  }

  showPageListMenu (e) {
    e.stopPropagation();
    if (e.button === 2) {
      this.setState({
        eventObj: e.nativeEvent,
        isShowPageListMenu: true
      })
    }
  }

  setChildState (state) {
    this.childState = state
  }

  render () {
    return (
      <menu className="page-list" onMouseDown={ this.showPageListMenu.bind(this) }>
        <ul>
          {
            this.state.list.map(val => (
              <PageItem key={ val.id }
                data={ val }
                match={ this.props.match }
                fetch={ this.fetch.bind(this) }
                showPageItemMenu={ this.showPageItemMenu.bind(this) }
                setChildState={ this.setChildState.bind(this) } />
            ))
          }
        </ul>

        {
          this.state.showTip &&
          <div className="page-list-tip">点击鼠标右键<br/>新建页面</div>
        }

        <ContextMenu
          data={ this.pageItemContextMenu } 
          eventObj={ this.state.eventObj }
          isShow={ this.state.isShowPageItemMenu } 
          hideMenu={ this.hideMenu.bind(this) } />

        <ContextMenu 
          data={ this.pageListContextMenu } 
          eventObj={ this.state.eventObj }
          isShow={ this.state.isShowPageListMenu }
          hideMenu={ this.hideMenu.bind(this) } />

        <MessageBox 
          isShow={ this.state.isShowMessageBox }
          title='Are you sure?'
          confirm={ this.handleDeletion.bind(this) }
          hideBox={
            () => { 
              this.setState({
                isShowMessageBox: false
              }) 
            }
          }>
          <p>注意：只有不含任何用例的页面才能被删除</p>
        </MessageBox>
      </menu>
    )
  }
}

export default PageList