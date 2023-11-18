/**
* This is the description for routing all the crystal actions. It means url= #/crystal/*
*
* @class XfeController
* @constructor
*/
function XfeController() {
	this.init();
}

XfeController.prototype.setPageBackground = ExiGenericController.prototype.setPageBackground;
XfeController.prototype.notFound = ExiGenericController.prototype.notFound;

/**
* Inits the controller for the crystal related objects
* Paths accepted:
* #/crystal/nav
* #/mx/crystal/:crystalId/main
*
* @method init
*/
XfeController.prototype.init = function() {
	var _this = this;
	var listView;	

	Path.map("#/mx/xfe/:xfeFluorescenceSpectrumId/main").to(function() {
		var mainView = new XfeViewerMainView();
		EXI.addMainPanel(mainView);

		mainView.load(this.params['xfeFluorescenceSpectrumId']);

	}).enter(this.setPageBackground);
};
