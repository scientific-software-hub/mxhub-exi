/*
 * var Event = function (sender) { this._sender = sender; this._listeners = []; };
 */

function Event(sender) {
	this._sender = sender;
	this._listeners = [];
}

Event.prototype = {
	attach : function(listener) {
		this._listeners.push(listener);
	},
	notify : function(args) {
		for (var i = 0; i < this._listeners.length; i++) {
			this._listeners[i](this._sender, args);
		}
	}
};

// -- ESM interop (Grunt -> Vite migration): re-expose module-scope
// declarations as globals, matching the semantics classic <script> tags
// provided (other files still reference these as bare identifiers). --
window.Event = Event;
