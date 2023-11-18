/**
* This is the description for routing all the crystal actions. It means url= #/mx/image/*
*
* @class ImageController
* @constructor
*/
function ImageController() {
	this.init();
}

ImageController.prototype.setPageBackground = ExiGenericController.prototype.setPageBackground;
ImageController.prototype.notFound = ExiGenericController.prototype.notFound;

/**
* Inits the controller for the crystal related objects
* Paths accepted:
* #/mx/image/:imageId/main
*
* @method init
*/
ImageController.prototype.init = function() {
	var _this = this;
	/*var listView;	

	Path.map("#/mx/image/:imageId/main").to(function() {
		var mainView = new ImageMainView();
		EXI.addMainPanel(mainView);
		mainView.load(this.params['imageId']);

	}).enter(this.setPageBackground);*/
};
