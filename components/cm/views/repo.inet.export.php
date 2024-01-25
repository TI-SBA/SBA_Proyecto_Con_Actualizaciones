<?php
global $f;
date_default_timezone_set('America/Lima');
$f->library('excel');

$objReader = PHPExcel_IOFactory::createReader('Excel2007');
$objPHPExcel = $objReader->load(IndexPath.DS.'templates/cm/relc.xlsx');
//echo date('H:i:s') , " Add new data to the template" , EOL;
$data = $items;
$baseRow = 9;
$index=0;
$meses = array("Todos","Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Setiembre","Octubre","Noviembre","Diciembre");
$objPHPExcel->getActiveSheet()->setCellValue('A1', "INVENTARIO-ESTADO DE TRÁMITES MAUSOLEOS EN EL MES DE ".strtoupper($meses[$f->request->mes])." ".$f->request->ano);
//$objPHPExcel->getActiveSheet()->setCellValue('I5',"MES DE LA MODIFICACIÓN: ".strtoupper($meses[$filtros["mes_modif"]])." - ".$filtros["ano"] );
foreach($data as $r => $item) {
	$row = $baseRow + $r;
	$objPHPExcel->getActiveSheet()->insertNewRowBefore($row,1);
	$objPHPExcel->getActiveSheet()->setCellValue('A'.$row, Date::format($item[0]->sec, "d/m/Y"))
	                              ->setCellValue('B'.$row, $item[1])
	                              ->setCellValue('C'.$row, $item[2])
								  ->setCellValue('D'.$row, $item[3])
								  ->setCellValue('E'.$row, $item[4])
								  ->setCellValue('F'.$row, $item[5])
								  ->setCellValue('G'.$row, $item[6])
								  ->setCellValue('H'.$row, $item[7])
								  ->setCellValue('I'.$row, $item[8])
								  ->setCellValue('I'.$row, $item[9])
								  ->setCellValue('I'.$row, $item[10]);	                              
	$r++;
}
$objPHPExcel->getActiveSheet()->removeRow($baseRow-1,1);
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment;filename="reporte-credito-suplementario.xlsx"');
header('Cache-Control: max-age=0');
$objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel2007'); 
$objWriter->save('php://output'); 
?>