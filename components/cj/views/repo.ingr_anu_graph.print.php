<?php
global $f;
$f->library("graphics");
$graph = new Graph(1300,700,'auto');
$graph->graph_theme = null;
$graph->SetScale("textlin");
$graph->SetShadow();
$graph->xaxis->SetTickLabels($meses);
$b1plot = new BarPlot($cant_s);
$b1plot->value->Show();
$b1plot->SetLegend("Soles");
$b2plot = new BarPlot($cant_d);
$b2plot->value->Show();
$b2plot->SetLegend("Dolares");
$gbplot = new GroupBarPlot(array($b1plot,$b2plot));
$graph->Add($gbplot);
$b1plot->SetColor("white");
$b1plot->SetFillColor("#cc1111");
$b2plot->SetColor("white");
$b2plot->SetFillColor("#11cccc");
$graph->title->Set("INGRESOS ".$ano);
$graph->title->SetFont(FF_VERDANA,FS_BOLD,12);
$graph->Stroke(_IMG_HANDLER);
$graph->img->Stream(IndexPath."/temp/cjg1.png");	
$f->library('pdf');
$pdf=new FPDF('L','mm','A4');
$pdf->AddPage();
$pdf->SetFont('Arial','',15);
$pdf->SetXY(40,10);
$pdf->Cell(10,0);
$pdf->Write(5,$title1);
$pdf->SetXY(0,25);
$pdf->Image('temp/cjg1.png' , 10 ,15, 280 , 170,'PNG');
$pdf->Output();