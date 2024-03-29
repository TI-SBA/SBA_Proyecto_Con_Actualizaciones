var K = {
    version: '1.1.0',
    options: {
        nameApp:    'Proyecto Beneficencia',
        theme:      'kunanui',
	    error:      'ci/index/error',
	    about:      'ci/index/about'
	},
    path: {
	    source:  'scripts/',    /* Path to KunanUI source JavaScript */
	    themes:  'themes/',     /* Path to KunanUI Themes */
	    plugins: 'plugins/'     /* Path to Plugins */
    },
    /* Returns the path to the current theme directory */
    themePath: function(){
        return K.path.themes + K.options.theme + '/'; 
    },
    files: {
        css: [],
        js: []
    },
    instances: {
        window: [],
        windowTot: 0,
        panel: [],
        panelTot: 0
    },
    tmp: null
};
/*
*  We add all the methods
*/
$.extend(K,{
/*
Function: updateContent
	Replace the content of a window or panel.

updateOptions:
	element - The parent window or panel.
	childElement - The child element of the window or panel recieving the content.
	method - ('get', or 'post') The way data is transmitted.
	data - (hash) Data to be transmitted
	title - (string) Change this if you want to change the title of the window or panel.
	content - (string or element) An html loadMethod option.
	loadMethod - ('html', 'xhr', or 'iframe')
	url - Used if loadMethod is set to 'xhr' or 'iframe'.
	scrollbars - (boolean)
	padding - (object)
	store - (boolean)
	onContentLoaded - (function)
*/
	updateContent: function(opts){
		var options = $.extend({},{
			element:      null,
			childElement: null,
			method:       null,
			data:         null,
			title:        null,
			content:      null,
			loadMethod:   null,
			url:          null,
			scrollbars:   null,
			padding:      null,
			store:		  true,
			require:      false,
			onContentLoaded: null
		}, opts);
		
		/* We check if there is an element */
		if (!options.element){
			K.notification({text: '"element" not defined for "K.updateContent"',type: 'error'});
			return console.warn('=>K: "element" not defined for "K.updateContent"');
		}
		
		/* The load method is defined */
		if (!options.loadMethod){
			if (!options.url) options.loadMethod = 'html';
			else options.loadMethod = 'xhr';
		}
		/* This method load the needed libraries */
		if($.type(options.require)=='object'){
			if($.type(options.require.css)=='array'){
				K.include.css(options.require.css);
			}
			if($.type(options.require.javascript)=='array'){
				K.include.javascript(options.require.javascript,options.require.onload,options);
			}
		}else
			this.loadSelect(options);
		return this;
	},
	/* Load new content. */
	loadSelect: function(opts){
		switch(opts.loadMethod){
			case 'xhr':
				this.updateContentXHR(opts);
				break;
			case 'iframe':
				this.updateContentIframe(opts);
				break;
            case 'json':
                this.updateContentJSON(opts);
                break;
			case 'html':
			default:
				this.updateContentHTML(opts);
				break;
		}
	},
	updateContentXHR: function(opts){
		if(opts.store)
			if($.jStorage.get(opts.url, false)){
				$.jStorage.get(opts.url);
	        	$('#'+opts.element).html($.jStorage.get(opts.url));
	        	if($.isFunction(opts.onContentLoaded))
					opts.onContentLoaded();
				return;
			}
		$.ajax({
	        url: opts.url,
	        data: opts.data,
	        error: function(e, xhr, opts, error){
	            $('#'+opts.element).html('<strong>Error:</strong><br />'+'La petici�n a la p�gina ' + opts.url + ' ha devuelto el siguiente error: ' + xhr.status + ' - ' + error);
	        },
	        success: function(rpta){
	        	if(opts.store) $.jStorage.set(opts.url, rpta);
	        	$('#spinner').hide();
	        	$('#'+opts.element).html(rpta);
            	if($.isFunction(opts.onContentLoaded)) opts.onContentLoaded();
	        },
	        type: "POST"
		});
	},
	updateContentIframe: function(opts){
		opts.$element = $('#'+opts.element);
		var width = opts.$element.parent().width()-5;
		opts.$element.append('<iframe src="'+opts.url+'" border=0 width="'+width+'px" height="'+(opts.$element.parent().offset().height-10)+'px"></iframe>');
		opts.$iframe = opts.$element.find('iframe');
		opts.$element.resize(function(){
			opts.$iframe.width(($(this).width()-5)+'px');
			opts.$iframe.height(($(this).height()-10)+'px');
		}).resize();
		if($.isFunction(opts.onContentLoaded)) opts.onContentLoaded();
	},
	updateContentHTML: function(opts){
		$('#'+opts.element).empty().html(opts.content);
		if($.isFunction(opts.onContentLoaded)) opts.onContentLoaded();
	},
	include: {
		javascript: function(p,callback,options){
			for(contJs=0; contJs<p.length; contJs++){
				if($.inArray(p[contJs],K.files.js)==-1){
					var script = document.createElement( 'script' );
					script.type = 'text/javascript';
					script.src = p[contJs];
					document.getElementsByTagName('head')[0].appendChild(script);
					K.files.js.push(p[contJs]);
				}
			}
			if($.isFunction(callback)) callback();
			K.loadSelect(options);
		},
		css: function(p){
			for(contCss=0; contCss<p.length; contCss++){
				if($.inArray(p[contCss],K.files.css)==-1){
					var cssLink = $('<link href="'+p[contCss]+'" type="text/css" rel="Stylesheet" />');
					$("head").append(cssLink);
					K.files.css.push(p[contCss]);
				}
			}
		}
	},
	/*
	
	Function: notification
		Shows a notification to the user.
	
	notificationOptions:
		text - (string) Notification message
		textAlign - (CSS/Properties/text-align) Alignment of message
		layout - (top, topCenter, bottom, center, topLeft, topRight) Layout of notification. (Customizable with CSS)
		theme - (string) Theme of notification. (Customizable with CSS)
		type - (alert | error | success) Style of the notification. (Customizable with CSS)
		modal - (boolean) Adds modal layer when set to true.
		modalCss - (jQuery Css Properties) Set one or more CSS properties for the modal layer.
		speed - (integer (ms)) Speed of open and close animations.
		timeout - (integer (ms) | false) Duration of notification on screen. Set false for sticky notification.
		closable - (boolean) Enables the close button when set to true.
		closeOnSelfClick - (boolean) Close the noty on self click when set to true.
		force - (boolean) Adds notification to the beginning of queue when set to true.
		buttons - (false | array) An array of buttons.
			buttons: [
		      {type: 'button green', text: 'Ok', click: function() { // } },
		      {type: 'button pink', text: 'Cancel', click: function() { // } }
		    ]
		onShow - (false | function) onShow Callback
		onClose - (false | function) onClose Callback

	*/
	notification: function(options){
		if($.type(options)=='string'){
			var tmp = options;
			options = {
				text: tmp,
				type: 'info'
			};
		}
		var delay = 5000;
		switch(options.type){
			case "info":
				var type = 'info';
				var icon = 'ui-icon ui-icon-locked';
				break;
			case "success":
				var type = 'success';
				var icon = 'ui-icon ui-icon-flag';
				break;
			case "error":
				var type = 'error';
				var icon = 'ui-icon ui-icon-signal-diag';
				break;
			default:
				var type = 'notice';
				var icon = 'ui-icon ui-icon-mail-closed';
				break;
		}
		var params = {
			text: options.text,
			type: type,
			icon: icon,
			delay: delay,
			animation: {
				effect_in: 'show',
				effect_out: 'slide'
			}
		};
		if(options.title!=null) params.title = options.title;
		if(options.icon!=null) params.icon = 'ui-icon '+options.icon;
		if(options.delay!=null) params.delay = options.delay;
		if(options.hide!=null) params.hide = options.hide;
		
		//K.nn(options.title,options.text);
		return $.pnotify(params);
	},
	clearNoti: function(){
		$.pnotify_remove_all();
	},
	sendingInfo: function(){
		K.notification({
			text: 'Enviando informaci&oacute;n...<img src="images/ajax-loader_noti.gif" />',
			hide: false,
			type: 'info'
		});
	},
	Modal: function(opts){
		var options = $.extend({},{
			id				: null,
			title			: 'New window',
			header			: true,
			height			: 250,
			width			: 300,
			modal			: true,
			position		: 'center',
			loadMethod		: null,
			method			: 'post',
			content			: '',
			contentURL		: null,
			data			: null,
			store			: true,
			padding			: { top: 0, right: 0, bottom: 0, left: 0 },
			resizable		: false,
			draggable		: true,
			maximizable		: false,
			minimizable 	: false,
			buttons			: null,
			onResize		: null,
			onContentLoaded : null,
			onClose			: null
		}, opts);
		new K.Window(options);
	},
	TitleBar: function(opts){
		$('#titleBar span:first').html(opts.title);
		$('#toolBar').empty();
		if(opts.toolbar || opts.onContentLoaded!=null)
			K.updateContent({
				element:      'toolBar',
				method:       opts.method,
				data:         opts.data,
				title:        opts.title,
				content:      opts.content,
				loadMethod:   opts.loadMethod,
				url:          opts.url,
				padding:      opts.padding,
				store:		  opts.store,
				onContentLoaded: opts.onContentLoaded
			});
	},
	restaureWindow: function(id){
		$('#'+id).parent().find('.ui-icon-restore').click();
	},
	maximizeWindow: function(id){
		var $div = $('#'+id);
		tamano = [ $div.height() , $div.width() ];
		tamanowin = [ $div.dialog( "widget" ).height() , $div.dialog( "widget" ).width() ];
		positionwin = [ $div.dialog( "widget" ).position().left , $div.dialog( "widget" ).position().top ];
		$div.dialog( "option", "height", $(window).height() )
			.dialog( "option", "width", $(window).width() )
			.dialog( "option", "position", [ 0 , 0 ] )
			.dialog( "option", "draggable", false )
			.dialog( "option", "resizable", false );
		$('.ui-icon-max',$dialog).addClass('ui-icon-restore');
		$('.ui-icon-max',$dialog).removeClass('ui-icon-max');
	},
	minimizeWindow: function(id){
		$('#'+id).parent().find('.ui-dialog-minimize').click();
	},
	closeWindow: function(id){
		if($('#'+id).length>0)
			$('#'+id).dialog('close');
	},
	titleUpdate: function(id,title){
		var icon = '<span class="'+$('#'+id+'_dockTab').find('label .ui-icon').attr('class')+'"></span>';
		$('#'+id).dialog( "option", "title", icon+title);
		$('#'+id+'_dockTab').find('label').attr('title',icon+title);
		if(title.indexOf('&',0)>12){
			if(title.length>27) title = title.substring(0, (title.indexOf('&',0)+8))+'...';
		}else{
			if(title.length>20) title = title.substring(0, 20)+'...';
		}
		$('#'+id+'_dockTab').find('span').html(icon+title);
	},
	Table: function(p){
		p.colCount = p.table.find('.tableBody tr:first>td').length; /* Get total number of column */

		p.m = 0;
		p.n = 0;
		p.brow = 'mozilla';

		jQuery.each(jQuery.browser, function(i, val) {
			if(val == true){
				p.brow = i.toString();
			}
		});
		
		p.table.css('padding','0px').find('td').css({'padding':'0px','margin':'0px'});
		p.table.find('td:first').addClass('ui-button ui-widget ui-state-default ui-button-text-only');
		
		p.table.find('.tableHeader div').each(function(i){
			$(this).parent().addClass('ui-button ui-widget ui-state-default ui-button-text-only');
			if (p.m < p.colCount){
				if (p.brow == 'mozilla'){
					p.table.find('td:first').css("width",p.table.find('.tableColumn td').innerWidth()); /* for adjusting first td */
					$(this).css('width',p.table.find('.tableBody td:eq('+p.m+')').innerWidth()-2); /* for assigning width to table Header div */
				}
				else if (p.brow == 'msie'){
					p.table.find('td:first').css("width",p.table.find('.tableColumn td').width());
					$(this).css('width',p.table.find('.tableBody td:eq('+p.m+')').width()-4); /* In IE there is difference of 2 px */
				}
				else if (p.brow == 'safari'){
					p.table.find('td:first').css("width",p.table.find('.tableColumn td').width());
					$(this).css('width',p.table.find('.tableBody td:eq('+p.m+')').width()-2);
				}
				else {
					p.table.find('td:first').css("width",p.table.find('.tableColumn td').width());
					$(this).css('width',p.table.find('.tableBody td:eq('+p.m+')').innerWidth()-2);
				}
			}
			p.m++;
		});

		p.table.find('.tableColumn td').each(function(i){
			if(p.brow == 'mozilla'){
				$(this).css('height',p.table.find('.tableBody td:eq('+p.colCount*p.n+')').outerHeight()); /* for providing height using scrollable table column height */
			}
			else if(p.brow == 'msie'){
				$(this).css('height',p.table.find('.tableBody td:eq('+p.colCount*p.n+')').innerHeight()-2);
			}
			else {
				$(this).css('height',p.table.find('.tableBody td:eq('+p.colCount*p.n+')').height());
			}
			p.n++;
		});

		p.table.find('.tableBody').unbind('scroll').bind('scroll',function(){
			p.table.find('.tableHeader').scrollLeft(p.table.find('.tableBody').scrollLeft());
			p.table.find('.tableColumn').scrollTop(p.table.find('.tableBody').scrollTop());
		});
	},
	clickMenu: function(p){
		p.show = function($this){
			p.temp = $this.addClass('temp');
			$ul = $this.find('.inner:eq(0)');
			var left = $this.offset().left;
			if($("#"+p.id+' ul:first').css('float')=='right'){
				//left = $this.offset().left + ($ul.closest('.main').find('a:first').width()*2) - $ul.width();
				left = ($('.temp').offset().left + $ul.closest('.main').width()) - $ul.width() + 20;
			}
			$ul.show();
			$('#menFloat').append($ul).css({
				"display": "block",
				"position": "absolute",
				"z-index": "999999",
				"box-shadow": "2px 2px 5px #999",
				"top": $this.offset().top+$this.height()+"px",
				"left": left+"px"
			});
			p.$menu.data('visible',true);
		};
		p.hideAll = function(){
			$('.temp').append($('#menFloat').find('ul:eq(0)'));
			$('.temp').removeClass('temp');
			p.$menu.find('.main ul').hide();
		};
		if(p.$menu==null) p.$menu = $("#"+p.id+">ul");
		p.$menu.addClass('clickMenu');
		p.$menu.find('>li').each(function(){
			$this = $(this);
			$this.addClass('main');
			$this.find('ul').hide();
			$this.click(function(){
				$this = $(this);
				if(p.$menu.data('visible')==true){
					p.hideAll();
					p.$menu.data('visible',false);
				}else{
					if($this.find('ul').css('display')=='none'){
						p.show($this);
					}else{
						p.hideAll();
						p.$menu.data('visible',false);
					}
				}
			}).mouseenter(function(){
				p.hideAll();
				$this = $(this);
				if(p.$menu.data('visible')){
					p.show($this);
				}
			});
		});
		p.$menu.find('.main ul').each(function(){
			$this = $(this);
			if(!$this.hasClass('main')){
				$this.addClass('inner');
			}
		});
		p.$menu.find('.main>ul').each(function(){
			$this = $(this);
			if(!$this.hasClass('main')){
				$this.addClass('outter');
			}
		});
		p.$menu.find('.inner').width('160px');
		p.$menu.find('.inner ul').before('<img src="' + K.themePath() + 'images/right.gif" class="liArrow" />');
		$('body').mouseup(function(e){
			if($(e.target).closest("#menFloat").length<1)
				if($(e.target).closest("#"+p.id).length<1){
					p.hideAll();
					p.$menu.data('visible',false);
				}
		}).append('<div id="menFloat" class="clickMenu"></div>');
		$('#menFloat').delegate('li','click',function(){
			p.hideAll();
			p.$menu.data('visible',false);
		});
		$('#menFloat').delegate('li','mouseover mouseout',function(event){
			if (event.type == 'mouseover') { 
				$(this).find('ul:eq(0)').css({
					"display": "block",
					"position": "absolute",
					"z-index": "999999",
					"box-shadow": "2px 2px 5px #999",
					"left": "160px",
					"top": "0px"
				});
			}else
				$(this).find('ul').hide();
		});
	},
	/*
	
	Function: windowPrint
		Creates a window for a PDF document.
	
	windowPrintOptions:
		id - (string) Identification of the window.
		title - (string) Change this if you want to change the title of the window or panel.
		url - (string) The link to the PDF document to visualize.

	*/
	windowPrint: function(p){
		K.Window({
			id: p.id,
			title: p.title,
			height: 400,
			width: 350,
			maximizable: false,
			resizable: false,
			loadMethod: 'iframe',
			contentURL: '',
			icon: 'ui-icon-print',
			buttons: {
				"Cerrar": function(){
					K.closeWindow(p.id);
				}
			},
			onContentLoaded: function(){
				$('#'+p.id).dialog('widget').find('.ui-dialog-buttonpane span').html("Cerrar Impresi&oacute;n");
				$(window).resize(function(){
					var $this = $('#'+p.id);
					$this.dialog( "option", "height", $(window).height() )
						.dialog( "option", "width", $(window).width() )
						.dialog( "option", "position", [ 0 , 0 ] )
						.dialog( "option", "draggable", false )
						.dialog( "option", "resizable", false );
					$this.height(($this.height()-0)+'px');
				}).resize();
				$('#'+p.id).find('iframe').attr('src',p.url);
			}
		});
	},
	/*
	
	Function: about
		Display a modal with "About Us" information.
		Modify "K.options.about" to the link you want to show.

	*/
	about: function(){
		new K.Modal({
			id: 'modAbout',
			title: 'Acerca de '+K.options.nameApp,
			contentURL: K.options.about,
			icon: 'ui-icon-info',
			padding: { top: 0, right: 0, bottom: 0, left: 0 },
			width: 350,
			height: 150
		});
	},
	/*
	
	Function: cleanTheme
		Reset the CSS theme

	*/
	cleanTheme: function(){
		$.cookie('jquery-ui-theme',null);
	},
	/*
	
	Function: cleanData
		Flush the Local Storage

	*/
	cleanData: function(){
		$.jStorage.flush();
	},
	/*
	
	Function: block
		Blocks the window or element till is needed.
	
	blockOptions:
		$element - Element you want to block. If you don't specify this, it will block the whole window.
		message - (string) Message you want to display while blocking.
		onUnblock - (function) Events to be launched after unblocking.

	*/
	block: function(p){
		if(p==null){
			p = new Object;
			$.blockUI({
				message: '<img src="images/ajax-block.gif"><h2>Espere por favor...</h2>',
                css: {
		            border: 'none',
		            padding: '15px',
		            backgroundColor: '#000',
		            '-webkit-border-radius': '10px',
		            '-moz-border-radius': '10px',
		            opacity: .5,
		            color: '#fff'
	        	}
			});
		}else{
			if(p.message==null) p.message = '<img src="images/ajax-block.gif"><h2>Espere por favor...</h2>';
			if(p.$element!=null){
				p.$element.block({
					message: p.message,
	                css: {
			            border: 'none',
			            padding: '15px',
			            backgroundColor: '#000',
			            '-webkit-border-radius': '10px',
			            '-moz-border-radius': '10px',
			            opacity: .5,
			            color: '#fff'
		        	},
		        	onUnblock: function(){
		        		if($.isFunction(p.onUnblock)) p.onUnblock();
		        	}
	            });
			}else{
				$.blockUI({
					message: p.message,
	                css: {
			            border: 'none',
			            padding: '15px',
			            backgroundColor: '#000',
			            '-webkit-border-radius': '10px',
			            '-moz-border-radius': '10px',
			            opacity: .5,
			            color: '#fff'
		        	},
		        	onUnblock: function(){
		        		if($.isFunction(p.onUnblock)) p.onUnblock();
		        	}
				});
			}
		}
	},
	/*
	
	Function: unblock
		Unblocks the window or element till is needed.
	
	unblockOptions:
		$element - Element you want to block. If you don't specify this, it will block the whole window.

	*/
	unblock: function(p){
		if(p==null){
			$.unblockUI();
		}else{
			p.$element.unblock();
		}
	},
	/*
	
	Function: initMode
		Unblocks the window or element till is needed.
	
	initModeOptions:
		mode - (string) Name of the mode, menu and js script.
		titleBar - (object) Params to K.TitleBar

	*/
	initMode: function(p){
		K.selectMenu({id: p.mode});
		$.cookie('mode', p.mode);
		$.cookie('action', p.action);
		$('#pageWrapperLeft .ui-state-highlight').removeClass('ui-state-highlight');
		$('#pageWrapperLeft').find('[name='+p.action+']').find('ul').addClass('ui-state-highlight');
		K.Desktop.clean();
		if(p.message==null) K.block({$element: $('#pageWrapperMain')});
		else K.block({$element: $('#pageWrapperMain'),message: p.message});
		K.TitleBar(p.titleBar);
	},
	/*
	
	Function: filter
		Unblocks the window or element till is needed.
	
	filterOptions:
		id - (string) Name of the DOM object.
		height - (integet) Height of the filter.
		width - (integet) Width of the filter.
		top - (integet) Top of the filter.
		left - (integet) Left of the filter.
		onContentLoaded - (function) Function to be performed when all its done.

	*/
	filter: function(p){
		$filter = $(p.content);
		if($('#'+p.id).length<=0) $('body').append($filter);
		$filter = $('#'+p.id);
		$filter.addClass('kuiFilt ui-autocomplete ui-menu ui-widget ui-widget-content ui-corner-all');
		$filter.css({
			"display": "block",
			"z-index": "99999999",
			"height": p.height+"px",
			"width": p.width+"px",
			"top": p.top+"px",
			"left": p.left+"px"
		});
		$('body').mouseup(function(e){
			if($(e.target).closest('.kuiFilt').length<1) $filter.remove();
		});
		p.onContentLoaded();
	},
	/*
	
	Function: selectMenu
		Selects the menu to active.
	
	selectMenuOptions:
		id - Element you want to select.

	*/
	selectMenu: function(p){
		$('#menFloat,#NavBar').find('.ui-state-active').removeClass('ui-state-active');
		$('#'+p.id).addClass('ui-state-active');
	},
	/*
	
	Function: date
		Return a string with the current date in format 'YYYY-mm-dd'.

	*/
	date: function(){
		var myDate = new Date();
		var day = myDate.getDate();
		var month = myDate.getMonth() + 1;
		if(day<10) day = '0' + day;
		if(month<10) month = '0' + month;
		var prettyDate = myDate.getFullYear() + '-' + month + '-' + day;
		return prettyDate;
	},
	/*
	
	Function: dateTime
		Return a string with the current date in format 'YYYY-mm-dd hh:ii:ss'.

	*/
	dateTime: function(){
		var myDate = new Date();
		var day = myDate.getDate();
		var month = myDate.getMonth() + 1;
		var hours = myDate.getHours();
		var minutes = myDate.getMinutes();
		var seconds = myDate.getSeconds();
		if(day<10) day = '0' + day;
		if(month<10) month = '0' + month;
		if(hours<10) hours = '0' + hours;
		if(minutes<10) minutes = '0' + minutes;
		if(seconds<10) seconds = '0' + seconds;
		var prettyDate = myDate.getFullYear() + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
		return prettyDate;
	},
/*
	
	Function: dateTime
		Return a string with the current date in format 'YYYY-mm-dd hh:ii:ss'.

	*/
	dateTimeFormat: function(myDate){
		var day = myDate.getDate();
		var month = myDate.getMonth() + 1;
		var hours = myDate.getHours();
		var minutes = myDate.getMinutes();
		var seconds = myDate.getSeconds();
		if(day<10) day = '0' + day;
		if(month<10) month = '0' + month;
		if(hours<10) hours = '0' + hours;
		if(minutes<10) minutes = '0' + minutes;
		if(seconds<10) seconds = '0' + seconds;
		var prettyDate = myDate.getFullYear() + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
		return prettyDate;
	},
	/*
	
	Function: dateComp
		Compare two dates and return false if first date is less than the last one.
	
	dateCompOptions:
		fecha - (string) first date to compare on format "yyyy-mm-dd hh:ii:ss".
		fecha2 - (string) second date to compare on format "yyyy-mm-dd hh:ii:ss".

	*/
	dateComp: function(fecha, fecha2){
		var xMes=fecha.substr(5, 2);
		var xDia=fecha.substr(8, 2);
		var xAnio=fecha.substr(0,4);
		var yMes=fecha2.substr(5, 2);
		var yDia=fecha2.substr(8, 2);
		var yAnio=fecha2.substr(0,4);
		if (xAnio > yAnio){
			return(true);
		}else{
			if (xAnio == yAnio){
				if (xMes > yMes){
		      		return(true);
				}
		 		if (xMes == yMes){
					if (xDia > yDia){
						return(true);
					}else{
						return(false);
					}
				}else{
					return(false);
				}
			}else{
				return(false);
			}
		}
	},
	/*
	
	Function: round
		Round numbers to a specific amount of decimals.
	
	roundOptions:
		n - (float) Number to be format.
		dec - (integer) Amount of decimals you want to show.

	*/
	round: function(n,dec){
		/*n = parseFloat(n);
		if(!isNaN(n)){
			if(!dec) var dec= 0;
			var factor= Math.pow(10,dec);
			return Math.floor(n*factor+((n*factor*10)%10>=5?1:0))/factor;
		}else{
			return n;
		}*/
		n = parseFloat(n);
		if(!isNaN(n)){
			n = Math.round(n * 100) / 100;
			return n.toFixed(dec);
		}else return n;
	},
	/*
	
	Function: gridButtons
		Append a group of button to the selected row.
	
	gridButtonsOptions:
		$row - (DOM) Row to insert buttons.
		event - (event) Click Event,
		index - (integer) Index of the column to insert buttons,
		buttons - (array) Array of objects.
			[
				{
					label - (String) Label for the button.
					icon - (String) Icon for the button.
					callback - (function) Callback for clicking.
				}
			]

	*/
	gridButtons: function(p){
		$target = $(p.event.target);
    	if($target.closest('[name^=btnGrid]').length>0){
    		$.noop();
    	}else{
    		p.$row.data('p',p.data);
			$mainGrid = p.$row.closest('.gridBody');
			$mainGrid.find('ul').each(function(){
				$(this).find('li').eq(p.index).html('');
			});
			for(var i = 0; i<p.buttons.length; i++){
				$mainGrid.find('[name=btnGrid'+p.buttons[i].label+']').button("destroy");
				p.$row.find('li').eq(p.index).append( '<button name="btnGrid'+p.buttons[i].label+'">'+p.buttons[i].label+'</button>' );
				p.$row.find('[name=btnGrid'+p.buttons[i].label+']').button({
		            icons: { primary: p.buttons[i].icon },
		            text: false
		        }).mouseup(function(e){
		        	e.preventDefault();
		        	var tmp = $(this).data('p');
		        	tmp.callback($(this).closest('.item'));
				}).data('p',p.buttons[i]);
			}
    	}
	}
});
$.extend(K.options,{
	/* Naming options:
	If you change the IDs of the Kunan Desktop containers in your HTML,
	you need to change them here as well. */
	dockWrapper: 'dockWrapper',
	dockVisible: 'true',
	dock:        'dock'
});
K.Desktop = {
	options: {
		/* If you change the IDs of the KunanUI Desktop containers in your HTML,
		you need to change them here as well. */
		desktop:             'desktop',
		desktopHeader:       'desktopHeader',
		dockWrapper:		'dockWrapper',
		desktopNavBar:       'desktopNavbar',
		pageWrapper:         'pageWrapper',
		pageWrapperMain:     'pageWrapperMain',
		dock:                'dock',
		dockWrapper:         'dockWrapper',
		desktopFooter:       'desktopFooterWrapper',
		contextMenu:         'contextMenu',
		titleBar:			 'titleBar'
	},
	clean: function(){
		if($('#pageWrapperMain .ui-layout-pane-center').length>0){
			/*if($('.ui-layout-center','#pageWrapper').length>0){*/
				id = $('.ui-layout-center','#pageWrapperMain').attr('id');
				index = id!='' ? $.inArray(id,K.instances.panel) : $.inArray('mainPanel',K.instances.panel);
				K.instances.panel.splice(index,1);
			/*}
			if($('.ui-layout-north','#pageWrapper').length>0){*/
				id = $('.ui-layout-north','#pageWrapperMain').attr('id');
				index = id!='' ? $.inArray(id,K.instances.panel) : $.inArray('topPanel',K.instances.panel);
				if(index!=-1) K.instances.panel.splice(index,1);
			/*}
			if($('.ui-layout-west','#pageWrapper').length>0){*/
				id = $('.ui-layout-west','#pageWrapperMain').attr('id');
				index = id!='' ? $.inArray(id,K.instances.panel) : $.inArray('leftPanel',K.instances.panel);
				if(index!=-1) K.instances.panel.splice(index,1);
			/*}
			if($('.ui-layout-east','#pageWrapper').length>0){*/
				id = $('.ui-layout-east','#pageWrapperMain').attr('id');
				index = id!='' ? $.inArray(id,K.instances.panel) : $.inArray('rightPanel',K.instances.panel);
				if(index!=-1) K.instances.panel.splice(index,1);
			/*}
			if($('.ui-layout-south','#pageWrapper').length>0){*/
				id = $('.ui-layout-south','#pageWrapperMain').attr('id');
				index = id!='' ? $.inArray(id,K.instances.panel) : $.inArray('bottomPanel',K.instances.panel);
				if(index!=-1) K.instances.panel.splice(index,1);
			/*}*/
			$('#pageWrapperMain').layout().destroy();
		}
		$('#pageWrapperMain').empty();
	},
	initialize: function(){
		/*
		This one is to get all the files
		*/
		/*for(contDesk=0; contDesk<$('link').length; contDesk++){
			K.files.css.push($('link').eq(contDesk).attr('href'));
		}
		for(contDesk=0; contDesk<$('script').length; contDesk++){
			K.files.js.push($('script').eq(contDesk).attr('src'));
		}*/
		/*
		The next function is for the grids
		*/
		$('.iconTitleBar,.gridBody ul,.list li').die('mouseenter').live('mouseenter',function(){
			$(this).addClass('ui-state-hover');
			$(this).css('font-weight','normal');
			$(this).find('li').css('font-weight','normal');
		});
		$('.iconTitleBar,.gridBody ul,.list li').die('mouseleave').live('mouseleave',function(){
			$(this).removeClass('ui-state-hover');
		});
		$('.gridBody ul,.list li').die('click').live('click',function(e){
			/*console.log($(e.target).prop('tagName'));
			if($(e.target).prop('tagName')!='SELECT' && $(e.target).prop('tagName')!='OPTION'){*/
				$(this).closest('.list').find('li').removeClass('ui-state-highlight');
				$(this).closest('.gridBody').find('ul').removeClass('ui-state-highlight');
				$(this).closest('.gridBody').find('ul').removeClass('ui-state-hover');
				$(this).addClass('ui-state-highlight');
			/*}*/
		});
		$('.styleTable tr').die('click').live('click',function(e){
			/*console.log($(e.target).prop('tagName'));
			if($(e.target).prop('tagName')!='SELECT' && $(e.target).prop('tagName')!='OPTION'){*/
				$(this).closest('tbody').find('td').removeClass('ui-state-highlight_td');
				$(this).closest('tbody').find('tr').removeClass('ui-state-highlight');
				$(this).closest('tbody').find('tr').removeClass('ui-state-highlight');
				$(this).closest('tbody').find('tr').removeClass('ui-state-hover');
				$(this).addClass('ui-state-highlight');
				$(this).find('td').addClass('ui-state-highlight_td');
			/*}*/
		});
		/*
		This one is for the focus event
		*/
		$('input:not(:radio),select,textarea').live('focus',function(){
			$(this).addClass('ui-state-highlight');
		}).live('blur',function(){
			$(this).removeClass('ui-state-highlight');
		});
		/*
		AJAX event control
		*/
		var settimewait;
		$('#spinner').ajaxStart(function() {
	      $(this).show();
	      settimewait = setTimeout('jQuery("#spinner").hide()',3000);
	    });
	    $('#spinner').ajaxError(function(e, xhr, opts, error) {
	    	//window.location.assign('ci/index/logout');
	    	if(xhr.status==403){
	    		location.reload(true);
	    	}else if(xhr.status==501){
	    		eval("var texto = arrMsg."+xhr.responseText+";");
	    		K.notification({ text: texto , type: 'error', layout: 'topLeft' });
	    	}else{
			    $(this).hide();
			    txtError = error;
				/*new K.Modal({
					id: 'modError',
					title: 'Error de carga: '+opts.url,
					contentURL: K.options.error,
					icon: 'ui-icon-alert',
					resizable: true,
					draggable: true,
					height: 300,
					width: 450,
					onContentLoaded: function(p){
						p = new Object;
						p.$dialog = $('#modError').dialog('widget');
						p.$dialog.find('.ui-dialog-titlebar').addClass('ui-state-error');
						p.$dialog.find('[name=url]').text(opts.url);
						p.$dialog.find('[name=status]').text(xhr.status);
						p.$dialog.find('[name=error]').html(''+txtError);
						p.$dialog.find('[name=response]').html(xhr.responseText);
					}
				});
				K.notification({
					text: 'La petici&oacute;n a la p&aacute;gina ' + opts.url + ' ha devuelto el siguiente error: ' + xhr.status + ' - ' + error,
					type: 'error',
					layout: 'topLeft'
				});*/
			}
		});
		$.ajaxSetup({
	      complete: function(){
	        $('#spinner').hide();
	      }
	    });
		$('#spinner').ajaxComplete(function() {
	      clearTimeout(settimewait);
	      $(this).hide();
	    });
	    $('#spinner').ajaxSuccess(function() {
	        $(this).hide();
	    });
        /*
        dialog control!
        */
        $(document).bind('mousedown',function(e){
        	$target = $(e.target);
        	if($target.closest('.ui-dialog').length>0){
				idWinSel = $target.closest('.ui-dialog').find('ui-dialog-content').attr('id');
				$('#'+idWinSel+"_dckbar").attr('checked',false).button( "refresh" );
				$('#'+idWinSel).parent().find('.ui-dialog-titlebar').addClass('ui-state-default').removeClass('ui-widget-header');
        	}else if($target.closest('.dockTab').length>0){
	        	return 0;
        	}else{
				$('.ui-dialog-titlebar').addClass('ui-state-default')
					.removeClass('ui-widget-header');
				$('input[type=checkbox]','#'+K.Desktop.options.dock).attr('checked',false).button( "refresh" );
			}
        });
        /*$(window).jkey('ctrl+alt+q',function(){
			$('#dockMini').click();
		});*/
        /*
        Tooltip
        */
		xOffset = -10; /* x distance from mouse */
		yOffset = 10; /* y distance from mouse */
		$(".vtip").die().live({
			mouseenter: function(e){
				this.t = this.title;
				this.title = ''; 
				this.top = (e.pageY + yOffset); this.left = (e.pageX + xOffset);
				$('body').append( '<p id="vtip" class="ui-state-highlight ui-corner-all">' + this.t + '</p>' );
				$('p#vtip').css("top", this.top+"px").css("left", this.left+"px").fadeIn("fast");
			},
			mouseleave: function(){
				this.title = this.t;
				$("p#vtip").fadeOut("slow").remove();
			},
			mousemove: function(e){
				this.top = (e.pageY + yOffset);
				this.left = (e.pageX + xOffset);
				//Left
		        var left = this.left;
		        var width = $('#vtip').width() + 14;
		        if((left+width)>K.docWidth)
		            left = this.left - width;
		        //Top
		        var top = this.top;
		        var height = $('#vtip').height() + 8;
		        if((top +height )>K.docHeight)
		            top = this.top - height*2;
				$("p#vtip").css("top", top+"px").css("left", left+"px");
			}
		});
		
		this.$desktop         = $('#'+this.options.desktop);
		this.$desktopHeader   = $('#'+this.options.desktopHeader);
		this.$desktopNavBar   = $('#'+this.options.desktopNavBar);
		this.$pageWrapper     = $('#'+this.options.pageWrapper);
		this.$dock            = $('#'+this.options.dock);
		this.$desktopFooter   = $('#'+this.options.desktopFooter);
		this.$pageWrapperMain = $('#'+this.options.pageWrapperMain);
		this.$titleBar		  = $('#'+this.options.titleBar);

		if (this.$desktop) {
			$('body').css({
				overflow: 'hidden',
				height: '100%',
				margin: 0
			});
			$('html').css({
				overflow: 'hidden',
				height: '100%'
			});
		}
		
		this.$desktopNavBar.addClass("ui-state-default");
		$('#titleBar').addClass("ui-datepicker-header ui-widget-header ui-helper-clearfix");
		$('#NavBar ul li').addClass("ui-state-default");
		this.$dock.addClass("ui-accordion-header ui-helper-reset ui-state-default");

		/* This will create buttons for dialogs */
		$('#dockMini').button({
            icons: { primary: "ui-icon-minusthick" },
            text: false
        }).click(function(){
        	$('.ui-dialog').find('.ui-dialog-minimize').click();
        }).addClass('vtip').attr('title','Minimizar todas las ventanas.');
        $('#dockClose').button({
            icons: { primary: "ui-icon-closethick" },
            text: false
        }).click(function(){
        	$('.ui-dialog').find('.ui-dialog-titlebar-close').click();
        }).addClass('vtip').attr('title','Cerrar todas las ventanas.');
		
		this.setDesktopSize();
		this.menuInitialize();
		this.contextMenu();
		
		 $('#pageWrapper').layout({
			 west__size:		200,
			 west__minSize:		170,
			 west__maxSize:		300,
			 west__onresize:	function(){
			 	var width = $('#pageWrapperLeft').width()-2;
			 	$('#pageWrapperLeft').find('.gridHeader li').css({
					'min-width': width+'px',
					'max-width': width+'px'
				});
				$('#pageWrapperLeft').find('.gridBody li').each(function(index){
					var padding = $(this).css('padding-left');
					padding = parseInt(padding.substr(0,padding.length-2));
					if(padding==2)
						$(this).css({
							'min-width': width+'px',
							'max-width': width+'px'
						});
					else
						$(this).css({
							'min-width': (width-padding)+'px',
							'max-width': (width-padding)+'px'
						});
				});
			 }
		 });
		
		 $('#pageWrapperLeft').find('.grid:eq(1)').css("overflow-x","hidden");
		 
		$('#pageWrapperLeft').resize(function(){
			 $('#pageWrapperLeft').find('.grid:eq(1)').height(($('#pageWrapperLeft').height()-$('#pageWrapperLeft').find('.grid:eq(0)').height())+'px');
		}).resize();
		 
		 /* Resize desktop, page wrapper, modal overlay,
		and maximized windows when browser window is resized */
		$(window).resize(function(){
			K.docWidth = $(document).width();
			K.docHeight = $(window).height();
			K.Desktop.setDesktopSize();
		});
		$('#pageWrapperMain').resize(function(){
			K.Desktop.setDesktopSize();
		});
		$('#NavBar').find('.clickMenu').removeClass('clickMenu');;
		$('#K_preload').remove();
		$('#desktop').show();
		return true;
	},
	menuInitialize: function(){
		var $table = $('#desktopTitlebar table');
		var $menUser = $('#menUser');
		K.clickMenu({id: 'NavBar'});
		K.clickMenu({id: 'menUser'});
		$menUser.find('a').css('color','#ffffff');
		$menUser.find('li li').css('background','#000');
		$table.find('td').eq(0).width($table.find('td').eq(2).width()+'px');
		porcent = (($table.width()-($table.find('td').eq(2).width()*2))*100)/$table.width();
		$table.find('td').eq(1).width(porcent+'%');
	},
	setDesktopSize: function(){
		var dockWrapper = $('#'+K.Desktop.options.dockWrapper);

		/* hack for IE browser (assuming that IE is a browser) */
		if (this.$desktop){
			this.$desktop.css('height', $(window).height());
		}

		/* Set pageWrapper height so the dock doesn't cover the pageWrapper scrollbars. */
		if (this.$pageWrapper) {
			//var dockOffset = K.options.dockVisible ? dockWrapper.height() : 0;
			var dockOffset = dockWrapper.height();
			var pageWrapperHeight = $(window).height();
			if (this.$desktopHeader){ pageWrapperHeight -= this.$desktopHeader.height(); }
			if (this.$dockWrapper){ pageWrapperHeight -= this.$dockWrapper.height(); }
			if (this.$desktopFooter){ pageWrapperHeight -= this.$desktopFooter.height(); }
			pageWrapperHeight -= dockOffset;

			if (pageWrapperHeight < 0){
				pageWrapperHeight = 0;
			}
			this.$pageWrapper.height(pageWrapperHeight+'px');
			this.$pageWrapperMain.height((pageWrapperHeight - this.$titleBar.innerHeight() - 4)+'px');
		}
	},
	contextMenu: function(){
		$('body').contextMenu('conMenBody', {
			bindings: {
				'conMenBody_about': function(t) {
					K.about();
				}
			}
		});
	}
};
K.Panel = function(opts){
	var options = $.extend({},{
		id:                 'mainPanel',
		title:              'New Panel',
		container:          'pageWrapperMain',
		position:			'center',
		loadMethod:         null,
		contentURL:         null,

		/* xhr options */
		method:				'post',
		data:               null,
		store:				true,

		/* html options */
		content:            '',

		header:             true,
		headerToolbox:      false,
		headerToolboxURL:   null,
		headerToolboxContent: false,
		headerToolboxOnload: null,

		/* Style options: */
		scrollbars:         true,
		padding:   		    { top: 8, right: 8, bottom: 8, left: 8 },

		/* Events */
		onBeforeBuild:       null,
		onContentLoaded:     null

	},opts);
	if(options.id==null) options.id = 'kpanel'+(panelTot+1);
	if($('#'+options.id).length>0){
		index = $.inArray(options.id,K.instances.panel);
		K.instances.panel.splice(index,1);
	}
	/*if(K.instances.panel.indexOf(options.id)!=-1) return K.notification('Panel instance "'+options.id+'" already declared.','error');*/
	K.instances.panel.push(options.id);
	K.instances.panelTot++;
	
	var $container = $('#'+options.container);
	if(options.container == 'body') $container = $('body');
	
	switch(options.position){
		case 'top':		panelClass = 'ui-layout-north'; break;
		case 'right':	panelClass = 'ui-layout-east'; break;
		case 'left':	panelClass = 'ui-layout-west'; break;
		case 'bottom':	panelClass = 'ui-layout-south'; break;
		case 'center':	panelClass = 'ui-layout-center'; break;
	}
	$panel = $('<div id="'+options.id+'" class="'+panelClass+'"></div>');
	$container.append($panel);
	K.updateContent({
		element: 			options.id,
		loadMethod:			options.loadMethod,
		method: 			options.method,
		data:				options.data,
		content:			options.content,
		url:				options.contentURL,
		store:				options.store,
		require:			options.require,
		onContentLoaded:	options.onContentLoaded
	});
	return this;
};
K.Window = function( opts ){
	if(opts==null) opts = new Object;
	var options = $.extend({},{
		id			: null,
		title		: 'New window',
		height		: 250,
		width		: 300,
		modal		: false,
		header		: true,
		clickClosable: true,
		buttons		: null,
		position	: 'center',
		loadMethod	: null,
		method		: 'post',
		icon		: 'ui-icon-newwin',
		content		: null,
		contentURL	: null,
		data		: null,
		store		: true,
		padding		: { top: 0, right: 0, bottom: 0, left: 0 },
		resizable	: false,
		draggable	: true,
		maximizable 	: false,
		minimizable 	: true,
		onResize	: null,
		onContentLoaded : null,
		onClose		: null,
		maximize	: function(){
			if($('.ui-icon-restore',$titlebar).length > 0){
				$div.dialog( "option", "height", tamanowin[0] ).dialog( "option", "width", tamanowin[1] )
					.dialog( "option", "position", [ positionwin[0] , positionwin[1] ] )
					.dialog( "option", "draggable", true )
					.dialog( "option", "resizable", true );
				$div.height( tamano[0] ).width( tamano[1] );
				$('.ui-icon-restore',$dialog).addClass('ui-icon-max');
				$('.ui-icon-restore',$dialog).removeClass('ui-icon-restore');
				if( typeof(options.onResize) == 'function' ){ options.onResize(); }
			}else{
				tamano = [ $div.height() , $div.width() ];
				tamanowin = [ $div.dialog( "widget" ).height() , $div.dialog( "widget" ).width() ];
				positionwin = [ $div.dialog( "widget" ).position().left , $div.dialog( "widget" ).position().top ];
				$div.dialog( "option", "height", $(window).height() )
					.dialog( "option", "width", $(window).width() )
					.dialog( "option", "position", [ 0 , 0 ] )
					.dialog( "option", "draggable", false )
					.dialog( "option", "resizable", false );
				$('.ui-icon-max',$dialog).addClass('ui-icon-restore');
				$('.ui-icon-max',$dialog).removeClass('ui-icon-max');
				if( typeof(options.onResize) == 'function' ){ options.onResize(); }
			}
		},
		unselected	: function(){
			if($('input[id$=_dckbar]','#'+K.Desktop.options.dock).length>0){
				$('.ui-dialog-titlebar').addClass('ui-state-default')
					.removeClass('ui-widget-header');
				$('input[type=checkbox]','#'+K.Desktop.options.dock).attr('checked',false).button( "refresh" );
			}
		},
		selected	: function(id){
			options.unselected();
			$('#'+id+"_dckbar").attr('checked',true).button( "refresh" );
			
			$.ui.dialog.maxZ++;
			$dialog = $('#'+id).parent().css('z-index',$.ui.dialog.maxZ);
			$dialog.effect("shake", { times:2 }, 200);
			$dialog.find('.ui-dialog-titlebar').removeClass('ui-state-default').addClass('ui-widget-header');
		},
		/*
		This makes to dockbar bigger or smaller according the number of windows
		*/
		resizeDock	: function(){
			var $divs = $('div','#'+K.Desktop.options.dock);
			var width = $('#'+K.Desktop.options.dock).width();
			var width_total = 0;
			for(i = 0; i < $divs.length; i++){
				width_total = width_total + $divs.eq(i).outerWidth();
			}
			if(width_total > width){
				filas = parseInt((width_total / width));
				if(filas>0){
					filas++;
					$('#'+K.Desktop.options.dock).height((30*filas)+'px');
				}
			}else
				$('#'+K.Desktop.options.dock).height('30px');
			$(window).resize();
		}
	}, opts);
	K.instances.windowTot++;
	if(opts.id==null){
		opts.id = 'windowKUI'+K.instances.windowTot;
		options.id = 'windowKUI'+K.instances.windowTot;
	}
	$dock = $('#'+K.Desktop.options.dock);
	
	if($('#'+opts.id).length>0){ options.selected(opts.id); return false; }
	options.unselected();
	
	$('body').append( "<div id='" + options.id  +"' title='"  +options.title + "'></div>");
	
	var $div = $('#'+options.id);
	/**********************************/
	var tamano = [ options.height , options.width ];
	var tamanowin = [ options.height , options.width ];
	var positionwin = [ 0 , 0 ];
	
	if(options.buttons != null){
		var tmp_buttons = {};
		$.each(options.buttons, function(id, func) {
			/*$footer.append('<button type="button" class="btn btn-default">'+id+'</button>')
				.find('button:last').click(function(){ func(); });*/
			if($.type(func)=='function'){
				tmp_buttons[id] = func;
			}else{
				tmp_buttons[id] = func.f;
			}
		});
		options.buttons = tmp_buttons;
	}else{
		options.buttons = null;
	}
	
	$div.dialog({
		height		: options.height,
		width		: options.width,
		modal		: options.modal,
		position	: options.position,
		resizable	: options.resizable,
		draggable	: options.draggable,
		buttons		: options.buttons,
		focus		: function(){
			$('.ui-dialog-titlebar').addClass('ui-state-default').removeClass('ui-widget-header');
			$('input[type=checkbox]','#'+K.Desktop.options.dock).attr('checked',false).button( "refresh" );
			$('#'+options.id+"_dckbar").attr('checked',true).button( "refresh" );
			$('#'+options.id).parent().find('.ui-dialog-titlebar').removeClass('ui-state-default').addClass('ui-widget-header');
		},
		resize		: function(){
			/*if( options.loadMethod == 'iframe' ){ resizeIframe( options.id ); }*/
			if( typeof(options.onResize) == 'function' ){ options.onResize(); }
		},
		open		: function(){
			$dialog = $div.parent();
			$titlebar = $dialog.find('.ui-dialog-titlebar');
			if(!options.header){
				$titlebar.hide();
				if(options.clickClosable) $('#'+options.id).click(function(){ K.closeWindow(options.id); });
				$('.ui-widget-overlay').click(function(){ K.closeWindow(options.id); });
			}else{
				var tmpSp = $titlebar.find('span:first').html();
				$titlebar.find('span:first').html("<span class='ui-icon "+options.icon+"'></span>"+tmpSp);
			}
			
			$div.width('100%').height('100%')
				.css('padding',options.padding.top+'px '+options.padding.right+'px '+options.padding.bottom+'px '+options.padding.left+'px');
			if(!options.modal){
				$(window).resize(function() {
					if($titlebar.find('.ui-icon-restore').length > 0){
						$div.dialog( "option", "height", $(window).height() )
							.dialog( "option", "width", $(window).width() )
							.dialog( "option", "position", [ 0 , 0 ] )
							.dialog( "option", "draggable", false )
							.dialog( "option", "resizable", false );
						if( typeof(options.onResize) == 'function' ){ options.onResize(); }
					}
				});
				if(options.maximizable){
					if($('#ui-dialog-title-'+options.id).length>0) $('#ui-dialog-title-'+options.id).after('<a href="#" class="ui-dialog-maximize ui-corner-all ui-dialog-titlebar-max"><span class="ui-icon ui-icon-max"></span></a>');
					else $div.dialog('widget').find('.ui-dialog-title').after('<a href="#" class="ui-dialog-maximize ui-corner-all ui-dialog-titlebar-max"><span class="ui-icon ui-icon-max"></span></a>');
					$div.dialog('widget').find('.ui-dialog-maximize',$titlebar).hover(function(){
						$(this).addClass('ui-state-hover');
					},function(){
						$(this).removeClass('ui-state-hover');
					}).click(function(){ options.maximize(); });
					$titlebar.dblclick(function(){ options.maximize(); });
				}
				/* If you're here > you have a very big problem diptongo */
				if(options.minimizable){
					if($('#ui-dialog-title-'+options.id).length>0) $('#ui-dialog-title-'+options.id).after('<a href="#" class="ui-dialog-minimize ui-corner-all ui-dialog-titlebar-min"><span class="ui-icon ui-icon-minusthick"></span></a>');
					else $div.dialog('widget').find('.ui-dialog-title').after('<a href="#" class="ui-dialog-minimize ui-corner-all ui-dialog-titlebar-min"><span class="ui-icon ui-icon-minusthick"></span></a>');
					$titlebar.find('.ui-dialog-minimize').hover(function(){
						$(this).addClass('ui-state-hover');
					}, function(){
						$(this).removeClass('ui-state-hover');
					}).click(function(){
						$('#'+options.id+"_dckbar").attr('checked',false).button( "refresh" );
						$('#'+options.id).parent().hide();
					});
					if(!options.maximizable) $titlebar.find('.ui-dialog-minimize').css('right','20px');
				}
			}
			
			K.updateContent({
				element:		options.id,
				method:			options.method,
				data:			options.data,
				content:		options.content,
				loadMethod:		options.loadMethod,
				url:			options.contentURL,
				store:			options.store,
				onContentLoaded: function(){
					$div.css('position','relative').width(options.width+'px').height(options.height+'px');
					$div.dialog('widget').css('box-shadow','2px 2px 5px #999').contextMenu('conMenWindows', {
						onShowMenu: function(e, menu) {
							if(options.maximizable==false){
								$('#conMenWindows_Res, #conMenWindows_Max', menu).remove();
							}else{
								if($('.ui-icon-restore',$titlebar).length > 0){
									$('#conMenWindows_Max', menu).remove();
								}else{
									$('#conMenWindows_Res', menu).remove();
								}
							}
							if(options.minimizable==false){
								$('#conMenWindows_Min', menu).remove();
							}
							$('#conMenWindows_about', menu).remove();
							$(menu).css('z-index',(parseInt($.ui.dialog.maxZ)+1));
							return menu;
						},
						bindings: {
							'conMenWindows_Min': function(t) {
								K.minimizeWindow(opts.id);
							},
							'conMenWindows_Res': function(t) {
								K.restaureWindow(opts.id);
							},
							'conMenWindows_Max': function(t) {
								K.maximizeWindow(opts.id);
							},
							'conMenWindows_Cer': function(t) {
								K.closeWindow(opts.id);
							},
							'conMenWindows_about': function(t) {
								K.about();
							}
						}
					});
					if($.isFunction(options.onContentLoaded)) options.onContentLoaded();
				}
			});
		},
		close		: function(){
			if( typeof(options.onClose) == 'function' ){
				options.onClose();
			}
			
			$div.dialog('destroy').remove();
			$('#'+options.id+"_dckbar").button('destroy');
			$('#'+options.id+"_dockTab").remove();
			
			options.resizeDock();
		}
	});

	if(!options.modal){
	    if(options.title.indexOf('&',0)>12){
	    	if(options.title.length>27) options.tmptitle = options.title.substring(0, (options.title.indexOf('&',0)+8))+'...';
	    	else options.tmptitle = options.title;
	    }else{
	    	if(options.title.length>20) options.tmptitle = options.title.substring(0, 20)+'...';
	    	else options.tmptitle = options.title;
		}
		var dckbar = "<div id='"+options.id+"_dockTab' class='dockTab'><input type='checkbox' id='"+options.id+"_dckbar' /><label for='"+options.id+"_dckbar' class='vtip' title='"+options.title+"'>"+options.tmptitle+"</label><div>";
		$dock.append(dckbar);
		
		$('#'+options.id+"_dckbar").change(function(){
			$dialog = $('#'+options.id).dialog('widget');
			/* "$.ui.dialog.maxZ" is the global variable for z-index of all dialogs */
			$dialog.css('z-index',(parseInt($.ui.dialog.maxZ)+1));
			$.ui.dialog.maxZ = parseInt($.ui.dialog.maxZ)+1;
			
			if($dialog.css('display')!='none'){
				if($dialog.find('.ui-dialog-titlebar').hasClass('ui-widget-header')) $dialog.hide();
				else{
					options.unselected();
					$('#'+options.id+"_dckbar").attr('checked',true).button( "refresh" );
					$dialog.find('.ui-dialog-titlebar').removeClass('ui-state-default').addClass('ui-widget-header');
					$dialog.effect("shake", { times:1 }, 200);
				}
			}else{
				options.unselected();
				
				$('#'+options.id+"_dckbar").attr('checked',true).button( "refresh" );
				
				if( $dialog.css('display') == 'block' ) $dialog.effect("shake", { times:1 }, 200);
				else $dialog.show();
				$dialog.find('.ui-dialog-titlebar').removeClass('ui-state-default').addClass('ui-widget-header');
			}
		}).button().attr('checked',true).button('refresh');
		var tmpSp = $('#'+options.id+'_dockTab').find('span').html();
		$('#'+options.id+'_dockTab').find('span').html("<span class='ui-icon "+options.icon+"'></span>"+tmpSp);
		
		options.resizeDock();
	}
	return this;
};
$.extend(K,{
	menu: function(p){
		p.$men = $('<ul>');
		for(var i=0; i<p.items.length; i++){
			p.$men.append('<li><a i="'+i+'"><span class="ui-icon '+p.items[i].icon+'"></span>'+p.items[i].lab+'</a></li>');
			p.$men.find('a:last').mouseup(function(){
				p.items[$(this).attr('i')].click();
			});
		}
		p.$men.css({
			zIndex: $.ui.dialog.maxZ,
			position: 'absolute',
			top: p.top,
			left: p.left
		}).menu();
		$('body').append(p.$men);
		$('body').one('mouseup',function(){
			p.$men.remove();
		});
	}
});
/*
 * 
 * IMPLEMENTACIÓN MVC EN JS
 * 
*/
/*$.extend(K,{
	model: function(p){
		this.url = p.url;
		this.get = function(id){
			if(id==null){
				return K.notification({title: ciHelper.titleMessages.dbReq,text: 'Envio de ID inv&aacute;lido!',type: 'error'});
			}
			return $.getJSON(this.url+'/get','id='+id);
		};
		this.lista = function(p){
			if(p==null || p.page==null){
				p = {page: 1};
			}
			p.page_rows = 20;
			return $.getJSON(this.url+'/lista',p);
		};
		this.search = function(p){
			if(p==null || p.page==null){
				p = {page: 1,texto: ''};
			}
			if(p.texto==null) p.texto = "";
			p.page_rows = 20;
			return $.getJSON(this.url+'/search',p);
		};
	}
});*/
$.extend(K,{
	model: function(url, func){
		// The model constructor.
		var model = function(attrs) {
			self = this;
			self.attrs = attrs;
		};
		model.prototype.url = url;
		model.prototype.extend = function(cb){
			cb(self);
		};
		model.prototype.get = function(attr){
			return self.attrs[attr];
		};
		model.prototype.set = function(attr,value){
			self.attrs[attr] = value;
			return true;
		};
		model.prototype.save = function(act){
			if(self.validate!=null){
				for(var i=0; i<self.validate.length; i++){
					if(self.attrs[self.validate[i].name]==null || self.attrs[self.validate[i].name]==''){
						self.validate[i].action();
						return K.notification({title: ciHelper.titleMessages.infoReq,text: self.validate[i].message,type: 'error'});
					}
				}
			}
			act.before();
			console.log(self.attrs);
			return act.done();
			
			$.post(self.url+'/save',self.attrs,function(data){
				//
			},'json');
		};
		model.prototype.sync = function(cb){
			$.post(self.url+'/get','id='+self.attrs._id,function(data){
				self.attrs = data;
				cb();
			},'json');
		};
		//if (Model.Utils.isFunction(func)) func.call(model, model, model.prototype)
		return model;
	}
});
$.extend(K,{
	loadMode: function(p){
		//K.selectMenu({id: p.mode});
		$.cookie('mode', p.mode);
		$.cookie('action', p.action);
		//$('#pageWrapperLeft .ui-state-highlight').removeClass('ui-state-highlight');
		//$('#pageWrapperLeft').find('[name='+p.action+']').find('ul').addClass('ui-state-highlight');
		$('#mainPanel').empty();
		/*if(p.message==null) K.block({$element: $('#pageWrapperMain')});
		else K.block({$element: $('#pageWrapperMain'),message: p.message});*/
		//K.TitleBar(p.titleBar);
		K.updateContent({
			element: 'mainPanel',
			mode: 'xhr',
			url: p.url,
			store: (p.store!=null)?p.store:true,
			onContentLoaded: p.onContentLoaded
		});
	}
});
K.grid = function(p){
	if(p==null) return false;
	p.$content = '<div name="grid" class="fuelux table-responsive">'+
	    '<table name="grid" style="width:100%;min-width:100%;" class="table table-bordered table-hover datagrid table-fixed-header">'+
	    	'<thead class="table-header">'+
	    		'<tr>'+
	    			'<th>'+
	    				'<span class="datagrid-header-title"></span>'+
	    				'<div class="row">'+
	    					'<div class="col-md-8 datagrid-header-left">'+
					    	'</div>'+
					    	'<div class="col-md-4 datagrid-header-right">'+
		    					'<div class="input-group search">'+
							      	'<input type="text" placeholder="Buscar" class="form-control">'+
							      	'<span class="input-group-btn">'+
							        	'<button class="btn btn-info" type="button">Buscar!</button>'+
							      	'</span>'+
							      	'<span class="input-group-btn">'+
							        	'<button class="btn btn-default" type="button">Limpiar</button>'+
							      	'</span>'+
							    '</div>'+
		    				'</div>'+
	    				'</div>'+
	    			'</th>'+
	    		'</tr>'+
	    	'</thead>'+
	    	'<tfoot>'+
	    		'<tr>'+
	    			'<th class="row">'+
	    				'<div class="col-md-6 datagrid-footer-left" style="display:none;">'+
	    					'<div class="grid-controls">'+
	    						'<span><span class="grid-start"></span> - <span class="grid-end"></span> de <span class="grid-count"></span></span>'+
	    						'<select class="grid-pagesize input-small"><option value="25">25</option><option value="50">50</option><option value="75">75</option><option value="100">100</option></select>'+
	    						'<span class="hidden-phone">Por P&aacute;gina</span>'+
	    					'</div>'+
	    				'</div>'+
	    				'<div class="col-md-6 datagrid-footer-right" style="display:none;">'+
	    					'<div class="grid-pager">'+
	    						'<button class="btn btn-danger btn-xs grid-prevpage"><i class="fa fa-chevron-left"></i></button>'+
	    						'<span class="hidden-phone">P&aacute;gina</span>'+
	    						'<select class="grid-pages-all input-small"></select>'+
	    						'<span class="hidden-phone">de <span class="grid-pages"></span></span>'+
	    						'<button class="btn btn-danger btn-xs grid-nextpage"><i class="fa fa-chevron-right"></i></button>'+
	    					'</div>'+
	    				'</div>'+
	    			'</th>'+
	    		'</tr>'+
	    	'</tfoot>'+
	    '</table>'+
	'</div>';
	if(p.$el==null)
		p.$el = $('#mainPanel');
	p.$el.empty().append(p.$content);
	p.$el.find('tbody').remove();
	if(p.pagination==null) p.pagination = true;
	if(p.stopLoad==null) stopLoad = false;
	if(p.search==null) p.search = true;
	if(p.headfixed==null) p.headfixed = true;
	if(p.params==null) p.params = {};
	p.$thead = p.$el.find('thead');
	p.$theadset = p.$el.find('.datagrid-header-left');
	p.$tfoot = p.$el.find('tfoot');
	p.$footer = p.$el.find('tfoot th');
	p.$footerchildren = p.$footer.children().show().css('visibility', 'hidden');
	p.$topheader = p.$el.find('thead th');
	p.$searchcontrol = p.$el.find('.search');
	/*this.$filtercontrol = this.$element.find('.filter');*/
	p.$pagesize = p.$el.find('.grid-pagesize');
	p.$pagedropdown = p.$el.find('.grid-pages-all');
	p.$prevpagebtn = p.$el.find('.grid-prevpage');
	p.$nextpagebtn = p.$el.find('.grid-nextpage');
	p.$pageslabel = p.$el.find('.grid-pages');
	p.$countlabel = p.$el.find('.grid-count');
	p.$startlabel = p.$el.find('.grid-start');
	p.$endlabel = p.$el.find('.grid-end');
	p.$tbody = $('<tbody style="height: '+p.$height+'px; overflow: auto">').insertAfter(p.$thead);
	if(p.$thead.find('tr').length>1)
		p.$thead.find('tr:last').remove();
	p.$colheader = $('<tr>').appendTo(p.$thead);
	p.$footer.attr('colspan', p.cols.length);
	p.$topheader.attr('colspan', p.cols.length);

	var colHTML = '';
	$.each(p.cols, function (index, column) {
		if($.type(column)=='string')
			colHTML += '<th style="text-align:center;">' + column + '</th>';
		else{
			if(column.width!=null) width=' width="'+column.width+'px"';
			else width = "";
			if(column.n!=null)
				descr = column.n;
			if(column.descr!=null)
				descr = column.descr;
			if(column.f!=null){
				sort = ' class="grid-sort" data-sort="'+column.f+'"';
			}else sort = "";
			colHTML += '<th style="text-align:center;"'+width+sort+'>' + descr + '</th>';
		}
	});
	p.$colheader.empty().append(colHTML);
	if(p.toolbarURL!=null||p.toolbarHTML!=null){
		if(p.toolbarURL!=null){
			$.post(p.toolbarURL,function(html){
				p.$theadset.empty().append(html);
				if($.isFunction(p.onContentLoaded))
					p.onContentLoaded(p.$theadset);
			});
		}else{
			p.$theadset.empty().append(p.toolbarHTML);
			if($.isFunction(p.onContentLoaded))
				p.onContentLoaded(p.$theadset);
		}
	}
	if(p.headfixed){
		var headHTML = '<table id="table-fixed" style="position:fixed;top:0;width:'+(p.$el.find('.fuelux').width()-15)+'px;z-index:2000;display:none;" class="table table-bordered table-hover datagrid table-fixed-header"><thead>'+colHTML+'</thead></table>';		
		/*$('#mainPanel .fuelux')//.empty()
			.prepend(headHTML);*/
		p.$el.find('.fuelux')//.empty()
			.prepend(headHTML);
		$('section').scroll(function(){
			var sc = window.pageYOffset; 
			if(sc>p.$thead.find('tr').eq(1).position().top){
				$('#table-fixed').show();
			}else{
				$('#table-fixed').hide();
			}
		});
	}
	$.extend(p,{
		updatePageDropdown: function(data){
			if(data==null){
				K.notification({
					title: 'Items no encontrados',
					text: 'No hay items para la b&uacute;squeda seleccionada!',
					type: 'error'
				});
				return false;
			}else{
				if(parseInt(data.total_items)==0){
					K.notification({
						title: 'Items no encontrados',
						text: 'No hay items para la b&uacute;squeda seleccionada!',
						type: 'error'
					});
					return false;
				}
			}	
			p.$pagedropdown.empty();
			var pageHTML = '';
			for (var i = 1; i <= data.total_pages; i++) {
				pageHTML += '<option value="'+i+'">' + i + '</option>';
			}
			p.$pagedropdown.html(pageHTML);
			p.$pagedropdown.find('option[value='+data.page+']').attr('selected','selected');
			p.$pageslabel.text(data.total_pages);
			p.$countlabel.html(data.total_items + ' ' + p.itemdescr);
			var ini = 1 + (data.page-1)*data.items_page;
			p.$startlabel.text(ini);
			p.$endlabel.text(ini+parseInt(data.total_page_items)-1);
		
			p.$prevpagebtn.removeAttr('disabled')
				.button('enable',true);
			p.$nextpagebtn.removeAttr('disabled')
				.button('enable',true);
			if(parseInt(data.page)==1){
				p.$prevpagebtn.attr('disabled',"disabled")
					.button('disable',true);
			}
			if(parseInt(data.page)==parseInt(data.total_pages)){
				p.$nextpagebtn.attr('disabled',"disabled")
					.button('disable',true);
			}
		},
		renderData: function(page){
			if($.isFunction(p.checkRender)){
				if(p.checkRender(p.$theadset)==false) return p;
			}
			if(p.pagination==true){
				$.extend(p.params,{
					page_rows: p.$pagesize.find('option:selected').val(),
					page: (page) ? page : (p.$pagedropdown.find('option:selected').val()?p.$pagedropdown.find('option:selected').val():1)
				});
			}
			if(p.search==true){
				$.extend(p.params,{
					texto: p.$searchcontrol.find('input').val()
				});
			}
			if(p.$colheader.find('.grid-sort-true').length!=0){
				$.extend(p.params,{
					sort: p.$colheader.find('.grid-sort-true').attr('data-sort'),
					sort_i: p.$colheader.find('.grid-sort-true').attr('data-sort-i')
				});
			}
			p.$tbody.empty();
			if($.isFunction(p.onLoading)){
				p.onLoading();
			}
			$.jStorage.set('grid-'+p.data,p.params);
			$.post(p.data,p.params,function(data){
				if(p.pagination==true){
					if(data.paging!=null){
						p.$footerchildren.css('visibility', function () {
							return (data.paging.total_items > 0) ? 'visible' : 'hidden';
						});
						p.updatePageDropdown(data.paging);
					}
				}
				if($.isFunction(p.fill)){
					if(data.paging!=null){
						if(data.items!=null)
							for(var i=0,j=data.items.length; i<j; i++){
								p.$tbody.append(p.fill(data.items[i],$('<tr class="item">'),data));
								ciHelper.gridButtons(p.$tbody);
							}
					}else{
						if(data!=null){
							if(data.items!=null){
								for(var i=0,j=data.items.length; i<j; i++){
									p.$tbody.append(p.fill(data.items[i],$('<tr class="item">'),data));
								}
							}else
								p.fill(data,p.$tbody,data);
						}
					}
				}else p.load(data,p.$tbody);
				//K.resetModals();
				p.$tbody.closest('table').styleTable();
				if($.isFunction(p.onComplete)){
					p.onComplete();
				}
			},'json');
		},
		reinit: function(newP){
			$.extend(p,newP);
			p.renderData();
		}
	});
	if(p.pagination==true){
		p.$prevpagebtn.click(function(){
			var val = parseInt(p.$pagedropdown.find('option:selected').val());
			p.$pagedropdown.find('option[value='+(val--)+']').attr('selected','selected');
			p.renderData(val);
		}).button({icons: {primary: 'ui-icon-triangle-1-w'},text: false});
		p.$nextpagebtn.click(function(){
			var val = parseInt(p.$pagedropdown.find('option:selected').val());
			p.$pagedropdown.find('option:selected').removeAttr('selected');
			p.$pagedropdown.find('option[value='+(val++)+']').attr('selected','selected');
			p.renderData(val);
		}).button({icons: {primary: 'ui-icon-triangle-1-e'},text: false});
		p.$pagesize.unbind('change').change(function(){ p.renderData(); });
		p.$pagedropdown.unbind('change').change(function(){ p.renderData(); });
	}else{
		p.$tfoot.remove();
	}
	if(p.search==true){
		p.$searchcontrol.find('input').unbind('keyup').keyup(function(e){
			if(e.keyCode == 13) p.$searchcontrol.find('button:eq(0)').click();
		});
		p.$searchcontrol.find('button:eq(0)').unbind('click').click(function(){
			p.renderData(1);
		});
		p.$searchcontrol.find('button:eq(1)').unbind('click').click(function(){
			p.$searchcontrol.find('input').val('');
			p.renderData(1);
		});
		p.$searchcontrol.find('button:eq(0)').button({icons: {primary: 'ui-icon-search'},text: false});
		p.$searchcontrol.find('button:eq(1)').button({icons: {primary: 'ui-icon-trash'},text: false});
	}else{
		p.$searchcontrol.remove();
	}
	p.$colheader.find('.grid-sort').unbind('click').bind('click',function(){
		if($(this).hasClass('grid-sort-true')){
			$(this).attr('data-sort-i',-parseFloat($(this).attr('data-sort-i')));
			if($(this).find('.ui-icon-triangle-1-s').length==0){
				p.$colheader.find('.ui-icon').remove();
				$(this).append('<span class="ui-icon ui-icon-triangle-1-s"></span>');
			}else{
				p.$colheader.find('.ui-icon').remove();
				$(this).append('<span class="ui-icon ui-icon-triangle-1-n"></span>');
			}
		}else{
			p.$colheader.find('.ui-icon').remove();
			p.$colheader.find('.grid-sort-true').removeClass('grid-sort-true');
			$(this).addClass('grid-sort-true');
			$(this).attr('data-sort-i',1);
			$(this).append('<span class="ui-icon ui-icon-triangle-1-n"></span>');
		}
		p.renderData(1);
	});
	if(p.onlyHtml!=null){
		if(p.onlyHtml==true){
			p.$el.find('table').styleTable();
			return p;
		}
	}
	if(p.stopLoad==true){
		if($.isFunction(p.afterLoad)){
			p.afterLoad(p);
			return p;
		}
		if($.isFunction(p.onComplete)){
			p.onComplete();
		}
		return p;
	}else{
		if(p.forget==null){
			var pregrid = $.jStorage.get('grid-'+p.data);
			if(pregrid!=null){
				if(pregrid.texto!=null){
					if(pregrid.texto!='')
						p.$searchcontrol.find('input').val(pregrid.texto);
				}
				if(typeof pregrid.page != 'undefined'){
					if(parseInt(pregrid.page)!=1){
						p.$tfoot.find('.grid-pages-all').selectVal(""+pregrid.page);
					}
				}
				if(typeof pregrid.page_rows != 'undefined')
					if(parseInt(pregrid.page_rows)!=20)
						p.$tfoot.find('.grid-pagesize').selectVal(pregrid.page_rows);
				//
			}
		}
		if($.isFunction(p.storeParam)){
			p.storeParam(pregrid,p);
		}else{
			//p.$tbody.css({height:$(window).height()-p.$thead.height()-p.$tfoot.height()-$('#titleBar').height()-$('#dock').height()-10});
			if(p.forget==null)
				if(pregrid==null)
					p.renderData();
				else
					p.renderData(pregrid.page);
			else
				p.renderData();
		}
		return p;
	}
};
K.nn = function(title, content, img_uri){
	if(img_uri==null) img_uri = 'images/logo.jpg';
	function checkPermission(){
		if(window.webkitNotifications && window.webkitNotifications.checkPermission() == 0){
			return true;
		}else if(Notification && Notification.permission == 'granted'){
			return true;
		}
		return false;
	}
	
	function requestPermission(){
		//pedimos permiso para mostrar notificaciones
		if(window.webkitNotifications && window.webkitNotifications.checkPermission() != 0){//Chrome
			window.webkitNotifications.requestPermission();
		}else if(Notification && Notification.permission != 'granted'){//Firefox
			Notification.requestPermission();
		}
	}
	//Con estas tres funciones podemos crear un enlace con id="activar" y crear un evento para él:
	if(!checkPermission()){
		requestPermission();
	}
	if(window.webkitNotifications && checkPermission()){
		var notification = window.webkitNotifications.createNotification(
			img_uri,
			title,
			content
		);
		return notification;
	}else if(Notification && checkPermission()){
		return new Notification( title,
		{
			body: content,
			//iconUrl: img_uri
			icon: img_uri
		});
	}
};
K.nn('Notificaciones','Sistema conectado!');