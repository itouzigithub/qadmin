export function getCases (pageID) {
  return new Promise((resolve, reject) => {
    window.$ajax({
      url: '/cases', 
      data: {
        id: pageID
      }, 
      success: res => {
        if (res.code === 0) {
          resolve(res.data)
        } else {
          reject('获取用例接口出错')
        }
      }
    })
  })
}

export function addCase (title, projectID, pageID, cb) {
	window.$ajax({
    url: '/cases/index/addCase',
    type: 'post',
    data: {
      title: title,
      project_id: projectID,
      page_id: pageID  
    },
    success: res => {
      if (res.code === 0) {
        cb && cb()
      }
    }
  })
}

export function deleteCase (id, cb) {
	window.$ajax({
		url: '/cases/index/deleteCase',
		type: 'post',
		data: {
			id: id
		},
		success: res => {
			if (res.code === 0) {
				cb && cb();
			} else {
        alert(res.info)
      }
		}
	})
}

export function updateTitle (id, title, cb) {
	window.$ajax({
    url: '/cases/index/updateTitle', 
    type: 'post',
    data: {
      id: id,
      title: title
    }, 
    success: res => {
      if (res.code === 0) {
        cb && cb()
      }
    }
  })
}

export function updateContent (id, content, type, cb) {
  window.$ajax({
    url: '/cases/index/updateContent',
    type: 'post',
    data: {
      id: id,
      content: content,
      type: type
    }, 
    success: res => {
      if (res.code === 0) {
        cb && cb()
      }
    }
  })
}