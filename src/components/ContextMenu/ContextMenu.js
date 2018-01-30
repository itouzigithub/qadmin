import React from 'react'
import './ContextMenu.css'

export default function ContextMenu (props) {
  var e = props.eventObj
  var x = 0, y = 0;

  if (e) {
    x = e.pageX - 8;
    y = e.pageY - 8;
  }

  return (
    <ul className="context-menu" 
      style={{ 
        display: props.isShow ? 'block' : 'none',
        left: x + 'px', 
        top: y + 'px' 
      }} 
      onMouseLeave={ e => {
          props.hideMenu()
        }  
      }>
      {
        props.data.map((val, i) =>
          <li disabled={ !!val.disabled } key={ i } 
            onClick={ 
              (e) => {
                if (val.disabled) return;
                e.stopPropagation();
                val.handler();
                props.hideMenu();
              }
            }>
            <i className={ val.icon ? 'fa ' + val.icon : ''}></i>
            { val.name }
          </li>
        )
      }
    </ul>
  )
}