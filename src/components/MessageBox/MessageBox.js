import React from 'react'
import './MessageBox.css'
/**
 * @isShow { Boolean } required 控制弹窗显示与隐藏
 * @hideBox { Function } required 关闭操作
 * @title { String } optional 弹窗标题
 * @children { Slot } optional 自定义弹窗内容
 * @confirm { Function } optional 确认操作
 * @type { String } optional 类型，可选值： 'warn' | 'info' | 'danger'
 */
export default function (props) {
  return (
    props.isShow 
    ? <div className="mask">
        <div className="msg-box" type={ props.type || 'danger' }>
          <header className="msg-box-hd">{ props.title || "我是弹框" }</header>
          <div className="msg-box-bd">
            { props.children }
          </div>
          <footer className="msg-box-ft">
            <button onClick={
              () => {
                props.confirm && props.confirm();
                props.hideBox();
              }
            }>确定</button>
            <button onClick={ props.hideBox }>取消</button>
          </footer>
        </div>
      </div>
    : null
  )
}