/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/js/background.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/js/background.js":
/*!******************************!*\
  !*** ./src/js/background.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// Pass through PTT's wall!\nvar origin = \"app://pcman\";\nchrome.webRequest.onBeforeSendHeaders.addListener(\n    details => {\n        const headers = details.requestHeaders;\n        for (let i = 0; i < headers.length; i++) {\n            if (headers[i].name === \"Origin\") {\n                headers[i].value = origin;\n            }\n        }\n        return {\n            requestHeaders: headers\n        };\n    }, {\n        urls: [\"wss://ws.ptt.cc/*\"],\n        types: [\"xmlhttprequest\", \"websocket\"]\n    },\n    [\"requestHeaders\", \"blocking\", \"extraHeaders\"]\n);\n\n// set account on first install\nchrome.runtime.onInstalled.addListener(function (object) {\n    if (chrome.runtime.OnInstalledReason.INSTALL === object.reason) {\n        chrome.tabs.create({url:chrome.extension.getURL(\"login.html\")});\n    }\n});//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvanMvYmFja2dyb3VuZC5qcy5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy8uL3NyYy9qcy9iYWNrZ3JvdW5kLmpzPzgxMDQiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gUGFzcyB0aHJvdWdoIFBUVCdzIHdhbGwhXG52YXIgb3JpZ2luID0gXCJhcHA6Ly9wY21hblwiO1xuY2hyb21lLndlYlJlcXVlc3Qub25CZWZvcmVTZW5kSGVhZGVycy5hZGRMaXN0ZW5lcihcbiAgICBkZXRhaWxzID0+IHtcbiAgICAgICAgY29uc3QgaGVhZGVycyA9IGRldGFpbHMucmVxdWVzdEhlYWRlcnM7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGVhZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGhlYWRlcnNbaV0ubmFtZSA9PT0gXCJPcmlnaW5cIikge1xuICAgICAgICAgICAgICAgIGhlYWRlcnNbaV0udmFsdWUgPSBvcmlnaW47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlcXVlc3RIZWFkZXJzOiBoZWFkZXJzXG4gICAgICAgIH07XG4gICAgfSwge1xuICAgICAgICB1cmxzOiBbXCJ3c3M6Ly93cy5wdHQuY2MvKlwiXSxcbiAgICAgICAgdHlwZXM6IFtcInhtbGh0dHByZXF1ZXN0XCIsIFwid2Vic29ja2V0XCJdXG4gICAgfSxcbiAgICBbXCJyZXF1ZXN0SGVhZGVyc1wiLCBcImJsb2NraW5nXCIsIFwiZXh0cmFIZWFkZXJzXCJdXG4pO1xuXG4vLyBzZXQgYWNjb3VudCBvbiBmaXJzdCBpbnN0YWxsXG5jaHJvbWUucnVudGltZS5vbkluc3RhbGxlZC5hZGRMaXN0ZW5lcihmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgaWYgKGNocm9tZS5ydW50aW1lLk9uSW5zdGFsbGVkUmVhc29uLklOU1RBTEwgPT09IG9iamVjdC5yZWFzb24pIHtcbiAgICAgICAgY2hyb21lLnRhYnMuY3JlYXRlKHt1cmw6Y2hyb21lLmV4dGVuc2lvbi5nZXRVUkwoXCJsb2dpbi5odG1sXCIpfSk7XG4gICAgfVxufSk7Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/js/background.js\n");

/***/ })

/******/ });