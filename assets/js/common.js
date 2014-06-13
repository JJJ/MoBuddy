/* global MoBuddyOptions */

/*------------------------------------------------------------------------------
This file contains the JavaScript Code for Mobile Devices
--------------------------------------------------------------------------------
>>> TABLE OF CONTENTS:
--------------------------------------------------------------------------------

1.0 - Core Functions
	1.1 - Startup (Binds Events + Conditionals)
2.0 - Responsive Menus
	2.1 - Mobile/Tablet Carousels
	2.2 - Responsive Dropdowns
	2.3 - Notifications Area
3.0 - Content
	3.1 - Members (Group Admin)
	3.2 - Search Input Field
	3.3 - Hide Profile and Group Buttons Area
	3.4 - Move the Messages Checkbox, below the Avatar
4.0 - jQuery Mobile Plugin

------------------------------------------------------------------------------*/

var MoBuddyJS = function( $, window, document ) {

	window.MoBuddy = window.MoBuddy || {};
	window.MoBuddy.is_mobile = null;

	var
		$document         = $(document),
		$window           = $(window),
		$body             = $('body'),
		$mobile_check     = $('#mobuddy-mobile-check').css({position:'absolute',top:0,left:0,width:'100%',height:1,zIndex:1}),
		mobile_width      = 782,
		is_mobile         = false,
		has_item_nav      = false,
		mobile_modified   = false,
		swiper            = false,
		$container        = $( MoBuddyOptions.container_id ),
		$mobuddy_header   = $('#mobuddy-header-wrapper').html(),
		$inner            = $('#mobuddy-inner-wrap'),
		$buddypress       = $('#buddypress'),
		$item_nav         = $buddypress.find('#item-nav'),
		$selects,
		$mobile_nav_wrap,
		$mobile_item_wrap,
		$mobile_item_nav;

	/*--------------------------------------------------------------------------
	0.0 - Mark-up Adjustments
	--------------------------------------------------------------------------*/

	// Move some markup ahead of the main content area
	$container.before( $mobuddy_header );

	// Wrap the main container so MoBuddy can reliably interact with it
	$container.wrap( '<div id="mobuddy-main-wrap"><div id="mobuddy-inner-wrap"></div></div>');

	/*--------------------------------------------------------------------------
	1.0 - Core Functions
	--------------------------------------------------------------------------*/

	/**
	 * Checks for supported mobile resolutions via media query and
	 * maximum window width.
	 *
	 * @return {boolean} True when screen size is mobile focused
	 */
	function check_is_mobile() {

		// The $mobile_check element refers to an empty div#mobile-check we
		// hide or show with media queries. We use this to determine if we're
		// on mobile resolution
		$mobile_check.remove().appendTo( $body );

		is_mobile = MoBuddy.is_mobile = $mobile_check.is(':visible') || ($window.width() < mobile_width);

		if ( is_mobile ) {
			$body.addClass('is-mobile');
			mobile_width = $window.width();
		} else {
			$body.removeClass('mobuddy-is-mobile');
		}

		return is_mobile;
	}

	/**
	 * Checks for a BuddyPress sub-page menu. On smaller screens we turn
	 * this into a left/right swiper
	 *
	 * @return {boolean} True when BuddyPress item navigation exists
	 */
	function check_has_item_nav() {
		if ( $item_nav && $item_nav.length ) {
			has_item_nav = true;
		}

		return has_item_nav;
	}

	function render_layout() {
		var window_height  = $window.height(),
			carousel_width = ( $item_nav.find('li').length * 94 );

		// If on small screens make sure the main page elements are
		// full width vertically
		if ( is_mobile && ( $inner.height() < window_height ) ) {
			$('#page').css( 'min-height', window_height - ( $('#mobuddy-header').height() + $('#colophon').height() ) );
		}

		// Swipe/panel shut area
		if ( is_mobile && $('#mobuddy-swipe-area').length && Panels.state ) {
			$('#mobuddy-swipe-area').css({
				left:   Panels.state === 'left' ? 240 : 'auto',
				right:  Panels.state === 'right' ? 240 : 'auto',
				width:  $window.width() - 240,
				height: $window.outerHeight(true) + 200
			});
		}

		// Log out link in left panel
		var $left_logout_link   = $('#wp-admin-bar-logout'),
			$left_account_panel = $('#wp-admin-bar-user-actions'),
			$left_settings_menu = $('#wp-admin-bar-my-account-settings .ab-submenu').first();

		if ( $left_logout_link.length && $left_account_panel.length && $left_settings_menu.length ) {

			// On mobile user's accidentally click the link when it's up
			// top so we move it into the setting menu
			if ( is_mobile ) {
				$left_logout_link.appendTo( $left_settings_menu );

			// On desktop we move it back to it's original place
			} else {
				$left_logout_link.appendTo( $left_account_panel );
			}
		}

		// Runs once, first time we experience a mobile resolution
		if ( is_mobile && has_item_nav && ! mobile_modified ) {
			mobile_modified   = true;
			$mobile_nav_wrap  = $('<div id="mobile-item-nav-wrap" class="mobile-item-nav-container mobile-item-nav-scroll-container">');
			$mobile_item_wrap = $('<div class="mobile-item-nav-wrapper">').appendTo( $mobile_nav_wrap );
			$mobile_item_nav  = $('<div id="mobile-item-nav" class="mobile-item-nav">').appendTo( $mobile_item_wrap );
			$mobile_item_nav.append( $item_nav.html() );

			$mobile_item_nav.css( 'width', ( $item_nav.find( 'li' ).length * 94 ) );
			$mobile_nav_wrap.insertBefore( $item_nav ).show();
			$('#mobile-item-nav-wrap, .mobile-item-nav-scroll-container, .mobile-item-nav-container').addClass('fixed');
			$item_nav.css({display:'none'});

		// Resized to non-mobile resolution
		} else if ( ! is_mobile && has_item_nav && mobile_modified ) {
			$mobile_nav_wrap.css({display:'none'});
			$item_nav.css({display:'block'});
			$document.trigger('menu-close.mobuddy');

		// Resized back to mobile resolution
		} else if ( is_mobile && has_item_nav && mobile_modified ) {
			$mobile_nav_wrap.css({
				display:'block',
				width: carousel_width
			});

			$mobile_item_nav.css({
				width: carousel_width
			});

			$item_nav.css({display:'none'});
		}

		// Update select drop-downs
		populate_select_label();
	}

	/**
	 * Renders the layout, called when the page is loaded and on resize
	 *
	 * @return {void}
	 */
	function do_render() {
		check_is_mobile();
		check_has_item_nav();
		render_layout();
		mobile_carousel();
	}

	/*--------------------------------------------------------------------------
	1.1 - Startup (Binds Events + Conditionals)
	--------------------------------------------------------------------------*/

	// Render layout
	do_render();

	// Re-render layout after everything's loaded
	$window.bind( 'load', function() {
		do_render();
	});

	// Re-render layout on resize
	var throttle;

	$window.resize( function() {
		clearTimeout( throttle );
		throttle = setTimeout( do_render, 150 );
	});

	/*--------------------------------------------------------------------------
	2.0 - Responsive Menus
	--------------------------------------------------------------------------*/

	var Panels = {
		state: 'init',
		engine: 'CSS',

		click_throttle: null,
		click_status: true,

		$swipe_area: null,
		$left: null,
		$left_icon: null,
		$right: null,
		$right_icon: null,
		$content: null,

		init: function() {

			Panels.state       = 'closed';
			Panels.$items      = $('body, #mobuddy-header, #mobuddy-main-wrap');

			Panels.$left       = $('#wpadminbar');
			Panels.$right      = $('#mobuddy-right-drawer');

			Panels.$content    = $('#mobuddy-header, #mobuddy-main-wrap');
			Panels.$left_icon  = $('.mobuddy-left-btn');
			Panels.$right_icon = $('.mobuddy-right-btn');

			Panels.$swipe_area = $('<div id="mobuddy-swipe-area" />').hide().appendTo($body);

			var ieMobile = navigator.userAgent.indexOf('IEMobile') !== -1;

			// CSS3 animations by default, but fallback to jQuery
			// when not available
			if ( ieMobile || ! Modernizr || ! Modernizr.csstransitions || ! Modernizr.csstransforms || ! Modernizr.csstransforms3d ) {
				Panels.engine = 'JS';
				$('html').addClass('mobuddy-js-transitions');
			}

			// Global events
			$document.on( 'open-left-menu.mobuddy', { side: 'left' }, Panels.open );
			$document.on( 'open-right-menu.mobuddy', { side: 'right' }, Panels.open );
			$document.on( 'menu-close.mobuddy', Panels.close );

			// Menu events
			Panels.$swipe_area.on( 'fastclick click', { target: 'content' }, Panels.on_click );
			Panels.$left_icon.on( 'fastclick click', { target: 'icon', side: 'left' }, Panels.on_click );
			Panels.$right_icon.on( 'fastclick click', { target: 'icon', side: 'right' }, Panels.on_click );
		},

		/**
		 * Handle touch events on open menus, sometimes devices
		 * will handle the first 'click/touch' as a hover event
		 * if it thinks there might be a flyout or sub-menu
		 *
		 * This only affects clicking links to other pages inside
		 * our left/right panels, so we do that manually when a
		 * 'tap' event is detected on a link element in either
		 * panel
		 *
		 * @param  {object} e jQuery event object
		 * @return {void}
		 */
		on_menu_click: function( e ) {
			var href = !! this.getAttribute('href')
						? this.getAttribute('href')
						: false;

			if ( href ) {
				$document.trigger( 'menu-close.mobuddy' );
				window.location = href;
				return false;
			}
		},

		on_click: function( e ) {
			clearTimeout( Panels.click_throttle );
			click_throttle = setTimeout( function() {
				Panels.click_status = true;
			}, 150 );

			var status = true;

			// If this event wasn't initiated by us bail
			if ( e.isTrigger && e.type !== 'fastclick' ) {
				status = false;
			}

			if ( ! Panels.click_status ) {
				status = false;
			}

			if ( status ) {
				e.stopImmediatePropagation();
				e.stopPropagation();
				e.preventDefault();

				// If it's closed, open a panel
				if ( Panels.state === 'closed' && e.data && e.data.target === 'icon' ) {
					$document.trigger( 'open-' + e.data.side + '-menu.mobuddy' );

				// Otherwise close the panels
				} else {
					$document.trigger( 'menu-close.mobuddy' );
					return false;
				}

				Panels.click_status = false;
			}
		},

		open: function( e ) {
			var side = Panels.state = e.data.side;

			var opt  = {
				css: {
					zIndex: 999,
					opacity: 1,
					display: 'block',
					height: '100%'
				},
				ani: {}
			};

			opt.css[side] = -240;
			opt.ani[side] = 0;

			var $menu = Panels[ '$' + side ];

			// Use CSS Transitions where possible
			if ( Panels.engine === 'CSS' ) {
				$body.addClass( 'open-' + side ).removeClass( 'close-left close-right' );

			// jQuery/JS fallback
			} else {
				$body.addClass( 'open-' + side ).removeClass( 'close-left close-right' );
				$menu.css( opt.css ).animate( opt.ani );
				Panels.$content.on( 'fastclick click', { target: 'content' }, Panels.on_click );
			}

			setTimeout( function() {
			  $menu.on( 'fastclick click', 'a', { target: 'menu' }, Panels.on_menu_click );
			}, 200 );

			Panels.$swipe_area.css({
				left:   side === 'left'  ? 240 : 'auto',
				right:  side === 'right' ? 240 : 'auto',
				width:  $window.width() - 240,
				height: $window.outerHeight(true) + 200
			}).show();
		},

		close: function() {
			var side  = Panels.state;
			var $menu = Panels[ '$' + side ];
			var opt   = {
				css: {
					zIndex: -999
				},
				ani: {
					side: -240
				}
			};

			// Use CSS Transitions where possible
			if ( Panels.engine === 'CSS' ) {
				$body.addClass( 'close-' + side );
				setTimeout( function(){
					$body.removeClass( 'open-left open-right' );
				},400);

			// jQuery/JS fallback
			} else {
				$body.removeClass( 'open-left open-right' ).addClass( 'close-' + side );
				$menu.css( opt.css ).animate( opt.ani );
				Panels.$content.off( 'fastclick click' );
			}

			$menu.off( 'fastclick click' );

			Panels.$swipe_area.hide();

			Panels.state = 'closed';
		}
	}; // Panels

	Panels.init();

	/*--------------------------------------------------------------------------
	2.1 - Mobile/Tablet Carousels
	--------------------------------------------------------------------------*/

	function mobile_carousel() {
		if ( is_mobile && has_item_nav && ! swiper ) {
			// console.log( 'Setting up mobile nav swiper' );
			swiper = $('.mobile-item-nav-scroll-container').swiper({
				scrollContainer : true,
				slideElement : 'div',
				slideClass : 'mobile-item-nav',
				wrapperClass : 'mobile-item-nav-wrapper'
			});
		}
	}

	/*--------------------------------------------------------------------------
	2.2 - Responsive Dropdowns
	--------------------------------------------------------------------------*/

	// On page load we'll go through each select element and make sure
	// we have a label element to accompany it. If not, we'll generate
	// one and add it dynamically.
	function init_select() {
		var current = 0;

		$selects = $('#page select');

		$selects.each( function() {
			var $select = $(this);
			var id      = this.getAttribute('id') || 'mobuddy-select-' + current;
			var $label  = $select.prev('label');
			var dynamic = false;

			// If there's no label, let's append one
			if ( ! $label.length ) {
				$label  = $('<label></label>').hide().insertBefore( $select );
				dynamic = true;
			}

			// Set data on select element to use later
			$select.data( 'mobuddy-select-info', {
				state:     'init',
				dynamic:   dynamic,
				$label:    $label,
				orig_text: $label.text()
			} );
		});
	}

	init_select();

	// On mobile, we add a better select box. This function
	// populates data from the <select> element to it's
	// <label> element which is positioned over the select box.
	function populate_select_label() {

		// Abort when no select elements are found
		if ( ! $selects || ! $selects.length ) {
			return;
		}

		// Handle small screens
		if ( is_mobile ) {

			$selects.each( function( idx, val ) {
				var $select = $(this);
				var data    = $select.data( 'mobuddy-select-info' );
				var $label  = data.$label;

				if ( $label && $label.length ) {

					data.state = 'mobile';

					$label.text( $select.find('option:selected').text() ).show();
				}
			});

		// Handle larger screens
		} else {

			$selects.each( function( idx, val ) {
				var $select   = $(this);
				var data      = $select.data( 'mobuddy-select-info' );
				var $label    = data.$label;
				var orig_text = data.orig_text || MoBuddyOptions.select_label;

				if ( data.state !== 'desktop' && $label && $label.length ) {

					data.state = 'desktop';

					// If it's a dynamic select/label, we should hide the added
					// label that wasn't there before because we're only using
					// it on smaller screens
					if ( data.dynamic ) {
						$label.hide();
					}

					// Otherwise, let's set the original label's text
					else {
						$label.text( orig_text );
					}
				}
			});

		} // end is_mobile

	} // end populate_select_label();

	// On select change, repopulate label
	$selects.on( 'change', function( e ) {
		populate_select_label();
	});

	/*--------------------------------------------------------------------------
	2.3 - Notifications Area
	--------------------------------------------------------------------------*/

	// Add Notifications Area, if there are notifications to show
	if ( $( '#wp-admin-bar-bp-notifications' ).length !== 0 ) {

		// Clone and Move the Notifications Count to the Header
		$('li#wp-admin-bar-bp-notifications a.ab-item > span#ab-pending-notifications').clone().appendTo('.mobuddy-left-btn');

	}
}; // End MoBuddyJS() Mega Function

// Launch MoBuddy JS when document is ready
jQuery( document ).ready( function( $ ) {
	MoBuddyJS( $, window, document );
});
