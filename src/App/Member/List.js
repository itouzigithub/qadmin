import React from 'react'

export default class List extends React.Component {
  constructor (props) {
    super(props);
    this.typeMap = {
      'qa': 0,
      'dev': 1
    }
    this.type = this.props.match.params.type;
    this.state = {
      member: []
    }

    this.handleChange = this.handleChange.bind(this);
    this.projectID = +localStorage.projectID;
  }

  componentDidMount () {
    this.fetch();
  }

  componentWillReceiveProps (nextProps) {
    const prevType = this.props.match.params.type;
    const type = nextProps.match.params.type;
    if (type === prevType) return;
    this.type = type;
    setTimeout(() => {
	    this.fetch();
    }, 0)
  }

  fetch () {
    window.$ajax({
      url: '/projects/member/getMember',
      data: {
        project_id: this.projectID,
        type: this.typeMap[this.type]
      },
      success: res => {
        if (res.code === 0) {
          this.setState({
            member: res.data
          })
          setTimeout(() => {
          	this.handleSelected();
          }, 0)
        }
      }
    })
  }

  handleSelected () {
  	var box = document.querySelectorAll('.member-checkbox');
  	var list = this.state.member;
  	for (var i = 0; i < box.length; i++) {
  		if (list[i].is_member) {
	  		box[i].checked = true;
  		}
  	}
  }

  handleChange (target, value, id) {
  	target.setAttribute('disabled', true);
  	this.setMember(target, id, Number(value));
  }

  setMember (target, id, addOrRemove) {
  	window.$ajax({
  		url: '/projects/member/setMember' ,
  		data: {
  			project_id: this.projectID,
  			user_id: id,
  			type: this.typeMap[this.type],
  			is_add: addOrRemove
  		},
  		complete: () => {
  			target.removeAttribute('disabled');
  		}
  	})
  }

  render () {
    return (
      <article className="container">
        {
          this.state.member.map(val =>
            <p className="mb15" key={ val.id }>
              <label>
                <input className="member-checkbox" type="checkbox" 
                  onChange={ e => this.handleChange(e.currentTarget, e.target.checked, val.id) } />
                <span>{ val.real_name }</span>
              </label>
            </p>
          )
        }
      </article>
    )
  }
}