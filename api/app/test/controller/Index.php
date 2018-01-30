<?php
namespace app\test\controller;

class Index {
	public function index () {
		$arr = ['1', '2'];
		var_dump(in_array(1, $arr));
	}
}