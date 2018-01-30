<?php
namespace app\projects\controller;

use think\Db;
use think\controller\Rest;

class Stats extends Rest
{
  public function index()
  {
    $id = $_GET['id'];
    $pages = Db::query("SELECT id, page_name FROM qa_pages WHERE project_id = $id");
    $cases = Db::query("SELECT id, page_id, type FROM qa_cases WHERE project_id = $id");
    $bugs = Db::query("SELECT case_id, page_id, is_solved, is_effective FROM qa_bugs WHERE project_id = $id AND status = 3");

    $total_cases = count($cases);
    $total_bugs = count($bugs);
    $total_p1_cases = 0;
    $total_invalid_bugs = 0;
    $total_bug_cases = 0;
    $total_bug_p1_cases = 0;
    $total_solved_bugs = 0;

    // 标记 case 的 bug 数
    foreach ($cases as &$value) {
      $id = $value['id'];
      $bug_amount = 0;
      $invalid_bug_amount = 0;
      $solved_bugs = 0;
      $type = $value['type'];

      if ($type === 1) {
        $total_p1_cases += 1;
      }

      for ($i = 0; $i < count($bugs); $i++) { 
        if ($bugs[$i]['case_id'] === $id) {
          $bug_amount += 1;
          if ($bugs[$i]['is_effective'] === 0) {
            $invalid_bug_amount += 1;
            $total_invalid_bugs += 1;
            if ($bugs[$i]['is_solved'] === 1) {
              $total_solved_bugs += 1;
              $solved_bugs += 1;
            }
          }
        }
      }

      if ($bug_amount > 0) {
        $total_bug_cases += 1;
        if ($type === 1) {
          $total_bug_p1_cases += 1;
        }
      }

      $value['bugs'] = $bug_amount;
      $value['solved_bugs'] = $solved_bugs;
      $value['invalid_bugs'] = $invalid_bug_amount;
    }

    // 标记每一个页面的 case
    foreach ($pages as &$value) {
      $id = $value['id'];
      $case_amount = 0;
      $p1_case_amount = 0;
      $bug_amount = 0;
      $invalid_bug_amount = 0;
      $bug_cases = 0;
      $bug_p1_cases = 0;
      $solved_bugs = 0;

      for ($i = 0; $i < count($cases); $i++) { 
        if ($cases[$i]['page_id'] === $id) {
          $case_amount += 1;
          $bug_amount += $cases[$i]['bugs'];
          $solved_bugs += $cases[$i]['solved_bugs'];
          $invalid_bug_amount += $cases[$i]['invalid_bugs'];

          if ($cases[$i]['type'] === 1) {
            $p1_case_amount += 1;
          }
          // 包含有效 bug 的用例
          if ($cases[$i]['bugs'] - $cases[$i]['invalid_bugs'] > 0) {
            $bug_cases += 1;
            if ($cases[$i]['type'] === 1) {
              $bug_p1_cases += 1;
            }
          }
        }
      }

      $value['cases'] = $case_amount;
      $value['p1_cases'] = $p1_case_amount;
      $value['bugs'] = $bug_amount;
      $value['invalid_bugs'] = $invalid_bug_amount;
      $value['bug_cases'] = $bug_cases;
      $value['bug_p1_cases'] = $bug_p1_cases;
      $value['solved_bugs'] = $solved_bugs;
    }

    return $this->response([
      'code' => 0, 
      'data' => $pages, 
      'total' => [
        'cases' => $total_cases,
        'bugs' => $total_bugs,
        'p1_cases' => $total_p1_cases,
        'invalid_bugs' => $total_invalid_bugs,
        'bug_cases' => $total_bug_cases,
        'bug_p1_cases' => $total_bug_p1_cases,
        'solved_bugs' => $total_solved_bugs
      ]], 
      'json', 200);
  }
}