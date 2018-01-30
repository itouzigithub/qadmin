import React from 'react'
import './Stats.css'

class Stats extends React.Component {
  constructor () {
    super();
    this.state = {
      total: {},
      passRate: []
    }
  }

  componentDidMount () {
    window.$ajax({
      url: '/projects/stats',
      data: {
        id: +localStorage.projectID
      },
      success: res => {
        if (res.code === 0) {
          this.setState({
            total: res.total,
            passRate: res.data
          })
        }
      }
    })  
  }

  percent (num) {
  	if (isNaN(num)) {
  		return '-'
  	}
  	return (num * 100).toFixed(2) + '%'
  }

  render () {
    return (
      <article className="container">
      	<table>
      		<tbody>
	      		<tr>
	      			<th>页面</th>
	      			<th>用例</th>
	      			<th>P1级用例</th>
	      			<th title="仅统计已关闭的 Bug">Bug</th>
              <th>已解决Bug</th>
	      			<th>未解决Bug</th>
	      			<th>无效Bug</th>
	      			<th title="含有 bug 的 P1 级用例数 / P1 级用例数">P1级通过率</th>
	      			<th title="含有 bug 的用例数 / 用例数">整体通过率</th>
	      		</tr>
	      		{
	      			this.state.passRate.map(val => (
			      		<tr key={ val.id }>
			      			<td>{ val.page_name }</td>
			      			<td>{ val.cases }</td>
			      			<td>{ val.p1_cases }</td>
			      			<td>{ val.bugs }</td>
                  <td>{ val.solved_bugs }</td>
			      			<td>{ val.bugs - val.solved_bugs - val.invalid_bugs }</td>
			      			<td>{ val.invalid_bugs }</td>
			      			<td>{ this.percent(1 - val.bug_p1_cases / val.p1_cases) }</td>
			      			<td>{ this.percent(1 - val.bug_cases / val.cases) }</td>
			      		</tr>
	      			))
	      		}
	      		<tr>
	      			<th>总计</th>
	      			<th>{ this.state.total.cases }</th>
	      			<th>{ this.state.total.p1_cases }</th>
	      			<th>{ this.state.total.bugs }</th>
              <th>{ this.state.total.solved_bugs }</th>
	      			<th>{ this.state.total.bugs - this.state.total.solved_bugs - this.state.total.invalid_bugs }</th>
	      			<th>{ this.state.total.invalid_bugs }</th>
	      			<th>{ this.percent(1 - this.state.total.bug_p1_cases / this.state.total.p1_cases) }</th>
	      			<th>{ this.percent(1 - this.state.total.bug_cases / this.state.total.cases) }</th>
	      		</tr>
	      	</tbody>
      	</table>	
      </article>
    )
  }
}

export default Stats