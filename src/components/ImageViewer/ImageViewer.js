import React from 'react'

var style = {
	maxWidth: '100%',
	maxHeight: '100%',
	position: 'absolute',
	left: 0,
	right: 0,
	top: 0,
	bottom: 0,
	margin: 'auto'
}

export default class ImageViewer extends React.Component {
	constructor (props) {
		super();
		this.state = {
			isShow: false,
			src: ''
		}
		props.bus.on('imgViewer', src => {
			this.setState({
				isShow: true,
				src: src
			})
		})
	}

	render () {
		return (
			<div className="mask" style={{display: this.state.isShow ? 'block' : 'none'}}
			  onClick={
			  	() => {
			  		this.setState({
			  			isShow: false
			  		})
			  	}
			  }>
				<img src={ this.state.src } alt="" style={ style } onClick={ e => e.stopPropagation() } />
			</div>
		)
	}
}