<?php
namespace app\pages\controller;

use think\Db;
use think\controller\Rest;

class Index extends Rest
{
  // 根据项目 id 获取所有页面
  public function index()
  {
    if (!isset($_GET['id'])) {
      return 'missing params: id';
    }

    $id = $_GET['id'];

    $data = Db::query("SELECT * FROM qa_pages WHERE project_id = $id");

    $res = [
      "code" => 0,
      "data" => $data
    ];

    return $this->response($res, 'json', 200);
  }

  // 新增 page
  public function addPage()
  {
    if (!isset($_POST['project_id'])) {
      return 'missing params: project_id';
    }

    if (!isset($_POST['name'])) {
      return 'missing params: name';
    }

    $id = $_POST['project_id'];
    $name = $_POST['name'];

    Db::query("INSERT INTO qa_pages (project_id, page_name, group_number) VALUES ($id, '$name', 0)");

    return $this->response(["code" => 0], 'json', 200);
  }

  // 更新 page
  public function updatePageName()
  {
    if (!isset($_POST['id'])) {
      return 'missing params: id';
    }

    if (!isset($_POST['name'])) {
      return 'missing params: name';
    }

    $id = $_POST['id'];
    $name = $_POST['name'];

    Db::query("UPDATE qa_pages SET page_name = '$name' WHERE id = $id");

    return $this->response(["code" => 0], 'json', 200);
  }

  // 删除 page
  public function deletePage()
  {
    if (!isset($_POST['id'])) {
      return 'missing params: id';
    }

    $id = $_POST['id'];

    // 检查该页面下是否含有用例
    $res = Db::query("SELECT id From qa_cases WHERE page_id = $id");
    if (count($res) > 0) {
      return $this->response(["code" => 1, "info" => '请先清空该页面下的所有用例'], 'json', 200);
    }

    Db::query("DELETE FROM qa_pages WHERE id = $id");

    return $this->response(["code" => 0], 'json', 200);
  }
}