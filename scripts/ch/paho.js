chPaho = {
	states: {
		H: {
			descr: "Hospitalizado",
			color: "green",
			label: '<span class="label label-success">Hospitalizado</span>'
		},
		A:{
			descr: "Alta",
			color: "#FC0303",
			label: '<span class="label label-default">Alta</span>'
		}
	},
	tipos: {
		"":"S/E",
		"C":"Completa",
		"P":"Parcial"
	},
	sala: {
		"V":"VARONES",
		"M":"MUJERES"
	},
	modulo: {
		"MH":"Salud Mental",
		"AD":"Adicciones"
	},
	Categoria: {
		"8":"INDIGENTE",
		"10":"NUEVO",
		"11":"CONTINUADOR"
	},
	init: function(){
		K.initMode({
			mode: 'ch',
			action: 'chPaho',
			titleBar: {
				title: 'Pacientes Hospitalizados Salud Mental'
			}
		});
		new K.Panel({
			onContentLoaded: function(){
		   		var $grid = new K.grid({
					cols: ['','Modulo','Estado','Historia Clinica','Paciente','Pabellon','Sala','Categoria','Ultima Modificacion'],
					data: 'ch/paho/lista',
					params: {modulo:'CH'},
					itemdescr: 'tipo(s)',
					toolbarHTML: '<button name="btnAgregar" class="btn btn-success"><i class="fa fa-plus"></i> Agregar</button>',
					onContentLoaded: function($el){
						$el.find('[name=btnAgregar]').click(function(){
							chPaho.windowNew();
						});
						$el.find('[name=estado]').change(function(){
							var estado = $el.find('[name=estado] option:selected').val();
							$grid.reinit({params: {estado: estado}});
						});
					},
					onLoading: function(){ K.block(); },
					onComplete: function(){ $('#mainPanel .fuelux').height(parseFloat($('#mainPanel .fuelux').height())+240+'px');
					 K.unblock(); },
					fill: function(data,$row){
						$row.append('<td>');
						$row.append('<td>'+data.modulo+'</td>');
						$row.append('<td>'+chPaho.states[data.estado].label+'</td>');
						$row.append('<td>'+data.hist_cli+'</td>');
						$row.append('<td>'+mgEnti.formatName(data.paciente)+'</td>');
						$row.append('<td>'+data.pabellon+'</td>');
						$row.append('<td>'+chPaho.sala[data.sala]+'</td>');
						$row.append('<td>'+chPaho.Categoria[data.cate]+'</td>');
						$row.append('<td><kbd>'+ciHelper.date.format.bd_ymdhi(data.fecmod)+'</kbd><br />'+mgEnti.formatName(data.modificado)+'</td>');
						$row.data('id',data._id.$id).data('data',data).dblclick(function(){
							K.WindowPrint({
								id:'windowPrint',
								title:"Informe ",
								url:"ch/paho/if_fron?_id="+$(this).data('id')
							});
						}).data('estado',data.estado).contextMenu("conMenCon_Paciente", {
							onShowMenu: function($row, menu) {
								$('#conMenListEd_ver',menu).remove();
								if($row.data('estado')=='H') $('#conMenListEd_hab',menu).remove();
								else $('#conMenListEd_edi,#conMenListEd_des',menu).remove();
								return menu;
							},
							bindings: {
								'conMenCon_Paciente_info': function(t) {
									chPaho.windowDetails({id: K.tmp.data('id'),nom: K.tmp.find('td:eq(2)').html()});
								},
				 				'conMenCon_Paciente_edi': function(t) {
									chPaho.Mover({id: K.tmp.data('id'),nom: K.tmp.find('td:eq(2)').html()});
								},
								'conMenCon_Paciente_alta': function(t) {
									chPaho.Alta({id: K.tmp.data('id'),nomb: K.tmp.find('td:eq(2)').html()});
								},
								'conMenCon_Paciente_eli': function(t) {
									ciHelper.confirm('&#191;Desea <b>Eliminar</b> la Hospitalizacion:  <b>'+K.tmp.find('td:eq(2)').html()+'</b>&#63;',
									function(){
										K.sendingInfo();
										$.post('ch/paho/delete',{_id: K.tmp.data('id')},function(){
											K.clearNoti();
											K.notification({title: 'Hospitalizacion Eliminada',text: 'La eliminaci&oacute;n se realiz&oacute; con &eacute;xito!'});
											chPaho.init();
										});
									},function(){
										$.noop();
									},'Eliminaci&oacute;n de Hospitalizacion');
								},
								'conMenFhospica_info':function(t){
									K.windowPrint({
										id:'windowPrint',
										title:"Hospitalizacion",
										url:"ch/paho/print?_id="+K.tmp.data('id')
									});
								},'conMenCon_Paciente_info':function(t){
									K.windowPrint({
										id:'windowPrint',
										title:"Hospitalizacion",
										url:"ch/paho/print?_id="+K.tmp.data('id')
									});
								},
							}
						});
						return $row;
					}
				});
			}
		});
	},
	windowNew: function(p){
		if(p==null) p={};
		chHospi.windowSelect({callback: function(paciente){
			new K.Panel({
				title: 'Nuevo Internamiento',
				contentURL: 'ch/paho/edit',
				store:false,
				buttons: {
					"Guardar": {
						icon: 'fa-save',
						type: 'success',
						f: function(){
							K.clearNoti();
							var form = ciHelper.validator(p.$w.find('form'),{
								onSuccess: function(){
									K.sendingInfo();
									var data = {
										estado: 'H',
										modulo:p.$w.find('[name=modulo]').text(),
										paciente: mgEnti.dbRel(p.$w.find('[name=paciente] [name=mini_enti]').data('data')),
										hist_cli:p.$w.find('[name=hist_cli]').text(),
										cie10:p.$w.find('[name=cie10]').text(),
										diag:p.$w.find('[name=diag]').text(),
										cate:p.$w.find('[name=cate]').text(),
										tipo_hosp:p.$w.find('[name=tipo_hosp]').text(),
										monto:p.$w.find('[name=monto]').text(),
										pabellon:p.$w.find('[name=pabellon]').val(),
										fec_inicio:p.$w.find('[name=fec_inicio]').val(),
										fec_fin:p.$w.find('[name=fec_fin]').val(),
										sala:p.$w.find('[name=sala]').val(),
										pendiente:p.$w.find('[name=pendiente]').val(),
										total:p.$w.find('[name=total]').val(),
										deuda:p.$w.find('[name=deuda]').val(),

										



									};

									
									p.$w.find('#div_buttons button').attr('disabled','disabled');
									$.post("ch/paho/save",data,function(result){
										if(result.error!=null){
											K.clearNoti();
											K.msg({title: ciHelper.titles.infoReq,text: "Debe existir una ficha social antes!",type: 'error'});
										}else{
											K.clearNoti();
											K.msg({title: ciHelper.titles.regiGua,text: "Hospitalizacion Agregada!"});
											chPaho.init();
										}
									},'json');
								}
							}).submit();
						}
					},
					"Cancelar": {
						incon: 'fa-ban',
						type: 'danger',
						f: function(){
							chPaho.init();
						}
					}
				},
				onContentLoaded: function(){
					p.$w = $('#mainPanel');
						p.$w.find("[name=fec_inicio]").datepicker({
		   				format: 'mm/dd/yyyy',
		    			startDate: '-3d'
						});
						p.$w.find("[name=fec_fin]").datepicker({
			   				format: 'mm/dd/yyyy',
			    			startDate: '-3d'
							});
						p.$w.find("[name=fec_tras]").datepicker({
			   				format: 'mm/dd/yyyy',
			    			startDate: '-3d'
							});
						p.$w.find("[name=fec_alta]").datepicker({
			   				format: 'mm/dd/yyyy',
			    			startDate: '-3d'
							});
					mgEnti.fillMini(p.$w.find('[name=paciente] [name=mini_enti]'),paciente.paciente);
					p.$w.find('[name=hist_cli]').html(paciente.hist_cli).data('data',paciente);
					p.$w.find('[name=modulo]').html(paciente.modulo).data('data',paciente);
					p.$w.find('[name=cie10]').html(paciente.cie10).data('data',paciente);
					p.$w.find('[name=diag]').html(paciente.diag).data('data',paciente);
					p.$w.find('[name=cate]').html(paciente.categoria).data('data',paciente);
					p.$w.find('[name=tipo_hosp]').html(paciente.tipo_hosp).data('data',paciente);
					p.$w.find('[name=monto]').html(paciente.importe).data('data',paciente);

					
				}
			});
		}})
	},
	Mover: function(p){
		new K.Panel({
			title: 'Movimiento de Pabellon',
			contentURL: 'ch/paho/move',
			store: false,
			buttons: {
					"Guardar": {
						icon: 'fa-save',
						type: 'success',
						f: function(){
							K.clearNoti();
							var data = {
								_id: p.id,
								paciente: mgEnti.dbRel(p.$w.find('[name=paciente] [name=mini_enti]').data('data')),
								hist_cli:p.$w.find('[name=hist_cli]').text(),
								pabellon:p.$w.find('[name=pabellon]').val(),
								fec_tras:p.$w.find('[name=fec_tras]').val(),
									
							};	
							K.sendingInfo();
							p.$w.find('#div_buttons button').attr('disabled','disabled');
							$.post("ch/paho/save",data,function(result){
								K.clearNoti();
								K.msg({title: ciHelper.titles.regiAct,text: "Pabellon Cambiando!"});
								chPaho.init();
							},'json');
						}
					},
					"Cancelar": {
						icon: 'fa-ban',
						type: 'danger',
						f: function(){
							chPaho.init();
						}
					}
				},
				onContentLoaded: function(){
					p.$w = $('#mainPanel');
					p.$w.find("[name=fec_tras]").datepicker({
			   			format: 'yyyy-mm-dd',
		    			startDate: '-3d'
					});
					K.block();
					$.post('ch/paho/get',{_id: p.id},function(data){
					mgEnti.fillMini(p.$w.find('[name=paciente] [name=mini_enti]'),data.paciente);
					p.$w.find('[name=pabellon]').val(data.pabellon),
					p.$w.find('[name=hist_cli]').text(data.hist_cli),
					K.unblock();
				},'json');
			}
		});
	},
	Alta: function(p){
		new K.Panel({
			title: 'Alta de Paciente',
			contentURL: 'ch/paho/alta',
			store: false,
			buttons: {
					"Guardar": {
						icon: 'fa-save',
						type: 'success',
						f: function(){
							K.clearNoti();
							var data = {
								_id: p.id,
								estado: 'A',
								paciente: mgEnti.dbRel(p.$w.find('[name=paciente] [name=mini_enti]').data('data')),
								autorizado: p.$w.find('[name=autorizado] [name=mini_enti]').data('data'),
								tipo_hosp:p.$w.find('[name=tipo_hosp]').text(),
								fec_inicio:p.$w.find('[name=fec_inicio]').val(),
								fec_alta:p.$w.find('[name=fec_alta]').val(),
								talta:p.$w.find('[name=talta]').val(),
								modalidad:p.$w.find('[name=modalidad]').val(),
								cant:p.$w.find('[name=cant]').val(),
							};	
							if(data.autorizado==null){
								p.$w.find('[name=autorizado] [btnSel]').click();
								return K.msg({
									title: ciHelper.titles.infoReq,
									text: 'Debe Seleccionar a alguien que autorice el alta',
									type: 'erro'
								});
							}else data.autorizado = mgEnti.dbRel(data.autorizado);
							p.$w.find('#div_buttons button').attr('disabled','disabled');
							$.post("ch/paho/save",data,function(result){
								K.clearNoti();
								K.msg({title: ciHelper.titles.regiAct,text: "Alta de Paciente Correcta!"});
								chPaho.init();
							},'json');
						}
					},
					"Cancelar": {
						icon: 'fa-ban',
						type: 'danger',
						f: function(){
							chPaho.init();
						}
					}
				},
				onContentLoaded: function(){
					p.$w = $('#mainPanel');
					p.$w.find("[name=fec_alta]").datepicker({
			   			format: 'yyyy-mm-dd',
		    			startDate: '-3d'
					});
					p.$w.find("[name=fec_inicio]").datepicker({
			   			format: 'yyyy-mm-dd',
		    			startDate: '-3d'
					});
					p.$w.find('[name=autorizado] .panel-title').html('AUTORIZADO POR');
					p.$w.find('[name=autorizado] [name=btnSel]').click(function(){
						mgEnti.windowSelect({callback: function(data){
							mgEnti.fillMini(p.$w.find('[name=autorizado] [name=mini_enti]'),data);
						},bootstrap: true,filter: [
							{nomb: 'tipo_enti',value: 'P'},
							{nomb: 'roles.medico',value: {$exists: true}}
						]});
					});
					p.$w.find('[name=autorizado] [btnAct]').click(function(){
						if(p.$w.find('[name=autorizado] [name=mini_enti]').data('data')==null){
							K.msg({
								title: ciHelper.titles.infoReq,
								text: 'Debe Elegir a una Entidad!',
								type: 'error'
							});
						}else{
							mgEnti.windowEdit({callback: function(data){
								mgEnti.fillMini(p.$w.find('[name=autorizado] [name=mini_enti]'),data);
							},id: p.$w.find('[name=autorizado] [name=mini_enti]').data('data')._id.$id});
						}
					});
					K.block();
					$.post('ch/paho/get',{_id: p.id},function(data){
					mgEnti.fillMini(p.$w.find('[name=paciente] [name=mini_enti]'),data.paciente);
					p.$w.find('[name=tipo_hosp]').text(data.tipo_hosp),
					p.$w.find('[name=fec_inicio]').val(moment(data.fec_inicio.sec,'X').format('YYYY-MM-DD'));

					K.unblock();
				},'json');
			}
		});
	},
};
define(
	['ch/hospi','mg/enti'],
	function(chHospi,mgEnti){
		return chPaho
	}
);