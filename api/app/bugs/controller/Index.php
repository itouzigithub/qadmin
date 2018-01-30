<?php
namespace app\bugs\controller;

use think\Db;
use think\controller\Rest;

define('IMAGE_PATH_PREFIX', '../public');

class Index extends Rest
{
  // 处理查询 bug 返回值中的某些参数
  private function handleResult($data)
  {
    if (empty($data)) {
      return Array();
    }
    for ($i = 0; $i < count($data); $i++) {
      $imgs = $data[$i]['imgs'];
      if (!empty($imgs)) {
        $data[$i]['imgs'] = explode(',', $imgs);
      }
    }
    return $data;
  }

  /**
   * 添加 bug
   */
  public function addBug()
  { 
    $projectID = $_POST["project_id"];
    $pageID = $_POST["page_id"];
    $caseID = $_POST["case_id"];
    $content = $_POST["content"];

    session_start();
    $name = $_SESSION["real_name"];
    $record = date("Y-m-d H:i") . ' ' . $name . '创建';

    Db::query("INSERT INTO qa_bugs (project_id, page_id, case_id, content, history) VALUES ($projectID, $pageID, $caseID, '$content', '$record')");

    return $this->response(['code' => 0], 'json', 200);
  }

  /**
   * 返回某个页面的 bug
   * 如果 dev_id 参数存在，表明只返回属于某个开发的 bug
   */
  public function getBugsByPageID()
  {
    if (!isset($_GET["page_id"])) {
      return 'missing params: page_id';
    }
    $id = $_GET['page_id'];
    $dev_id = $_GET['dev_id'];

    if (!empty($dev_id)) {
      $res = Db::query("SELECT * FROM qa_bugs WHERE page_id = $id AND dev_id = $dev_id");
    } else {
      $res = Db::query("SELECT * FROM qa_bugs WHERE page_id = $id");
    }
    $res = $this->handleResult($res);
    return $this->response(['code' => 0, 'data' => $res], 'json', 200);
  }

  /**
   * 查询某个用例下的 bug
   */
  public function getBugsByCaseID ()
  {
    if (!isset($_GET["case_id"])) {
      return 'missing params: case_id';
    }
    $id = $_GET['case_id'];
    $res = Db::query("SELECT * FROM qa_bugs WHERE case_id = $id");
    $res = $this->handleResult($res);
    return $this->response(['code' => 0, 'data' => $res], 'json', 200);
  }

  /**
   * 根据类型返回某个项目的 bug
   * type 0 - 待指派 | 1 - 待修复 | 2 - 已修复待验证 | 3 - 已关闭
   * dev_id 如果存在，表示获取属于某个开发的 bug
   */
  public function getBugsByProjectID()
  {
    $pid = $_GET['project_id'];
    $type = $_GET['type'];
    $sql = "SELECT * FROM qa_bugs WHERE project_id = $pid and status = $type";

    if (isset($_GET['dev_id']) && !empty($_GET['dev_id'])) {
      $dev_id = $_GET['dev_id'];
      $sql = $sql . " and dev_id = $dev_id";
    }

    $res = Db::query($sql);
    $res = $this->handleResult($res);
    return $this->response(['code' => 0, 'data' => $res], 'json', 200);
  }

  /**
   * 更新 bug 内容
   */
  public function updateBug ()
  {
    if (!isset($_POST["id"])) {
      return 'missing params: id';
    }
    if (!isset($_POST["content"])) {
      return 'missing params: content';
    }
    $id = $_POST["id"];
    $content = $_POST["content"];

    Db::query("UPDATE qa_bugs SET content = '$content' WHERE id = $id");
    return $this->response(["code" => 0], 'json', 200);
  }

  /**
   * 删除 bug
   */
  public function deleteBug()
  {
    $id = $_GET['id'];
    Db::query("DELETE FROM qa_bugs WHERE id = $id");
    return $this->response(["code" => 0], 'json', 200);
  }

  /**
   * 将 bug 指派给开发
   */
  public function assignBug()
  {
    $id = $_POST['id'];
    $dev_id = $_POST['dev_id'];
    $assigner = $_POST['assigner'];
    $belong_to = $_POST['belong_to'];

    $res = Db::query("SELECT history FROM qa_bugs WHERE id = $id");
    $pre_history = $res[0]['history'];

    $record = date("Y-m-d H:i") . ' ' . $assigner . '指给' . $belong_to;
    $history = $pre_history . '&' . $record;
    Db::query("UPDATE qa_bugs SET dev_id = $dev_id, assigner = '$assigner', belong_to = '$belong_to', history = '$history', status = 1 WHERE id = $id");
    return $this->response(["code" => 0, "record" => $record], 'json', 200);
  }

