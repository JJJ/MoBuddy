<?php

/**
 * The MoBuddy Plugin
 *
 * A great mobile experience for your BuddyPress powered site.
 * 
 * This plugin is based almost entirely on the mobile experience provided by the
 * BuddyBoss theme.
 *
 * @package MoBuddy
 * @subpackage Main
 */

/**
 * Plugin Name: MoBuddy
 * Plugin URI:  http://buddypress.org
 * Description: A great mobile experience for your BuddyPress powered site
 * Author:      John James Jacoby, 10up, BuddyBoss
 * Author URI:  http://jaco.by
 * Version:     0.1.0
 * Text Domain: mobuddy
 * Domain Path: /
 * License:     GPLv2 or later (license.txt)
 */

// Exit if accessed directly
if ( !defined( 'ABSPATH' ) ) exit;

new MoBuddy();

class MoBuddy {

	/**
	 * Script version
	 *
	 * @var string
	 */
	public $version = '20140611a';

	/**
	 * Hook everything in when class is instantiated
	 */
	public function __construct() {

		// Bail for ajax requests
		if ( defined( 'DOING_AJAX' ) && DOING_AJAX ) {
			return;
		}

		// Get the theme name
		$this->current_theme_name = wp_get_theme()->get( 'Name' );
		$this->supported_theme    = (bool) $this->get_default_wrapper();

		// Global actions
		add_action( 'after_setup_theme', array( $this, 'after_setup_theme' ) );

		// Bail if in wp-admin
		if ( ! is_admin() ) {

			// Enqueue our scripts
			add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' )    );

			// Add our header wrapper on calls to wp_footer
			add_action( 'wp_footer',          array( $this, 'header_wrapper'  ), 1 );

			// Helpers for BuddyPress Default Theme (and derivatives)
			add_action( 'bp_before_header', array( $this, 'bp_before_header' ) );
			add_action( 'bp_after_footer',  array( $this, 'bp_after_footer'  ) );

		// Admin only actions
		} elseif ( false === $this->supported_theme ) {
			add_action( 'admin_init', array( $this, 'admin_settings' ), 99 );
			add_action( 'admin_menu', array( $this, 'admin_page'     ), 99 );
		}
	}

	/**
	 * Things that need to happen after the theme has been setup.
	 *
	 * Here we:
	 * -- Noop the admin-bar CSS
	 * -- Register a custom navigation menu for the right drawer
	 */
	public function after_setup_theme() {

		// Noop WordPress core's admin bar CSS; we have our own with separate
		// rules for desktop and mobile.
		add_theme_support( 'admin-bar', array( 'callback' => '__return_false' ) );

		// This plugin uses wp_nav_menu() for the right drawer
		register_nav_menu( 'mobuddy-right-drawer', __( 'Mobile - Right Drawer', 'mobuddy' ) );
	}

	/**
	 * Enqueues scripts and styles for front-end.
	 */
	public function enqueue_scripts() {

		// Get some URL's
		$plugin_url = plugin_dir_url( __FILE__ );
		$assets_url = trailingslashit( trailingslashit( $plugin_url ) . 'assets' );
		$css_url    = trailingslashit( $assets_url . 'css' );
		$js_url     = trailingslashit( $assets_url . 'js'  );

		/** Scripts ***********************************************************/

		// HTML5 Shim
		wp_enqueue_script( 'mobuddy-html5-js',     $js_url . 'html5.js',             false,                                     $this->version, false );

		// Modernizr
		wp_enqueue_script( 'mobuddy-modernizr-js', $js_url . 'modernizr.min.js',     array( 'mobuddy-html5-js'               ), $this->version, false );

		// Adds mobile JavaScript functionality.
		wp_enqueue_script( 'mobuddy-swiper-js',    $js_url . 'idangerous.swiper.js', array( 'jquery'                         ), $this->version, true  );

		// Fastclick
		wp_enqueue_script( 'mobuddy-fastclick-js', $js_url . 'jquery.fastclick.js',  array( 'jquery', 'mobuddy-modernizr-js' ), $this->version, false );

		// Common
		wp_enqueue_script( 'mobuddy-common-js',    $js_url . 'common.js',            array( 'jquery', 'mobuddy-fastclick-js' ), $this->version, false );

		// Localize some MoBuddy bits
		wp_localize_script( 'mobuddy-common-js', 'MoBuddyOptions', array(
			'select_label' => __( 'Show:', 'mobuddy' ),
			'container_id' => $this->get_container_id()
		) );

		/** Styles ************************************************************/

		// Unplug the core toolbar styling
		wp_deregister_style( 'admin-bar' );

		// Load the style
		wp_enqueue_style( 'mobuddy-common-sss',           $css_url . 'common.css',           array( 'dashicons' ), $this->version, 'all' );

		// Load our own adminbar (Toolbar) styles.
		wp_enqueue_style( 'mobuddy-toolbar-css',          $css_url . 'toolbar-mobile.css',   array( 'dashicons' ), $this->version, 'all' );

		// Load our own adminbar (Toolbar) styles.
		wp_enqueue_style( 'mobuddy-toolbar-override-css', $css_url . 'toolbar-override.css', array( 'dashicons' ), $this->version, 'all' );
	}

