/**
* This is the description for routing all the crystal actions. It means url= #/crystal/*
*
* @class CrystalController
* @constructor
*/
function CrystalController() {
	this.init();
}

CrystalController.prototype.setPageBackground = ExiGenericController.prototype.setPageBackground;
CrystalController.prototype.notFound = ExiGenericController.prototype.notFound;

/**
* Inits the controller for the crystal related objects
* Paths accepted:
* #/crystal/nav
* #/mx/crystal/:crystalId/main
*
* @method init
*/
CrystalController.prototype.init = function() {
	var _this = this;
	var listView;	

	Path.map("#/crystal/nav").to(function() {
			EXI.clearNavigationPanel();
			EXI.setLoadingNavigationPanel(true);
			listView = new CrystalListView();
			listView.onSelect.attach(function(sender, selected) {	
				location.hash = "/mx/crystal/" + selected[0].crystalId + "/main";
			});

			EXI.addNavigationPanel(listView);
			var onSuccess = function(sender, crystals) {
				listView.load(crystals);
				EXI.setLoadingNavigationPanel(false);
			};
			EXI.getDataAdapter({onSuccess : onSuccess}).mx.crystal.getCrystalsByProposalId();
	}).enter(this.setPageBackground);

	Path.map("#/mx/crystal/:crystalId/main").to(function() {
		var mainView = new CrystalMainView();
		EXI.addMainPanel(mainView);
		EXI.setLoadingMainPanel(true);
		var onSuccess = function(sender, crystal){
			mainView.load(crystal);
			EXI.setLoadingMainPanel(false);
			
		};
		EXI.getDataAdapter({onSuccess : onSuccess}).mx.crystal.getCrystalById(this.params['crystalId']);

	}).enter(this.setPageBackground);
};
