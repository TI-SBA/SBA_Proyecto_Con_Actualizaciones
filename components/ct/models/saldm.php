<?php
class Model_ct_saldm extends Model {
	private $col;
	public $items;
	
	public function __construct() {
		global $f;
		$this->col = $f->datastore->ct_saldos_movimientos;
	}
	protected function get_one(){
		global $f;
		$this->items = $this->col->findOne(array('_id'=>$this->params['_id']));
	}
	protected function get_filter_one(){
		global $f;
		if(isset($this->params['fields'])) $fields = $this->params['fields'];
		else $fields = array();
		if(isset($this->params['filter'])) $filter = $this->params['filter'];
		else $filter = array();
		$filter = array(
			'periodo.ano' => $this->params['ano'],
			'periodo.mes'=> $this->params['mes']
		);
		$this->items = $this->col->findOne($filter);
	}
	protected function get_ultimo(){
		global $f;	
		$data = $this->col->find(array(
						"periodo.ano"=>date("Y")
		))->sort(array("periodo.mes"=>-1))->limit(1);		
		if($data==null){//no hay saldos en este año
			$this->items = "reinicio";
		}else{
			//$this->items = $data;
			foreach ($data as $ob) {
			    $this->items = $ob;
			}
		}
	}
	protected function get_lista(){
		global $f;
		$filter = array();
		$fields = array();
		$order = array('rubro'=>1);
		$data = $this->col->find($filter,$fields)->sort($order);
		foreach ($data as $obj) {
		    $this->items[] = $obj;
		}
	}
	protected function get_search(){
		global $f;
		if($this->params["texto"]!=''){
			$f->library('helpers');
			$helper=new helper();
			$parametro = $this->params["texto"];
			$criteria = $helper->paramsSearch($this->params["texto"], array('nomb','cod'));
		}else $criteria = array();
		$fields = array();
		$cursor = $this->col->find($criteria,$fields)->sort( array('nomb'=>1) )->skip( $this->params["page_rows"] * ($this->params["page"]-1) )->limit( $this->params["page_rows"] );
		foreach ($cursor as $obj) {
			$this->items[] = $obj;
		}
		$this->paging($this->params["page"],$this->params["page_rows"],$cursor->count());
	}
	protected function get_all(){
		global $f;
		if(isset($this->params['fields'])) $fields = $this->params['fields'];
		else $fields = array();
		if(isset($this->params['filter'])) $filter = $this->params['filter'];
		else $filter = array();
		$data = $this->col->find($filter,$fields);
		foreach ($data as $ob) {
		    $this->items[] = $ob;
		}
	}
	protected function save_insert(){
		global $f;
		$this->col->insert( $this->params['data'] );
	}
	protected function save_update(){
		global $f;
		unset($this->params['data']['_id']);
		$this->col->update( array('_id'=>$this->params['_id']) , array('$set'=>$this->params['data']) );
	}
	protected function delete_fuen(){
		global $f;
		$this->items = array(
		    '_id' => new MongoId($f->request->id),
		);
		$this->col->remove($this->items);
	}
}
?>