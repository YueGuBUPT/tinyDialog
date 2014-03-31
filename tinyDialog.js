/*!
 * author:guyue
 * contacts:百度hi->guyuebupt
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
		isIE6 = /msie 6/i.test(navigator.userAgent)

	function position(tinyDialog){
		var this$ = tinyDialog.$,
			left = ($window.width()-this$.outerWidth(true))/2,
			top = ($window.height()-this$.outerHeight(true))/(1+1.61803398875)
		if(this$){
			if(isIE6){
				this$.css({
					'left':document.documentElement.scrollLeft + left,
					'top':document.documentElement.scrollTop + top
				})
			}else{
				this$.css({
					'left':left,
					'top':top
				})
			}
		}
	}
	function setMaskWH($mask){
		$mask.css({
			width:$document.width(),
			height:$document.height()
		})
	}

	function MiniDialog(options){
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
		position(self)
		$window.on('resize',function(){
			position(self)
		})
		if(isIE6){
			$window.on('scroll',function(){
				position(self)
			})
		}
		self.$.appendTo($body)
		if(self.init && typeof(self.init) == 'function'){
			self.init.call(self)
		}
		if(self.autoShow){
			self.show()
		}
	}
	MiniDialog.prototype.show = function(){
		if(!this.isShow && this.$){
			if(this.mask){
				if($mask){
					$mask.show()
				}else{
					$mask = $(document.createElement('DIV')).addClass(otherOptions.maskCssClass)
					if(isIE6){
						setMaskWH($mask)
						$window.on('resize',function(){
							setMaskWH($mask)
						})
					}
					$mask.appendTo($body)
				}
				maskUserCount++
			}
			this.$.show()
			this.isShow = true
		}
	}

	MiniDialog.prototype.hide = function(){
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
	MiniDialog.prototype.remove = function(){
		this.hide()
		this.$.remove()
	}

	function out(options){
		return new MiniDialog(options)
	}
	out.config = {
		defaultOptions:defaultOptions,
		otherOptions:otherOptions
	}
	out.alert = function(msg,okFunction,options,noRemoveWhenClose){
		return new MiniDialog($.extend({
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
		return new MiniDialog($.extend({
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
		return new MiniDialog($.extend({
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