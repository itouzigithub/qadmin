<?php
namespace app\cases\controller;

use think\Db;
use think\controller\Rest;

class Index extends Rest
{ 
  // 根据页面 id 获取所有用例
  public function index()
  {
    if (!isset($_GET["id"])) {
      return 'missing params: id';
    }

    $id = $_GET["id"];

    $cases = Db::query("SELECT * FROM qa_cases WHERE page_id = $id");

    $res = [
      'data' => $cases,
      'code' => 0
    ];

    return $this->response($res, 'json', 200);
  }

  // 新增用例
  public function addCase()
  { 
    if ($this->method != 'post') {
      return 'requst method should be: post';
    }

    if (!isset($_POST['title'])) {
      return 'missing property: title';
    }

    if (!isset($_POST['project_id'])) {
      return 'missing property: project_id';
    }

    if (!isset($_POST['page_id'])) {
      return 'missing property: page_id';
    }

    $title = $_POST['title'];
    $projectID = $_POST['project_id'];
    $pageID = $_POST['page_id'];

    Db::query("INSERT INTO qa_cases (title, project_id, page_id) VALUES ('$title', $projectID, $pageID)");

    return $this->response(['code' => 0], 'json', 200);
  }

  // 删除用例
  public function deleteCase()
  {
    if ($this->method != 'post') {
      return 'requst method should be: post';
    }

    if (!isset($_POST['id'])) {
      return 'missing property: id';
    }

    $id = $_POST['id'];

    // 检查该用例下是否含有 bug 项目
    $res = Db::query("SELECT id FROM qa_bugs WHERE case_id = $id");
    if (count($res) > 0) {
      return $this->response(['code' => 1, 'info' => '请先清空该用例的 bug'], 'json', 200);
    }

    Db::query("DELETE FROM qa_cases WHERE id = $id");

    return $this->response(['code' => 0], 'json', 200);
  }

  // 更新用例标题
  public function updateTitle()
  {
    if ($this->method != 'post') {
      return 'requst method should be: post';
    }

    if (!isset($_POST['title'])) {
      return 'missing property: title';
    }

    if (!isset($_POST['id']) && empty($_POST['id'])) {
      return 'missing or invalid property: id';
    }

    $id = $_POST['id'];
    $title = $_POST['title'];

    Db::query("UPDATE qa_cases SET title = '$title' WHERE id = $id");

    return $this->response(['code' => 0], 'json', 200);
  }

  // 更新用例描述
  public function updateContent()
  {
    $content = $_POST['content'];
    $id = $_POST['id'];
    $type = (int)$_POST['type'];

    if ($type === 0) {
      Db::query("UPDATE qa_cases SET content = '$content' WHERE id = $id");
      return $this->response(['code' => 0], 'json', 200);
    }

    if ($type === 1) {
      Db::query("UPDATE qa_cases SET expectation = '$content' WHERE id = $id");
      return $this->response(['code' => 0], 'json', 200);
    }

    if ($type === 2) {
      Db::query("UPDATE qa_cases SET remark = '$content' WHERE id = $id");
      return $this->response(['code' => 0], 'json', 200);
    }

    return $this->response(['code' => 1, 'info' => 'update failed'], 'json', 200);
  }

  // 标记用例类型
  public function mark () 
  {
    if (!isset($_GET["id"])) {
      return 'missing params: id';
    }

    if (!isset($_GET["type"])) {
      return 'missing params: type';
    }

    $id = $_GET["id"];
    $type = $_GET["type"];

    Db::query("UPDATE qa_cases SET type = $type WHERE id = $id");

    return $this->response(['code' => 0], 'json', 200);
  }
}
