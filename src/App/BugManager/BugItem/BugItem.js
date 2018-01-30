import React from 'react'
import './BugItem.css'
import { bugReasonType } from '../../../assets/js/config'
import { addBug, updateBug } from '../curd'

const bugStatusMap = {
  '0': 'fa-hourglass-start',        // 刚创建
  '1': 'fa-fire-extinguisher',      // 修复中
  '2': 'fa-bell',                   // 待验证
  '3': 'fa-lock'                    // 已关闭
}

const bugLabelMap = {
  '0': ' 待指派',
  '1': ' 修复中',
  '2': ' 待验证',
  '3': ' 已关闭'
}

class BugItem extends React.Component {
  constructor (props) {
    super();
    const {
      id, content, imgs, status, 
      history, case_id, page_id, project_id, 
      is_effective, is_solved, 
      solution, reason, reason_type,
      isEdit 
    } = props.data;

    this.state = {
      content,
      status,        // 0 - 刚创建 | 1 - 待修复 | 2 - 待验证 | 3 - 已关闭
      imgs,
      is_effective,
      is_solved,
      history: history.split('&'),
      isEdit: isEdit === undefined ? false : isEdit
    }

    this.id = id;
    this.case_id = case_id;
    this.page_id = page_id;
    this.project_id = project_id;
    this.reason_type = reason_type;
    this.reason = reason || '';
    this.solution = solution || '';
    
    this.bus = props.bus;
    this.bus.on('addImg', this.addImg.bind(this));
  }

  componentWillReceiveProps (nextProps) {
    // updateBugStatus 事件后更新状态
    if (nextProps.data.status !== this.state.status) {
      var history = this.state.history.slice();
      history.push(nextProps.data.record);
      this.setState({
        status: nextProps.data.status,
        history: history 
      })
    }
  }

  update () {
    const content = this.state.content;
    const id = this.id;

    if (!content) return;
    // id 不存在表示新增，存在表示更新
    if (!id || id < 0) {
      addBug(content, this.case_id, this.page_id, this.project_id)
      .then(() => {
        // 重新获取 bug，否则新增的 bug 没有 id，无法执行后续的修改操作
        this.props.getBugs();
      })
      .catch(e => {
        console.error(e)
      })
    } else {
      updateBug(id, content)
      .then(() => {
        this.isEdit = false
      })
      .catch(e => {
        console.error(e)
      })
    }
  }

  syncChange (e) {
    this.setState({
      content: e.target.value.trim()
    })
  }

  showBugMenu (event) {
    // 修复中的 bug，QA 不可操作
    if (this.state.status === 1 && window.USERINFO.role === 0) {
      this.bus.emit('toast', '请通知开发指回该 bug');
      return;
    } 
    // 其它状态下的 bug，开发不可操作
    if (this.state.status !== 1 && window.USERINFO.role === 1) return;

    this.bus.emit('showBugMenu', {
      event: event,
      id: this.id,
      undeletable: this.state.status > 0, // 已指派的 bug 不可删除
      uncloseable: this.state.status === 0, // 刚创建的 bug 不可关闭
      caseID: this.case_id
    })
  }

  showBugRecord () {
    this.bus.emit('showBugRecord', {
      history: this.state.history,
      reason: this.reason,
      solution: this.solution
    })
  }

  computedRecord () {
    return this.state.history.slice(-1)[0].slice(5)
  }

  computedRecordReason () {
    var type = +this.reason_type;
    if (type === undefined || type === null) {
      return ''
    }
    for (var i = 0; i < bugReasonType.length; i++) {
      if (bugReasonType[i].value === type) {
        return bugReasonType[i].name
      }
    }
  }

  addImg (id, arr) {
    if (id !== this.id) return;
    this.setState({
      imgs: arr
    })
  }

  deleteImage (index) {
    window.$ajax({
      url: '/bugs/index/deleteImg',
      type: 'post',
      data: {
        index: index,
        bug_id: this.id
      },
      success: res => {
        if (res.code === 0) {
          var imgs = this.state.imgs.slice();
          imgs.splice(index, 1);
          this.setState({
            imgs: imgs
          })
        }
      }
    })
  }

  render () {
    return (
      <li>
        {
          this.state.isEdit
          ? <div className="ipt-container">
              <textarea value={ this.state.content }
                ref={ input => this.input = input }
                onChange={ this.syncChange.bind(this) }
                onBlur={
                  () => {
                    this.update();
                    this.setState({
                      isEdit: false
                    })
                  }
                }>
              </textarea>
            </div>
          : <div className='bug-item' status={ this.state.status }>
              <p className="bug-content" onMouseDown={ this.showBugMenu.bind(this) }
                onDoubleClick={
                  () => {
                    if (window.USERINFO.role === 1 || this.state.status === 3) return;
                    this.setState({
                      isEdit: true
                    })
                    setTimeout(() => {
                      this.input.focus();
                    }, 0)
                  }
                }>
                <i className={'bug-label fa ' + bugStatusMap[this.state.status]}>
                  { bugLabelMap[this.state.status] }
                </i>
                { this.state.content }
                {
                  (window.USERINFO.role === 0 && this.state.status < 3) &&
                  <i className="fa fa-image ml8" onMouseDown={ 
                    (e) => {
                      e.stopPropagation();
                      this.bus.emit('invokeUploader', this.id) 
                    } 
                  }></i>
                }
              </p>
              <div className="bug-imgs">
                {
                  !!this.state.imgs && this.state.imgs.map((val, i) => 
                    <div key={ i } 
                      className="bug-img" 
                      style={{ backgroundImage: 'url(' + val + ')'}}
                      onClick={ () => { this.bus.emit('imgViewer', val) } }>
                      {
                        window.USERINFO.role === 0 &&
                        <i className="fa fa-trash" onClick={ 
                          e => {
                            e.stopPropagation();
                            this.deleteImage(i);
                          }
                        }></i>
                      }
                    </div>
                  )
                }
              </div>
              {
                this.state.status < 3 &&
                <div className="bug-record">
                  { this.computedRecord() }
                  {
                    this.state.is_effective === 0 &&
                    <i className="fa fa-question-circle ml4" title={ this.reason || "未填写" }></i>
                  }
                </div>
              }
              {
                this.state.status === 3 &&
                <div className="bug-record">
                  {
                    this.state.is_effective === 0 &&
                    <i className="bug-badge fa fa-warning">无效</i>
                  }
                  {
                    this.state.is_effective === 1 && (
                      this.state.is_solved
                      ? <i className="bug-badge fa fa-check">已解决</i>
                      : <i className="bug-badge fa fa-times">未解决</i>
                    )
                  }
                  {
                    this.state.is_effective === 1 &&
                    <i className="bug-badge fa fa-bug">{ this.computedRecordReason() }</i>
                  }
                  <i className="bug-badge fa fa-quote-right" onClick={ this.showBugRecord.bind(this) }>查看</i>
                </div>
              }
            </div>
        }
      </li>
    )
  }
}

export default BugItem