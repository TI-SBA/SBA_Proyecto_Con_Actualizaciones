<?php
class Controller_ag_guia extends Controller {
	function execute_anular_legacy(){
		global $f;
		$data = $f->model('ag/guia')->params(array('_id'=>new MongoId($f->request->data['_id'])))->get('one')->items;
		$fecreg = new MongoDate();
		if($data['estado']=='A'){
			$f->model('ag/guia')->params(array('_id'=>new MongoId($f->request->data['_id']),'data'=>array('estado'=>'X')))->save('update')->items;
			foreach ($data['items'] as $i=>$item) {
				$producto_get = $f->model('lg/prod')->params(array('_id'=>$item['producto']['_id']))->get('one')->items;
				if($data['almacen_origen']!=null){
					$stock = $f->model("lg/stck")->params(array("filter"=>array("almacen"=>$data["almacen_origen"]["_id"],"producto"=>$item['producto']['_id'])))->get('one_custom')->items;
					if($stock==null){
						$stock = array(
							'_id'=>new MongoId(),
							'producto'=>$item['producto']['_id'],
							'almacen'=>$data["almacen_origen"]["_id"],
							'stock'=>0,
							'costo'=>0
						);
						$f->model('lg/stck')->params(array('data'=>$stock))->save('insert');
					}
					$saldo = $f->model("lg/movi")->params(array('filter'=>array('stock'=>$stock['_id']),'sort'=>array('fecreg'=>-1)))->get('custom')->items;

					$saldo_cant = 0;
					$saldo_monto = 0;
					if($saldo!=null){
						if(count($saldo)>0){
							$saldo_cant = $saldo[0]['saldo_cant'];
							$saldo_monto = $saldo[0]['saldo_monto'];
						}
					}

					$stock_actual = floatval($saldo_cant);

					/************************************************
					* REGISTRAR EL MOVIMIENTO -> KARDEX
					**************************************************/
					$mov = array(
						'fecreg'=>$fecreg,
						'documento'=>array(
							'_id'=>$data['_id'],
							'cod'=>$data['num'],
							'tipo'=>'GR'
						),
						'glosa'=>'INGRESO DE PRODUCTOS POR ANULACION DE GUIA GUIA '.$data['num'],
						//'tipo'=>'E',
						'almacen'=>$data['almacen_origen'],
						'stock'=>$stock['_id'],
						'cant'=>floatval($item['cant']),
						'entrada_cant'=>floatval($item['cant']),
						'entrada_monto'=>floatval(0),
						'salida_cant'=>0,
						'salida_monto'=>0,
						'precio_unitario'=>floatval(0),
						'saldo_cant'=>$stock_actual+floatval($item['cant']),
						'saldo_monto'=>0,
						'periodo'=>date("Y-m",$fecreg->sec)
						//'total'=>floatval($prod['subtotal'])
					);
					$mov['saldo_cant'] = $saldo_cant+$mov['entrada_cant'];
					$mov['saldo_monto'] = $saldo_monto+$mov['entrada_monto'];
					$f->model("lg/movi")->params(array('data'=>$mov))->save("insert");
					$f->model("lg/stck")->params(array(
						'_id'=>$stock['_id'],
						'data'=>array(
							'stock'=>floatval($mov['saldo_cant'])
						)
					))->save("update");
				}
				if($data['almacen_destino']!=null){
					$stock = $f->model("lg/stck")->params(array("filter"=>array("almacen"=>$data["almacen_destino"]["_id"],"producto"=>$item['producto']['_id'])))->get('one_custom')->items;
					if($stock==null){
						$stock = array(
							'_id'=>new MongoId(),
							'producto'=>$item['producto']['_id'],
							'almacen'=>$data["almacen_destino"]["_id"],
							'stock'=>0,
							'costo'=>0
						);
						$f->model('lg/stck')->params(array('data'=>$stock))->save('insert');
					}
					$saldo = $f->model("lg/movi")->params(array('filter'=>array('stock'=>$stock['_id']),'sort'=>array('fecreg'=>-1)))->get('custom')->items;

					$saldo_cant = 0;
					$saldo_monto = 0;
					if($saldo!=null){
						if(count($saldo)>0){
							$saldo_cant = $saldo[0]['saldo_cant'];
							$saldo_monto = $saldo[0]['saldo_monto'];
						}
					}

					$stock_actual = floatval($saldo_cant);

					/************************************************
					* REGISTRAR EL MOVIMIENTO -> KARDEX
					**************************************************/
					$mov = array(
						'fecreg'=>$fecreg,
						'documento'=>array(
							'_id'=>$data['_id'],
							'cod'=>$data['num'],
							'tipo'=>'GR'
						),
						'glosa'=>'SALIDA DE PRODUCTOS POR ANULACION DE GUIA '.$data['num'],
						//'tipo'=>'E',
						'almacen'=>$data['almacen_destino'],
						'stock'=>$stock['_id'],
						'cant'=>floatval($item['cant']),
						'entrada_cant'=>0,
						'entrada_monto'=>floatval(0),
						'salida_cant'=>floatval($item['cant']),
						'salida_monto'=>0,
						'precio_unitario'=>floatval(0),
						'saldo_cant'=>$stock_actual-floatval($item['cant']),
						'saldo_monto'=>0,
						'periodo'=>date("Y-m",$fecreg->sec)
						//'total'=>floatval($prod['subtotal'])
					);
					$mov['saldo_cant'] = $saldo_cant-$mov['salida_cant'];
					$mov['saldo_monto'] = $saldo_monto-$mov['salida_monto'];
					$f->model("lg/movi")->params(array('data'=>$mov))->save("insert");
					$f->model("lg/stck")->params(array(
						'_id'=>$stock['_id'],
						'data'=>array(
							'stock'=>floatval($mov['saldo_cant'])
						)
					))->save("update");
				}
			}
			$f->model('ac/log')->params(array(
				'modulo'=>'AG',
				'bandeja'=>'Inventario',
				'descr'=>'Se ingreso un Lote segun Guia de Remision <b>'.$data['num'].'</b>.'
			))->save('insert');
		}
		$f->response->json(true);
	}
	function execute_lista(){
		global $f;
		$params = array("page"=>$f->request->data['page'],"page_rows"=>$f->request->data['page_rows']);
		if(isset($f->request->data['texto']))
			if($f->request->data['texto']!='')
				$params['texto'] = $f->request->data['texto'];
		if(isset($f->request->data['sort']))
			$params['sort'] = array($f->request->data['sort']=>floatval($f->request->data['sort_i']));
		$f->response->json( $f->model("ag/guia")->params($params)->get("lista") );
	}
	function execute_anular(){
		global $f;
		$data = $f->model('ag/guia')->params(array('_id'=>new MongoId($f->request->data['_id'])))->get('one')->items;
		$fecreg = new MongoDate();
		if($data['estado']=='A'){
			$f->model('ag/guia')->params(array('_id'=>new MongoId($f->request->data['_id']),'data'=>array('estado'=>'X')))->save('update')->items;
			foreach ($data['items'] as $i=>$item) {
				$producto_get = $f->model('lg/prod')->params(array('_id'=>$item['producto']['_id']))->get('one')->items;
				if($data['almacen_origen']!=null){
					$stock = $f->model("lg/stck")->params(array("filter"=>array("almacen"=>$data["almacen_origen"]["_id"],"producto"=>$item['producto']['_id'])))->get('one_custom')->items;
					if($stock==null){
						$stock = array(
							'_id'=>new MongoId(),
							'producto'=>$item['producto']['_id'],
							'almacen'=>$data["almacen_origen"]["_id"],
							'stock'=>0,
							'costo'=>0
						);
						$f->model('lg/stck')->params(array('data'=>$stock))->save('insert');
					}
					$saldo = $f->model("lg/movi")->params(array('filter'=>array('stock'=>$stock['_id']),'sort'=>array('fecreg'=>-1)))->get('custom')->items;

					$saldo_cant = 0;
					$saldo_monto = 0;
					if($saldo!=null){
						if(count($saldo)>0){
							$saldo_cant = $saldo[0]['saldo_cant'];
							$saldo_monto = $saldo[0]['saldo_monto'];
						}
					}

					$stock_actual = floatval($saldo_cant);

					/************************************************
					* REGISTRAR EL MOVIMIENTO -> KARDEX
					**************************************************/
					/*
						$mov = array(
							'fecreg'=>$fecreg,
							'documento'=>array(
								'_id'=>$data['_id'],
								'cod'=>$data['num'],
								'tipo'=>'GR'
							),
							'glosa'=>'INGRESO DE PRODUCTOS POR ANULACION DE GUIA GUIA '.$data['num'],
							//'tipo'=>'E',
							'almacen'=>$data['almacen_origen'],
							'stock'=>$stock['_id'],
							'cant'=>floatval($item['cant']),
							'entrada_cant'=>floatval($item['cant']),
							'entrada_monto'=>floatval(0),
							'salida_cant'=>0,
							'salida_monto'=>0,
							'precio_unitario'=>floatval(0),
							'saldo_cant'=>$stock_actual+floatval($item['cant']),
							'saldo_monto'=>0,
							'periodo'=>date("Y-m",$fecreg->sec)
							//'total'=>floatval($prod['subtotal'])
						);
					*/
					/************************************************************
					* REGISTRAR EL MOVIMIENTO DE SALIDA-> KARDEX				*
					************************************************************/
					/*COMO FUNCIONA LOS MOVIMIENTOS*/
					//ENTRADA FISICO O SALIDA FISICO = cant
					//ENTRADA VALORADO O SALIDA VALORADO = total
					//PRECIO UNITARIO O COSTO PROMEDIO = precio_unitario
					//SALDO FISICO = saldo
					//SALDO VALORADO = saldo_imp
					$mov = array(
						'glosa'=>'INGRESO DE PRODUCTOS POR ANULACION DE GUIA GUIA '.$data['num'],
					 	'documento'=>array(
							'_id'=>$data['_id'],
							'cod'=>$data['num'],
							'tipo'=>'GR'
						),
					    'producto'=>array(
					        "_id"=>$producto_get['_id'],
					        "cod"=>$producto_get['cod'],
					        "nomb"=>$producto_get['nomb']
					    ),
					    'organizacion'=>array(
					        '_id'=>new MongoId('57b3250f8e73583808000038'),
					        'nomb'=>utf8_encode('Actividades comerciales DGRE')   
					 	),
					    'clasif'=>array(
					        "_id" => new MongoId("51f281b04d4a13c4040000a9"),
					        "cod" => "2.3.1.8.1.99",
					        "nomb" => "OTROS PRODUCTOS SIMILARES",
					    ),
					    'cuenta'=>array(
					        "_id" => new MongoId("51a8ff654d4a13540a0000b7"),
					        "cod" => "1201.0301",
					        "nomb" => "Venta de Bienes",
					    ),
					    'stock'=>$stock['_id'],
					    //'lote'=>$lote['_id'],
					    'tipo'=>'E',
					    'estado'=>'H',
					    "almacen"=>$data['almacen_origen'],
					    'autor'=>$f->session->userDBMin,
					    'trabajador'=>$f->session->userDBMin,
					    'fecreg'=>$data['fecreg'],
					    'fecmod'=>$data['fecreg'],
					    'guia'=>$data['_id'],
					    'fec'=>$data['fecreg'],
					    //COSTO PROMEDIO
					    'precio_unitario'=>floatval($precio_unitario),
					    //SALIDA FISICA
					    'cant'=>floatval($item['cant']),
					    //SALDO FISICO
					    'saldo'=>$stock_actual+floatval($item['cant']),
					    //SALIDA VALORADA
						'total'=>floatval($item['cant'])*floatval($precio_unitario),
					    //SALDO VALORADO
					    'saldo_imp'=>$saldo_monto+floatval($item['cant'])*floatval($precio_unitario),
					);
					$mov['saldo_cant'] = $saldo_cant+$mov['entrada_cant'];
					$mov['saldo_monto'] = $saldo_monto+$mov['entrada_monto'];
					$f->model("lg/movi")->params(array('data'=>$mov))->save("insert");
					$f->model("lg/stck")->params(array(
						'_id'=>$stock['_id'],
						'data'=>array(
							'stock'=>floatval($mov['saldo_cant'])
						)
					))->save("update");
				}
				if($data['almacen_destino']!=null){
					$stock = $f->model("lg/stck")->params(array("filter"=>array("almacen"=>$data["almacen_destino"]["_id"],"producto"=>$item['producto']['_id'])))->get('one_custom')->items;
					if($stock==null){
						$stock = array(
							'_id'=>new MongoId(),
							'producto'=>$item['producto']['_id'],
							'almacen'=>$data["almacen_destino"]["_id"],
							'stock'=>0,
							'costo'=>0
						);
						$f->model('lg/stck')->params(array('data'=>$stock))->save('insert');
					}
					$saldo = $f->model("lg/movi")->params(array('filter'=>array('stock'=>$stock['_id']),'sort'=>array('fecreg'=>-1)))->get('custom')->items;

					$saldo_cant = 0;
					$saldo_monto = 0;
					if($saldo!=null){
						if(count($saldo)>0){
							$saldo_cant = $saldo[0]['saldo_cant'];
							$saldo_monto = $saldo[0]['saldo_monto'];
						}
					}

					$stock_actual = floatval($saldo_cant);

					/************************************************
					* REGISTRAR EL MOVIMIENTO -> KARDEX
					**************************************************/
					/*
						$mov = array(
							'fecreg'=>$fecreg,
							'documento'=>array(
								'_id'=>$data['_id'],
								'cod'=>$data['num'],
								'tipo'=>'GR'
							),
							'glosa'=>'SALIDA DE PRODUCTOS POR ANULACION DE GUIA '.$data['num'],
							//'tipo'=>'E',
							'almacen'=>$data['almacen_destino'],
							'stock'=>$stock['_id'],
							'cant'=>floatval($item['cant']),
							'entrada_cant'=>0,
							'entrada_monto'=>floatval(0),
							'salida_cant'=>floatval($item['cant']),
							'salida_monto'=>0,
							'precio_unitario'=>floatval(0),
							'saldo_cant'=>$stock_actual-floatval($item['cant']),
							'saldo_monto'=>0,
							'periodo'=>date("Y-m",$fecreg->sec)
							//'total'=>floatval($prod['subtotal'])
						);
					*/
					/************************************************************
					* REGISTRAR EL MOVIMIENTO DE SALIDA-> KARDEX				*
					************************************************************/
					/*COMO FUNCIONA LOS MOVIMIENTOS*/
					//ENTRADA FISICO O SALIDA FISICO = cant
					//ENTRADA VALORADO O SALIDA VALORADO = total
					//PRECIO UNITARIO O COSTO PROMEDIO = precio_unitario
					//SALDO FISICO = saldo
					//SALDO VALORADO = saldo_imp
					$mov = array(
						'glosa'=>'SALIDA DE PRODUCTOS POR ANULACION DE GUIA '.$data['num'],
					 	'documento'=>array(
							'_id'=>$data['_id'],
							'cod'=>$data['num'],
							'tipo'=>'GR'
						),
					    'producto'=>array(
					        "_id"=>$producto_get['_id'],
					        "cod"=>$producto_get['cod'],
					        "nomb"=>$producto_get['nomb']
					    ),
					    'organizacion'=>array(
					        '_id'=>new MongoId('57b3250f8e73583808000038'),
					        'nomb'=>utf8_encode('Actividades comerciales DGRE')   
					 	),
					    'clasif'=>array(
					        "_id" => new MongoId("51f281b04d4a13c4040000a9"),
					        "cod" => "2.3.1.8.1.99",
					        "nomb" => "OTROS PRODUCTOS SIMILARES",
					    ),
					    'cuenta'=>array(
					        "_id" => new MongoId("51a8ff654d4a13540a0000b7"),
					        "cod" => "1201.0301",
					        "nomb" => "Venta de Bienes",
					    ),
					    'stock'=>$stock['_id'],
					    //'lote'=>$lote['_id'],
					    'tipo'=>'S',
					    'estado'=>'H',
					    "almacen"=>$data['almacen_origen'],
					    'autor'=>$f->session->userDBMin,
					    'trabajador'=>$f->session->userDBMin,
					    'fecreg'=>$data['fecreg'],
					    'fecmod'=>$data['fecreg'],
					    'guia'=>$data['_id'],
					    'fec'=>$data['fecreg'],
					    //COSTO PROMEDIO
					    'precio_unitario'=>floatval($precio_unitario),
					    //SALIDA FISICA
					    'cant'=>floatval($item['cant']),
					    //SALDO FISICO
					    'saldo'=>$stock_actual+floatval($item['cant']),
					    //SALIDA VALORADA
						'total'=>floatval($item['cant'])*floatval($precio_unitario),
					    //SALDO VALORADO
					    'saldo_imp'=>$saldo_monto+floatval($item['cant'])*floatval($precio_unitario),
					);
					$mov['saldo_cant'] = $saldo_cant-$mov['salida_cant'];
					$mov['saldo_monto'] = $saldo_monto-$mov['salida_monto'];
					$f->model("lg/movi")->params(array('data'=>$mov))->save("insert");
					$f->model("lg/stck")->params(array(
						'_id'=>$stock['_id'],
						'data'=>array(
							'stock'=>floatval($mov['saldo_cant'])
						)
					))->save("update");
				}
			}
			$f->model('ac/log')->params(array(
				'modulo'=>'AG',
				'bandeja'=>'Inventario',
				'descr'=>'Se ingreso un Lote segun Guia de Remision <b>'.$data['num'].'</b>.'
			))->save('insert');
		}
		$f->response->json(true);
	}
	function execute_get(){
		global $f;
		$items = $f->model("ag/guia")->params(array("_id"=>new MongoId($f->request->data['_id'])))->get("one")->items;
		$f->response->json( $items );
	}
	function execute_details(){
		global $f;
		$f->response->view("ag/guia.details");
	}
}
?>