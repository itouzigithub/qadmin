import React from 'react'
import './Case.css'
import BugItem from '../../BugManager/BugItem/BugItem'
import { updateTitle, updateContent, addCase } from './curd.js'
import { sortArrayofObjects } from '../../../assets/js/utils'
import { getBugsByCaseID, deleteBug } from '../../BugManager/curd'

class CaseItem extends React.Component {
  constructor (props) {
    super();
    const { id, title, content, expectation, remark, type, bugs, isEditTitle } = props.data;
    this.id = id;
    this.state = {
      title,
      content,
      expectation,
      remark,
      type, // 是否为 p1 级
      bugs,
      isEditTitle: isEditTitle === undefined ? false : isEditTitle,
      isEditDesc: false,
      isEditExp: false,
      isEditRemark: false
    }

    this.contentChanged = false; // 标记编辑内容是否改变，只有改变才提交，以减少接口通信负荷

    props.bus.on('addBug', this.addBug.bind(this));
    props.bus.on('deleBug', this.deleBug.bind(this));
    props.bus.on('updateBugStatus', this.updateBugStatus.bind(this));
  }

  changeTitle (e) {
    this.contentChanged = true;
    this.setState({
      title: e.target.value.trim()
    })
  }

  handleChangedTitle () {
    const title = this.state.title;
    const id = this.id;

    if (!title) return

    // id 不存在表示新增，存在表示更新
    if (!id || id < 0) {
      const pageID = this.props.pageID;
      const projectID = +localStorage.projectID;

      addCase(title, projectID, pageID, () => {
        this.setState({
          isEditTitle: false
        })
        // 新增后需重新获取数据，否则新增项没有 id
        this.props.bus.emit('fetchCases');
      })
    } else if (this.contentChanged) {
      updateTitle(id, title, () => {
        this.setState({
          isEditTitle: false
        })
      })
    } else {
      this.setState({
        isEditTitle: false
      })
    }
  }

  changeDesc (e) {
    this.contentChanged = true;
    this.setState({
      content: e.target.value
    })
  }

  changeExp (e) {
    this.contentChanged = true;
    this.setState({
      expectation: e.target.value
    })
  }

  changeRemark (e) {
    this.contentChanged = true;
    this.setState({
      remark: e.target.value
    })
  }

  createMarkup (html, placeholder) {
    if (!html) {
      return {
        __html: `<span class="case-desc-placeholder" title="双击编辑">${placeholder}</span>`
      }
    }
    return {
      __html: html.replace(/[\r\n]/g, '<br>').replace(/\s/g, '&nbsp;')
    }
  }

  addBug (id) {
    if (id !== this.id) return;
    var bugs = this.state.bugs.slice();
    if (bugs.length > 0 && bugs.slice(-1)[0].id === -1) return;
    bugs.push({
      id: -1,
      content: '',
      status: 0,
      history: '',
      case_id: this.id,
      page_id: this.props.pageID,
      project_id: +localStorage.projectID,
      isEdit: true
    });
    this.setState({
      bugs: bugs
    })
  }

  deleBug (bugID, caseID) {
    if (this.id !== caseID) return;
    deleteBug(bugID, () => {
      var bugs = this.state.bugs.slice();
      for (var i = 0; i < bugs.length; i++) {
        if (bugs[i].id === bugID) {
          bugs.splice(i, 1);
          return this.setState({
            bugs: bugs
          })
        }
      }
    })
  }

  updateBugStatus (id, status, record, reason) {
    var bugs = this.state.bugs.slice();
    if (bugs.length === 0) return;
    for (var i = 0; i < bugs.length; i++) {
      if (bugs[i].id === id) {
        bugs[i].status = status;
        bugs[i].record = record;
        // reason 存在，表明 bug 被标记为无效
        if (reason !== undefined) {
          bugs[i].is_effective = 0;
        }
        this.props.bus.emit('updateBugStats', id, status);
        return this.setState({
          bugs: bugs
        })
      }
    }
  }

  // 获取单个项目的 bug
  getBugs () {
    getBugsByCaseID(this.id)
    .then(data => {
      this.setState({
        bugs: data
      })
    })
    .catch(e => {
      console.log(e)
    })
  }

