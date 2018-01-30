<?php
namespace app\auth\controller;

use think\Db;
use think\controller\Rest;

class Index extends Rest
{
  public function login () 
  {
    if (!isset($_POST['username'])) {
      return 'missing params: username';
    }

    if (!isset($_POST['password'])) {
      return 'missing params: password';
    }

    $username = $_POST['username'];
    $password = $_POST['password'];

    $res = Db::query("SELECT id, real_name FROM all_users WHERE user_name = '$username' AND user_password = $password");

    if (count($res) === 0) {
      return $this->response(['code' => 1, 'info' => 'invalid username or password'], 'json', 200);
    }

    if (count($res) === 1) {
      $id = $res[0]["id"];
      $name = $res[0]["real_name"];

      setcookie('UID', $id, time() + 10 * 24 * 3600, '/', '', false, true);
      
      return $this->response(['code' => 0], 'json', 200);
    }
  }

  public function getLoginStatus()
  {
    if (!isset($_COOKIE["UID"]) || empty($_COOKIE["UID"])) {
      return $this->response(['code' => 1, 'info' => '登录状态已过期'], 'json', 200);
    }

    $id = $_COOKIE["UID"];
    $res = Db::query("SELECT id, authority_level, role, real_name FROM all_users WHERE id = $id");

    if (count($res) === 1) {
      session_start();
      $_SESSION["id"] = $id;
      $_SESSION["real_name"] = $res[0]["real_name"];
      return $this->response(['code' => 0, 'data' => $res[0]], 'json', 200);
    } else {
      return $this->response(['code' => 1, 'info' => '登录状态已过期'], 'json', 200);
    }
  }
}