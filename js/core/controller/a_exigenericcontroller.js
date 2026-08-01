/**
* Super class for the controllers. It manages the setPageBackground and notFound methods
*
* @class ExiGenericController
* @constructor
*/
function ExiGenericController() {
	this.init();
}


ExiGenericController.prototype.setPageBackground = function() {

};

ExiGenericController.prototype.notFound = function() {

};



// -- ESM interop (Grunt -> Vite migration): re-expose module-scope
// declarations as globals, matching the semantics classic <script> tags
// provided (other files still reference these as bare identifiers). --
window.ExiGenericController = ExiGenericController;
