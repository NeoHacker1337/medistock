/**
 * Mega Filter PRO/PLUS
 * 
 * @license Commercial
 * @author info@ocdemo.eu
 */

if( typeof Array.prototype.indexOf == 'undefined' ) {
	Array.prototype.indexOf = function(obj, start) {
		for( var i = ( start || 0 ), j = this.length; i < j; i++ ) {
			if( this[i] === obj ) {return i;}
		}
		
		return -1;
   };
};

var MegaFilterINSTANCES = typeof MegaFilterINSTANCES == 'undefined' ? [] : MegaFilterINSTANCES;
var MegaFilterCommonData = typeof MegaFilterCommonData == 'undefined' ? {} : MegaFilterCommonData;

var MegaFilter = function(){ };

MegaFilter.prototype = {
	
	/**
	 * Main box of filter
	 */
	_box: null,
			
	/**
	 * Ooptions
	 */
	_options: null,
			
	/**
	 * @var int
	 */
	_timeoutAjax: null,
	
	_timeoutSearchFiled: null,
		
	/**
	* @var string
	*/
	_url			: null,
	
	/**
	 * URL separator
	 * 
	 * @var string
	 */
	_urlSep			: null,
	
	/**
	 * List of parameters
	 *
	 * @var object
	 */
	_params			: null,
	
	/**
	 * List of scrolls
	 * 
	 * @var array
	 */
	_scrolls		: null,
	
	/**
	 * List of buttons
	 * 
	 * @var array
	 */
	_buttonsMore	: null,
	
	_liveFilters	: null,
	
	/**
	 * Main container
	 *
	 * @var jQuery
	 */
	_jqContent		: null,
		
	/**
	 * Loader over results
	 *
	 * @var jQuery
	 */
	_jqLoader		: null,
	
	/**
	 * Loader over filter
	 * 
	 * @var jQuery
	 */
	_jqLoaderFilter	: null,
	
	/**
	 * Sliders
	 * 
	 * @type array
	 */
	_sliders		: null,
		
	/**
	 * ID of main container
	 *
	 * @var string
	 */
	_contentId		: '#content',
	
	/**
	 * Waiting for server response
	 * 
	 * @var bool
	 */
	_busy			: false,
	
	/**
	 * Something was changed when loading data from the server
	 * 
	 * @var bool
	 */
	_waitingChanges	: false,
	
	/**
	 * Last response
	 * 
	 * @var string
	 */
	_lastResponse	: '',
	
	_refreshPrice : function(){},
	
	_inUrl : null,
	
	_isInit: false,
	
	_cache: null,
	
	_relativeScroll: null,
	
	_selectOptions: null,
	
	_lastUrl: null,
	
	_urlToFilters: null,
	
	_instanceIdx: 0,
	
	_inlineHorizontalUpdate: null,
	
	_lastEvent: null,
	
	_startUrl: null,
	
	_history: 1,
	
	_changed: false,
	
	_ajaxPagination: null,
	
	_seoAliases: null,
	
	_selectedFilters: null,
	
	////////////////////////////////////////////////////////////////////////////
	
	/**
	 * Init class
	 */
	init: function( box, options ) {
		var self = this,
			i;
		
		self._instanceIdx = MegaFilterINSTANCES.length;
		
		if( options.routeHome == options.route && options.homePageAJAX ) {
			self._contentId = options.homePageContentSelector;
		} else if( options.contentSelector ) {
			self._contentId = options.contentSelector;
		}
		
		self._jqContent	= jQuery(self._contentId);
		self._options	= options;
		
		if( ! self._jqContent.length ) {
			self._contentId = '#maincontent';
			
			self._jqContent	= jQuery(self._contentId);
		}
		
		if( options.routeHome == options.route && options.homePageAJAX && box.hasClass( 'mfilter-content_top' ) && box.parents(self._contentId) ) {
			self._jqContent.parent().prepend( box.addClass('col-sm-12') );
		}
		
		if( self._startUrl === null ) {
			self._startUrl = self.location();
		}
		
		self._cache						= {};
		self._seoAliases				= {};
		self._scrolls					= [];
		self._buttonsMore				= [];
		self._liveFilters				= [];
		self._sliders					= [];
		self._inlineHorizontalUpdate	= [];
		self._box						= box;
		self._selectOptions				= {};
		
		if( typeof MegaFilterCommonData.lastResponse == 'undefined' ) {
			MegaFilterCommonData.lastResponse = {};
		}
		
		if( typeof MegaFilterCommonData.mainContent == 'undefined' ) {
			MegaFilterCommonData.mainContent = {};
		}
		
		if( self._box.tooltip ) {
			self._box.find('[data-mf-toggle="tooltip"]').tooltip({
				'viewport' : 'body',
				'container' : 'body'
			});
		}
		
		if( ! self._instanceIdx ) {
			var tmp = {};
			
			for( i in MegaFilterCommonData.seo.aliases ) {
				tmp[self.filtersToUrl( self.sortParamsForSeoAlias( self.__urlToFilters( i ) ), true )] = MegaFilterCommonData.seo.aliases[i];
			}
			
			MegaFilterCommonData.seo.aliases = tmp;
		}
		
		self.initResponsive();
		
		if( self._options.manualInit && ! self._isInit ) {
			var items = self._box.find('> .mfilter-content').find('> ul,> div').hide(),
				$init = jQuery('<a href="#" style="padding: 10px; text-align: center; display: block;">' + self._options.text.init_filter + '</a>').appendTo( self._box.find('> .mfilter-content') );
			
			$init.click(function(){
				$init.text( self._options.text.initializing );
				
				setTimeout(function(){
					items.show();
					self.boot();
					$init.remove();
				},100);
				
				return false;
			});
		} else {
			self.boot();
		}
		
		if( self._options.seo.valuesAreLinks ) {
			jQuery(self._box).on('click', 'a.mfp-value-link', function(e){
				if( jQuery(this).hasClass('mfp-value-link-disabled') ) {
					e.preventDefault();
					
					return;
				}
				
				if( self._options.seo.valuesLinksAreClickable ) {
					self._showLoader();
					self._busy = true;
				} else {
					e.preventDefault();
				}
				
				jQuery(this).parent().trigger('click');
			});
		}
		
		return self;
	},
	
	boot: function() {
		var self = this,
			i;
		
		self.initUrls();

		for( i in self._options.params ) {
			if( typeof self._options.params[i] == 'function' ) continue;

			if( typeof self._params[i] == 'undefined' ) {
				self._params[i] = self._options.params[i];
			}
		}

		self.initSliders();
		
		//var t = this.microtime(true);
		for( i in self ) {
			if( i.indexOf( '_init' ) === 0 ) {
				self[i]();
			}
		}
		//alert(this.microtime(true)-t);
		
		if( self._options.route == self._options.routeHome && self._params[self._options.seo.parameter] ) {
			setTimeout(function(){
				self.ajax();
			},50);
		}
		
		if( self._params[self._options.seo.parameter] ) {
			self.setFiltersByUrl();
		} else if( ( self._options.seo.enabled || self._options.seo.aliasesEnabled ) && self._options.seo.alias != '' ) {
			for( i in MegaFilterCommonData.seo.aliases ) {
				if( MegaFilterCommonData.seo.aliases[i] == self._options.seo.alias ) {
					self.setFiltersByUrl( self.__urlToFilters( i ) );
					
					break;
				}
			}
		} else {
			self.setFiltersByUrl();
		}
		
		self.initCountInfo();
		
		self._isInit = true;
	},
	
	microtime: function(get_as_float) {
		var now = new Date()
			.getTime() / 1000;
		var s = parseInt(now, 10);

		return (get_as_float) ? now : (Math.round((now - s) * 1000) / 1000) + ' ' + s;
	},

	keys: function( obj ) {
		var keys = [];
		
		for( var i in obj ) {
			keys.push( i );
		}
		
		return keys;
	},
	
	base64_decode: function(data) {
		var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
		var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
		  ac = 0,
		  dec = '',
		  tmp_arr = [];

		if (!data) {
		  return data;
		}

		data += '';

		do {
		  h1 = b64.indexOf(data.charAt(i++));
		  h2 = b64.indexOf(data.charAt(i++));
		  h3 = b64.indexOf(data.charAt(i++));
		  h4 = b64.indexOf(data.charAt(i++));

		  bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

		  o1 = bits >> 16 & 0xff;
		  o2 = bits >> 8 & 0xff;
		  o3 = bits & 0xff;

		  if (h3 == 64) {
			tmp_arr[ac++] = String.fromCharCode(o1);
		  } else if (h4 == 64) {
			tmp_arr[ac++] = String.fromCharCode(o1, o2);
		  } else {
			tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
		  }
		} while (i < data.length);

		dec = tmp_arr.join('');

		return dec.replace(/\0+$/, '');
	},
	
	sortKeys: function( data ) {
		var keys = [],
			sortData = [],
			i;
			
		for( i in data ) {
			sortData.push( [ i, data[i] ] );
		}
		
		sortData.sort(function(a,b){
			var sa = typeof a[1].sort_order == 'undefined' ? 0 : a[1].sort_order,
				sb = typeof b[1].sort_order == 'undefined' ? 0 : b[1].sort_order;
			
			if( sa > sb ) {
				return 1;
			} else if( sa < sb ) {
				return -1;
			}
			
			return 0;
		});
		
		for( i = 0; i < sortData.length; i++ ) {
			keys.push( sortData[i][0] );
		}
		
		return keys;
	},
	
	urldecode: function(str) {
	  return decodeURIComponent((str + '')
		.replace(/%(?![\da-f]{2})/gi, function () {
			return '%25';
		})
		.replace(/\+/g, '%20'));
	},
	
	/**
	 * Init sliders
	 * 
	 * @return void
	 */
	initSliders: function(){
		var self = this,
			_init = false;
		
		function d( txt ) {
			var $i = jQuery('<div>').html( txt ),
				txt2 = $i.text();
			$i.remove();
			return txt2;
		}
		
		self._box.find('li.mfilter-filter-item.mfilter-slider').each(function(i){
			var _this		= jQuery(this).attr('data-slider-id', i),
				seo_name	= _this.attr('data-seo-name'),
				data		= jQuery.parseJSON(self.base64_decode(_this.find('.mfilter-slider-data').html())),
				$min		= _this.find('.mfilter-opts-slider-min'),
				$max		= _this.find('.mfilter-opts-slider-max'),
				$slider		= _this.find('.mfilter-slider-slider'),
				update		= false,
				keys, values, map;
				
			function init( data, update ) {
				if( update ) {
					return;
				}
				
				keys	= self.sortKeys( data );
				
				if( _init ) {
					if( ! keys.length ) {
						$slider.slider().slider('disable');

						return;
					} else {
						$slider.slider().slider('enable');
					}
				}
				
				if( keys.length == 1 ) {
					data['copy'] = data[keys[0]];
					keys.push('copy');
				}
				
				var params = self._parseUrl( document.location.href.toString(), {'x':'x'} ),
					filters = {};
				
				if( typeof params[self._options.seo.parameter] != 'undefined' ) {
					filters = self.__urlToFilters( decodeURIComponent( params[self._options.seo.parameter] ) );
				}
				
				//var filters = /*update ? self.filters() :*/ self.urlToFilters();
				
				values	= typeof filters[seo_name] != 'undefined' ? (function(){ 
					var d = [];
					
					for( var i = 0; i < filters[seo_name].length; i++ ) {
						d[i] = self.decode( self.urldecode( filters[seo_name][i] ) );
					} 
					
					return d;
				})() : [ data[keys[0]].key, data[keys[keys.length-1]].key ];
				map		= (function(){
					var m = [ keys.indexOf( values[0] ), keys.indexOf( values[values.length-1] ) ];

					if( m[0] != -1 && m[1] != -1 ) {
						return typeof filters[seo_name] == 'undefined' ? [ 0, keys.length-1 ] : m;
					}

					for( var i = 0; i < keys.length; i++ ) {
						if( m[0] == -1 ) {
							if( values[0] == d( data[keys[i]].value ) ) {
								m[0] = i;
							}
						} else if( m[1] == -1 ) {
							if( values[values.length-1] == d( data[keys[i]].value ) ) {
								m[1] = typeof data['copy'] == 'undefined' ? i : ( typeof filters[seo_name] == 'undefined' ? 1 : m[0] );
							}
						} else {
							break;
						}
					}
					
					if( m[0] == -1 ) {
						m[0] = 0;
					}

					if( m[1] == -1 ) {
						m[1] = m[0];//keys.length-1;
					}

					return m;
				})();
				
				$min.attr('data-key',map[0]).attr('data-min',0).val( d( data[keys[map[0]]].name ) );
				$max.attr('data-key',map[1]).attr('data-max',keys.length-1).val( d( data[keys[map[1]]].name ) );
				
				$slider.slider({
					range	: true,
					min		: 0,
					max		: keys.length-1,
					values	: map,
					isRTL	: self._options.direction == 'rtl',
					slide	: function( e, ui ) {
						$slider.trigger('slidechange', ui);
					},
					stop	: function( e, ui ) {
						update = true;
						
						self.runAjaxIfPossible();
					}
				}).bind('slidechange', function(e, ui){
					if( typeof keys[ui.values[0]] == 'undefined' || typeof data[keys[ui.values[0]]] == 'undefined' )
						return;

					if( typeof keys[ui.values[1]] == 'undefined' || typeof data[keys[ui.values[1]]] == 'undefined' )
						return;

					$min.attr('data-key',ui.values[0]).val( d( data[keys[ui.values[0]]].name ) );
					$max.attr('data-key',ui.values[1]).val( d( data[keys[ui.values[1]]].name ) );
				});
				
				if( _init ) {
					$slider.slider( 'value', $slider.slider('value') );
				}
				
				_init = true;
			}
			
			init( data );
			
			var s_idx = self._sliders.length;
			
			self._sliders.push({
				data: data,
				init: function( data, update ) {
					init( data, update );
				},
				resetValues: function(){
					data = self._sliders[s_idx].data;
					keys = self.sortKeys( data );
					
					$min.attr('data-key',0).attr('data-min',0).val( d( data[keys[map[0]]].name ) );
					$max.attr('data-key',keys.length-1).attr('data-max',keys.length-1).val( d( data[typeof keys[map[1]] != 'undefined' ? keys[map[1]] : keys[map[0]]].name ) );
					
					$slider.slider( 'option', 'min', parseInt( $min.attr('data-min') ) );
					$slider.slider( 'option', 'max', parseInt( $max.attr('data-max') ) );
					$slider.slider( 'option', 'values', [
						$min.attr('data-min'),
						$max.attr('data-max')
					]);
					$slider.slider( 'value', $slider.slider( 'value' ) );
					
					update = true;
				},
				setValues: function( values ){
					var vals = typeof values != 'undefined' ? (function(){
						var min = null,
							max = null,
							i = 0;
						
						for( var j in data ) {
							if( data[j].value == values[0] ) {
								min = i;
							}
							
							if( data[j].value == values[values.length-1] ) {
								max = i;
							}
							
							if( min !== null && max !== null ) {
								break;
							}
							
							i++;
						}
						
						return [ min === null ? 0 : min, max === null ? keys.length-1 : max ];
					})( values ) : $slider.slider('values');
					
					$min.attr('data-key',vals[0]).val( d( data[keys[vals[0]]].name ) );
					$max.attr('data-key',vals[1]).val( d( data[typeof keys[map[1]] != 'undefined' ? keys[map[1]] : keys[map[0]]].name ) );
					
					$slider.slider('values', vals);
				},
				getValues: function(){
					if( $min.attr('data-key') == $min.attr('data-min') && $max.attr('data-key') == $max.attr('data-max') && self.keys( data ).length == self.keys( self._sliders[s_idx].data ).length ) {
						return [];
					}
					
					var min		= parseInt( $min.attr('data-key') ),
						max		= parseInt( $max.attr('data-key') ),
						vals	= [];
					
					for( var i = min; i <= max; i++ ) {
						var key = keys[i];
						
						if( ! key ) continue;
						
						if( typeof data[key] == 'undefined' ) {
							key = keys[0];
						}
						
						vals.push( encodeURIComponent( self.encode( d( data[key].value ) ) ) );
					}
					
					return vals;
				}
			});
		});
	},
	
	initResponsive: function(){
		var self	= this,
			column	= null,
			moved	= false,
			hidden	= true;
	
		if( self._box.hasClass( 'mfilter-hide-container' ) ) {
			column = self._box.parent();
			self._box.removeClass( 'mfilter-content_top mfilter-modern-horizontal mfilter-hide' );
		} else if( self._box.hasClass( 'mfilter-column_left' ) ) {
			column = jQuery('#column-left');
		} else if( self._box.hasClass( 'mfilter-column_right' ) ) {
			column = jQuery('#column-right');
		} else {
			return;
		}
		
		var id = 'mfilter-free-container-' + self.widgetPosition() + '-' + jQuery('[id^="mfilter-free-container"][data-position="' + self.widgetPosition() + '"]').length,
			locked = false,
			control = false,
			src = jQuery('<span class="mfilter-before-box">'),
			cnt, cnt2, cnt3, btn;
		
		if( ! jQuery( '.mfilter-free-container.mfilter-widget-position-' + self.widgetPosition() ).length ) {
			control = true;
			
			cnt = jQuery('<div class="mfilter-free-container mfilter-free-container-closed mfilter-widget-position-' + self.widgetPosition() + ' mfilter-direction-' + self._options.direction + ( self._options.isMobile ? ' mfilter-mobile' : '' ) + ' mfilter-box-' + ( self._instanceIdx + 1 ) + '" data-position="' + self.widgetPosition() + '">')
				.prependTo( jQuery('body') );
			
			btn = jQuery('<div class="mfilter-free-button">')
				.appendTo( cnt )
				.click(function(){
					if( locked ) return false;
				
					locked = true;
				
					if( hidden ) {
						cnt.animate(self.widgetPosition() == 'right' ? {
							'marginRight' : 0
						} : {
							'marginLeft' : 0
						}, 500, function(){
							locked = false;
							
							self._relativeScroll.refresh();
							cnt.addClass('mfilter-free-container-opened').removeClass('mfilter-free-container-closed');
							
							for( var i in self._scrolls ) {
								self._scrolls[i].refresh();
							}
						});
					} else {
						cnt.animate(self.widgetPosition() == 'right' ? {
							'marginRight' : - ( cnt.outerWidth(true)<cnt.outerWidth()?cnt.outerWidth():cnt.outerWidth(true) )
						} : {
							'marginLeft' : - cnt.outerWidth(true)
						}, 500, function(){
							locked = false;
							
							cnt.addClass('mfilter-free-container-closed').removeClass('mfilter-free-container-opened');
							
							jQuery('body > div.tooltip.fade.top.in').remove();
						});
					}
			
					hidden = ! hidden;
				});
			
			cnt2 = jQuery('<div class="mfilter-iscroll">')
				.css('overflow','hidden')
				.attr('id', id)
				.appendTo( cnt );
			
			cnt3 = jQuery('<div>')
				.appendTo( cnt2 );
		} else {
			cnt = jQuery( '.mfilter-free-container.mfilter-widget-position-' + self.widgetPosition() );
			cnt2 = cnt.find( '.mfilter-iscroll:first' );
			cnt3 = cnt2.find( '> div:first' );
			btn = jQuery( '.mfilter-free-button ');
		}
		
		function reinit() {
			var init = false,
				$self = jQuery('#'+id);
			
			return {
				refresh : function(){
					if( init ) {
						return;
					}
					
					init = true;
					
					$self.scrollbar();
				},
				reinit: function(){
					
				}
			};
		}
		
		if( control ) {
			self._relativeScroll = reinit();
		}
		
		self._box.before( src );
		
		if( ! column.length ) {
			column = self._box.parent();
		}
		
		function isVisible() {
			var displayAlwaysAsWidget = self._options.displayAlwaysAsWidget;
			
			/*self.eachInstances(function( instance ){
				if( ! displayAlwaysAsWidget && instance.widgetPosition() == self.widgetPosition() ) {
					displayAlwaysAsWidget = instance._options.displayAlwaysAsWidget;
				}
			});*/
			
			var visible = self._options.displayAlwaysAsWidget ? false : column.is(':visible'),
				height	= jQuery(window).height() - 50;
			
			if( displayAlwaysAsWidget ) {
				cnt.show();
			}
			
			if( visible && moved ) {
				if( control ) {
					cnt.hide();
				}
				
				src.after( self._box );
				
				if( control ) {
					if( ! hidden ) {
						btn.trigger('click');
					}
				}
				
				moved = false;
			} else if( ! visible && ! moved ) {
				if( control ) {
					cnt.show();
				}
				
				cnt3.append( self._box );
				
				moved = true;
			}
			
			if( displayAlwaysAsWidget || control ) {
				if( moved ) {
					self.eachInstances(function( self ){
						if( self._relativeScroll ) {
							cnt2.attr('data-max-height', height).css( 'max-height', height + 'px' );
							self._relativeScroll.refresh();
						}
					});
				}
			}
		}
		
		jQuery(window).resize(function() {
			isVisible();
		});
		
		setTimeout(function(){
			isVisible();
		},100);
		
		if( control ) {
			if( self._options.isMobile && self._options.widgetWithSwipe ) {
				self.swipe = function( e, direction, distance, duration, fingerCount, fingerData ){
					if( direction != 'left' && direction != 'right' ) return;
					
					if( ( self.widgetPosition() == 'right' && direction == 'left' ) || ( self.widgetPosition() == 'left' && direction == 'right' ) ) {
						if( hidden ) {
							btn.trigger('click');
						}
					} else if( ( self.widgetPosition() == 'right' && direction == 'right' ) || ( self.widgetPosition() == 'left' && direction == 'left' ) ) {
						if( ! hidden ) {
							btn.trigger('click');
						}
					}
				};
				
//				jQuery(document).hammer({
//					direction: Hammer.DIRECTION_HORIZONTAL
//				}).bind('panright panleft', function(e){
//					if( ( self.widgetPosition() == 'right' && e.type == 'panleft' ) || ( self.widgetPosition() == 'left' && e.type == 'panright' ) ) {
//						if( hidden ) {
//							btn.trigger('click');
//						}
//					} else if( ( self.widgetPosition() == 'right' && e.type == 'panright' ) || ( self.widgetPosition() == 'left' && e.type == 'panleft' ) ) {
//						if( ! hidden ) {
//							btn.trigger('click');
//						}
//					}
//				});
			}
		}
	},
	
	swipe: function(){},
	
	widgetPosition: function() {
		var self = this;
		
		if( self._options.widgetPosition != '' ) {
			return self._options.widgetPosition;
		}
		
		return self._options.direction == 'rtl' ? 'right' : 'left';
	},
	
	location: function(){
		var self = this,
			url = document.location.href.toString().split('#')[0],
			parts = url.split('http://demo2.ninethemes.net/'),
			last_part = parts.pop();
		
		while( last_part == '' && parts.length ) {
			last_part = parts.pop();
		}
		
		if( self._options.seo.alias != '' ) {
			last_part = last_part.replace( encodeURIComponent( self._options.seo.alias ), '' );
		}
		
		for( var i in self._seoAliases ) {
			last_part = last_part.replace( encodeURIComponent( self._seoAliases[i] ), '' );
		}
		
		parts.push(last_part);
		
		return parts.join('http://demo2.ninethemes.net/');
	},
	
	reg_exp_quote: function(str, delimiter) {
		return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
	},
	
	removeMfpFromUrl: function( url ) {
		var self = this,
			reg = new RegExp("/" + self.reg_exp_quote(self._options.seo.parameter) + ",([a-z0-9\\-_]+\\[[^\\]]*\\],?)+", "g");
		
		if( url.match( reg ) ) {
			return url.replace( reg, '' );
		}
		
		var reg2 = new RegExp("(\\?|&)" + self.reg_exp_quote(self._options.seo.parameter) + "=([a-z0-9\\-_]+\\[[^\\]]*\\],?)+", "g");
		
		if( url.match( reg2 ) ) {
			return url.replace( reg2, '' );
		}
		
		return url.replace( new RegExp("/" + self.reg_exp_quote(self._options.seo.separator) + "/([a-z0-9\\-_]+,[^\\/\\?]+\\/?)+"), '' );
	},
	
	locationPath: function(){
		var self = this,
			location = self.location();
		
		return self.removeMfpFromUrl( decodeURIComponent( self.parse_url( location ).path ) );
	},
	
	initUrls: function( url ) {
		var self = this;

		if( typeof url == 'undefined' ) {
			url	 = self.location().split('#')[0];
		}
		
		self._urlSep	= self._parseSep( url ).urlSep;
		self._url		= self._parseSep( url ).url;
		self._params	= self._parseUrl( url );
		self._inUrl		= self._parseUrl( url );
	},
	
	_initMfImage: function() {
		var self = this;
		
		self._box.find('.mfilter-image input').change(function(){
			var s = jQuery(this).is(':checked'),
				t = jQuery(this).attr('type');
				
			if( t == 'radio' ) {
				jQuery(this).parent().parent().find('.mfilter-image-checked').removeClass('mfilter-image-checked');
			}
			
			jQuery(this).parent()[s?'addClass':'removeClass']('mfilter-image-checked');
		});
		
		self._box.find('.mfilter-image input:checked').parent().addClass('mfilter-image-checked');
	},
	
	__initTreeCategoryEvents: function() {
		var self = this,
			$path = self._box.find('input[name="path"]');
		
		self._box.find('li.mfilter-filter-item.mfilter-tree.mfilter-categories')[self._box.find('.mfilter-category-tree > ul > li').length?'show':'hide']();
			
		self._box.find('.mfilter-category-tree').each(function(){
			var _this = jQuery(this),
				ul = _this.find('> ul'),
				top_url = ul.attr('data-top-url'),
				top_path = (typeof self._options.params['path'] == 'undefined'?'':self._options.params['path']).split('_');
		
			_this.find('.mfilter-to-parent a').unbind('click').bind('click', function(){
				var parts = (jQuery(this).attr('data-path')?jQuery(this).attr('data-path'):$path.val()).split('_'),
					count = parts.length - 1;

				parts.pop();
				
				if( self._path() == parts.join('_') && self._options.params.path ) {
					parts = [];
				}
				
				if( top_url != '' && count < top_path.length ) {
					window.location.href = self.createUrl(top_url);
				} else {
					$path.val( parts.length || ! self._options.params.path ? parts.join('_') : self._path() );

					self.runAjax();
				}

				return false;
			});
				
			_this.find('a[data-parent-id]').click(function(){
				if( self._busy ) return false;

				var id = jQuery(this).attr('data-id'),
					path = $path.val(),
					parts = path.split('_'),
					last = parts[parts.length-1].split(',');
					
				self._cache['cat_'+id] = jQuery(this).text();
				
				if( last.indexOf( id ) == -1 ) {				
					if( path != '' ) {
						path += '_';
					}

					path += id;
				
					$path.val( path );
				}
				
				self.runAjax();

				return false;
			});
		});
	},
	
	_path: function( skip_org ){
		var self = this;
		
		if( skip_org !== true && typeof self._options.params.mfp_org_path_aliases != 'undefined' && self._options.params.mfp_org_path_aliases != '' ) {
			return self._options.params.mfp_org_path_aliases;
		} else if( skip_org !== true && typeof self._options.params.mfp_org_path != 'undefined' && self._options.params.mfp_org_path != '' ) {
			return self._options.params.mfp_org_path;
		} else if( typeof self._options.params.mfp_path_aliases != 'undefined' && self._options.params.mfp_path_aliases != '' ) {
			return self._options.params.mfp_path_aliases;
		} else if( typeof self._options.params.mfp_path != 'undefined' && self._options.params.mfp_path != '' ) {
			return self._options.params.mfp_path;
		} else if( typeof self._options.params.path_aliases != 'undefined' && self._options.params.path_aliases != '' ) {
			return self._options.params.path_aliases;
		} else if( typeof self._options.params.path != 'undefined' ) {
			return self._options.params.path;
		}
		
		return '';
	},
	
	_initTreeCategory: function( force ) {
		var self = this,
			$path = self._box.find('input[name="path"]');
		
		if( self._isInit && force !== true ) {
			self.__initTreeCategoryEvents();
			
			return;
		}
		
		if( ! $path.val() && ! self._isInit ) {
			$path.val( self._path( true ) );
		}
		
		self._box.find('.mfilter-category-tree').each(function(){
			var filters = self.filters();
			
			if( ( typeof filters.path != 'undefined' && filters.path != self._path() ) || $path.val().indexOf( '_' ) > -1 || ( $path.val() && ! self._options.params.path ) || ( $path.val() && self._options.route != self._options.routeCategory ) ) {
				jQuery(this).find('ul').prepend(jQuery('<li class="mfilter-to-parent">')
					.append(jQuery('<a>')
						.html((function(){
							var parts = $path.val().split('_'),
								cat = parts[parts.length-1];
							
							return typeof self._cache['cat_'+cat] != 'undefined' ? self._cache['cat_'+cat] : self._options.text.go_to_top;
						}))
					)
				);
			}
		});
		
		self.__initTreeCategoryEvents();
	},
	
	_initBox: function() {
		var self = this;
		
		if( self._isInit ) return;
		
		if( self._box.hasClass( 'mfilter-content_top' ) ) {
			self._box.find('.mfilter-content > ul > li').each(function(i){
				if( i && i % 4 == 0 ) {
					jQuery(this).before('<li style="clear:both; display:block;"></li>');
				}
			});
		}
	},
	
	_initTextFields: function() {
		var self = this;
		
		self._box.find('.mfilter-filter-item.mfilter-text').each(function(){
			var _this	= jQuery(this),
				name	= _this.attr('data-seo-name'),
				input	= _this.find('input[type=text]');
				
			function clear() {
				if( self._cache['txt_field_'+name] ) {
					clearTimeout( self._cache['txt_field_'+name] );
				}
				
				self._cache['txt_field_'+name] = null;
			}
				
			input.bind('keydown', function(e){
				if( e.keyCode == 13 ) {
					clear();
					
					self.ajax();
					
					return false;
				}
			}).bind('keyup.mf_shv', function(){
				input[input.val()?'addClass':'removeClass']('mfilter-text-has-value');
			}).bind('keyup', function(e){
				clear();
				
				if( self._options['refreshResults'] != 'using_button' ) {
					self._cache['txt_field_'+name] = setTimeout(function(){
						self.ajax();

						self._cache['txt_field_'+name] = null;
					}, 1000);
				} else if( self._options['usingButtonWithCountInfo'] && self._options['calculateNumberOfProducts'] ) {
					self._cache['txt_field_'+name] = setTimeout(function(){
						self._ajaxGetInfo([], true, true);

						self._cache['txt_field_'+name] = null;
					}, 1000);
				}
			}).trigger('keyup.mf_shv');
		});
	},
	
	_initSearchFiled: function() {
		var self = this,
			searchField = self._box.find('input[id="mfilter-opts-search"]'),
			searchButton = self._box.find('[id="mfilter-opts-search_button"]');
			
		if( ! searchField.length )
			return;
			
		var refreshDelay = parseInt( searchField.unbind('keyup keydown click paste propertychange').attr('data-refresh-delay').toString().replace(/[^0-9\-]+/, '') ),
			lastValue = searchField.val(),
			eventTimeout = null;
		
		function clearInt() {
			if( self._timeoutSearchFiled )
				clearTimeout( self._timeoutSearchFiled );
			
			self._timeoutSearchFiled = null;
		}
		
		if( refreshDelay != '-1' ) {
			searchField.bind('keyup paste propertychange', function(e){
				var $self = jQuery(this);
				
				clearTimeout( eventTimeout );
				
				eventTimeout = setTimeout(function(){
					if( $self.val() == lastValue )
						return;

					if( ! refreshDelay ) {
						self.runAjaxIfPossible();
					} else if( e.keyCode != 13 ) {
						clearInt();

						self._timeoutSearchFiled = setTimeout(function(){
							self.runAjaxIfPossible();

							self._timeoutSearchFiled = null;
						}, refreshDelay);
					}

					lastValue = searchField.val();
					eventTimeout = null;
				},10);
			});
		}
		
		searchField.bind('keydown', function(e){
			if( e.keyCode == 13 ) {
				$(this).trigger('change');
				
				return false;
			}
		}).bind('change',function(){
			if( jQuery(this).val() != lastValue ) {
				clearInt();
			
				self.runAjaxIfPossible();
			}
		}).bind('resetvalue',function(){
			lastValue = jQuery(this).val();
		}).bind('keyup.mf_shv', function(){
			jQuery(this)[jQuery(this).val()?'addClass':'removeClass']('mfilter-search-has-value');
		}).trigger('keyup.mf_shv');
	
		searchButton.bind('click', function(){
			clearInt();
			
			self.ajax();
			
			return false;
		});
	},
	
	encode: function( string ) {
		string = string.replace( /,/g, 'LA==' );
		string = string.replace( /\[/g, 'Ww==' );
		string = string.replace( /\]/g, 'XQ==' );
		string = string.replace( /"/g, 'Ig==' );
		string = string.replace( /'/g, 'Jw==' );
		string = string.replace( /&/g, 'Jg==' );
		string = string.replace( /\//g, 'Lw==' );
		string = string.replace( /\+/g, 'Kw==' );
		
		return string;
	},
	
	decode: function( string ) {
		string = string.replace( /LA==/g, ',' );
		string = string.replace( /Ww==/g, '[' );
		string = string.replace( /XQ==/g, ']' );
		string = string.replace( /Ig==/g, '"' );
		string = string.replace( /Jw==/g, "'" );
		string = string.replace( /Jg==/g, '&' );
		string = string.replace( /Lw==/g, 'http://demo2.ninethemes.net/' );
		string = string.replace( /Kw==/g, '+' );
		
		return string;
	},
	
	_parseSep: function( url ) {
		var self = this,
			urlSep = null;
		
		if( typeof url == 'undefined' )
			url = self._url;
		
		if( ! self._options.smp.isInstalled || self._options.smp.disableConvertUrls ) {
			url		= self.parse_url( url );
			url		= ( url.scheme && url.host ? url.scheme + ':' : '' ) + ( url.host ? '//' + url.host : '' ) + (url.port ? ':'+url.port: '') + url.path;
			url		= url.split('&')[0];
		} else {
			url		= url.indexOf('?') > -1 ? url.split('?')[0] : url.split(';')[0];
		}
		
		urlSep	= {
			'f' : '?',
			'n' : '&'
		};
		
		return {
			url : url,
			urlSep : urlSep
		};
	},
	
	/**
	 * Init content
	 */
	_initContent: function() {
		var self = this;
		
		self._jqContent
			.css('position', 'relative');
	},
	
	/**
	 * @return {scheme: 'http', host: 'hostname', user: 'username', pass: 'password', path: '/path', query: 'arg=value', fragment: 'anchor'}
	 */
	parse_url: function(str, component) {
		var query, key = ['source', 'scheme', 'authority', 'userInfo', 'user', 'pass', 'host', 'port',
			'relative', 'path', 'directory', 'file', 'query', 'fragment'
			],
			ini = (this.php_js && this.php_js.ini) || {},
			mode = (ini['phpjs.parse_url.mode'] &&
			ini['phpjs.parse_url.mode'].local_value) || 'php',
			parser = {
			php: /^(?:([^:\/?#]+):)?(?:\/\/()(?:(?:()(?:([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?()(?:(()(?:(?:[^?#\/]*\/)*)()(?:[^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
			strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
			loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/\/?)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/ // Added one optional slash to post-scheme to catch file:/// (should restrict this)
			};

		var m = parser[mode].exec(str),
			uri = {},
			i = 14;
		while (i--) {
			if (m[i]) {
			uri[key[i]] = m[i];
			}
		}

		if (component) {
			return uri[component.replace('PHP_URL_', '')
			.toLowerCase()];
		}
		if (mode !== 'php') {
			var name = (ini['phpjs.parse_url.queryKey'] &&
			ini['phpjs.parse_url.queryKey'].local_value) || 'queryKey';
			parser = /(?:^|&)([^&=]*)=?([^&]*)/g;
			uri[name] = {};
			query = uri[key[12]] || '';
			query.replace(parser, function($0, $1, $2) {
			if ($1) {
				uri[name][$1] = $2;
			}
			});
		}
		delete uri.source;
		return uri;
	},
	
	baseTypes: function( skip ) {
		var self	= this,
			types	= [];
		
		function find( self ) {
			self._box.find('[data-base-type]').each(function(){
				var baseType = jQuery(this).attr('data-base-type'),
					type = jQuery(this).attr('data-type');
					
				if( baseType == 'categories' ) {
					baseType += ':' + type;
				}

				if( types.indexOf( baseType ) > -1 ) return;
				if( typeof skip != 'undefined' && skip.indexOf( baseType ) > -1 ) return;
				
				if( type == 'text' ) return;
				
				types.push( baseType );
			});
		}
		
		find( self );
		
		for( var i = 0; i < MegaFilterINSTANCES.length; i++ ) {
			if( i == self._instanceIdx ) continue;
			
			find( MegaFilterINSTANCES[i] );
		}
		
		return types;
	},
	
	_ajaxUrl: function( url ) {
		//if( this.parse_url( document.location.toString() ).scheme == 'https' && this.parse_url( url ).scheme == 'http' ) {
		//	url = url.replace( 'http://', 'https://' );
		//}
		
		url = url.replace( /^https?:\/\//, '//' );
		//url = this.removeMfpFromUrl( url );
		
		var self = this,
			params = url.indexOf('?') > -1 ? url.split('?')[1] : '',
			parts = ( url.indexOf('?') > -1 ? url.split('?')[0] : url ).split('http://demo2.ninethemes.net/');
		
		for( i = 0; i < parts.length; i++ ) {
			if( /^page-[0-9]+$/.test( parts[i] ) ) {
				delete parts[i];
			} else if( i > 0 && /^[0-9]+$/.test( parts[i] ) && parts[i-1] == 'page' ) {
				delete parts[i];
				delete parts[i-1];
			}
		}
		
		url = parts.join('http://demo2.ninethemes.net/');
		//url = url.replace('://', '###URL###');
		url = url.replace( /\/+$/g, 'http://demo2.ninethemes.net/' );
		//url = url.replace('###URL###', '://');
		
		if( params != '' ) {
			url += '?' + params;
		}
		
		if( self._options.mijoshop ) {
			return url + ( url.indexOf('?') > -1 ? '&' : '?' ) + 'option=com_mijoshop&format=raw';
		}
		
		if( self._options.joo_cart != false ) {
			function parse( u ) {
				u = u.replace( 'index-2.html', '' );
				u = u.replace( /\/$/, '' );
				
				return u + '/';
			}
		
			var site_url 	= parse( self._options.joo_cart.site_url ),
				main_url 	= parse( self._options.joo_cart.main_url ),
				route 		= url.indexOf( 'index-2.html' ) > -1 ? self._parseUrl( url, {} ).route : url.replace( main_url, '' ),
				query		= self.parse_url( url ).query;
			
			if( typeof route == 'undefined' ) {
				route = '';
			}
			
			if( typeof query == 'undefined' ) {
				query = '';
			}
			
			if( route.indexOf('?') > -1 ) {
				route = route.split('?')[0];
			}
			
			if( route == 'module/mega_filter/getajaxinfo' ) {
				return site_url + 'index.php?route=' + route + ( query ? '&' + query : '' ) + '&option=com_opencart&format=raw';
			}
		}
		
		return url;
	},
	
	getToPost: function( url ) {
		var self = this,
			data = {};
		
		if( self._options.seo.enabled && self._options.seo.usePostAjaxRequests ) {
			var data = self._parseUrl(decodeURIComponent(url), {}),
				getajaxinfo = ( typeof data.route != 'undefined' && data.route == 'extension/module/mega_filter/getajaxinfo' ) || ( ! data.route && url.indexOf( 'extension/module/mega_filter/getajaxinfo' ) > -1 ),
				u = self.parse_url( getajaxinfo ? url : self.location() ),
				path = u.path ? self.removeMfpFromUrl(u.path) : '',
				get = [],
				mfp = typeof data[self._options.seo.parameter] != 'undefined' && self._options.seo.enabled && path ? self.filtersToUrl( self.sortParamsForSeoAlias( self.__urlToFilters( data[self._options.seo.parameter] ) ), true ) : '';
			
			url = ( u.scheme && u.host ? u.scheme + ':' : '' ) + ( u.host ? '//' + u.host : '' ) + (u.port ? ':'+u.port: '') + path;
			
			for( var i in data ) {
				if( i == self._options.seo.parameter && path && path != 'http://demo2.ninethemes.net/index.php' ) {
					url = url.replace(/\/$/, '');
					
					if( typeof MegaFilterCommonData.seo.aliases[mfp] != 'undefined' ) {
						url += '/' + MegaFilterCommonData.seo.aliases[mfp];
					} else {
						url += '/' + self._options.seo.separator + '/' + data[i];
					}
				} else if( ! (
						[ 
							'mfilterBTypes', 
							'mfilterIdx', 
							'mfilterLPath', 
							'mfilterRoute', 
							'path_aliases', 
							'mfp_org_path', 
							'mfp_org_path_aliases', 
							'mfp_path', 
							'mfp_path_aliases', 
							self._options.seo.separator 
						].indexOf( i ) >= 0 ||
						( getajaxinfo && i == 'path' )
					)
				) {
					get.push( i + '=' + data[i] );
					
					delete data[i];
				}
			}
			
			if( path && path != '/index.php' && self._options.seo.addSlashAtTheEnd ) {
				url += 'http://demo2.ninethemes.net/';
			}
			
			if( get.length ) {
				url += '?' + get.join('&');
			}
		}
		
		return {
			url: url,
			data: data
		};
	},
	
	_ajaxGetInfo: function( baseTypes, showLoader, renderSelectedFilters ){
		var self = this,
			url = self.getToPost( self._ajaxUrl( self.createUrl( self._options.ajaxGetInfoUrl, jQuery.extend( {}, self._params ), true ) ) ),
			data = jQuery.extend( url.data, {
				'mfilterIdx'	: self._options.idx,
				'mfilterRoute'	: self._options.route,
				'mfilterBTypes'	: self.baseTypes( baseTypes ).join(','),
				'mfilterLPath'	: self.locationPath()
			});
		
		if( showLoader ) {
			self._showLoader( true );
		}
		
		jQuery.ajax({
			'url'		: url.url,
			'type'		: self._options.seo.enabled && self._options.seo.usePostAjaxRequests ? 'POST' : 'GET',
			'data'		: data,
			'success'	: function( response ) {
				var $tmp = jQuery('<tmp>').html( response );
				
				if( showLoader ) {
					self._hideLoader();
				}
				
				self._parseInfo( self.base64_decode($tmp.find('#mfilter-json').html()) );
				
				self.checkValueLinks();
				
				if( renderSelectedFilters ) {
					self.renderSelectedFilters();
				}
			},
			'error'		: function() {
				
			}
		});
	},
	
	/**
	 * Init info about counts
	 */
	initCountInfo: function() {
		var self = this;
		
		if( ! self._options.calculateNumberOfProducts || self._isInit ) {
			return;
		}
		
		self._ajaxGetInfo(['categories:tree','categories:cat_checkbox','price']);
		
		self._parseInfo('{"stock_status":[],"manufacturers":[],"rating":[],"attributes":[],"options":[],"filters":[],"discounts":[]}',true);
	},
	
	_setSeoData: function( data ) {
		var self = this;
		
		if( typeof data == 'undefined' ) {
			if( typeof MegaFilterCommonData.seo_data == 'undefined' ) {
				return;
			}
			
			data = MegaFilterCommonData.seo_data;
			delete MegaFilterCommonData.seo_data;
		} else if( typeof MegaFilterCommonData.seo_data == 'undefined' ) {
			MegaFilterCommonData.seo_data = {
				'h1' : $(self._options.contentSelectorH1).first().html(),
				'meta_title' : $('title').html(),
				'meta_description' : $('meta[name=description]').html(),
				'meta_keywords' : $('meta[name=keywords]').html()
			};
		}
		
		if( data.h1 ) {
			$(self._options.contentSelectorH1).first().html( data.h1 );
		}
		
		if( data.meta_title ) {
			$('title').html( data.meta_title );
		}
		
		if( data.meta_description ) {
			$('meta[name=description]').html( data.meta_description );
		}
		
		if( data.meta_keyword ) {
			$('meta[name=keywords]').html( data.meta_keyword );
		}
	},
	
	_parseInfo: function( data, first ) {
		var self	= this,
			filters	= self.filters(),
			json	= jQuery.parseJSON( data );
		
		self._setSeoData( json.seo_data );
		
		for( var i in json ) {
			switch( i ) {
				case 'categories:tree' : {
					self._box.find('.mfilter-category-tree > ul > li').remove();
					
					for( var j = 0; j < json[i].length; j++ ) {
						if( self._options.hideInactiveValues && json[i][j].cnt == '0' ) continue;
						
						self._box.find('.mfilter-category-tree > ul').append(jQuery('<li class="mfilter-tb-as-tr">')
							.append(jQuery('<div class="mfilter-tb-as-td">')
								.append(jQuery('<a>')
									.attr('data-id', json[i][j].id)
									.attr('data-parent-id', json[i][j].pid)
									.html( json[i][j].name )
								)
							)
							.append('<div class="mfilter-tb-as-td mfilter-col-count"><span class="mfilter-counter">' + json[i][j].cnt + '</span></div>')
						);
					}
					
					self._initTreeCategory( true );
					
					break;
				}
				case 'categories:cat_checkbox' : {
					var cnt = {};
					
					for( var j in json[i] ) {
						cnt[json[i][j].id] = json[i][j].cnt;
					}
					
					self._box.find('.mfilter-filter-item.mfilter-cat_checkbox').each(function(){
						var $self = jQuery(this),
							cx = 0,
							idx = 0;
						
						$self.find('input[value]').each(function(i){
							var $self2 = $(this),
								$parent = $self2.parent().parent(),
								$cnt = $parent.find('.mfilter-counter'),
								checked = $self2.is(':checked'),
								id = $self2.val(),
								c = typeof cnt[id] == 'undefined' ? 0 : parseInt( cnt[id] ),
								ct = c;
							
							if( typeof filters['path'] != 'undefined' ) {
								if( filters['path'].indexOf( encodeURIComponent( id ) ) == -1 ) {
									ct = '+' + ct;
								}
							}
								
							$cnt.text( ct )[checked?'addClass':'removeClass']('mfilter-close');
							
							if( c ) {
								cx++;
								$parent.removeClass('mfilter-hide mfilter-first-child');
							}
							
							if( checked || c ) {
								$self2.removeAttr('disabled');
								$parent.removeClass('mfilter-disabled');
								$parent.find('a.mfp-value-link').removeClass('mfp-value-link-disabled');
							} else {
								$self2.attr('disabled',true);
								$parent.addClass('mfilter-disabled');
								$parent.find('a.mfp-value-link').addClass('mfp-value-link-disabled');
							}
							
							if( ! $parent.hasClass('mfilter-hide') ) {
								if( i > 0 && idx == 0 ) {
									$parent.addClass('mfilter-first-child');
								}
								idx++;
							}
						});
						
						if( cx ) {
							$self.removeClass('mfilter-hide');
						}
					});
					
					break;
				}
				case 'price' : {
					var priceRange = self.getPriceRange();
					
					if( priceRange.min == self._options.priceMin && priceRange.max == self._options.priceMax ) {
						self._box.find('[id="mfilter-opts-price-min"]').val( json[i].min );
						self._box.find('[id="mfilter-opts-price-max"]').val( json[i].max );
					}
					
					self._options.priceMin = json[i].min;
					self._options.priceMax = json[i].max;
					
					self._refreshPrice();
					
					break;
				}
				case 'vehicles' : {
					self._box.find('.mfilter-filter-item.mfilter-vehicles').each(function(){
						var $li = jQuery(this),
							$prev = null,
							auto_levels = $li.attr('data-auto-levels') == '1' ? true : false,
							params = self._parseUrl( document.location.href.toString(), {'x':'x'} ),
							filters = {};
				
							if( self._options.refreshResults == 'using_button' ) {
								filters = self.filters();
							} else if( typeof params[self._options.seo.parameter] != 'undefined' ) {
								filters = self.__urlToFilters( decodeURIComponent( params[self._options.seo.parameter] ) );
							}
							
							params	= typeof filters.vehicle != 'undefined' ? filters.vehicle.length : 0;
						
						$li.find('.mfilter-vehicles > .form-control').removeClass('mfilter-hide');
						
						$li.find('select').each(function(i){
							var keys	= [ 'makes', 'models', 'engines', 'years' ],
								vals	= typeof json['vehicles'][keys[i]] != 'undefined' ? json['vehicles'][keys[i]] : [],
								$self	= jQuery(this),
								val		= '';//typeof self.urlToFilters().vehicle != 'undefined' ? self.urlToFilters().vehicle[i] : '';

							if( typeof filters.vehicle != 'undefined' ) {
								val = filters.vehicle[i];
							}
							
							if( ( ( $prev == null || ! $prev.is(':disabled') ) && ( vals.length || params < i ) ) || ( keys[i] == 'years' && typeof json.vehicles.years != 'undefined' && json.vehicles.years.length ) ) {
								$self.html( '<option value="">' + $self.find('option:first').text() + '</option>' );
								
								for( var j = 0; j < vals.length; j++ ) {
									$self.append(jQuery('<option>')
										.attr({
											'value' : vals[j].value,
											'id' : vals[j].key,
											'data-name' : vals[j].name,
											'data-total' : vals[j].total?vals[j].total:''
										})
										.attr(keys[i]=='makes'?{
											'data-image' : vals[j].image
										}:{})
										.text(vals[j].name)
										.attr('selected', val == vals[j].value)
									);
								}

								$self.attr('disabled',vals.length?false:true).mf_selectpicker('refresh');
							} else {
								$self.attr('disabled',true).mf_selectpicker('refresh');
							}
							
							if( auto_levels || ( keys[i] == 'engines' && params >= 2 && ! vals.length ) ) {
								$self.parent()[i>0&&$self.is(':disabled')?'addClass':'removeClass']('mfilter-hide');
							}

							$prev = $self;
						});
					});
					
					break;
				}
				case 'levels' : {					
					self._box.find('.mfilter-filter-item.mfilter-levels').each(function(){
						var $li = jQuery(this),
							labels = $li.attr('data-labels').split('||');
						
						for( var i = 0; i < json['levels'].length; i++ ) {
							var $select = $li.find('select:eq(' + i + ')'),
								vals = json['levels'][i],
								val = '';
								
							if( typeof filters.level != 'undefined' ) {
								val = filters.level[i];
							}
							
							if( ! $select.length ) {
								$select = $('<select class="form-control" data-type="level-' + i + '">')
									.appendTo( $li.find('div.mfilter-levels') );
								
								$select.mf_selectpicker();
							}
							
							$select.html( '<option value="">' + ( typeof labels[i] == 'undefined' || labels[i] == '' ? ( vals.length && vals[0].label !== '' ? vals[0].label : '---' ) : labels[i] ) + '</option>' );
							
							for( var j = 0; j < vals.length; j++ ) {
								$select.append(jQuery('<option>')
									.attr({
										'value' : vals[j].value,
										'id' : vals[j].key,
										'data-name' : vals[j].name,
										'data-total' : vals[j].total?vals[j].total:'',
										'data-image' : vals[j].image,
										'selected' : val == vals[j].value 
									})
									.text( vals[j].name )
								);
							}
							
							if( vals.length ) {
								$select.removeAttr('disabled');
							} else {
								$select.attr('disabled', true);
							}
							
							$select.mf_selectpicker('refresh');
						}
						
						if( $li.find('select').length >= json['levels'].length ) {
							$li.find('select').each(function(i){
								if( i >= json['levels'].length ) {
									jQuery(this).parent().remove();
								}
							});
						}
						
						if( $li.find('select').length ) {
							self._initEvents();
							$li.removeClass('mfilter-hide');
						} else {
							$li.addClass('mfilter-hide');
						}
					});
					
					break;
				}
				case 'tags' :
				case 'model' :
				case 'sku' :
				case 'upc' :
				case 'ean' :
				case 'jan' :
				case 'isbn' :
				case 'mpn' :
				case 'location' :
				case 'length' :
				case 'width' :
				case 'height' :
				case 'weight' :
				case 'rating' :
				case 'attributes' :
				case 'filters' :
				case 'options' :
				case 'discounts' :
				case 'manufacturers' :
				case 'stock_status' : {				
					self._box.find('.mfilter-filter-item.mfilter-' + i).each(function(){
						var $item		= jQuery(this),
							seo			= $item.attr('data-seo-name'),
							id			= $item.attr('data-id'),
							$items		= $item.find( '.mfilter-options .mfilter-option'),
							hidden		= 0;
						
						$items.each(function(){
							var $self		= jQuery(this),
								$input		= $self.find('input[type=checkbox],input[type=radio],select'),
								val			= $input.val(),
								$counter	= jQuery(this).find('.mfilter-counter'),
								text		= '',
								cnt			= json[i];							
							
							if( id && typeof cnt[id] != 'undefined' ) {
								cnt = cnt[id];
							}
							
							if( $self.hasClass( 'mfilter-select' ) ) {
								var $options	= $input.find('option'),
									hOptions	= 0,
									val			= $input.val(),
									idx			= $input.prop('selectedIndex');
								
								if( typeof self._selectOptions[seo] == 'undefined' ) {
									self._selectOptions[seo] = [];
									
									$options.each(function(){
										self._selectOptions[seo].push({
											'name'	: jQuery(this).attr('data-name'),
											'id'	: jQuery(this).attr('id'),
											'value'	: jQuery(this).attr('value'),
											'text'	: jQuery(this).html()
										});
									});
								}
								
								$options.remove();
								
								(function(){
									function add( $option ) {
										$input.append( $option );
										
										if( val == $option.val() ) {
											idx = $input.find('option').length-1;
										}
									}
									
									for( var i = 0; i < self._selectOptions[seo].length; i++ ) {
										var $option = jQuery('<option>')
											.attr('value', self._selectOptions[seo][i].value);

										if( self._selectOptions[seo][i].name ) {
											$option.attr('data-name', self._selectOptions[seo][i].name);
										}

										if( self._selectOptions[seo][i].id ) {
											$option.attr('id', self._selectOptions[seo][i].id);
										}

										if( self._selectOptions[seo][i].id ) {
											var idd = self._selectOptions[seo][i].id.split('-').pop();

											if( first || typeof cnt[idd] != 'undefined' ) {
												$option.html( ( ! first && self._options.showNumberOfProducts ? '(' + cnt[idd] + ') ' : '' ) + self._selectOptions[seo][i].name );
												
												add( $option );
											} else {
												$option.attr('disabled', true).html( ( self._options.showNumberOfProducts ? '(0)' : '' ) + self._selectOptions[seo][i].name );

												if( ! self._options.hideInactiveValues ) {
													add( $option );
												}

												hOptions++;
											}
										} else {
											$option.html( self._selectOptions[seo][i].text );
											add( $option );
										}
									}
								})();
								
								if( idx >= 0 ) {
									$input.prop('selectedIndex', idx);
								}
								
								if( hOptions == self._selectOptions[seo].length ) {
									hidden++;
								}
							} else if( $self.hasClass( 'mfilter-slider' ) ) {
								//if( self._options.hideInactiveValues ) {
									self._box.find('[data-id="' + id + '"][data-slider-id]').each(function(){
										var slider_id = jQuery(this).attr('data-slider-id'),
											data = {};

										for( var i in self._sliders[slider_id].data ) {
											if( typeof cnt != 'undefined' && typeof cnt[i] != 'undefined' && parseInt( cnt[i] ) > 0 ) {
												data[i] = self._sliders[slider_id].data[i];
											}
										}
										
										self._sliders[slider_id].init( data, true );
									});
								//}
							} else if( $self.hasClass( 'mfilter-text' ) ) {
								$input = $self.find('input[type=text]');
								
								if( typeof filters[seo] != 'undefined' ) {
									
								} else {
									
								}
							} else {
								var idd = $input.attr('id').split('-').pop();
								
								if( typeof filters[seo] != 'undefined' ) {
									if( filters[seo].indexOf( encodeURIComponent( self.encode( val ) ) ) > -1 ) {
										$counter.addClass( 'mfilter-close' );
									} else {
										if( ! $item.hasClass( 'mfilter-radio' ) && ! $item.hasClass('mfilter-image_list_radio') /*&& base_type != 'option'*/ )
											text += '+';

										$counter.removeClass( 'mfilter-close' );
									}
								} else {
									$counter.removeClass( 'mfilter-close' );
								}
								
								$self.removeClass('mfilter-first-child mfilter-last-child mfilter-disabled mfilter-hide mfilter-visible');
								$self.find('a.mfp-value-link').removeClass('mfp-value-link-disabled');
								$self.parent().removeClass('mfilter-hide');
								
								if( typeof cnt[idd] != 'undefined' && parseInt( cnt[idd] ) > 0 ) {
									text += cnt[idd];

									$self.addClass('mfilter-visible');
									$input.attr('disabled', false);
								} else {
									text = '0';
									hidden++;
									
									$self.addClass('mfilter-disabled');
									$self.find('a.mfp-value-link').addClass('mfp-value-link-disabled');
									$input.attr('disabled',true);
										
									if( first !== true && self._options.hideInactiveValues ) {
										$self.addClass('mfilter-hide');
										
										if( self._box.hasClass('mfilter-content_top') ) {
											$self.parent().addClass('mfilter-hide');
										}
									}
								}

								$counter.text( text );
							}
						});
						
						if( first !== true && self._options.hideInactiveValues ) {
							if( $item.hasClass('mfilter-select') ) {
								$item[$item.find('select option[value!=""]').length?'removeClass':'addClass']('mfilter-hide');
							} else {
								$item[hidden==$items.length?'addClass':'removeClass']('mfilter-hide');
								$item.find('.mfilter-option').not('.mfilter-hide,.mfilter-hide-by-live-filter').first().addClass('mfilter-first-child');
								$item.find('.mfilter-option').not('.mfilter-hide,.mfilter-hide-by-live-filter').last().addClass('mfilter-last-child');
							}
						}
					});
					
					break;
				}
			}
		}
		
		if( self._options.hideInactiveValues ) {
			self._box.find('li.mfilter-gheader').each(function(){
				var $this = jQuery(this),
					key = $this.attr('data-group-key');
				
				if( self._box.find('li[data-group-key="' + key + '"]:not(.mfilter-gheader)').length == self._box.find('li[data-group-key="' + key + '"]:not(.mfilter-gheader).mfilter-hide').length ) {
					$this.addClass('mfilter-hide');
				} else {
					$this.removeClass('mfilter-hide');
				}
			});
		}
						
		if( first !== true && ( self._options.hideInactiveValues || self._box.find('[data-display-live-filter!="0"]').length ) ) {							
			for( var s = 0; s < self._scrolls.length; s++ ) {
				self._scrolls[s].refresh();
			}

			for( var b = 0; b < self._buttonsMore.length; b++ ) {
				self._buttonsMore[b].refresh();
			}
			
			for( var f = 0; f < self._liveFilters.length; f++ ) {
				self._liveFilters[f].refresh();
			}

			if( self._relativeScroll != null ) {
				self._relativeScroll.refresh();
			}
		}
		
		self._updateInlineHorizontal();
	},
	
	_initAlwaysSearch: function() {
		var self	= this;
			
		function search() {
			self._jqContent.find('[name^=filter_],[name=search],[name=category_id],[name=sub_category],[name=description]').each(function(){
				var name	= jQuery(this).attr('name'),
					value	= jQuery(this).val(),
					type	= jQuery(this).attr('type');

				if( [ 'checkbox', 'radio' ].indexOf( type ) > -1 && ! jQuery(this).is(':checked') )
					value = '';
					
				if( name ) {
					self._inUrl[name] = value;
					self._params[name] = value;
				}
			});
			
			self.reload();
			//self.ajax();
		}
			
		jQuery('#button-search').unbind('click').click(function(e){
			e.preventDefault();
				
			search();
		});
			
		self._jqContent.find('input[name=filter_name],input[name=search]').unbind('keydown').unbind('keyup').bind('keydown', function(e){
			if( e.keyCode == 13 ) {
				e.preventDefault();
					
				search();
			}
		});
	},
	
	hexToRgb: function(str) {
		if ( /^#([0-9a-f]{3}|[0-9a-f]{6})$/ig.test(str) ) { 
			var hex = str.substr(1);
			hex = hex.length == 3 ? hex.replace(/(.)/g, '$1$1') : hex;
			var rgb = parseInt(hex, 16);               
			return [(rgb >> 16) & 255, (rgb >> 8) & 255, rgb & 255].join(',');
		} 
		
		return '255,255,255';
	},
	
	_initAlwaysAjaxPagination: function(){
		var self = this;
		
		if( ! self._options.ajaxPagination ) return;
		
		self._jqContent.find('.pagination a').click(function(){
			var url = jQuery(this).attr('href'),
				params = self._parseUrl( url );
			
			if( typeof params.page != 'undefined' ) {
				self._ajaxPagination = params.page;
				
				self.ajax( url );
				
				return false;
			}
		});
	},
		
	__initLoader: function() {
		var color = this.hexToRgb(typeof this._options.color == 'undefined' ? '#ffffff' : this._options.color.loader_over_results);
		
		this._jqLoader = jQuery('<span class="mfilter-ajax-loader-container" style="cursor: wait; z-index: 100; margin: 0; padding: 0; position: absolute; text-align: center; background-color: rgba(' + color + ',0.7);"></span>')
			.prependTo( this._jqContent )
			.html( '<img src="catalog/view/theme/default/stylesheet/mf/images/ajax-loader.gif?v2" alt="" />' )
			.hide();
	},
	
	__initLoaderFilter: function() {
		var color = this.hexToRgb(typeof this._options.color == 'undefined' ? '#ffffff' : this._options.color.loader_over_filter);
		
		this._jqLoaderFilter = jQuery('<span style="cursor: wait; z-index: 10000; margin: 0; padding: 0; position: absolute; background-color: rgba(' + color + ',0.7);"></span>')
			.prependTo( this._box )
			.hide();
	},
	
	/**
	 * Init displaying the list
	 */
	_initDisplayItems: function() {
		var self = this,
			isContentTop = self._box.hasClass( 'mfilter-content_top' ),
			params = self.urlToFilters();
		
		self._box.find('.mfilter-filter-item').each(function(i){
			var _level0				= jQuery(this),
				type				= _level0.attr('data-type'),
				seo_name			= _level0.attr('data-seo-name'),
				displayLiveFilter	= parseInt( _level0.attr('data-display-live-filter') ),
				displayListOfItems	= _level0.attr('data-display-list-of-items');
					
			if( ! displayListOfItems ) {
				displayListOfItems = self._options.displayListOfItems.type;
			}

			if( type == 'price' || type == 'rating' ) return;
			
			var wrapper = _level0.find('.mfilter-content-wrapper'),
				content	= _level0.find('> .mfilter-content-opts'),
				heading	= _level0.find('> .mfilter-heading'),
				idx = null;

			if( ! isContentTop && heading.hasClass( 'mfilter-collapsed' ) ) {
				if( typeof params[seo_name] == 'undefined' ) {
					content.show();
				}
			}
			
			if( displayListOfItems == 'scroll' ) {
				if( type == 'tree' || ( wrapper.actual ? wrapper.actual( 'outerHeight', { includeMargin: true } ) : wrapper.outerHeight(true) ) > self._options.displayListOfItems.maxHeight-1 ) {
					if( self._options.displayListOfItems.standardScroll || ( jQuery.browser && jQuery.browser.msie && jQuery.browser.version < 9 ) || ( /*/firefox/i.test(navigator.userAgent) &&*/ /mac/i.test(navigator.platform) ) ) {
						wrapper
							.addClass('mfilter-scroll-standard')
							.css({
								'max-height': self._options.displayListOfItems.maxHeight + 'px',
								'overflow-y': 'scroll'
							});
					} else {
						wrapper
							.attr('id', 'mfilter-content-opts-' + self._instanceIdx + '-' + i);

						(function(){
							if( type == 'slider' || type == 'text' || type == 'select' || type == 'vehicles' || type == 'levels' || type == 'price' ) return;
							
							var init = false,
								$self = jQuery( '#mfilter-content-opts-' + self._instanceIdx + '-' + i );
							
							idx = self._scrolls.length;
							
							self._scrolls.push({
								refresh: function(){
									if( init ) return;
									
									init = true;
									
									$self.removeClass('scroll-wrapper').css('max-height', self._options.displayListOfItems.maxHeight+'px').scrollbar();
								}
							});
							
							if( ! self._options.calculateNumberOfProducts ) {
								self._scrolls[idx].refresh();
							}
						})();
					}
				}
			} else if( displayListOfItems == 'button_more' && ! isContentTop && type != 'image' && type != 'image_radio' ) {
				self._buttonsMore.push((function( _level0 ){		
					function init( first ) {
						var lessHeight	= 0,
							$cnt 		= _level0.find('.mfilter-options-container');
						
						if( ! $cnt.length ) {
							$cnt = _level0.find('.mfilter-content-wrapper');
						}
						
						var
							moreHeight	= $cnt.actual ? $cnt.actual( 'outerHeight', { includeMargin: true } ) : $cnt.outerHeight(true),
							show		= false,
							count		= 0,
							idx			= 0;
						
						_level0.find('.mfilter-option.mfilter-tb-as-tr').each(function(i){
							var _this = jQuery(this);
							
							if( _this.hasClass('mfilter-hide') || _this.hasClass('mfilter-hide-by-live-filter') ) return;

							if( idx < self._options.displayListOfItems.limit_of_items ) {
								lessHeight += _this.actual ? _this.actual( 'outerHeight', { includeMargin: true } ) : _this.outerHeight(true);
							} else {
								count++;
							}
							
							idx++;
						});

						if( count ) {
							wrapper.css('overflow','hidden').css('height', lessHeight+'px');
							
							function sh( show, force ) {
								if( force ) {
									wrapper.height( moreHeight );
								} else {
									wrapper.animate({
										'height' : ! show ? moreHeight : lessHeight
									}, 500, function(){
										if( self._relativeScroll != null )
											self._relativeScroll.refresh();
									});
								}
										
								_level0.find('a.mfilter-button-more').text(show?self._options.displayListOfItems.textMore.replace( '%s', count ):self._options.displayListOfItems.textLess);
							}

							_level0.find('.mfilter-content-opts').append(jQuery('<div>')
								.addClass( 'mfilter-button-more' )
								.append(jQuery('<a>')
									.attr( 'href', '#' )
									.addClass( 'mfilter-button-more' )
									.text( self._options.displayListOfItems.textMore.replace( '%s', count ) )
									.bind('click', function(){
										sh( show );

										show = ! show;
										
										wrapper[show?'addClass':'removeClass']('mfilter-slide-down');

										return false;
									})
								)
							);
						
							if( wrapper.hasClass('mfilter-slide-down') ) {
								sh( false, true );
								show = true;
							}
						}
					}
					
					init( true );
					
					idx = self._buttonsMore.length;
					
					return {
						refresh: function() {
							_level0.find('.mfilter-content-wrapper').removeAttr('style');
							_level0.find('.mfilter-button-more').remove();
							
							init();
						}
					};
				})( _level0 ));
			}
			
			if( type == 'cat_checkbox' ) {
				(function(){
					var cnt = 0;
					
					content.find('.mfilter-category .mfilter-option').each(function(i){
						if( jQuery(this).find('.mfilter-counter').text() != '0' ) {							
							if( i && ! cnt ) {
								jQuery(this).addClass('mfilter-first-child');
							}
							
							cnt++;
						} else {
							jQuery(this).addClass('mfilter-hide');
						}
					});
					
					if( ! cnt ) {
						_level0.addClass('mfilter-hide');
					}
				})();
			}
			
			(function(){
				if( isContentTop ) {
					return;
				}
				
				if( displayLiveFilter < 1 || content.find('.mfilter-option').length < displayLiveFilter || type == 'image' || type == 'image_radio' ) {
					displayLiveFilter = 0;
					
					return;
				}
				
				content.prepend('<div class="mfilter-live-filter"><input type="text" class="form-control" id="mfilter-live-filter-input-' + self._instanceIdx + '-' + i + '" /></div>');
				
				wrapper.find('> .mfilter-options > div').attr('id', 'mfilter-live-filter-list-' + self._instanceIdx + '-' + i);

				_level0.addClass('mfilter-live-filter-init');

				jQuery('#mfilter-live-filter-list-' + self._instanceIdx + '-' + i).liveFilter('#mfilter-live-filter-input-'+self._instanceIdx + '-' + i, '.mfilter-visible,.mfilter-should-visible,.mfilter-disabled,.mfilter-option:not(.mfilter-filter-item)', {
					'filterChildSelector' : 'label',
					'after' : function(contains, containsNot){
						var list = jQuery('#mfilter-live-filter-list-' + self._instanceIdx + '-' + i);

						contains.removeClass('mfilter-should-visible').addClass('mfilter-visible');
						containsNot.removeClass('mfilter-visible').addClass('mfilter-should-visible');

						list.find('> .mfilter-option').removeClass('mfilter-first-child mfilter-last-child');
						
						list.find('> .mfilter-option:not(.mfilter-hide):not(.mfilter-hide-by-live-filter):first').addClass('mfilter-first-child');
						list.find('> .mfilter-option:not(.mfilter-hide):not(.mfilter-hide-by-live-filter):last').addClass('mfilter-last-child');

						if( idx !== null ) {
							if( displayListOfItems == 'scroll' ) {
								self._scrolls[idx].refresh();
							} else if( displayListOfItems == 'button_more' ) {
								self._buttonsMore[idx].refresh();
							}
						}
						
						if( self._relativeScroll != null ) {
							self._relativeScroll.refresh();
						}
					}
				});
					
				_level0.addClass('mfilter-live-filter-init');
				
				self._liveFilters.push({
					refresh: function(){
						content.find('.mfilter-live-filter')[content.find('.mfilter-option:not(.mfilter-hide)').length <= displayLiveFilter?'hide':'show']();
					},
					check: function() {
						jQuery('#mfilter-live-filter-input-'+self._instanceIdx + '-' + i).trigger('keyup');
					}
				});
				
				self._liveFilters[self._liveFilters.length-1].refresh();
			})();

			if( ! isContentTop && heading.hasClass( 'mfilter-collapsed' ) ) {
				if( typeof params[seo_name] == 'undefined' ) {
					content.hide();
				}
			}
		});
	},
			
	/**
	 * Init headers
	 */
	_initHeading: function() {
		var self = this;
		
		if( self._box.hasClass('mfilter-content_top') )
			return;
		
		self._box.find('.mfilter-heading').click(function(){
			var opts = jQuery(this).parent().find('> .mfilter-content-opts');

			if( jQuery(this).hasClass('mfilter-collapsed') ) {
				opts.slideDown('normal', function(){
					if( self._relativeScroll != null )
						self._relativeScroll.refresh();
				});
				jQuery(this).removeClass('mfilter-collapsed');
			} else {
				opts.slideUp('normal', function(){
					if( self._relativeScroll != null )
						self._relativeScroll.refresh();
				});
				jQuery(this).addClass('mfilter-collapsed');
			}
		});
	},
	
	_updateInlineHorizontal: function() {
		for( var i = 0; i < this._inlineHorizontalUpdate.length; i++ ) {
			this._inlineHorizontalUpdate[i]();
		}
	},
	
	_initInlineHorizontal: function() {
		var self = this;
		
		if( ! self._box.hasClass( 'mfilter-content_top' ) ) {
			return;
		}
		
		self._box.find('li[data-inline-horizontal="1"][data-type="checkbox"],li[data-inline-horizontal="1"][data-type="radio"],li[data-inline-horizontal="1"][data-type="image_list_checkbox"],li[data-inline-horizontal="1"][data-type="image_list_radio"]').each(function(){
			var $container = jQuery(this).addClass('mfilter-inline-horizontal').find('.mfilter-opts-container'),
				$wrapper = $container.find('> .mfilter-content-wrapper'),
				$options = $wrapper.find('> .mfilter-options'),
				$optionsCnt = $options.find('> .mfilter-options-container'),
				$tb = $optionsCnt.find('> .mfilter-tb'),
				left = 0;
			
			function width() {
				var w = 0,
					b = false;
				
				left = 0;
				
				$tb.find('> .mfilter-tb').each(function(){
					var ww = jQuery(this).outerWidth(true);
					
					if( self._lastEvent ) {
						var $el = jQuery(this).find('[id="' + self._lastEvent + '"]');
						
						if( $el.length ) {
							b = true;
						} else if( ! b ) {
							left += ww;
						}
					}
					
					w += ww;
				});
				
				return w;
			}
			
			self._inlineHorizontalUpdate[self._inlineHorizontalUpdate.length] = function() {
				$optionsCnt.removeAttr('style');
				$tb.removeAttr('style').css('margin-left',$tb.attr('data-mgr')+'px');
				
				o1 = w1;
				o2 = w2;
				
				w1 = $optionsCnt.width()-2*8;
				w2 = width();
				
				$optionsCnt.css('width', w1);
				$tb.css('width', w2+fix);
				
				if( w2 > w1 ) {
					$right.addClass('mf-active');
					
					if( x >= w2-w1 && $left.hasClass('mf-active') ) {
						t=0;
						$right.trigger('click');
					} else if( self._lastEvent ) {
						var $el = $tb.find('[id="' + self._lastEvent + '"]');
						
						if( $el.length ) {
							var w = $el.parent().parent().parent().outerWidth(true);
							
							if( x > left ) {
								t=0;
								x=left-w+w1;
								$left.trigger('click');
							} else if( x+w1 < left+w ) {
								t=0;
								x=x+(w*2)-w1;
								$right.trigger('click');
							}
						}
					}
				} else {
					t=x=0;
					$left.addClass('mf-active').trigger('click');
					$right.removeClass('mf-active');
				}
				
				/*if( ! $right.hasClass('mf-active') ) {
					if( w2 > w1 ) {
						//t=0;
						$right.addClass('mf-active');//.trigger('click');
					} else {
						t=x=0;
						$left.addClass('mf-active').trigger('click');
						//$right.removeClass('mf-active');
					}
				} else {
					if( w2 <= w1 ) {
						$right.removeClass('mf-active');
					}
				}*/
			};
			
			var $left = jQuery('<a href="#"></a>'),
				$right = jQuery('<a href="#"></a>');
			
			$wrapper.prepend(jQuery('<div class="mfilter-scroll-left"></div>').append($left));
			$wrapper.append(jQuery('<div class="mfilter-scroll-right"></div>').append($right));
			
			var w1 = $optionsCnt.width(),
				w2 = width(),
				o1 = -1,
				o2 = -1,
				x = 0,
				fix = 50,
				t = 'normal';
			
			if( w2 > w1 ) {
				$right.addClass('mf-active');
			}
			
			$optionsCnt.css('width', w1);
			$tb.css('width', w2+fix).attr('data-mgr','0');
			
			$left.click(function(){
				var $self = jQuery(this);
				
				if( ! $self.hasClass('mf-active') ) return false;
				
				x -= w1;
				
				if( x <= 0 ) {
					x = 0;
					$self.removeClass('mf-active');
				}
				
				$tb.attr('data-mgr', -x).stop().animate({
					'marginLeft' : -x
				}, t);
				
				t = 'normal';
				
				$right.addClass('mf-active');
				
				return false;
			});
			$right.click(function(){
				var $self = jQuery(this);
				
				if( ! $self.hasClass('mf-active') ) return false;
				
				x += w1;
				
				if( x >= w2-w1 ) {
					x = w2-w1;
					$self.removeClass('mf-active');
				}
				
				$tb.attr('data-mgr', -x).stop().animate({
					'marginLeft' : -x
				}, t);
				
				t = 'normal';
				
				$left.addClass('mf-active');
				
				return false;
			});
		});
	},
	
	_initCategoryRelated: function() {
		var self	= this;
		
		self._box.find('.mfilter-filter-item.mfilter-related').each(function(){
			var $li			= jQuery(this),
				seoName		= $li.attr('data-seo-name'),
				autoLevels	= $li.attr('data-auto-levels'),
				fields		= $li.find('select[data-type="category-related"]');
			
			fields.each(function(i){
				if( ! autoLevels && i == fields.length - 1 ) {
					jQuery(this).change(function(){
						self.runAjaxIfPossible();
					});
				} else {
					function eChange( $self, id ) {
						var $this = $self.parent().attr('data-id', id),
							labels = $this.parent().attr('data-labels').split('#|#');
						
						$self.change(function(e, auto){
							var cat_id = $self.val();
							
							$next = $this.next().find('select');
							$parent = $next.parent();
							label = typeof labels[id+1] == 'undefined' ? $parent.attr('data-next-label') : labels[id+1];

							if( cat_id ) {
								$next.html('<option value="">' + self._options.text.loading + '</option>');
								$next.prop('selectedIndex', 0);

								jQuery.post( self._ajaxUrl( self._options.ajaxGetCategoryUrl ), { 'cat_id' : cat_id }, function( response ){
									var data = jQuery.parseJSON( response );

									if( data.length && autoLevels ) {
										var $li = jQuery('<li>');

										$this.after( $li );
										$next = jQuery('<select>').appendTo( $li );
										
										if( ! label )
											label = MegaFilterLang.text_select;

										eChange( $next, id+1 );
									}

									$next.html('<option value="">' + label + '</option>');
									$next.prop('selectedIndex', 0);

									for( var i = 0; i < data.length; i++ ) {
										$next.append( '<option value="' + data[i].id + '">' + data[i].name + '</option>' );
									}

									if( autoLevels ) {
										if( ! data.length && ! auto ) {
											self.runAjaxIfPossible();
										}
									} else if( ! data.length && ! auto ) {
										self.runAjaxIfPossible();
									}
								});
							} else if( $self.parent().attr('data-id') == '0' ) {
								fields.prop('selectedIndex', 0);
								self.runAjaxIfPossible();
							}

							var $p = $parent;

							while( $p.length ) {
								if( autoLevels ) {
									var $t = $p;
									$p = $p.next();
									$t.remove();
								} else {
									$p.find('select').prop('selectedIndex', 0).find('option[value!=""]').remove();
									$p = $p.next();
								}
							}
							
							if( ! cat_id ) {
								var beforeVal	= self.urlToFilters()[seoName],
									afterVal	= self.filters()[seoName];

								if( typeof beforeVal == 'undefined' )
									beforeVal = [-1];

								if( typeof afterVal == 'undefined' )
									afterVal = [-1];

								if( beforeVal.toString() != afterVal.toString() ) {
									self.runAjax();
								}
							}
						});
					}

					eChange( jQuery(this), i );
				}
			});
		});
	},
	
	runAjaxIfPossible: function(){
		var self = this;
		
		if( self._options['refreshResults'] != 'using_button' ) {
			self.runAjax();
			
			return true;
		} else if( self._options['usingButtonWithCountInfo'] && self._options['calculateNumberOfProducts'] ) {
			self._ajaxGetInfo([], true, true);
			
			return true;
		}
		
		return false;
	},
	
	renderSelectedFilters: function( init ){
		if( ! this._options.displaySelectedFilters ) return;
		
		var self = this,
			filters = self.filters(),
			list = [],
			i, j;
		
		self.eachInstances(function( self ){
			filters = jQuery.extend(filters, self.filters());
		}, true);
		
		if( self._selectedFilters === null ) {
			self._selectedFilters = $('<div class="mfilter-selected-filters" data-idx="' + self._instanceIdx + '">').append('<div class="mfilter-selected-filters-cnt"></div>');
			
			if( self._jqContent.attr('class') ) {
				self._selectedFilters.addClass( self._jqContent.attr('class') );
			}
			
			if( self._options.displaySelectedFilters == 'over_filter' ) {
				self._box.find('> .mfilter-content:first').prepend( self._selectedFilters );
			} else {
				self._jqContent.before( self._selectedFilters );
			}
		}
		
		if( ! init ) {
			self.eachInstances(function( self ){
				self.renderSelectedFilters( true );
			}, true);
		}
		
		if( self._selectedFilters.attr('data-idx') != self._instanceIdx+'' ) return;
		
		function add( label, fn ) {
			list.push($('<a>').html('<span>'+label+'</span><span class="mfilter-close"><i></i></span>').click(function(){
				fn();
				
				return false;
			}));
		}
		
		for( i in filters ) {
			(function($li){
				var txt = jQuery.trim( $li.find('.mfilter-heading-text span').html() ),
					type = $li.attr('data-type'),
					baseType = $li.attr('data-base-type');

				if( txt !== '' ) {
					txt += ': ';
				}
				
				switch( true ) {
					case type == 'slider' : {
						(function( $inputs ){
							var $min = $inputs.find('.mfilter-opts-slider-min'),
								$max = $inputs.find('.mfilter-opts-slider-max');

							if( $min.attr('data-key') != $min.attr('data-min') || $max.attr('data-key') != $max.attr('data-max') ) {
								add(txt + $min.val() + ' - ' + $max.val(), function(){
									self._sliders[$li.attr('data-slider-id')].resetValues();

									if( ! self.runAjaxIfPossible() && self._options['refreshResults'] == 'using_button' ) {
										self.runAjax();
									}
								});
							}
						})( $li.find('.mfilter-slider-inputs') );

						break;
					}
					case type == 'price' : {
						(function( $inputs ){
							var $min = $inputs.find('#mfilter-opts-price-min'),
								$max = $inputs.find('#mfilter-opts-price-max');

							if( $min.val() != self._options.priceMin || $max.val() != self._options.priceMax ) {
								add(txt + $min.val() + ' - ' + $max.val(), function(){
									$min.val( self._options.priceMin );
									$max.val( self._options.priceMax );
									$li.find('[id="mfilter-price-slider"]').each(function(){					
										jQuery(this).slider( 'option', 'min', self._options.priceMin );
										jQuery(this).slider( 'option', 'max', self._options.priceMax );
										jQuery(this).slider( 'option', 'values', [ self._options.priceMin, self._options.priceMax ] );
										jQuery(this).slider( 'value', jQuery(this).slider('value') );
									});

									if( ! self.runAjaxIfPossible() && self._options['refreshResults'] == 'using_button' ) {
										self.runAjax();
									}
								});
							}
						})( $li.find('.mfilter-price-inputs') );

						break;
					}
					case type == 'search' :
					case type == 'text' : {
						(function( $input ){
							add(txt + $input.val(), function(){
								$input.val('').trigger('resetvalue');

								if( ! self.runAjaxIfPossible() && self._options['refreshResults'] == 'using_button' ) {
									self.runAjax();
								}
							});
						})( $li.find('input[type=text]') );

						break;
					}
					case type == 'levels' :
					case type == 'select' :
					case type == 'vehicles' : {
						$li.find('select').each(function(){
							var $this = $(this);

							if( $this.val() ) {
								$this.find('option:first').each(function(){
									if( $(this).text().replace(/-+/, '') !== '' ) {
										txt = $(this).text() + ': ';
									}
								});

								var $option = $this.find('option[value="' + $this.val() + '"]');

								add( $option.attr('data-name')?txt + $option.attr('data-name'):txt + $option.text(), function(){
									$this.prop('selectedIndex',0).trigger('change','skipRunAjax');
									
									if( ! self.runAjaxIfPossible() && self._options['refreshResults'] == 'using_button' ) {
										self.runAjax();
									}
								});
							}
						});

						break;
					}
					default : {						
						function findInput( val ) {
							var $input = $li.find('input[value="' + val.replace( /"/g, '&quot;' ) + '"]');							
						
							if( $input.length == 0 ) {
								$li.find('input').each(function(){
									if( $(this).val() == val ) {
										$input = $(this); return true;
									}
								});
							}
							
							return $input;
						}
						
						for( j = 0; j < filters[i].length; j++ ) {
							var val = self.decode( decodeURIComponent( filters[i][j] ) ),
								txt2 = txt;

							switch( true ) {
								case ( type == 'checkbox' || type == 'radio' || type == 'image_list_radio' || type == 'image_list_checkbox' || type == 'rating' || type == 'cat_checkbox' ) : {
									(function( $input ){
										if( ! $input.length ) return;
										
										if( $input.parent().next().find('.mfp-value-link').length ) {
											txt2 += $input.parent().next().find('.mfp-value-link').html();
										} else {
											txt2 += $input.parent().next().html();
										}
										
										add(txt2, function(){
											$input.prop('checked', false).trigger('change','skipRunAjax');
											
											if( ! self.runAjaxIfPossible() && self._options['refreshResults'] == 'using_button' ) {
												self.runAjax();
											}
										});
									})( findInput( val ) );

									break;
								}
								case ( type == 'image' || type == 'image_radio' ) && ( baseType == 'attribute' || baseType == 'option' || baseType == 'filter' ) : {
									(function( $input ){
										if( ! $input.length ) return;
										
										if( $input.next().find('img').length ) {
											txt2 += $input.next().find('img').parent().html();
										} else {
											txt2 += $input.next().attr('title');
										}
										
										add(txt2, function(){
											$input.prop('checked', false).trigger('change','skipRunAjax');
											
											if( ! self.runAjaxIfPossible() && self._options['refreshResults'] == 'using_button' ) {
												self.runAjax();
											}
										});
									})( findInput( val ) );

									break;
								}
							}
						}
					}
				}
			})( self._box.find('[data-seo-name="' + i + '"]') );
		}
		
		var $cnt = self._selectedFilters.find('> div').html('');
		
		self._selectedFilters[list.length?'show':'hide']();
		
		for( i = 0; i < list.length; i++ ) {
			$cnt.append( list[i] );
		}
	},
	
	_initSelectedFilters: function(){
		var self = this;
		
		setTimeout(function(){
			self.renderSelectedFilters( true );
		}, 100);
	},
	
	/**
	 * Init events
	 */
	_initEvents: function() {
		var self = this;
		
		function val( $input ) {
			var val = $input.val(),
				parent = $input.parent();
			
			if( $input.attr('type') == 'checkbox' || $input.attr('type') == 'radio' ) {
				parent.parent().find('.mfilter-counter').unbind('click').bind('click', function(){
					if( ! jQuery(this).hasClass( 'mfilter-close' ) ) return;
					
					$input.prop('checked', false).trigger('change');
				});
				
				val = $input.is(':checked');
				
				if( ! self._options.calculateNumberOfProducts ) {
					if( self._isInit && $input.attr('type') == 'radio' ) {
						parent.parent().find('.mfilter-counter').removeClass('mfilter-close');
					}
					
					parent.find('.mfilter-counter')[val?'addClass':'removeClass']('mfilter-close');
				}
				
				if( $input.attr('type') == 'radio' ) {
					parent.parent().parent().parent().parent().parent().parent().find('.mfilter-option').removeClass('mfilter-input-active mfilter-image-checked');
				}
			}
			
			parent[val?'addClass':'removeClass']('mfilter-input-active');
						
			if( parent.hasClass( 'mfilter-image' ) ) {
				parent[val?'addClass':'removeClass']('mfilter-image-checked');
			}
		}
		
		self._box.find('input[type=checkbox],input[type=radio],select:not([data-type="category-related"])').unbind('change').change(function(e,t){
			var type = jQuery(this).attr('data-type');
			
			if( type && ( type.split('-')[0] == 'vehicle' || type.split('-')[0] == 'level' ) ) {
				var reset = false;
					
				jQuery(this).parent().parent().find('select').each(function(i){
					if( reset ) {
						jQuery(this).html( '<option value="">' + jQuery(this).find('option:first').text() + '</option>' ).prop('selectedIndex',0).mf_selectpicker('refresh');
					} else if( jQuery(this).attr('data-type') == type ) {
						reset = true;
					}
				});
			}
			
			self._lastEvent = jQuery(this).attr('id');
			
			if( t !== 'skipRunAjax' ) {
				self.runAjaxIfPossible();
			}
			
			val(jQuery(this));
			
			if( type && ( type.split('-')[0] == 'vehicle' || type.split('-')[0] == 'level' ) && type.split('-')[1] != 'years' && self._options['refreshResults'] == 'using_button' ) {
				self._ajaxGetInfo([], true);
			}
		});
		
		self._box.find('.mfilter-options .mfilter-option input[type=checkbox]:checked,.mfilter-options .mfilter-option input[type=radio]:checked').each(function(){
			val(jQuery(this));
		});
		
		self._box.find('.mfilter-button a').bind('click', function(){
			self._lastEvent = null;
			
			if( jQuery(this).hasClass( 'mfilter-button-reset' ) ) {
				self.eachInstances(function( self ){
					self.resetFilters();
				});
			}
			
			self.ajax();
			
			return false;
		});
	},
			
	/**
	 * Run ajax
	 */
	runAjax: function( onlyCountInfo ) {
		var self = this;
				
		switch( self._options['refreshResults'] ) {
			case 'using_button' :
			case 'immediately' : {
				self.ajax();
					
				break;
			}
			case 'with_delay' : {
				if( self._timeoutAjax )
					clearTimeout( self._timeoutAjax );
					
				self._timeoutAjax = setTimeout(function(){
					self.ajax( undefined, undefined, onlyCountInfo );
							
					self._timeoutAjax = null;
				}, self._options['refreshDelay'] );
					
				break;
			}
		}
	},
	
	/**
	 * Get the current price range
	 */
	getPriceRange: function() {
		var self		= this,
			minInput	= self._box.find('[id="mfilter-opts-price-min"]'),
			maxInput	= self._box.find('[id="mfilter-opts-price-max"]'),
			min			= minInput.val(),
			max			= maxInput.val();		
			
		if( ! /^[0-9]+$/.test( min ) || min < self._options.priceMin )
			min = self._options.priceMin;
		
		if( ! /^[0-9]+$/.test( max ) || max > self._options.priceMax )
			max = self._options.priceMax;
		
		return {
			min : parseInt( min ),
			max : parseInt( max )
		};
	},
	
	/**
	 * Init price range
	 */
	_initPrice: function() {
		var self		= this,
			priceRange	= self.getPriceRange(),
			filters		= self.urlToFilters(),
			minInput	= self._box.find('[id="mfilter-opts-price-min"]').unbind('change').bind('change', function(){
				changePrice();
			}).val( filters.price ? filters.price[0] : priceRange.min ),
			maxInput	= self._box.find('[id="mfilter-opts-price-max"]').unbind('change').bind('change', function(){
				changePrice();
			}).val( filters.price ? filters.price[1] : priceRange.max ),
			slider		= self._box.find('[id="mfilter-price-slider"]');
		
		self._refreshPrice = function( minMax ) {
			var priceRange = self.getPriceRange();
			
			if( priceRange.min < self._options.priceMin ) {
				priceRange.min = self._options.priceMin;
			}
			
			if( priceRange.max > self._options.priceMax ) {
				priceRange.max = self._options.priceMax;
			}
			
			if( priceRange.min > priceRange.max ) {
				priceRange.min = priceRange.max;
			}
			
			if( priceRange.min.toString() != minInput.val() ) {
				minInput.val( priceRange.min );
			}
			
			if( priceRange.max.toString() != maxInput.val() ) {
				maxInput.val( priceRange.max );
			}
			
			slider.slider( 'option', 'values', [ priceRange.min, priceRange.max ] );
			
			if( minMax !== false ) {
				slider.slider( 'option', 'min', self._options.priceMin );
				slider.slider( 'option', 'max', self._options.priceMax );
				slider.slider( 'value', slider.slider('value') );
			}
		};
			
		function changePrice() {
			self._refreshPrice( false );
			
			self.runAjaxIfPossible();
		}
		
		slider.slider({
			range	: true,
			min		: self._options.priceMin,
			max		: self._options.priceMax,
			values	: [ priceRange.min, priceRange.max ],
			isRTL	: self._options.direction == 'rtl',
			slide	: function( e, ui ) {
				minInput.val( ui.values[0] );
				maxInput.val( ui.values[1] );
			},
			stop	: function( e, ui ) {
				self.runAjaxIfPossible();
			}
		});
	},
	
	_initWindowOnPopState: function(){
		var self = this,
			inited = false;
			
		if( self._isInit ) return;
		
		function update() {
			self.eachInstances(function( self ){
				self._urlToFilters = null;
				self.initUrls();
				self.setFiltersByUrl();
			});
		}

		function setFilters( url ) {
			var params = self._parseUrl( url );

			if( typeof params[self._options.seo.parameter] != 'undefined' ) {
				self.setFiltersByUrl( self.__urlToFilters( decodeURIComponent( params[self._options.seo.parameter] ) ) );
			} else {
				self.resetFilters();
			}
		}
		
		// delay due Safari
		jQuery().ready(function(){
			setTimeout(function(){
				inited = true;
			},1000);
		});

		window.onpopstate = function(e){
			if( ! inited ) return;
			
			if( e.state ) {
				update();

				self._render( e.state.html, e.state.json, true );

				setFilters( e.state.url );
				self.renderSelectedFilters();
			} else if( typeof MegaFilterCommonData.mainContent[self.location()] != 'undefined' && self._history > 0 ) {
				update();

				self._render( MegaFilterCommonData.mainContent[self.location()].html, MegaFilterCommonData.mainContent[self.location()].json, true );

				setFilters( self.location() );
				self.renderSelectedFilters();
			} else if( self._changed && self._history > 0 ) {
				setFilters( self._startUrl.toString() );

				self.ajax( null, true );
			} else {
				update();
				
				setFilters( self.location() );
				
				self.ajax( null, true );
			}

			self._history--;
		};
	},
	
	count: function( obj ) {
		var c = 0;
		
		for( var i in obj ) {
			c++;
		}
		
		return c;
	},
	
	_initVehicles: function() {
		var self = this;
		
		self._box.find('li[data-type="vehicles"]').each(function(){
			var $li = jQuery(this),
				auto_levels = $li.attr('data-auto-levels')=='1'?true:false;
			
			$li.find('select').each(function(i){
				var $self = jQuery(this);

				if( $self.find('option').length == 1 ) {
					$self.attr('disabled',true).mf_selectpicker('refresh');
					
					if( auto_levels && i > 0 ) {
						$self.parent().addClass('mfilter-hide');
					}
				}
			});
		});
	},
	
	_initLevels: function() {
		var self = this;
		
		self._box.find('li[data-type="levels"]').each(function(){
			var $li = jQuery(this);
			
			$li.find('select').each(function(i){
				var $self = jQuery(this);

				if( $self.find('option').length == 1 ) {
					$self.attr('disabled',true).mf_selectpicker('refresh');
					
					if( i > 0 ) {
						$self.parent().addClass('mfilter-hide');
					}
				}
			});
		});
	},
	
	setFiltersByUrl: function( params ) {
		var self	= this;
		
		if( typeof params == 'undefined' ) {
			params = self.urlToFilters();
		}
		
		self.resetFilters( false );
		
		self._box.find('li[data-type]').each(function(){
			var _this	= jQuery(this),
				type	= _this.attr('data-type'),
				seoName	= type == 'tree' || type == 'cat_checkbox' ? 'path' : _this.attr('data-seo-name'),
				value	= params[seoName];
			
			if( typeof value == 'undefined' || typeof value[0] == 'undefined' ) {
				return;
			}
			
			switch( type ) {
				case 'tree' : {
					_this.find('input[name=path]').val( value.join('_') );
					
					break;
				}
				case 'cat_checkbox' :
				case 'rating' :
				case 'stock_status' :
				case 'manufacturers' :
				case 'discounts' :
				case 'image' :
				case 'image_radio' :
				case 'radio' :
				case 'image_list_radio' :
				case 'image_list_checkbox' :
				case 'checkbox' : {
					for( var i in value ) {
						if( typeof value[i] == 'function' ) continue;
						
						if( type == 'image_radio' || type == 'radio' || type == 'image_list_radio' ) {
							_this.find('.mfilter-image-checked').removeClass('mfilter-image-checked');
						}
						
						var val;
						
						try {
							val = decodeURIComponent( value[i] );
						} catch( e ){
							val = value[i];
						}
						
						var val = self.decode( val ),
							$p1 = _this.find('input[value="' + val.replace( /"/g, '&quot;' ) + '"]');
						
						if( $p1.length == 0 ) {
							_this.find('input').each(function(){
								if( $(this).val() == val ) {
									$p1 = $(this); return true;
								}
							});
						}
						
						$p1 = $p1.prop('checked', true)
							.parent()
							.addClass('mfilter-input-active');
						
						$p1.parent()
							.find('.mfilter-counter').addClass('mfilter-close');
						
						if( $p1.hasClass( 'mfilter-image' ) ) {
							$p1.addClass('mfilter-image-checked');
						}
					}
					
					break;
				}
				case 'levels' :
				case 'vehicles' : {
					_this.find('select').each(function(i){
						if( typeof value[i] != 'undefined' ) {
							jQuery(this).find('option').each(function(j){
								if( value[i] == jQuery(this).val() ) {
									jQuery(this).parent().prop('selectedIndex',j).mf_selectpicker('refresh');
									
									return false;
								}
							});
						}
					});
					
					break;
				}
				case 'select' : {
					_this.find('select option[value="' + self.decode( decodeURIComponent( value[0] ) ).replace( /"/g, '&quot;' ) + '"]').attr('selected', true);
					
					_this.find('select.mf_selectpicker').mf_selectpicker('refresh');
						
					break;
				}
				case 'price' : {
					if( typeof value[0] != 'undefined' && typeof value[1] != 'undefined' ) {
						_this.find('input[id="mfilter-opts-price-min"]').val( value[0] );
						_this.find('input[id="mfilter-opts-price-max"]').val( value[1] );

						_this.find('[id="mfilter-price-slider"]').each(function(){					
							//jQuery(this).slider( 'option', 'min', value[0] );
							//jQuery(this).slider( 'option', 'max', value[1] );
							jQuery(this).slider( 'option', 'values', [ value[0], value[1] ] );
							jQuery(this).slider( 'value', jQuery(this).slider('value') );
						});
					}
					
					break;
				}
				case 'text' :
				case 'search' : {
					_this.find('input').val( self.decode( decodeURIComponent( value[0] ) ) );
					
					break;
				}
				case 'slider' : {
					if( [ 'weight', 'width', 'height', 'length' ].indexOf( seoName ) > -1 ) {
						value = value.sort(function(a,b){
							return parseFloat( a ) - parseFloat( b );
						});
					}
					
					self._sliders[_this.attr('data-slider-id')].setValues(value);
					
					break;
				}
			}
		});
		
		//for( var i = 0; i < self._sliders.length; i++ ) {
		//	self._sliders[i].setValues();
		//}
	},
	
	/**
	 * Show loader
	 */
	_showLoader: function( forceOverFilter ) {
		var self = this;
				
		if( self._jqLoader == null && ( forceOverFilter !== true || self._options.showLoaderOverResults ) ) {
			self.__initLoader();
		}
		
		if( self._jqLoaderFilter == null && ( forceOverFilter === true || self._options.showLoaderOverFilter ) ) {
			self.__initLoaderFilter();
		}
		
		if( forceOverFilter !== true && self._options.showLoaderOverResults ) {
			(function(){
				var w = self._jqContent.outerWidth(),
					h = self._jqContent.outerHeight(),
					j = self._jqContent.find('.product-list'),
					k = j.length ? j : self._jqContent.find('.product-grid'),
					l = k.length ? k : self._jqContent,
					t = k.length ? k.offset().top - 150 : l.offset().top;

				self._jqLoader
					.css('width', w + 'px')
					.css('height', h + 'px')
					.fadeTo('normal', 1)
					.find('img')
					.css('margin-top', t + 'px');
			})();
		}
		
		if( forceOverFilter === true || self._options.showLoaderOverFilter ) {
			(function(){
				var w = self._box.outerWidth(),
					h = self._box.outerHeight();
				
				self._jqLoaderFilter
					.css('width', w + 'px')
					.css('height', h + 'px')
					.fadeTo('normal',1);
			})();
		}
		
		if( forceOverFilter !== true ) {
			if( self._options.autoScroll ) {
				jQuery('html,body').stop().animate({
					scrollTop: self._jqContent.offset().top + self._options.addPixelsFromTop
				}, 'low', function(){
					//self._busy = false;
					self.render();
				});
			} else {
				//self._busy = false;
				self.render();
			}
		}
	},
	
	/**
	 * Hide loader
	 */
	_hideLoader: function() {
		var self = this;
		
		if( self._jqLoader !== null ) {		
			self._jqLoader.remove();
			self._jqLoader = null;
		}
		
		if( self._jqLoaderFilter !== null ) {
			self._jqLoaderFilter.remove();
			self._jqLoaderFilter = null;
		}
	},
	
	/**
	 * Render data
	 */
	render: function( history ) {
		var self = this;
		
		if( self._lastResponse === '' || self._busy ) {
			return;
		}
		
		self._hideLoader();
		
		// remove all links to scripts JS
		self._lastResponse = self._lastResponse.replace( /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '' );
		
		var tmp = jQuery('<tmp>').html( self._lastResponse ),
			content = tmp.find(self._contentId), // find main container
			json = tmp.find('#mfilter-json'); // information JSON containing data on the number of products by category
			
		if( ! content.length && self._contentId != '#content' ) {
			content = tmp.find('#content');
		}
			
		if( content.length ) {
			var styles = self._jqContent.html().match( /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi );
			
			if( styles != null && styles.length ) {
				for( var i = 0; i < styles.length; i++ ) {
					jQuery('head:first').append( styles[i] );
				}
			}
			
			self._render( content.html(), json && json.length ? self.base64_decode(json.html()) : null, history );
			
			self._lastResponse = '';
		} else {
			self.reload();
		}
	},
	
	urlToSeo: function( u, data ){
		var self = this,
			url = '';
		
		url += u.scheme && u.host ? u.scheme + ':' : '';
		url += u.host ? '//' + u.host : '';
		url += u.port ? ':' + u.port : '';
		url += typeof u.path != 'undefined' ? self.removeMfpFromUrl( decodeURIComponent( u.path ) ) : '/';
		
		if( data && typeof data['url_alias'] != 'undefined' ) {
			self._seoAliases[self.filtersToUrl( undefined, true )] = data['url_alias'];
		}

		if( self._options.seo.enabled && typeof u.query != 'undefined' && u.query ) {					
			//if( u.path != '/' ) {
				var reg = new RegExp(self._options.seo.parameter+'=([^&]+)'),
					mfp = u.query.match( reg );

				url = url.replace( /\/$/, '' );

				if( mfp ) {
					url += ! data || typeof data['url_alias'] == 'undefined' ? '/' + self._options.seo.separator + '/' + mfp[1] : '/' + data['url_alias'];
					
					if( self._options.seo.addSlashAtTheEnd ) {
						url += 'http://demo2.ninethemes.net/';
					}
					
					u.query = u.query.replace( self._options.seo.parameter + '=' + mfp[1], '' );
					u.query = u.query.replace( /^(\?|&)|&$/g, '' );
					u.query = u.query.replace( /&&/g, '&' );
				}

				if( u.query != '' ) {
					url += '?' + u.query;
				}

			//} else {
			//	url += '?' + u.query;
			//}

			self._lastUrl = url;
		} else if( data && typeof data['url_alias'] != 'undefined' ) {
			url = url.replace( /\/$/, '' );
			url += '/' + data['url_alias'];
					
			if( self._options.seo.enabled && self._options.seo.addSlashAtTheEnd ) {
				url += 'http://demo2.ninethemes.net/';
			}
		}
		
		return url;
	},
	
	_render: function( html, json, history ) {
		var self = this;
		
		if( history !== true ) {
			self._lastUrl = self.createUrl();
			
			if( self._ajaxPagination !== null ) {
				self._lastUrl += self._lastUrl.indexOf( '?' ) > -1 ? '&' : '?';
				self._lastUrl += 'page=' + self._ajaxPagination;
				
				self._ajaxPagination = null;
			}
			
			self._urlToFilters = null;
			
			if( self._options.seo.enabled || self._options.seo.aliasesEnabled ) {
				var u = self.parse_url( self._lastUrl ),
					data = jQuery.parseJSON( json || '{}' ),
					url = self.urlToSeo(u, data);
				
				if( self._options.seo.enabled && typeof u.query != 'undefined' && u.query ) {					
					self._lastUrl = url;
				} else if( typeof data['url_alias'] != 'undefined' ) {
					self._lastUrl = url;
				}
			}
			
			try {
				window.history.pushState({
					'html'	: html,
					'json'	: json,
					'url'	: self._lastUrl
				}, '', self._lastUrl );
				
				self._history++;
			} catch( e ) {}
		}
		
		if( json ) {
			self.eachInstances(function( self ){
				self._parseInfo( json );
				self.checkValueLinks();
			});
		}
		
		self.beforeRender( self._lastResponse, html, json );
			
		self._jqContent.html( html );
			
		/*if( self._box.hasClass( 'mfilter-content_top' ) ) {
			self._jqContent.prepend( self._box.removeClass('init') );
			self.init( self._box, self._options );
		}*/
			
		if( typeof jQuery.totalStorage == 'function' && jQuery.totalStorage('display') ) {
			display_MFP( jQuery.totalStorage('display') );
		} else if( typeof jQuery.cookie == 'function' && jQuery.cookie('display') ) {
			display_MFP( jQuery.cookie('display') );
		} else {
			display_MFP( 'list' );
		}
			
		for( var i in self ) {
			if( i.indexOf( '_initAlways' ) === 0 && typeof self[i] == 'function' ) {
				self[i]();
			}
		}
		
		for( var f = 0; f < self._liveFilters.length; f++ ) {
			self._liveFilters[f].check();
		}
		
		// Support for Product Quantity Extension (15186)
		if( typeof pq_initExt == 'function' ) {
			pq_initExt();
		}
		
		if( self._options.routeHome == self._options.route && self._options.homePageAJAX ) {
			self._jqContent.find('.pagination > li > a').unbind('click').bind('click', function(){
				self.ajax( jQuery(this).attr('href') );
				
				return false;
			});
		}
		
		if( self._relativeScroll ) {
			self._relativeScroll.reinit();
		}
		
		self.afterRender( self._lastResponse, html, json );
	},
	
	beforeRequest: function(){},
	
	beforeRender: function(){},
	
	afterRender: function(){},
	
	eachInstances: function( fn, skipCurrent ) {
		for( var i = 0; i < MegaFilterINSTANCES.length; i++ ) {
			if( skipCurrent === true && i == this._instanceIdx ) continue;
			
			fn( MegaFilterINSTANCES[i] );
		}
	},
	
	checkValueLinks: function(){
		var self = this;
		
		if( ! self._options.seo.valuesAreLinks ) { 
			return;
		}
		
		var params = self.filters( false, false ),
			currentUrl = self.parse_url( MegaFilterCommonData.seo.currentUrl ),
			baseUrl = '';
		
		baseUrl += currentUrl.host ? '//' + currentUrl.host : '';
		baseUrl += currentUrl.port ? ':' + currentUrl.port : '';
		
		if( self._options.routeHome == self._options.route && ! self._options.homePageAJAX ) {
			if( currentUrl.query && currentUrl.query.indexOf( 'route=common/home' ) >= 0 ) {
				baseUrl += currentUrl.path ? currentUrl.path : '/';
				
				currentUrl.query = currentUrl.query.replace( 'route=common/home', 'route=module/mega_filter/results' );
			} else if( currentUrl.path == 'common/home' || ! currentUrl.path ) {
				baseUrl += 'module/mega_filter/results';
			}
		} else {
			baseUrl += currentUrl.path ? currentUrl.path : '/';
		}

		self.eachInstances(function( self ){
			params = jQuery.extend( self.filters( false, false ), params );
		}, true);
		
		self.eachInstances(function( self ){
			jQuery(self._box).find('li[data-seo-name]').each(function(){
				var name = jQuery(this).attr('data-seo-name'),
					type = jQuery(this).attr('data-type');

				jQuery(this).find('a.mfp-value-link').each(function(){
					var $self = jQuery(this),
						href = (function(){
							if( $self.attr('data-href') ) {
								return $self.attr('data-href');
							}

							return /*decodeURIComponent*/( $self.attr('href') );
						})(),
						value = $self.attr('data-value'),
						new_url = baseUrl,
						copy = jQuery.extend( true, {}, params ),
						query = currentUrl.query ? currentUrl.query : '';
						
					if( $self.hasClass('mfp-value-link-disabled') ) {
						new_url = '#';

						if( ! $self.attr('data-href') ) {
							$self.attr('data-href', $self.attr('href'));
							$self.attr('href', '#');
						}
					} else {
						if( $self.attr('data-href') ) {
							$self.attr('href', $self.attr('data-href'));
							$self.removeAttr('data-href');
						}
						
						if( typeof copy[name] != 'undefined' ) {
							var tmp = [],
								idx = -1;

							for( var i = 0; i < copy[name].length; i++ ) {
								if( copy[name][i] == value ) {
									idx = i;
								} else {
									tmp.push( copy[name][i] );
								}
							}

							if( idx > -1 ) {
								if( tmp.length ) {
									copy[name] = tmp;
								} else {
									delete copy[name];
								}
							} else if( type == 'radio' || type == 'image_radio' || type == 'image_list_radio' ) {
								copy[name] = [ value ];
							} else {
								copy[name].push( value );
							}
						} else {
							copy[name] = [ value ];
						}
						
						copy = self.sortParamsForSeoAlias( copy );
						
						var copy_key = self.filtersToUrl( copy, true );
						
						if( typeof MegaFilterCommonData.seo.aliases[copy_key] != 'undefined' ) {
							new_url = new_url.replace( /\/+$/, '' ) + '/' + MegaFilterCommonData.seo.aliases[copy_key];
							
							if( self._options.seo.enabled && self._options.seo.addSlashAtTheEnd ) {
								new_url += 'http://demo2.ninethemes.net/';
							}
						} else {
							if( self.count( copy ) ) {
								if( self._options.seo.enabled ) {
									new_url = new_url.replace( /\/+$/, '' ) + '/' + self._options.seo.separator + '/' + self.filtersToUrl( copy );
									
									if( self._options.seo.addSlashAtTheEnd ) {
										new_url += 'http://demo2.ninethemes.net/';
									}
								} else {
									if( query != '' ) {
										query += '&';
									}

									query += self._options.seo.parameter + '=' + self.filtersToUrl( copy );
								}
							}
						}

						new_url += query ? '?' + query : '';
					}

					jQuery(this).attr('href', new_url);
				});
			});
		});
	},
	
	sortParamsForSeoAlias: function( params ){
		var self = this;
		
		params = self.sortObjByKeys( params );
		
		for( var i in params ) {
			var type = self._box.find('[data-seo-name="' + i + '"]').attr('data-type');
			
			if( type != 'slider' && type != 'price' ) {
				params[i] = params[i].sort();
			}
		}
		
		return params;
	},
	
	sortObjByKeys: function( params ) {
		var keys = [],
			obj = {},
			i, j;
		
		for( i in params ) {
			keys.push( i );
		}
		
		keys.sort();
		
		for( i = 0; i < keys.length; i++ ) {
			/*var vals = [];
			
			for( j = 0; j < params[keys[i]].length; j++ ) {
				vals.push( decodeURIComponent( params[keys[i]][j] ) );
			}*/
			
			obj[keys[i]] = params[keys[i]];
		}
		
		return obj;
	},
	
	/**
	 * Load datas
	 */
	ajax: function( url, history, onlyCountInfo ) {
		var self = this;
		
		if( self._busy ) {
			self._waitingChanges = true;
			
			return;
		}
		
		(function(){
			var filters = self.filters( true );
			
			self.eachInstances(function( self ){
				var params = jQuery.extend( self.filters(), filters );
				
				if( typeof filters.path == 'undefined' ) {
					params.path = [self._path()];
				}
				
				self.setFiltersByUrl( params );
			}, true);
		})();
		
		if( typeof url == 'undefined' || url === null ) {
			url = [ self._options.routeProduct, self._options.routeHome, self._options.routeInformation, self._options.routeManufacturerList ].indexOf( self._options.route ) > -1 ? self.createUrl( self._options.ajaxResultsUrl, undefined, undefined, ! ( self._options.seo.enabled && self._options.seo.usePostAjaxRequests ) ) : self.createUrl( undefined, undefined, undefined, ! ( self._options.seo.enabled && self._options.seo.usePostAjaxRequests ) );
		} else {
			var mfpUrl = this.filtersToUrl();
			
			url = this.removeMfpFromUrl( url );
			
			if( mfpUrl != '' ) {
				url += ( url.indexOf( '?' ) >= 0 ? '&' : '?' ) + self._options.seo.parameter + '=' + mfpUrl;
			}
		}
		
		var cname	= url + self._options.idx;
		
		if( ( ! self._options.homePageAJAX && self._options.routeHome == self._options.route ) || [ self._options.routeProduct, self._options.routeInformation, self._options.routeManufacturerList ].indexOf( self._options.route ) > -1 ) {
			if( url.indexOf( 'path,' ) < 0 && url.indexOf( 'path[' ) < 0 && self._options.data.category_id !== null ) {
				if( url.indexOf( self._options.seo.parameter + '=' ) < 0 ) {
					url += url.indexOf( '?' ) >= 0 ? '&' : '?';
					url += self._options.seo.parameter + '=';
				} else {
					url += ',';
				}
				url += 'force-path[' + self._options.data.category_id + ']';
			}
			
			window.location.href = url;
			
			return;
		}


		self.eachInstances(function( self ){
			self._busy = true;
			self._lastResponse = '';
		});
		
		self.renderSelectedFilters();
		
		self._showLoader();
		
		if( typeof self._params['page'] != 'undefined' ) {
			delete self._params['page'];
		}
		
		if( typeof MegaFilterCommonData.lastResponse[cname] != 'undefined' ) {
			self.eachInstances(function( self2 ){
				self2._lastResponse = MegaFilterCommonData.lastResponse[cname];
			});
			
			setTimeout(function(){
				self.eachInstances(function( self ){
					self._busy = false;
				});
				
				self.render( history );
			}, 100);
			
			return;
		}
		
		if( self.beforeRequest() === false ) {
			return;
		}
		
		url = self._ajaxUrl( url );
		url = self.getToPost( url );
		
		self._changed = true;
		
		jQuery.ajax({
			'type'		: self._options.seo.enabled && self._options.seo.usePostAjaxRequests ? 'POST' : 'GET',
			'url'		: url.url,
			'timeout'	: 60 * 1000,
			'cache'		: false,
			'data'		: jQuery.extend({
				'mfilterAjax'	: '1',
				'mfilterIdx'	: self._options.idx,
				'mfilterBTypes'	: self.baseTypes().join(','),
				'mfilterPath'	: self._path(),
				'mfilterLPath'	: self.locationPath()
			}, url.data),
			'success'	: function( response ) {
				self.eachInstances(function( self ){
					self._busy = false;
				});
				
				if( response ) {
					MegaFilterCommonData.lastResponse[cname] = response;
					
					self.eachInstances(function( self ){
						self._lastResponse	= response;
					});
					
					self.render( history );
					
					if( self._waitingChanges ) {
						self._waitingChanges = false;
						self.ajax();
					}
				} else {
					self.reload();
				}
			},
			'error'		: function() {
				self.reload();
			}
		});
	},
	
	/**
	 * Create full URL
	 */
	createUrl: function( url, attribs, force, ajax ) {
		var self	= this,
			params	= self.paramsToUrl( url, attribs ),
			filters	= self.filtersToUrl( undefined, ajax ),
			urlSep	= self._urlSep;
		
		if( typeof url == 'undefined' ) {
			url = self._url;
		} else {
			urlSep = self._parseSep( url.split('#')[0] ).urlSep;
			url = self._parseSep( url.split('#')[0] ).url;
		}
		
		url = self.removeMfpFromUrl( decodeURIComponent( url ) );
		
		if( params || filters ) {
			url += urlSep.f;
			
			if( params ) {
				url += params;
			}
			
			if( filters ) {
				if( params ) {
					url += urlSep.n;
				}
				
				url += self._options.seo.parameter + ( urlSep.n == '&' ? '=' : urlSep.n ) + filters;
			} else if( force ) {
				var mfp = self.filtersToUrl( self.urlToFilters() );

				if( mfp ) {
					url += urlSep.n;
					url += self._options.seo.parameter + ( urlSep.n == '&' ? '=' : urlSep.n ) + mfp;
				}
			}
		}
		
		return url;
	},
	
	/**
	 * Check correct entered price range
	 * 
	 * @return bool
	 */
	_validPrice: function( min, max ) {
		var self = this;
		
		min = parseInt( min );
		max = parseInt( max );
		
		if( min < self._options.priceMin ) {
			min = self._options.priceMin;
		}
		
		if( max > self._options.priceMax ) {
			max = self._options.priceMax;
		}
		
		if( min > max ) {
			return false;
		}
		
		if( min == max && min == self._options.priceMin && max == self._options.priceMax ) {
			return false;
		}
		
		return [ min, max ];
	},
	
	/**
	 * Make parameters from the URL to object
	 * 
	 * @return object
	 */
	urlToFilters: function( force ) {
		if( this._urlToFilters !== null ) {
			return this._urlToFilters;
		}
		
		var self = this;
		
		self._urlToFilters = {};
		
		if( ! self._params[self._options.seo.parameter] ) {
			return self._urlToFilters;
		}
		
		try {
			self._params[self._options.seo.parameter] = decodeURIComponent( self._params[self._options.seo.parameter] );
		} catch( e ) {}
		
		self._urlToFilters = self.__urlToFilters( self._params[self._options.seo.parameter] );
		
		return self._urlToFilters;
	},
	
	__urlToFilters: function( mfp ) {
		var self	= this,
			obj		= {},
			matches	= mfp.match( /[a-z0-9\-_]+\[[^\]]+\]/g );
		
		function validValue( key, val ) {
			switch( key ) {
				case 'force-path' : {
					self._options.data.force_category_id = val[0];
					
					return null;
				}
				case 'price' : {
					if( typeof val[0] != 'undefined' && val[1] != 'undefined' ) {
						var price = self._validPrice( val[0], val[1] );
						
						if( price !== false ) {
							return price;
						}
					}
					
					return null;
				}
				case 'stock_status' : {
					if( ! val.length || val[0] == '0' ) {
						return [];
					}
					
					return val;
				}
				default : {
					return val;
				}
			}
		}
		
		if( ! matches ) {
			if( self._options.seo.enabled ) {
				matches = mfp.split('http://demo2.ninethemes.net/');
				
				for( var i = 0; i < matches.length; i++ ) {
					var val = matches[i].split(','),
						key = val.shift();
					
					val = validValue( key, val );
					
					if( val !== null ) {
						obj[key] = val;
					}
				}
			}
			
			return obj;
		}
		
		for( var i = 0; i < matches.length; i++ ) {
			var key = matches[i].match( /([a-z0-9\-_]+)\[[^\]]+\]/ )[1],
				val = validValue( key, matches[i].match( /[a-z0-9\-_]+\[([^\]]+)\]/ )[1].split(',') );
			
			if( val !== null ) {
				obj[key] = val;
			}
		}
		
		return obj;
	},
	
	resetFilters: function( renderSelectedFilters ){
		var self	= this;
		
		self._urlToFilters = null;
		
		if( self._params !== null ) {
			delete self._params[self._options.seo.parameter];
		} else {
			self._params = {};
		}
		
		self._box.find('li[data-type]').each(function(){
			var _this		= jQuery(this),
				type		= _this.attr('data-type'),
				baseType	= _this.attr('data-base-type'),
				defaultVal	= null;
				
			_this.find('.mfilter-input-active').removeClass('mfilter-input-active');
			
			if( baseType == 'stock_status' && self._options.inStockDefaultSelected ) {
				defaultVal = self._options.inStockStatus;
			}
			
			switch( type ) {
				case 'image_radio' :
				case 'image' : {
					_this.find('input[type=checkbox]:checked,input[type=radio]:checked').prop('checked', false).parent().removeClass('mfilter-image-checked');
					
					break;
				}
				case 'cat_checkbox' : {
					_this.find('input[type=checkbox]:checked').prop('checked', false);
					_this.find('.mfilter-counter').removeClass('mfilter-close');
					
					break;
				}
				case 'tree' : {
					_this.find('input[name=path]').val( typeof self._options.params.path_aliases == 'undefined' ? ( typeof self._options.params.path == 'undefined' ? '' : self._options.params.path ) : self._options.params.path_aliases );
					
					break;
				}
				case 'rating' :
				case 'stock_status' :
				case 'manufacturers' :
				case 'discounts' :
				case 'checkbox' : 
				case 'image_list_checkbox' : 
				case 'image_list_radio' : 
				case 'radio' : {
					_this.find('input[type=checkbox]:checked,input[type=radio]:checked').prop('checked', false);
					_this.find('.mfilter-counter').removeClass('mfilter-close');
					
					if( defaultVal !== null ) {
						_this.find('input[value="' + defaultVal.replace( /"/g, '&quot;' ) + '"]').prop('checked', true)
							.parent().parent().find('.mfilter-counter').addClass('mfilter-close');
					}
					
					break;
				}
				case 'search_oc' :
				case 'search' : {
					_this.find('input[id="mfilter-opts-search"]').val( '' );
						
					break;
				}
				case 'text' : {
					_this.find('input[type=text]').val( '' );
					
					break;
				}
				case 'slider' : {					
					
					
					break;
				}
				case 'price' : {
					_this.find('input[id="mfilter-opts-price-min"]').val( self._options.priceMin );
					_this.find('input[id="mfilter-opts-price-max"]').val( self._options.priceMax );
					_this.find('[id="mfilter-price-slider"]').each(function(){					
						jQuery(this).slider( 'option', 'min', self._options.priceMin );
						jQuery(this).slider( 'option', 'max', self._options.priceMax );
						jQuery(this).slider( 'option', 'values', [ self._options.priceMin, self._options.priceMax ] );
						jQuery(this).slider( 'value', jQuery(this).slider('value') );
					});
					
					break;
				}
				case 'levels' :
				case 'vehicles' : 
				case 'related' :
				case 'select' : {
					if( self._isInit || type != 'related' ) {
						_this.find('select option').removeAttr('selected');

						if( defaultVal !== null ) {
							_this.find('select option').each(function(i){
								if( jQuery(this).val() == defaultVal ) {
									jQuery(this).attr('selected', true);
									_this.find('select').prop('selectedIndex', i);

									return false;
								}
							});
						} else {
							_this.find('select option:first').attr('selected', true);
							_this.find('select').prop('selectedIndex', 0);
						}

						if( type == 'related' ) {
							_this.find('select').each(function(i){
								if( i ) {
									if( _this.attr('data-auto-levels') ) {
										jQuery(this).parent().remove();
									} else {
										jQuery(this).find('option[value!=""]').remove();
									}
								}
							});
						}

						_this.find('select.mf_selectpicker').mf_selectpicker('refresh');
					}
					
					break;
				}
			}
		});
		
		for( var i = 0; i < self._sliders.length; i++ ) {
			self._sliders[i].resetValues();
		}
		
		if( renderSelectedFilters !== false ) {
			self.renderSelectedFilters();
		}
	},
	
	/**
	 * Get current values of all filters
	 * 
	 * @return object
	 */
	filters: function( alsoEmpty, ajax ) {
		var self	= this,
			params	= { },
			stockStatusExist = self._box.find('li[data-base-type="stock_status"]').length ? true : false;
		
		if( typeof self._options.data.force_category_id != 'undefined' ) {
			params['path'] = [ self._options.data.force_category_id ];
		}
				
		self._box.find('li[data-type]').each(function(){
			var _this	= jQuery(this),
				type	= _this.attr('data-type'),
				seoName	= _this.attr('data-seo-name');
				
			if( alsoEmpty === true ) {
				if( typeof params[seoName] == 'undefined' ) {
					params[seoName] = [];
				}
			}
			
			switch( type ) {
				case 'cat_checkbox' : 
				case 'rating' :
				case 'stock_status' : 
				case 'manufacturers' :
				case 'discounts' :
				case 'image_list_checkbox' :
				case 'image' :
				case 'checkbox' : {
					_this.find('input[type=checkbox]:checked').each(function(){
						if( typeof params[seoName] == 'undefined' ) {
							params[seoName] = [];
							
							/*if( type == 'cat_checkbox' ) {
								if( typeof self._options.params.mfp_org_path != 'undefined' ) {
									params[seoName].push( self._options.params.mfp_org_path );
								} else if( typeof self._options.params.path != 'undefined' ) {
									params[seoName].push( self._options.params.path );
								}
							}*/
						}
						
						params[seoName].push( encodeURIComponent( self.encode( jQuery(this).val() ) ) );
					});
					
					break;
				}
				case 'image_radio' :
				case 'image_list_radio' :
				case 'radio' : {
					_this.find('input[type=radio]:checked').each(function(){
						params[seoName] = [ encodeURIComponent( self.encode( jQuery(this).val() ) ) ];
					});
						
					break;
				}
				case 'slider' : {
					var slider_id = _this.attr('data-slider-id'),
						slider_vals = self._sliders[slider_id].getValues();
					
					if( slider_vals.length ) {
						params[seoName] = slider_vals;
					}
					
					break;
				}
				case 'price' : {
					var priceRange = self.getPriceRange();
					
					if( priceRange.min != self._options.priceMin || priceRange.max != self._options.priceMax ) {
						var price = self._validPrice( priceRange.min, priceRange.max );
						
						if( price !== false ) {
							params[seoName] = price;
						}
					}
					
					break;
				}
				case 'search_oc' :
				case 'search' : {
					_this.find('input[id="mfilter-opts-search"]').each(function(){
						if( jQuery(this).val() !== '' ) {
							params[seoName] = [ encodeURIComponent( self.encode( jQuery(this).val() ) ) ];
						}
					});
					
					break;
				}
				case 'text' : {
					_this.find('input[type=text]').each(function(){
						if( jQuery(this).val() != '' ) {
							params[seoName] = [ encodeURIComponent( self.encode( jQuery(this).val() ) ) ];
						}
					});
					
					break;
				}
				case 'select' : {
					_this.find('select').each(function(){
						if( jQuery(this).val() )
							params[seoName] = [ encodeURIComponent( self.encode( jQuery(this).val() ) ) ];
					});
						
					break;
				}
				case 'levels' :
				case 'vehicles' :
				case 'related' : {
					//if( _this.find('select:last').val() ) {
						_this.find('select').each(function(){
							var val = jQuery(this).val();
							
							if( val ) {							
								if( typeof params[seoName] == 'undefined' )
									params[seoName] = [];

								params[seoName].push( val );
							} else if( jQuery(this).attr('data-type') == 'vehicle-engines' ) {
								if( _this.find('select[data-type="vehicle-years"]').val() ) {
									params[seoName].push( '0' );
								}
							}
						});
					//}
				}
				case 'tree' : {
					_this.find('input').each(function(){
						var val = jQuery(this).val();
						
						if( val ) {
							params['path'] = [ val ];
						}
					});
					
					break;
				}
			}
		});
		
		// check that the default should be selected "in stock"
		if( self._options.inStockDefaultSelected && typeof params['stock_status'] == 'undefined' ) {
			params['stock_status'] = stockStatusExist ? [ 0 ] : [ self._options.inStockStatus ];
		}
		
		if( ! ajax && typeof params.path != 'undefined' ) {
			if( typeof self._seoAliases[self.filtersToUrl(params)] != 'undefined' && params.path == self._path() ) {
				delete params['path'];
			} else if( typeof self._options.params.path_aliases != 'undefined' && params.path == self._options.params.path_aliases ) {
				delete params['path'];
			} else if( typeof self._options.params.path != 'undefined' && params.path == self._options.params.path ) {
				delete params['path'];
			}
		}
		
		return params;
	},
			
	/**
	 * Create a URL based on parameters
	 */
	filtersToUrl: function( params, ajax ) {
		var self	= this,
			url		= '';
		
		if( typeof params == 'undefined' ) {
			params	= self.filters( false, ajax );
		
			self.eachInstances(function( self ){
				params = jQuery.extend( self.filters( false, ajax ), params );
			}, true);
		}
		
		if( ! ajax && self._options.seo.enabled ) {
			for( var i in params ) {
				url += url ? '/' : '';
				url += '' + i + ',' + params[i].join(',') /*(function(){
					var out = [];
					
					for( var j = 0; j < params[i].length; j++ ) {
						out.push( encodeURIComponent( params[i][j] ) );
					}
					
					return out.join(',');
				})()*/;
			}
		} else {
			for( var i in params ) {
				url += url ? ',' : '';
				url += '' + i + '[' + /*encodeURIComponent*/( params[i].join(',') ) + ']';
			}
		}
			
		return url;
	},
	
	/**
	 * Make parameters to the URL
	 * 
	 * @return string
	 */
	paramsToUrl: function( url, attribs ) {
		var self	= this,
			params	= typeof url == 'undefined' ? self._params : self._parseUrl( url, attribs ),
			urlSep	= typeof url == 'undefined' ? self._urlSep : self._parseSep( url ).urlSep;
		
		return self._paramsToUrl( params, {
			'skip'	: [ 'mfilter-ajax', self._options.seo.parameter, 'page' ],
			'sep'	: urlSep.n,
			'sep2'	: urlSep.n == '&' ? '=' : urlSep.n,
			'fn'	: function( i ) {
				return typeof url == 'undefined' && typeof self._inUrl[i] == 'undefined';
			}
		});
	},
	
	_paramsToUrl: function( params, o ) {
		var url = '';
		
		o = jQuery.extend({
			'skip'	: [],
			'sep'	: '&',
			'sep2'	: '=',
			'fn'	: function(){}
		}, typeof o == 'object' ? o : {});
		
		for( var i in params ) {
			if( o.skip.indexOf( i ) > -1 ) continue;
			
			if( o.fn( i, params[i] ) ) continue;
			
			url += url ? o.sep : '';
			url += i + o.sep2 + params[i];
		}
		
		return url;
	},
		
	/**
	 * @param url string
	 * @param attribs object
	 * @return object
	 */
	_parseUrl: function( url, attribs ) {		
		if( typeof attribs != 'object' )
			attribs = {
				'mfilter-ajax'	: '1'
			};
		
		if( typeof url == 'undefined' )
			return attribs;
			
		var self	= this,
			reg		= new RegExp('/'+self._options.seo.parameter+',([a-z0-9\-_]+\[[^\]]*\],?)+', 'g'),
			params, i, name, value, param,
			mfp;
		
		url = url.split('#')[0];
		mfp = url.match( reg );
		
		if( mfp ) {
			var reg1 = new RegExp('^/'+self._options.seo.parameter+',');
			
			attribs[self._options.seo.parameter] = mfp[0].split('?')[0].replace( reg1, '' );
		} else {
			var reg1 = new RegExp('/'+self._options.seo.separator+'/([a-z0-9\-_]+,[^/]+/?)+', 'g');
			
			mfp = url.match( reg1 );
			
			if( mfp ) {
				var reg2 = new RegExp('^/'+self._options.seo.separator+'/');
				
				attribs[self._options.seo.parameter] = mfp[0].split('?')[0].replace( reg2, '' );
			}
		}
		
		var parsed = self.parse_url( url );
		
		if( typeof attribs[self._options.seo.parameter] == 'undefined' && parsed.path && parsed.path != 'index.php' && parsed.path != 'http://demo2.ninethemes.net/index.php' ) {
			var parts = parsed.path.replace( self.parse_url( MegaFilterCommonData.seo.currentUrl ).path, '' ).split('http://demo2.ninethemes.net/');
			
			if( parts.length && parts[parts.length-1] != '' ) {
				var alias = parts[parts.length-1];
				
				for( i in MegaFilterCommonData.seo.aliases ) {
					if( alias == MegaFilterCommonData.seo.aliases[i] ) {
						attribs[self._options.seo.parameter] = i;
						
						break;
					}
				}
			}
		}
		
		if( url.indexOf( '?' ) > -1 || url.indexOf( '&' ) > -1 ) {
			params = typeof parsed.query != 'undefined' ? parsed.query.split('&') : url.split('&');
			
			for( i = 0; i < params.length; i++ ) {
				if( params[i].indexOf( '=' ) < 0 ) continue;
				
				param	= params[i].split('=');
				name	= param[0];
				value	= param[1];

				if( ! name ) continue;

				attribs[name] = value;
			}
		} else {
			params	= url.split( ';' );
			name	= null;
				
			for( i = 1; i < params.length; i++ ) {
				if( name === null )
					name = params[i];
				else {
					attribs[name] = params[i];
					name = null;
				}
			}
		}
		
		return attribs;
	},
	
	/**
	 * Reload page
	 */
	reload: function() {
		var self = this;
		
		window.location.href = self.createUrl();
	}
};
var MegaFilterLang = {};

jQuery().ready(function(){			
	jQuery(document).mf_swipe({
		swipe: function( e, direction, distance, duration, fingerCount, fingerData ){
			for( var i = 0; i < MegaFilterINSTANCES.length; i++ ) {
				MegaFilterINSTANCES[i].swipe( e, direction, distance, duration, fingerCount, fingerData );
			}
		},
		preventDefaultEvents: false
	});
});

function display_MFP(view) {
	// Product List
	$('#list-view').click(function() {
		$('#content .product-grid > .clearfix').remove();

		$('#content .row > .product-grid').attr('class', 'product-layout product-list col-xs-12');

		if( typeof localStorage === 'object' ) {
			try {
				localStorage.setItem('display', 'list');
			} catch( e ){}
		}
	});

	// Product Grid
	$('#grid-view').click(function() {
		$('#content .product-layout > .clearfix').remove();
		
		// What a shame bootstrap does not take into account dynamically loaded columns
		var cols = $('#column-right, #column-left').length;

		if (cols == 2) {
			$('#content .product-list').attr('class', 'product-layout product-grid col-lg-6 col-md-6 col-sm-12 col-xs-12');
		} else if (cols == 1) {
			$('#content .product-list').attr('class', 'product-layout product-grid col-lg-4 col-md-4 col-sm-6 col-xs-12');
		} else {
			$('#content .product-list').attr('class', 'product-layout product-grid col-lg-3 col-md-3 col-sm-6 col-xs-12');
		}

		if( typeof localStorage === 'object' ) {
			try {
				localStorage.setItem('display', 'grid');
			} catch( e ){}
		}
	});

	try {
		if (typeof localStorage === 'object' && localStorage.getItem('display') == 'list') {
			$('#list-view').trigger('click');
		} else {
			$('#grid-view').trigger('click');
		}
	} catch( e ) {
		$('#grid-view').trigger('click');
	}
}