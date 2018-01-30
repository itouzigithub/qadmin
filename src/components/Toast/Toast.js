import React from 'react'
import './Toast.css'

export default class Toast extends React.Component {
	constructor (props) {
		super();
		this.state = {
			content: '',
			isShow: false
		}

		props.bus.on('toast', content => {
			this.setState({
				content: content,
				isShow: true
			});
			setTimeout(() => {
				this.setState({
					isShow: false
				});
			}, 2000)
		})
	}

	render () {
		return (
			<div className="toast-wrap" style={{display: this.state.isShow ? 'block' : 'none'}}>
				<div className="toast-content">{ this.state.content }</div>
			</div>
		)
	}
}