  /**
   * 开发对 bug 的处理：解决 | 无法解决
   */
  public function handleBug()
  {
    $id = $_POST['id'];
    $reason_type = $_POST['reason_type'];
    $reason = $_POST['reason'];
    $solution = $_POST['solution'];
    $dev_name = $_POST['dev_name'];
    $is_solved = $_POST['is_solved'];
    $text = (int)$is_solved === 0 ? '无法解决' : '已解决';

    $res = Db::query("SELECT history FROM qa_bugs WHERE id = $id");
    $pre_history = $res[0]['history'];

    $record = date("Y-m-d H:i") . ' ' . $dev_name . ':问题' . $text;
    $history = $pre_history . '&' . $record;

    Db::query("UPDATE qa_bugs SET reason_type = $reason_type, is_solved = $is_solved, reason = '$reason', solution = '$solution', history = '$history', status = 2 WHERE id = $id");
    return $this->response(["code" => 0, "record" => $record], 'json', 200);
  }

  /**
   * 将 bug 标记为无效
   */
  public function handleInvalidBug()
  {
    $id = $_POST['id'];
    $reason = $_POST['reason'];
    $dev_name = $_POST['dev_name'];

    $res = Db::query("SELECT history FROM qa_bugs WHERE id = $id");
    $pre_history = $res[0]['history'];

    $record = date("Y-m-d H:i") . ' ' . $dev_name . ':问题无效';
    $history = $pre_history . '&' . $record;

    Db::query("UPDATE qa_bugs SET is_effective = 0, reason = '$reason', history = '$history', status = 2 WHERE id = $id");
    return $this->response(["code" => 0, "record" => $record, 'reason' => $reason], 'json', 200);
  }

  /**
   * 关闭 bug
   */
  public function close()
  {
    $id = $_GET['id'];
    $name = $_GET['who_close'];

    $res = Db::query("SELECT history FROM qa_bugs WHERE id = $id");
    $pre_history = $res[0]['history'];
    $record = date("Y-m-d H:i") . ' 由' . $name . '关闭';
    $history = $pre_history . '&' . $record;

    Db::query("UPDATE qa_bugs SET status = 3, history = '$history' WHERE id = $id");
    return $this->response(["code" => 0, "record" => $record], 'json', 200);
  }

  /**
   * 上传图片
   */
  public function upload()
  {
    $id = (int)$_POST['id'];
    $uploaddir = '/static/uploads/';
    $path = $uploaddir . time() . $_FILES['file']['name'];
    $uploadfile = IMAGE_PATH_PREFIX . $path;
    $max = ini_get('upload_max_filesize');
    $size = $_FILES['file']['size'];

    // 首先校验文件是否已上传
    if ($_FILES['file']['error'] !== UPLOAD_ERR_OK) {
      return $this->response(['code' => 1, 'info' => '文件过大，不可超过' . $max], 'json', 200);
    }

    // 然后将文件移动到目标地址，同时将路径存入表中
    if (move_uploaded_file($_FILES['file']['tmp_name'], $uploadfile)) {
      $res = Db::query("SELECT imgs FROM qa_bugs WHERE id = $id");
      if (empty($res[0]['imgs'])) {
        $array = [];
      } else {
        $array = explode(',', $res[0]['imgs']);
      }
      array_push($array, $path);
      $str = implode(',', $array);
      Db::query("UPDATE qa_bugs SET imgs = '$str' WHERE id = $id");
      return $this->response(['code' => 0, 'imgs' => $array], 'json', 200);
    }
  }

  /**
   * 删除图片
   */
  public function deleteImg()
  {
    $index = $_POST['index'];
    $id = $_POST['bug_id'];

    $res = Db::query("SELECT imgs FROM qa_bugs WHERE id = $id");
    $array = explode(',', $res[0]['imgs']);
    $target = array_splice($array, $index, 1);
    $str = implode(',', $array);
    unlink(IMAGE_PATH_PREFIX . $target[0]);
    Db::query("UPDATE qa_bugs SET imgs = '$str' WHERE id = $id");
    return $this->response(['code' => 0], 'json', 200);
  }


}