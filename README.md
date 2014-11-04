# Angular noVNC

Port of __[Joel Martin's](https://github.com/kanaka)__ [noVNC](https://github.com/kanaka/noVNC) project for __angularjs__.

### Sample app
![](https://github.com/rootStar-lock/angular-noVNC/blob/master/screens/avnc-a.png)
### Fullscreen mode
![](https://github.com/rootStar-lock/angular-noVNC/blob/master/screens/avnc-full-screen.png)

## Install

`$ bower install angular-no-vnc`

## Overview

* Multiple connections\displays over one page.
* Config over directive attributes.
* Full screen mode support.
* Easily scale, fit to width\height.

## Usage


### Start vnc & ws proxy (_server-side_)

This module is a port of noVNC project that means you should use [websockify](https://github.com/kanaka/websockify) proxy to convert over websockets.
For me it is:

```bash
$ sudo apt-get install -y x11vnc
$ x11vnc -display :0 -N -forever &
```

To run the websockify install angular-noVNC globally via npm:

```bash
$ npm install -g angular-no-vnc #add websockify command
$ websockify --web=.. 44999 localhost:5900
```

`--web=..` will allow you to use sample app in ../index.html for fast check by [http://localhost:44999](http://localhost:44999)

__Note that websockify listens on /websockify path by default. If you want to use another ws path please run `websockify --path your_path 44999 localhost:5900`__

_Additional info of usage websockify is [here](https://github.com/kanaka/websockify/wiki).
Others server-side features you might found [here](https://github.com/kanaka/noVNC/wiki)._

### Use in your application (_client-side_)

After running websockify, or other ws:// proxy server:

* Add library to your html file and __noVNC__ to your module dependency. `var app = angular.module('myApp', ['noVNC']);`

* Add directive `<vnc host="localhost" port="44999" is-connected="true"></vnc>`

* Reload page =)

### Configuration

| Attribute              | Description                                                   | Scope type | Default value                                |
|------------------------|---------------------------------------------------------------|:----------:|----------------------------------------------|
| __host__               | IP/name of host to connect.                                   | @          | _window.location.hostname_                   |
| __port__               | Port of websockify port.                                      | @          | _window.location.port_ or 80\http, 443\https |
| __password__           | Connection password.                                          | @          | ''                                           |
| __path__           	   | Connection path                                               | @          | ''                                 |
| __true-color__         | True color representation.                                    | =          | true                                         |
| __view-only__          | Disable keyboard and mouse events.                            | =          | false                                        |
| __is-connected__       | Connection switcher.                                          | =          | false                                        |
| __style__              | Style of canvas\display element.                              | =          | {}                                           |
| __states__             | States of system actions. format: [{status: '', msg: ''},].   | =          | []                                           |
| __display.scale__      | Scale of display from 0.1 to 1.                               | =          | 1                                            |
| __display.width__      | Display width.                                                | =          | null                                         |
| __display.height__     | Display height.                                               | =          | null                                         |
| __display.fitTo__      | Fit display to width/height/scale.                            | =          | null                                         |
| __display.fullScreen__ | Full screen mode switcher.                                    | =          | null                                         |


## Problems

Yes, they are should be in. This port is goes with code changes of big one (noVNC), that's why you need to use it carefully.

## Nearby changes

* Add loadable flash ws:// support.
* Add mobile mode support.
* Add clipboard transfer.
* Write tests.
* Add encription support.
* Refactoring and many code improvements.

All improvements need free time. Your stars and issues increase my interest to work with project =)

## Contribution

* Fork `$ git clone git@github.com:rootStar-lock/angular-noVNC.git`.
* Navigate and install npm and bower dependencies. `$ cd angular-noVNC && npm install`.
* Project driven by __gulp__ build system. Run `gulp --tasks` to see whats we have.
* Live sample app in _index.html_
* Use `gulp lint` and `gulp plato` to check code complexity and common mistakes.

Forks and pulls will be accepted with love)
