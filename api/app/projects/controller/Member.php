<?php
namespace app\projects\controller;

use think\Db;
use think\controller\Rest;

class Member extends Rest 
{
  /**
   * 根据参数 type 返回相应类型的所有的成员，并标记成员是否属于某个项目
   * type { Number } 0 - QA | 1 - 开发
   */
  public function getMember()
  {
    $pid = $_GET['project_id'];
    $type = $_GET['type'];

    if ($type == 0) {
      $type_val = 'qa'; // 测试
    }
    if ($type == 1) {
      $type_val = 'dev'; // 开发
    }

    $user = Db::query("SELECT id, real_name FROM all_users WHERE role = $type");
    $member = Db::query("SELECT " . $type_val . " FROM qa_projects WHERE id = $pid");

    if (empty($member)) {
      return 'find nothing with projectID:' . $pid; 
    }
    
    $member = $member[0][$type_val];

    for ($i=0; $i < count($user); $i++) {
      $uid = (string)$user[$i]['id'];
      if (strpos($member, $uid) === false) {
        $user[$i]['is_member'] = false;
      } else {
        $user[$i]['is_member'] = true;
      }
    }

    return $this->response(['code' => 0, 'data' => $user], 'json', 200);
  }

  /**
   * 设置项目成员
   */
  public function setMember()
  {
    $pid = $_GET['project_id'];
    $uid = $_GET['user_id'];
    $is_add = $_GET['is_add']; // 0 - 移除 | 1 - 添加
    $type = $_GET['type'];  // type 成员类型 0 - QA | 1 - 开发

    if ($type == 0) {
      $type_val = 'qa';
    }
    if ($type == 1) {
      $type_val = 'dev';
    }

    $member = Db::query("SELECT " . $type_val . " FROM qa_projects WHERE id = $pid");

    if (empty($member)) {
      return 'find nothing with projectID:' . $pid;
    }

    $value = $member[0][$type_val]; // 项目成员 id 构成的字符串，id 间以 & 分隔
    if (is_null($value) || empty(trim($value))) {
    	$value = '';
    }
    
    $arr = explode("&", $value);

    if ($is_add) {
    	// 添加项目成员 id
      if (!in_array($uid, $arr)) {
      	if (count($arr) === 1 && empty($arr[0])) {
      		$arr[0] = $uid;
      	} else {
	        array_push($arr, $uid);
      	}
      }
    } else {
    	// 删除项目成员 id
    	if (in_array($uid, $arr)) {
    		$key = array_search($uid, $arr);
    		array_splice($arr, $key, 1);
      }
    }

    $value = count($arr) > 1 ? implode('&', $arr) : $arr[0];

    Db::query("UPDATE qa_projects SET " . $type_val . " = '$value' WHERE id = $pid");

    return $this->response(['code' => 0], 'json', 200);
  }

  /**
   * 返回某个项目的开发成员
   */
  public function getDeveloperOfProject()
  {
    $pid = $_GET['project_id'];
    $member = Db::query("SELECT dev FROM qa_projects WHERE id = $pid");
    $value = $member[0]['dev'];

    if (empty($value)) {
      return $this->response(['code' => 1, 'info' => "请管理员添加项目开发成员"], 'json', 200);
    }

    $arr = explode('&', $value);
    $str = "id = $arr[0]";
    for ($i = 1; $i < count($arr); $i++) { 
      $str = $str . " OR id = $arr[$i]";
    }
    $sql = "SELECT id, real_name FROM all_users WHERE " . $str;
    // var_dump($sql);die;
    $res = Db::query($sql);

    return $this->response(['code' => 0, 'data' => $res], 'json', 200);
  }
}