import React from 'react'
import MessageBox from '../../components/MessageBox/MessageBox'
import { bugReasonType } from '../../assets/js/config'

export default class BugMessageBox extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      isShow: false
    }
    this.targetID = -1;
    this.result = '';
    props.bus.on('handleBug', this.showMessageBox.bind(this));
  }

  showMessageBox (result, id) {
    this.result = result;
    this.targetID = id;
    this.setState({
      isShow: true
    })
  }

  getBugInfo () {
    var $form = document.getElementById('bug-info');
    var $labels = $form.querySelectorAll('input');
    var data = {
      id: this.targetID,
      reason_type: -1,
      reason: $form.reason.value,
      solution: $form.solution.value
    }
    for (var i = 0; i < $labels.length; i++) {
      if ($labels[i].checked) {
        data.reason_type = +$labels[i].value;
        break;
      }
    }
    return data
  }

  handleBug () {
    if (this.result === 'invalid') {
      return this.handleInvalidBug()
    }
    var data = this.getBugInfo();
    if (data.reason_type === undefined || data.reason_type < 0) return alert('请选择 bug 类型');
    if (this.result === 'solved') {
      data.is_solved = 1
    }
    if (this.result === 'unsolved') {
      data.is_solved = 0
    }
    data.dev_name = window.USERINFO.real_name;
    window.$ajax({
      url: '/bugs/index/handleBug',
      type: 'post',
      data: data,
      success: res => {
        if (res.code === 0) {
          this.props.bus.emit('updateBugStatus', data.id, 2, res.record)
        }
      }
    })
  }

  handleInvalidBug () {
    var $form = document.getElementById('bug-info');
    var id = this.targetID;
    window.$ajax({
      url: '/bugs/index/handleInvalidBug',
      type: 'post',
      data: {
        id: id,
        dev_name: window.USERINFO.real_name,
        reason: $form.reason.value
      },
      success: res => {
        if (res.code === 0) {
          this.props.bus.emit('updateBugStatus', id, 2, res.record, res.reason)
        }
      }
    })
  }

  render () {
    return (
      <MessageBox type="info"
        title="bug 是一种资源"
        isShow={ this.state.isShow }
        confirm={ this.handleBug.bind(this) }
        hideBox={ () => {
          this.setState({
            isShow: false
          })
        }}>
        <form id="bug-info">
          {
            this.result !== 'invalid' &&
            <div className="f13 mb15">
              <p className='f13 mb6'>bug 类型（必填）</p>
              {
                bugReasonType.map((val, i) => 
                  <label key={ i } className="dib col-4" title={ val.title }>
                    <input className="vm" name="type" type="radio" value={ val.value } />
                    <span> { val.name }</span>
                  </label>
                )
              }
            </div>
          }
          <div className="mb15">
            <p className='f13 mb6'>bug 原因（选填）</p>
            <textarea name="reason" placeholder="请仔细说明原因，可作备忘，且有利于 QA 理解问题的本质"></textarea>
          </div>
          {
            this.result !== 'invalid' &&
            <div>
              <p className='f13 mb6'>解决方案（选填）</p>
              <textarea name="solution" placeholder="有价值的方案请补充至官方 Github"></textarea>
            </div>
          }
        </form>
      </MessageBox>
    )
  }
}