<?php
namespace app\projects\controller;

use think\Db;
use think\controller\Rest;

class Index extends Rest 
{
  public function index()
  {
    $projects = Db::query("SELECT * FROM qa_projects");
    if (!isset($_COOKIE['UID'])) {
      return $this->response(['code' => 1, 'info' => '登录状态过期'], 'json', 200);
    }

    // 仅返回用户所在的项目，管理员可查看所有项目
    $id = $_COOKIE['UID'];
    $data = Db::query("SELECT authority_level FROM all_users WHERE id = $id");
    $level = $data[0]['authority_level'];

    if ($level == 1) {
      $arr = $projects;
    } else {
      $arr = Array();

      foreach ($projects as $value) {
        $qa = empty($value['qa']) ? [] : explode('&', $value['qa']);
        $dev = empty($value['dev']) ? [] : explode('&', $value['dev']);
        $user = array_merge($qa, $dev);
        if (in_array($id, $user)) {
          array_push($arr, $value);
        }
      }
    }

    $res = [
      'data' => $arr,
      'code' => 0
    ];

    return $this->response($res, 'json', 200);
  }

  public function createProject()
  {
    if (!isset($_POST['name'])) {
      return 'missing property: name';
    }

    $name = $_POST['name'];
    $time = date("Y-m-d H:i:s");

    Db::query("INSERT INTO qa_projects (project_name, found_time) VALUES ('$name', '$time')");
    return $this->response(['code' => 0], 'json', 200);
  }

  public function updateProject()
  {
    if (!isset($_POST['id'])) {
      return 'missing property: id';
    }

    if (!isset($_POST['name'])) {
      return 'missing property: name';
    }

    $id = $_POST['id'];
    $name = $_POST['name'];

    Db::query("UPDATE qa_projects SET project_name = '$name' WHERE id = $id");
    return $this->response(['code' => 0], 'json', 200);
  }
}
