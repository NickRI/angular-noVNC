
angular.module('noVNC', ['noVNC.util', 'noVNC.rfb']).directive('vnc', ['WebUtil', 'RFB', 'Util', '$timeout', function(WebUtil, RFB, Util, $timeout) {
	'use strict';
	function newInterface() {
		var UI = {
			canvas: null,
			_settings : {},
			rfb_state : 'loaded',
			connected : false,
			isTouchDevice: false,

			// Setup rfb object, load settings from browser storage, then call
			// UI.init to setup the UI/menus
			load: function (callback) {
				WebUtil.initSettings(UI.start, callback);
			},

			// Render default UI and initialize settings menu
			start: function(callback) {
				UI.isTouchDevice = 'ontouchstart' in document.documentElement;
				// Settings with immediate effects
				UI.setSetting('logging', 'warn', true);
				WebUtil.init_logging(UI.getSetting('logging'));

				// if port == 80 (or 443) then it won't be present and should be
				// set manually
				var port = window.location.port;
				if (!port) {
					if (window.location.protocol.substring(0,5) === 'https') {
						port = 443;
					}
					else if (window.location.protocol.substring(0,4) === 'http') {
						port = 80;
					}
				}

				/* Populate the controls if defaults are provided in the URL */
				UI.setSetting('host', window.location.hostname, true);
				UI.setSetting('port', port, true);
				UI.setSetting('password', '', true);
				UI.setSetting('encrypt', (window.location.protocol === 'https:'), true);
				UI.setSetting('true_color', true, true);
				UI.setSetting('cursor', !UI.isTouchDevice, true);
				UI.setSetting('shared', true, true);
				UI.setSetting('view_only', false, true);
				UI.setSetting('path', 'websockify', true);
				UI.setSetting('width', false, true);
				UI.setSetting('height', false, true);
				UI.setSetting('repeaterID', '', true);

				UI.rfb = new RFB({
					'target': UI.canvas,
					'onUpdateState': UI.updateState,
					'onXvpInit': UI.updateXvpVisualState,
					'onClipboard': UI.clipReceive,
					'onDesktopName': UI.updateDocumentTitle,
					'onFBResize': UI.FBResize
				});

				// Show mouse selector buttons on touch screen devices
				// if (UI.isTouchDevice) {
				// 	// Remove the address bar
				// 	setTimeout(function() { window.scrollTo(0, 1); }, 100);
				// 	UI.setSetting('clip', true);
				// } else {
				UI.setSetting('clip', false);
				// }

				UI.setViewClip();
				Util.addEvent(window, 'resize', UI.setViewClip);

				Util.addEvent(window, 'beforeunload', function () {
					if (UI.rfb_state === 'normal') {
						return 'You are currently connected.';
					}
				});

				// Add mouse event click/focus/blur event handlers to the UI

				if (typeof callback === 'function') {
					callback(UI.rfb);
				}
			},

			FBResize: function() {},
			updateState: function() {},

			// Read form control compatible setting from cookie
			getSetting: function(name) {
				return UI._settings[name];
			},

			// Save control setting to cookie
			setSetting: function(name, value, ifNotExist) {
				if (typeof (value) !== 'undefined') {
					if (ifNotExist) {
						if (!(name in UI._settings)) {
							UI._settings[name] = value;
						}
					} else {
						UI._settings[name] = value;
					}
				} else if (typeof name === 'object') {
					UI._settings = name;
				}
			},

			sendCtrlAltDel: function() {
				UI.rfb.sendCtrlAltDel();
			},

			xvpShutdown: function() {
				UI.rfb.xvpShutdown();
			},

			xvpReboot: function() {
				UI.rfb.xvpReboot();
			},

			xvpReset: function() {
				UI.rfb.xvpReset();
			},

			connect: function() {
				var host, port, password, path;

				host = UI.getSetting('host');
				port = UI.getSetting('port');
				password = UI.getSetting('password');
				path = UI.getSetting('path');

				if ((!host) || (!port)) {
					throw('Must set host and port');
				}

				UI.rfb.set_encrypt(UI.getSetting('encrypt'));
				UI.rfb.set_true_color(UI.getSetting('true_color'));
				UI.rfb.set_local_cursor(UI.getSetting('cursor'));
				UI.rfb.set_shared(UI.getSetting('shared'));
				UI.rfb.set_view_only(UI.getSetting('view_only'));
				UI.rfb.set_repeaterID(UI.getSetting('repeaterID'));


				UI.rfb.connect(host, port, password, path);
			},


			disconnect: function() {
				UI.rfb.get_display().resizeAndScale(0, 0, 1);
				UI.rfb.disconnect();
			},

			reconect: function() {
				UI.disconnect();
				setTimeout(function() {
					UI.connect();
				}, 250);
			},

			displayBlur: function() {
				UI.rfb.get_keyboard().set_focused(false);
				UI.rfb.get_mouse().set_focused(false);
			},

			displayFocus: function() {
				UI.rfb.get_keyboard().set_focused(true);
				UI.rfb.get_mouse().set_focused(true);
			},

			clipClear: function() {
				UI.rfb.clipboardPasteFrom('');
			},

			clipSend: function(text) {
				Util.Debug('>> UI.clipSend: ' + text.substr(0,40) + '...');
				UI.rfb.clipboardPasteFrom(text);
				Util.Debug('<< UI.clipSend');
			},


			// Enable/disable and configure viewport clipping
			setViewClip: function(clip) {
				var display, cur_clip, pos, new_w, new_h;


				if (UI.rfb) {
					display = UI.rfb.get_display();
				} else {
					return;
				}

				cur_clip = display.get_viewport();

				if (typeof(clip) !== 'boolean') {
					// Use current setting
					clip = UI.getSetting('clip');
				}


				if (!clip && cur_clip) {
					// Turn clipping off
					display.set_viewport(false);
					UI.canvas.style.position = 'static';
					display.viewportChange();
				}

				if (UI.getSetting('clip')) {
					// If clipping, update clipping settings
					UI.canvas.style.position = 'absolute';
					pos = Util.getPosition(UI.canvas);
					new_w = window.innerWidth - pos.x;
					new_h = window.innerHeight - pos.y;
					display.set_viewport(true);
					display.viewportChange(0, 0, new_w, new_h);
				}
			},
		};
		return UI;
	}

	return {
		restrict: 'E',
		template: '<canvas></canvas>',
		scope: {
			host        : '@',
			port        : '@',
			password    : '@',
			viewOnly    : '=',
			trueColor   : '=',
			isConnected : '=',
			display     : '=',
			style       : '=',
			states      : '=',
			logging     : '=',
		},
		link: function(scope, iElement) {
			var Interface = newInterface();

			Interface.canvas = iElement[0].childNodes[0];
			Interface.states = scope.states;

			scope.$watch('host', function(host) {
				Interface.setSetting('host', host);
				if (Interface.connected) {
					Interface.reconect();
				}
			});

			scope.$watch('port', function(port) {
				Interface.setSetting('port', port);
				if (Interface.connected) {
					Interface.reconect();
				}
			});

			scope.$watch('password', function(password) {
				Interface.setSetting('password', password);
				if (Interface.connected) {
					Interface.reconect();
				}
			});

			scope.$watch('viewOnly', function(viewOnly) {
				if (typeof viewOnly === 'boolean') {
					Interface.setSetting('view_only', viewOnly);
					Interface.rfb.set_view_only(viewOnly);
				}
			});

			scope.$watch('logging', function(logging) {
				Interface.setSetting('logging', logging);
				WebUtil.init_logging(Interface.getSetting('logging'));
			});

			scope.$watch('trueColor', function(trueColor) {
				if (typeof trueColor === 'boolean') {
					Interface.setSetting('true_color', trueColor);
					if (Interface.connected) {
						Interface.reconect();
					}
				}
			});

			Interface.updateState = function (rfb, state, oldstate, msg) {
				Interface.rfb_state = state;

				if (scope.states) {
					$timeout(function() {
						scope.states.push({ status: state, msg: msg });
					}, 0);
				}

				switch (state) {
					case 'failed':
					case 'fatal':
						Interface.connected = false;
						break;
					case 'normal':
						Interface.connected = true;
						break;
					case 'disconnected':
						Interface.connected = false;
						break;
					case 'loaded':
						// klass = 'noVNC_status_normal';
						break;
					case 'password':
						// UI.toggleConnectPanel();
						// klass = 'noVNC_status_warn';
						break;
					default:
						// klass = 'noVNC_status_warn';
						break;
				}
			};

			Interface.FBResize = function(rfb, width, height) {
				var display = scope.display;
				rfb.get_display().resize(width, height);
				if (display) {

					if (display.scale) {
						if (display.width && display.height) {
							rfb.get_display().resizeAndScale(display.width, display.height, display.scale);
						} else {
							if (display.width) {
								rfb.get_display().resizeAndScale(display.width, height, display.scale);
							} else if (display.height) {
								rfb.get_display().resizeAndScale(width, display.height, display.scale);
							} else {
								rfb.get_display().resizeAndScale(width, height, display.scale);
							}
						}
						display.scale = rfb.get_display().get_scale();
					}

					if (display.fitTo) {
						switch (display.fitTo) {
							case 'width':
								rfb.get_display().resizeAndScale(width, height, 1*(display.width/width));
								break;
							case 'height':
								rfb.get_display().resizeAndScale(width, height, 1*(display.height/height));
								break;
							case 'scale':
								rfb.get_display().resizeAndScale(width, height, display.scale);
								break;
						}
					}

					if (display.fullScreen) {
						var isKeyboardAvailbleOnFullScreen = (typeof Element !== 'undefined' && 'ALLOW_KEYBOARD_INPUT' in Element) &&
							Element.ALLOW_KEYBOARD_INPUT;

						var element = Interface.canvas;
						if(element.requestFullScreen) {
							element.requestFullScreen();
						} else if(element.mozRequestFullScreen) {
							element.mozRequestFullScreen();
						} else if(element.webkitRequestFullscreen) {
							if (/Version\/[\d]{1,2}(\.[\d]{1,2}){1}(\.(\d){1,2}){0,1} Safari/.test(navigator.userAgent)) {
								element.webkitRequestFullscreen();
							} else {
								element.webkitRequestFullscreen(isKeyboardAvailbleOnFullScreen);
							}
						} else if (element.msRequestFullscreen) {
							element.msRequestFullscreen();
						}

						Interface.canvas.style.border = '1px solid grey';

						rfb.get_display().resizeAndScale(width, height, 1);

					} else {
						if(document.cancelFullScreen) {
							document.cancelFullScreen();
						} else if(document.mozCancelFullScreen) {
							document.mozCancelFullScreen();
						} else if(document.webkitExitFullscreen) {
							document.webkitExitFullscreen();
						} else if (document.msExitFullscreen) {
							document.msExitFullscreen();
						}

						Interface.canvas.style.border = (scope.style ? scope.style.border || 'none': 'none');
					}

				}
			};

			document.addEventListener('fullscreenchange', function () {
				scope.$apply(function() {
					if (scope.display && scope.display.fullScreen) {
						scope.display.fullScreen = document.fullscreen;
					}
				});
			}, false);

			document.addEventListener('mozfullscreenchange', function () {
				scope.$apply(function() {
					if (scope.display && scope.display.fullScreen) {
						scope.display.fullScreen = document.mozFullScreen;
					}
				});
			}, false);

			document.addEventListener('webkitfullscreenchange', function () {
				scope.$apply(function() {
					if (scope.display && scope.display.fullScreen) {
						scope.display.fullScreen = document.webkitIsFullScreen;
					}
				});
			}, false);

			document.addEventListener('msfullscreenchange', function () {
				scope.$apply(function() {
					if (scope.display && scope.display.fullScreen) {
						scope.display.fullScreen = document.msFullscreenElement;
					}
				});
			}, false);

			scope.$watch('display', function(display) {
				if (display) {
					Interface.FBResize(
						Interface.rfb,
						Interface.rfb.get_display().get_width(),
						Interface.rfb.get_display().get_height()
					);
				}
			}, true);

			scope.$watch('style', function(style) {
				for(var key in style) {
					Interface.canvas.style[key] = style[key];
				}
			}, true);

			scope.$watch('isConnected', function(isConnected) {
				if (typeof isConnected === 'boolean') {
					if (!isConnected) {
						Interface.disconnect();
					} else {
						Interface.connect();
					}
				}
			});

			scope.$on('$destroy', function() {
				if (scope.isConnected) {
					Interface.disconnect();
				}
			});

			Interface.load();
		}
	};

}]);
