import React from 'react'
import ToolMenu from '../../../components/ToolMenu/case-tools'
import CaseItem from './CaseItem'
import ContextMenu from '../../../components/ContextMenu/ContextMenu'
import BugContextMenu from '../../BugManager/BugContextMenu'
import BugRecord from '../../BugManager/BugRecord'
import MessageBox from '../../../components/MessageBox/MessageBox'
import ImageViewer from '../../../components/ImageViewer/ImageViewer'
import Toast from '../../../components/Toast/Toast'
import Bus from '../../../assets/js/bus'
import { getCases, deleteCase } from './curd'
import { getBugsByPageID } from '../../BugManager/curd'

class CaseList extends React.Component {
  constructor () {
    super();
    this.state = {
      cases: [],
      isShowCaseMenu: false,
      isShowBugMenu: false,
      eventObj: null,
      isShowMessageBox: false,
      bugs: []
    }

    // 一个自定义事件中介对象，用于管理 CaseList、CaseItem、BugItem、BugContextMenu、ContextMenu 组件之间的通信
    this.bus = new Bus();

    this.targetID = -1;

    this.caseContextMenu = [
      {
        icon: 'fa-plus',
        name: 'bug',
        handler: () => {
          this.bus.emit('addBug', this.targetID)
        }
      },
      {
        icon: 'fa-trash',
        name: '删除',
        disabled: false,
        handler: () => {
          this.setState({
            isShowMessageBox: true
          })
        }
      }
    ]

    this.bus.on('showCaseMenu', this.showCaseMenu.bind(this))

    // 监听来自 CaseItem 新增用例后，重新获取用例的消息
    this.bus.on("fetchCases", this.fetch.bind(this))

    // 上传图片
    this.bus.on("invokeUploader", this.invokeUploader.bind(this))

    // 监听 bug 状态改变，更新统计
    this.bus.on("updateBugStats", this.updateBugStats.bind(this))
  }

  componentDidMount () {
    // 获取用例和 bug 信息
    this.fetch();
  }

  componentWillReceiveProps (nextProps) {
    const prevID = this.props.match.params.id;
    const id = nextProps.match.params.id;
    if (id === prevID) return;
    this.fetch(id)
  }

  fetch (pageID) {
    var id = pageID || this.props.match.params.id;
    if (!id) return;

    if (window.USERINFO.role === 0) {
      Promise.all([getCases(id), getBugsByPageID(id)])
      .then(data => {
        var cases = data[0];
        var bugs = data[1];
        cases.forEach(val => {
          val.bugs = bugs.filter(item => {
            return item.case_id === val.id
          })
        })
        var obj = {};
        bugs.forEach(val => {
          obj[val.id] = val.status
        })
        this.setState({
          cases: cases,
          bugs: obj
        })
      })
      .catch(e => {
        console.error(e)
      })
    }
    // 对于开发角色的用户，仅展示用例，因为开发只需要看属于自己的 bug
    if (window.USERINFO.role === 1) {
      getCases(id)
      .then(cases => {
        cases.forEach(val => {
          val.bugs = [];
        });
        this.setState({
          cases: cases
        })
      })
    }
  }

  /**
   * e { Object } 事件对象
   * id { Number } 目标的 id
   * disabled { Boolean } 禁用删除选项
   */
  showCaseMenu (e, id, disabled = false) {
    if (e.button === 2) {
      this.targetID = id;
      this.caseContextMenu[1].disabled = disabled; // 禁用删除选项
      this.setState({
        eventObj: e.nativeEvent,
        isShowCaseMenu: true
      });
    }
  }

  deleCase () {
    var id = this.targetID;
    deleteCase(id, () => {
      var cases = this.state.cases;
      for (var i = 0; i < cases.length; i++) {
        if (cases[i].id === id) {
          cases.splice(i, 1);
          return this.setState({
            cases: cases
          })
        }
      }
    })
  }

  addCase () {
    var cases = this.state.cases.slice();
    if (cases.length === 0 || cases.slice(-1)[0].id !== -1) {
      cases.push({
        id: -1,
        status: 0,
        title: '',
        content: ' ',
        expectation: ' ',
        remark: ' ',
        bugs: [],
        isEditTitle: true
      })
      this.setState({
        cases: cases
      })
    }
    // 将页面滚动到底部
    var article = document.querySelector('.case-container');
    article.scrollTop = article.scrollHeight;
  }

  invokeUploader (id) {
    this.targetID = id;
    this.uploader.click();
  }

  upload (e) {
    var file = e.target.files[0];
    var id = this.targetID;
    var fd = new FormData();
    fd.append('file', file);
    fd.append('id', id);
    window.$ajax({
      url: '/bugs/index/upload',
      type: 'post',
      processData: false,
      contentType: false,
      data: fd,
      success: res => {
        if (res.code === 0) {
          this.bus.emit('addImg', id, res.imgs);
        } else {
          alert(res.info)
        }
      }
    })
  }

  stats () {
    if (window.USERINFO.role !== 0) return '';
    var bugs = this.state.bugs;
    var a = 0, b = 0, c = 0;
    for (var key in bugs) {
      switch (bugs[key]) {
        case 0: a += 1;
        break;
        case 1: b += 1;
        break;
        case 2: c += 1;
        break;
        default:
        break;
      }
    }
    return `，待指派 bug ${a} 条，待修复 bug ${b} 条，待验证 bug ${c} 条`
  }

  updateBugStats (id, status) {
    var obj = Object.assign({}, this.state.bugs);
    obj[id] = status;
    this.setState({
      bugs: obj
    })
  }

  render () {
    return (
      <article className="case-list">
        <div className="sub-nav">
          <div className="case-sum">
            共计 { this.state.cases.length } 条用例
            { this.stats() }
          </div> 
          <ToolMenu addCase={ this.addCase.bind(this) } />
        </div>

        <div className="container case-container">
          {
            this.state.cases.map(val => 
              <CaseItem 
                key={ val.id }
                data={ val }
                pageID={ this.props.match.params.id }
                bus={ this.bus } 
              />
            )
          }
        </div>

        <ContextMenu
          data={ this.caseContextMenu } 
          eventObj={ this.state.eventObj }
          isShow={ this.state.isShowCaseMenu } 
          hideMenu={ 
            () => { 
              this.setState({
                isShowCaseMenu: false
              }) 
            }
          } />

        <BugContextMenu bus={ this.bus } />
        <BugRecord bus={ this.bus } />

        <MessageBox 
          isShow={ this.state.isShowMessageBox }
          title='Are you sure?'
          confirm={ this.deleCase.bind(this) }
          hideBox={
            () => { 
              this.setState({
                isShowMessageBox: false
              }) 
            }
          }>
          <p>您确定删除该用例吗？</p>
        </MessageBox>

        <input type="file" 
          className="ipt-uploader"
          accept="image/jpeg, image/png" 
          ref={ input => this.uploader = input }
          onChange={ this.upload.bind(this) } />

        <ImageViewer bus={ this.bus } />

        <Toast bus={ this.bus } />
      </article>
    )
  }
}

export default CaseList