  mark () {
    if (window.USERINFO.role === 1) return;
    var type = this.state.type === 1 ? 0 : 1;
    window.$ajax({
      url: '/cases/index/mark',
      data: {
        id: this.id,
        type: type
      },
      success: res => {
        if (res.code === 0) {
          this.setState({
            type: type
          })
        }
      }
    })
  }

  render () {
    return (
      <section type={ this.state.type }>
        <div className='case-title'>

          <i className="fa fa-thumb-tack" onClick={ this.mark.bind(this) }></i>

          {
            this.state.isEditTitle
            ? <div className='ipt-container' style={{ height: '40px'}}>
                <input type="text" value={ this.state.title }
                  ref={ input => { this.titleInput = input }}
                  onChange={ this.changeTitle.bind(this) }
                  onBlur={ this.handleChangedTitle.bind(this) } />
              </div>
            : <p onMouseDown={
                  (event) => {
                    if (window.USERINFO.role !== 0) return;
                    this.props.bus.emit('showCaseMenu', event, this.id, !!this.state.bugs.length)
                  }
                }
                onDoubleClick={
                  () => {
                    if (window.USERINFO.role !== 0) return;
                    this.setState({
                      isEditTitle: true
                    })
                    this.contentChanged = false;
                    setTimeout(() => {
                      this.titleInput.focus();
                    }, 0)
                  }
                }>
                { this.state.title }
              </p>
          }
        </div>

        <div className='case-desc'>
          {
            this.state.isEditDesc 
            ? <div className='ipt-container case-step'>
                <textarea value={ this.state.content || '' }
                  ref={ input => this.descInput = input }
                  onChange={ this.changeDesc.bind(this) }
                  onBlur={
                    () => {
                      if (this.contentChanged) {
                        updateContent(this.id, this.state.content, 0);
                      }
                      this.setState({
                        isEditDesc: false
                      })
                    }
                  }>
                </textarea>
              </div>
            : <div className="case-step" dangerouslySetInnerHTML={ this.createMarkup(this.state.content, '操作步骤') }
                onDoubleClick={
                  () => {
                    if (window.USERINFO.role !== 0) return;
                    this.setState({
                      isEditDesc: true
                    })
                    this.contentChanged = false;
                    setTimeout(() => {
                      this.descInput.focus();
                    }, 0)
                  }
                } 
              ></div>
          }
          {
            this.state.isEditExp 
            ? <div className='ipt-container case-expect'>
                <textarea value={ this.state.expectation || '' }
                  ref={ input => this.expInput = input }
                  onChange={ this.changeExp.bind(this) }
                  onBlur={
                    () => {
                      if (this.contentChanged) {
                        updateContent(this.id, this.state.expectation, 1);
                      }
                      this.setState({
                        isEditExp: false
                      })
                    }
                  }>
                </textarea>
              </div>
            : <div className="case-expect" dangerouslySetInnerHTML={ this.createMarkup(this.state.expectation, '期望结果') }
                onDoubleClick={
                  () => {
                    if (window.USERINFO.role !== 0) return;
                    this.setState({
                      isEditExp: true
                    })
                    this.contentChanged = false;
                    setTimeout(() => {
                      this.expInput.focus();
                    }, 0)
                  }
                }></div>
          }
          {
            this.state.isEditRemark
            ? <div className='ipt-container case-remark'>
                <textarea value={ this.state.remark || '' }
                  ref={ input => this.remarkInput = input }
                  onChange={ this.changeRemark.bind(this) }
                  onBlur={
                    () => {
                      if (this.contentChanged) {
                        updateContent(this.id, this.state.remark, 2);
                      }
                      this.setState({
                        isEditRemark: false
                      })
                    }
                  }>
                </textarea>
              </div>
            : <div className="case-remark" dangerouslySetInnerHTML={ this.createMarkup(this.state.remark, '备注') }
                onDoubleClick={
                  () => {
                    if (window.USERINFO.role !== 0) return;
                    this.setState({
                      isEditRemark: true
                    })
                    this.contentChanged = false;
                    setTimeout(() => {
                      this.remarkInput.focus();
                    }, 0)
                  }
                }></div>
          }
        </div>

        <ul className='bug-wrapper'>
          {
            sortArrayofObjects(this.state.bugs, 'status').map(val =>
              <BugItem key={ val.id } 
                data={ val } 
                getBugs={ this.getBugs.bind(this) }
                bus={ this.props.bus } 
              />
            )
          }
        </ul>
      </section>
    )
  }
}

export default CaseItem