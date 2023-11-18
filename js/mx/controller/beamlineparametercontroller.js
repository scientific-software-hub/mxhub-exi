/**
* This is the description for routing all the puck actions. It means url= #/mx/datacollection/*
*
* @class BeamlineParameterController
* @constructor
*/
function BeamlineParameterController() {
	this.init();
}

BeamlineParameterController.prototype.setPageBackground = ExiGenericController.prototype.setPageBackground;
BeamlineParameterController.prototype.notFound = ExiGenericController.prototype.notFound;

/**
* Inits the controller for the puck related objects
* Paths accepted:
* #/mx/datacollection/protein_acronym/:acronmys/main
* #/mx/datacollection/session/:sessionId/main
*
* @method init
*/
BeamlineParameterController.prototype.init = function() {
	var _this = this;
	var listView;	

	
                
	Path.map("#/mx/beamlineparameter/datacollection/:dataCollectionId/main").to(function() {
        
		var mainView = new BeamlineParameterMainView();
		EXI.addMainPanel(mainView);
		mainView.load(this.params['dataCollectionId']);

	}).enter(this.setPageBackground);
};
