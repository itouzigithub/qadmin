import React from 'react'
import { Route } from 'react-router-dom'
import CaseList from './Case/CaseList.js'
import PageList from './PageList/PageList.js'

function CaseManager ({ match }) {
  return (
    <main>
      <PageList match={ match } />
      <Route path={`${match.url}/:id`} component={ CaseList } />
    </main>
  )
}

export default CaseManager