	/**
	 * Support for WordPress core themes
	 *
	 * @param string $default Default container ID
	 * @return string
	 */
	private function get_default_wrapper( $default = false ) {
		switch ( $this->current_theme_name ) {
			case 'Twenty Ten' :
				$wrapper = '#wrapper';
				break;
			case 'Twenty Eleven' :
				$wrapper = '#page';
				break;
			case 'Twenty Twelve' :
				$wrapper = '#page';
				break;
			case 'Twenty Thirteen' :
				$wrapper = '#page';
				break;
			case 'Twenty Fourteen' :
				$wrapper = '#page';
				break;
			case 'Buddy Default' :
			case 'BuddyPress Default' :
				$wrapper = '#mobuddy-helper';

			default :
				$wrapper = $default;
		}
		return $wrapper;
	}

	/**
	 * Get the container ID option
	 */
	public function get_container_id() {
		$id = $this->get_default_wrapper();

		if ( empty( $id ) ) {
			$id = get_option( 'mobuddy_container_id' );
		}

		return $id;
	}

	/**
	 * Top wrapper
	 */
	public function header_wrapper() {
	?>
	<script type="text/html" id="mobuddy-header-wrapper">
		<div id="mobuddy-mobile-check"></div>
		<div id="mobuddy-right-drawer">
			<?php wp_nav_menu( array(
				'menu'           => 'mobuddy-right-drawer',
				'theme_location' => 'mobuddy-right-drawer',
				'menu_class'     => 'mobuddy-nav-menu'
			) ); ?>
		</div>
		<div id="mobuddy-header">
			<div class="mobuddy-header-inner">
				<div class="mobuddy-left-btn">
					<a href="#" id="mobuddy-user-nav" class="closed "></a>
				</div>
				<div class="mobuddy-title-area">
					<h1><a href="<?php echo home_url(); ?>"><?php bloginfo( 'name' ); ?></a></h1>
				</div>
				<div class="mobuddy-right-btn">
					<a href="#" id="mobuddy-main-nav" class="closed"></a>
				</div>
			</div>
		</div>
	</script>
	<?php
	}

	/**
	 * Add a theme options page to the admin menu, including some help documentation.
	 *
	 * This function is attached to the admin_menu action hook.
	 */
	public function admin_page() {
		add_theme_page(
			__( 'MoBuddy Options', 'mobuddy' ),    // Name of page
			__( 'MoBuddy', 'mobuddy' ),            // Label in menu
			'edit_theme_options',                  // Capability required
			'mobuddy_options',                     // Menu slug, used to uniquely identify the page
			array( $this, 'render_settings_page' ) // Function that renders the options page
		);
	}

	/**
	 * Register the options, sections, and fields for the admin settings page
	 */
	public function admin_settings() {

		// Register the container ID field
		register_setting(
			'mobuddy_options',      // Options group, see settings_fields()
			'mobuddy_container_id', // Database option
			'sanitize_text_field'   // Sanitization callback
		);

		// Register a mobile settings field group
		add_settings_section(
			'mobuddy_mobile', // Unique identifier for the settings section
			'',               // Section title (we don't want one)
			'__return_false', // Section callback (we don't want anything)
			'mobuddy_options' // Menu slug, used to uniquely identify the page
		);

		add_settings_field(
			'mobuddy_wrapper_id',
			__( 'Container Element', 'mobuddy' ),
			array( $this, 'settings_container_id_field' ),
			'mobuddy_options',
			'mobuddy_mobile',
			array()
		);
	}

	/**
	 * Output the admin settings page
	 */
	public function render_settings_page() {
	?>
	<div class="wrap">
		<h2><?php esc_html_e( 'MoBuddy Options', 'mobuddy' ); ?></h2>
		<?php settings_errors(); ?>

		<form method="post" action="options.php">
			<?php
				settings_fields( 'mobuddy_options' );
				do_settings_sections( 'mobuddy_options' );
				submit_button();
			?>
		</form>
	</div>
	<?php
	}

	/**
	 * Output the container ID settings field
	 */
	public function settings_container_id_field() {
	?>

		<input id="mobuddy_container_id" name="mobuddy_container_id" type="text" class="regular-text code" value="<?php echo esc_attr( $this->get_container_id() ); ?>" />
		<p class="description"><?php esc_html_e( 'Wrapper element for your theme (#main, #page, #container, etc...)', 'mobuddy' ); ?></p>

	<?php
	}

	/** BP Default Helpers ****************************************************/

	/**
	 * Wrap default BuddyPress theme in a helper div
	 */
	public function bp_before_header() {
	?>
		<div id="mobuddy-helper">
	<?php
	}

	/**
	 * Close helper div wrapper
	 */
	public function bp_after_footer() {
	?>
		</div>
	<?php
	}
}