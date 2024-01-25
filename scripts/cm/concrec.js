/*Concesiones Recientes */
cmConcRec = {
		init: function(){
		if($('#pageWrapper [child=conc]').length<=0){
			var $p = $('#pageWrapperLeft');
			$.post('cm/navg/conc',function(data){
				for(var i=0; i<data.length; i++){
					var result = data[i];
					var $row = $p.find('.gridReference').clone();
					$row.find('li:eq(0)').html( '<span class="ui-icon '+result.icon+'"></span>' + result.descr )
						.css({
							"padding-left": "10px",
							"min-width": "186px",
							"max-width": "186px"
						});
					$row.wrapInner('<a name="'+result.name+'" class="item" href="javascript: void(0);" child="conc" />');
					$p.find("[name=cmConc]").after( $row.children() );
				}
				$p.find('[name=cmConc]').data('conc',$('#pageWrapper [child=conc]:first').data('conc'));
				$p.find('[name=cmConcRec]').click(function(){ cmConcRec.init(); }).find('ul').addClass('ui-state-highlight');
				$p.find('[name=cmConcAll]').click(function(){ cmConcAll.init(); });
				$p.find('[name=cmConcVen]').click(function(){ cmConcVen.init(); });
				$p.find('[name=cmConcPor]').click(function(){ cmConcPor.init(); });
			},'json');
		}
		K.initMode({
			mode: 'cm',
			action: 'cmConcRec',
			titleBar: { title: 'Concesiones Recientes'}
		});
		
		new K.Panel({
			id: 'mainPanel',
			contentURL: 'cm/oper',
			onContentLoaded: function(){
				$('#No-Results').hide();
				$mainPanel = $('#mainPanel');
				$mainPanel.find('[name=obj]').html( 'concesiones' );
				$mainPanel.find("[name=moreresults]").css('float','right').button({icons: {primary: 'ui-icon-triangle-1-s'}});
				$mainPanel.resize(function(){
					$mainPanel.find('.grid:eq(1)').height(($mainPanel.height()-$mainPanel.find('.grid:eq(0)').height()-$('.div-bottom').outerHeight()-$('.div-bottom').height())+'px');
				}).resize();
				$mainPanel.find('.grid:eq(0)').css('overflow','hidden');
				$mainPanel.find('.grid:eq(1)').scroll(function(){
					$mainPanel.find('.grid:eq(0)').scrollLeft($(this).scrollLeft());
				});
				var $li = $("#mainPanel .gridHeader li");
				var col = "espacio";
				$li.eq(2).attr('filter','espacio');
				$("#mainPanel .gridHeader").find('li:eq(2),li:eq(3),li:eq(4)').click( function(){
					$this = $(this);
					var order = 1;
					col = $(this).attr("filter");
					if($this.find('.ui-sorter').length>0){
						if($this.find('.ui-asc').length>0){
							$this.find('.ui-sorter').remove();
							$this.append('<span class="ui-sorter ui-icon ui-icon-triangle-1-s ui-desc" style="float:right"></span>');
						}else{
							$this.find('.ui-sorter').remove();
							$this.append('<span class="ui-sorter ui-icon ui-icon-triangle-1-n ui-asc" style="float:right"></span>');
							order = -1;
						}
					}else{
						$this.closest('.gridHeader').find('.ui-sorter').remove();
						$this.append('<span class="ui-sorter ui-icon ui-icon-triangle-1-s ui-desc" style="float:right"></span>');
					}
					$("#mainPanel .gridBody").empty();
					cmConcRec.loadData({page: 1,url: 'cm/oper/listaconcrec',filter: $(this).attr("filter"),order: order});
				});
				$mainPanel.find('[name=btnConcesion]').click(function(){
					cmOper.windowNewConcesion({$this:$(this)});
				}).button({icons: {primary: 'ui-icon-bookmark'}});
				$('.divSearch [name=buscar]').keyup(function(e){
					if(e.keyCode == 13) $('.divSearch [name=btnBuscar]').click();
				}).attr('placeholder',' Buscar concesion').width('250');
				$('.divSearch [name=btnBuscar]').click(function(){
					if($('.divSearch [name=buscar]').val().length<=0){
			            $("#mainPanel .gridBody").empty();
			            cmConcRec.loadData({page: 1,url: 'cm/oper/listaconcrec'});
					}else{
			            $("#mainPanel .gridBody").empty();
			            cmConcRec.loadData({page: 1,url: 'cm/oper/listaconcrec',bus: $('.divSearch [name=buscar]').val(),ncol: col});
			            K.notification({text: 'B&uacute;squeda realizada!',layout:"topLeft"});
					}
				}).button({icons: {primary: 'ui-icon-search'}});
				cmConcRec.loadData({page: 1,url: 'cm/oper/listaconcrec'});
			}
		});
		$('#pageWrapperMain').layout();
	},
	loadData: function(params){
		params.nomb = $('.divSearch [name=buscar]').val();
		params.page_rows = 20;
		params.page = (params.page) ? params.page : 1;
		$.post(params.url, params, function(data){
			if ( data.paging.total_page_items > 0 ) {
				for (i=0; i < data.paging.total_page_items; i++) {
					result = data.items[i];
					var $row = $('.gridReference','#mainPanel').clone();
					$li = $('li',$row);
					if(result.anulacion==null)
						$li.eq(0).css('background','#003265').addClass('vtip').attr('title','Activa');
					else
						$li.eq(0).css('background','red').addClass('vtip').attr('title','Anulada');
					$li.eq(1).html( '<button name="btnGrid">M&aacute;s Acciones</button>' );
					$li.eq(2).html( result.espacio.nomb );
					if(result.propietario.appat == null)
						$li.eq(3).html( result.propietario.nomb );
					else
						$li.eq(3).html( result.propietario.nomb + ' ' + result.propietario.appat + ' ' + result.propietario.apmat);
					$li.eq(4).html( ciHelper.dateFormat(result.fecreg) );
					$li.eq(5).html( cmOper.statesCondicionConc[result.concesion.condicion].descr );
					if(result.concesion.fecven != null){
						$li.eq(6).html( ciHelper.dateFormat(result.concesion.fecven) );
						if(ciHelper.dateDiffNow(result.concesion.fecven)<=cmOper.days)
							$li.eq(6).css('color','red');
					}
					$row.wrapInner('<a id="'+result._id.$id+'" class="item"  href="javascript: void(0);" />');
					$row.find('a').data('data',result).dblclick(function(){
						//cmOper.windowDetailsoper({id: $(this).data('data')._id.$id, data: $(this).data('data'),por: true});
						cmOper.windowDetailsConc({id: $(this).data('data')._id.$id,modal: true});
					}).data('id',result._id.$id).contextMenu('conMenCmConc', {
						onShowMenu: function(e, menu) {
							$(e.target).closest('.gridBody').find('ul').removeClass('ui-state-highlight');
							$(e.target).closest('.item').find('ul').addClass('ui-state-highlight');
							$(e.target).closest('.item').click();
							K.tmp = $(e.target).closest('.item');
							return menu;
						},
						bindings: {
							'conMenCmConc_ver': function(t) {
								cmOper.windowDetailsConc({id: K.tmp.data('id'),data: K.tmp.data('data'),modal: true});
							},
							'conMenCmConc_reg': function(t) {
								cmEspa.windowNewServ({id: K.tmp.data('id'),data: K.tmp.data('data')});
							}
						}
					});
					//cmOper.contextMenu({$row: $row.find('a'),data: $row.find('a').data('data'),por: true});
					$("#mainPanel .gridBody").append( $row.children() );
					ciHelper.gridButtons($("#mainPanel .gridBody"));
				}
				count = $("#mainPanel .gridBody .item").length;
				$('#No-Results').hide();
				$('#Results [name=showing]').html( count );
				$('#Results [name=founded]').html( data.paging.total_items );
				$('#Results').show();
				
				$moreresults = $("[name=moreresults]").unbind('click');
				if (parseFloat(data.paging.page) < parseFloat(data.paging.total_pages)) {
					$("#mainPanel .gridFoot").show();
					$moreresults.click( function(){
						$('#mainPanel .grid').scrollTo( $("#mainPanel .gridBody a:last"), 800 );
						params.page = parseFloat(data.paging.page) + 1;
						cmConcRec.loadData(params);
						$(this).button( "option", "disabled", true );
					});
					$( "[name=moreresults]",'#mainPanel').button( "option", "disabled", false );
		        }else{
					$("#mainPanel .gridFoot").hide();
					$( "[name=moreresults]",'#mainPanel').button( "option", "disabled", true );
		        }
			} else {
				$('#No-Results').show();
				$('#Results').hide();
				$("[name=moreresults]").button( "option", "disabled", true );
			}
			$('#mainPanel').resize();
			K.unblock({$element: $('#pageWrapperMain')});
		}, 'json');
	}
};
define(
	['cm/oper','cm/concall','cm/concpor','cm/concven'],
	function(cmOper,cmConcAll,cmConcPor,cmConcVen){
		return cmConcRec;
	}
);