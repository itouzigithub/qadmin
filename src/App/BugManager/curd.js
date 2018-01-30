export function getBugsByPageID (pageID) {
  return new Promise((resolve, reject) => {
    window.$ajax({
      url: '/bugs/index/getBugsByPageID',
      data: {
        page_id: pageID,
        dev_id: window.USERINFO.role === 1 ? window.USERINFO.id : ''
      },
      success: res => {
        if (res.code === 0) {
          resolve(res.data)
        } else {
          reject("根据页面 id 获取 bug 接口出错")
        }
      }
    })
  })
}

export function getBugsByCaseID (caseID) {
  return new Promise((resolve, reject) => {
    window.$ajax({
      url: '/bugs/index/getBugsByCaseID',
      data: {
        case_id: caseID
      },
      success: res => {
        if (res.code === 0) {
          resolve(res.data)
        } else {
          reject("根据页面 id 获取 bug 接口出错")
        }
      }
    })
  })
}

export function addBug (content, caseID, pageID, projectID) {
  return new Promise((resolve, reject) => {
    window.$ajax({
      url: '/bugs/index/addBug',
      type: 'post',
      data: {
        content: content,
        case_id: caseID,
        page_id: pageID,
        project_id: projectID
      },
      success: res => {
        if (res.code === 0) {
          resolve()
        } else {
          reject('添加 bug 接口出错')
        }
      }
    })
  })
}

export function updateBug (id, content) {
  return new Promise((resolve, reject) => {
    window.$ajax({
      url: '/bugs/index/updateBug',
      type: 'post',
      data: {
        id: id,
        content: content
      },
      success: res => {
        if (res.code === 0) {
          resolve()
        } else {
          reject('更新 bug 接口出错')
        }
      }
    })
  })
}

export function deleteBug (id, cb) {
  window.$ajax({
    url: '/bugs/index/deleteBug',
    data: {
      id: id
    },
    success: res => {
      if (res.code === 0) {
        cb && cb();
      }
    }
  })
}