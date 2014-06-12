/*!
 * author:guyue
 * contacts:baidu hi->guyuebupt
 * see https://github.com/YueGuBUPT/tinyDialog
 */
;(function($,document,window){
	var defaultOptions = {
			title:'消息',
			content:'',
			width:200,
			height:150,
			mask:true,
			closeX:false,
			autoShow:true,
			clickCloseX:function(){},
			init:function(){},
			warpperCssClass:'tinyDialog_wrapper',
			titleCssClass:'tinyDialog_title',
			contentOuterCssClass:'tinyDialog_content_outer',
			contentCssClass:'tinyDialog_content',
			buttonsAreaCssClass:'tinyDialog_buttons_area',
			buttonCssClass:'tinyDialog_button',
			otherTypeButtonCssClassPrefix:'tinyDialog_button_',
			lastButtonCssClass:'tinyDialog_last_button',
			closeXCssClass:'tinyDialog_close_x',
			buttons:[
				{
					'value':'确定'
				}
			]
		},
		otherOptions = {
			maskCssClass:'tinyDialog_mask'
		},
		$body = $('body'),
		$document = $(document),
		$window = $(window),
		$mask,
		maskUserCount = 0,
		ua = navigator.userAgent,
		isIE6 = /msie 6/i.test(ua),
		isIOS = /iphone|ipod|ipad/i.test(ua),
		// isAndorid = /andorid/i.test(ua),
		polyfilledOuterWidthHeight = false

	// polyfill outerWidth\outerHeight for Zepto
	// see https://gist.github.com/pamelafox/1379704#file-zepto-extras-js-L64
	if(!$.fn.outerWidth || !$.fn.outerHeight){
		polyfilledOuterWidthHeight = true
		$.each(['width', 'height'],function(j,dimension){
			var offset
				,_dimension
			_dimension = dimension.replace(/./,function(m){
				return m[0].toUpperCase()
			})
			$.fn['outer' + _dimension] = function(margin){
				var elem = this
				if (elem) {
					var size = elem[dimension]()
						,sides
					sides = {
						'width': ['left', 'right'],
						'height': ['top', 'bottom']
					}
					$.each(sides[dimension],function(k,side){
						if(margin){
							size += parseInt(elem.css('margin-' + side),10)
						}
					})
					return size
				}else{
					return null
				}
			}
		})
	}

	function position(tinyDialog){
		var self = tinyDialog,
			self$ = self.$,
			left,
			top
		if(self$){
			// When use Zepto & old version jQuery. it can not return `outerWidth` & `outerHeight` When element not show (display:none)
			// see http://www.dewen.org/q/3610/%E5%A6%82%E4%BD%95%E7%94%A8+Jquery+%E8%8E%B7%E5%8F%96%E9%9A%90%E8%97%8F%E5%85%83%E7%B4%A0%E7%9A%84%E5%AE%BD%E5%BA%A6%E5%B1%9E%E6%80%A7
			// see https://github.com/jquery/jquery/blob/master/src/css.js#L30
			// No need to run when use with jQuery (when polyfilledOuterWidthHeight === false)
			if(!self.isShow && polyfilledOuterWidthHeight){
				self$.css({
					position:'absolute',
					// _position:'absolute',
					visibility:'hidden',
					display:'block'
				})
			}
			left = ($window.width()-self$.outerWidth(true))/2,
			top = ($window.height()-self$.outerHeight(true))/(1+1.61803398875)
			if(isIE6){
				self$.css({
					'left':document.documentElement.scrollLeft + left,
					'top':document.documentElement.scrollTop + top
				})
			}else{
				self$.css({
					'left':left,
					'top':top
				})
			}
			if(!self.isShow && polyfilledOuterWidthHeight){
				self$.css({
					position:'fixed',
					// _position:'absolute',
					visibility:'visible',
					display:'none'
				})
			}
		}
	}
	function setMaskWH(){
		if($mask && $mask.css('display') != 'none'){
			$mask.css({
				width:$document.width(),
				height:$document.height()
			})
		}
		setTimeout(setMaskWH,500) // When document's height\width's change, it need call setMaskWH
	}

	function TinyDialog(options){
		var tmp,
			$tmpButton,
			self = this,
			buttonsCount
		if($.isPlainObject(options)){
			$.each(defaultOptions,function(k,v){
				if(defaultOptions.hasOwnProperty(k) && (!options.hasOwnProperty(k) || (typeof(options[k]) != typeof(defaultOptions[k])))){
					options[k] = v
				}
			})
		}else{
			options = defaultOptions
		}
		$.each(options,function(k,v){
			self[k] = v
		})
		self.isShow = false
		self.$ = $(document.createElement('DIV')).addClass(self.warpperCssClass).css({
			'width':self.width,
			'height':self.height
		})
		self.$title = $(document.createElement('DIV')).addClass(self.titleCssClass).html(self.title).appendTo(self.$)
		self.$contentOuter = $(document.createElement('DIV')).addClass(self.contentOuterCssClass).appendTo(self.$)
		self.$content = $(document.createElement('DIV')).addClass(self.contentCssClass).html(self.content).appendTo(self.$contentOuter)
		tmp = []
		buttonsCount = self.buttons.length
		$.each(self.buttons,function(i,e){
			$tmpButton = $(document.createElement('DIV')).addClass(self.buttonCssClass).text(e.value).on('click',function(event){
				if(e.click && typeof(e.click) == 'function'){
					if(e.click.call(this,event,self) !== false){
						self.hide()
					}
				}else{
					self.hide()
				}
			})
			if(buttonsCount == (i+1)){
				$tmpButton.addClass(self.lastButtonCssClass)
			}
			if(e.type){
				$tmpButton.addClass(self.otherTypeButtonCssClassPrefix+e.type)
			}
			tmp.push($tmpButton)
		})
		self.$buttonsArea = $(document.createElement('DIV')).addClass(self.buttonsAreaCssClass)
		self.$buttonsArea.append.apply(self.$buttonsArea,tmp).appendTo(self.$)
		if(self.closeX){
			self.$closeX = $(document.createElement('DIV')).addClass(self.closeXCssClass).appendTo(self.$)
			self.$closeX.on('click',function(event){
				if(self.clickCloseX && typeof(self.clickCloseX) == 'function'){
					if(self.clickCloseX.call(this,event,self) !== false){
						self.hide()
					}
				}else{
					self.hide()
				}
			})
		}
		self.$.appendTo($body)
		position(self)
		$window.on('resize',function(){
			position(self)
		})
		if(isIE6){
			$window.on('scroll',function(){
				position(self)
			})
		}
		if(self.init && typeof(self.init) == 'function'){
			self.init.call(self)
		}
		if(self.autoShow){
			self.show()
		}
	}
	TinyDialog.prototype.show = function(){
		if(!this.isShow && this.$){
			if(this.mask){
				if($mask){
					$mask.css('display','block') // replace `$mask.show()` , zepto fx_methods will add `opacity:1` in .show() method ,see https://github.com/madrobby/zepto/blob/master/src/fx_methods.js#L26
				}else{
					$mask = $(document.createElement('DIV')).addClass(otherOptions.maskCssClass)
					if(isIE6 || isIOS){
						$mask.css('position','absolute')
						setMaskWH()
					}
					$mask.appendTo($body)
				}
				maskUserCount++
			}
			this.$.show()
			this.isShow = true
		}
	}

	TinyDialog.prototype.hide = function(){
		if(this.isShow){
			this.isShow = false
			if(this.mask){
				maskUserCount--
				if($mask && maskUserCount == 0){
					$mask.hide()
				}
			}
			if(this.$){
				this.$.hide()
			}
		}
	}
	TinyDialog.prototype.remove = function(){
		this.hide()
		this.$.remove()
	}

	function out(options){
		return new TinyDialog(options)
	}
	out.config = {
		defaultOptions:defaultOptions,
		otherOptions:otherOptions
	}
	out.alert = function(msg,okFunction,options,noRemoveWhenClose){
		return new TinyDialog($.extend({
			content:msg,
			buttons:[
				{
					'value':'确定',
					'click':function(e,tinyDialogObjectInstance){
						okFunction.call(this,e,tinyDialogObjectInstance)
						if(!noRemoveWhenClose){
							tinyDialogObjectInstance.remove()
						}
					}
				}
			]
		},options))
	}
	out.confirm = function(msg,okFunction,cancelFunction,options,noRemoveWhenClose){
		return new TinyDialog($.extend({
			content:msg,
			buttons:[
				{
					'value':'确定',
					'click':function(e,tinyDialogObjectInstance){
						okFunction.call(this,e,tinyDialogObjectInstance)
						if(!noRemoveWhenClose){
							tinyDialogObjectInstance.remove()
						}
					}
				},
				{
					'value':'取消',
					'type':'secondary',
					'click':function(e,tinyDialogObjectInstance){
						cancelFunction.call(this,e,tinyDialogObjectInstance)
						if(!noRemoveWhenClose){
							tinyDialogObjectInstance.remove()
						}
					}
				}
			]
		},options))
	}
	out.prompt = function(msg,defaultPrompt,okFunction,cancelFunction,options,noRemoveWhenClose){
		var inputClass = 'tinyDialog_prompt_input'
		return new TinyDialog($.extend({
			content:['<div style="margin-bottom:5px">',msg,'</div><div><input class="',inputClass,'" style="width:175px;padding:6px 4px" value="',defaultPrompt,'"/></div>'].join(''),
			buttons:[
				{
					'value':'确定',
					'click':function(e,tinyDialogObjectInstance){
						okFunction.call(this,e,tinyDialogObjectInstance,tinyDialogObjectInstance.$content.find('input.'+inputClass).val())
						if(!noRemoveWhenClose){
							tinyDialogObjectInstance.remove()
						}
					}
				},
				{
					'value':'取消',
					'type':'secondary',
					'click':function(e,tinyDialogObjectInstance){
						cancelFunction.call(this,e,tinyDialogObjectInstance,tinyDialogObjectInstance.$content.find('input.'+inputClass).val())
						if(!noRemoveWhenClose){
							tinyDialogObjectInstance.remove()
						}
					}
				}
			]
		},options))
	}

	// $(new Image()).attr('src','b.png')
	window.tinyDialog = out
})($,document,window)