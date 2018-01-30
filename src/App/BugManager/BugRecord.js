import React from 'react'
import MessageBox from '../../components/MessageBox/MessageBox'

export default class BugRecord extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      isShow: false,
      history: [],
      reason: '',
      solution: ''
    }

    this.props.bus.on('showBugRecord', payload => {
      this.setState({
        isShow: true,
        history: payload.history,
        reason: payload.reason,
        solution: payload.solution
      })
    })
  }

  render () {
    return (
      this.state.isShow 
      ? <MessageBox 
          isShow={ this.state.isShow }
          title='Bug 记录'
          hideBox={
            () => { 
              this.setState({
                isShow: false
              }) 
            }
          }>
          <div>
            <p className="mb6">历史</p>
            <ul className="f13">
              {
                this.state.history.map((val, i) => 
                  <li key={ i }>{ val }</li>
                )
              }
            </ul>
            <p className="mb6 mt15">原因</p>
            <p className="f13">{ this.state.reason }</p>
            <p className="mb6 mt15">方案</p>
            <p className="f13">{ this.state.solution }</p>
          </div>
        </MessageBox>
      : null
    )
  }
}