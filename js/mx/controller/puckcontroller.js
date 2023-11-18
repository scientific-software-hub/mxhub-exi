/**
* This is the description for routing all the puck actions. It means url= #/puck/*
*
* @class PuckController
* @constructor
*/
function PuckController() {
	this.init();
}

PuckController.prototype.setPageBackground = ExiGenericController.prototype.setPageBackground;
PuckController.prototype.notFound = ExiGenericController.prototype.notFound;

/**
* Inits the controller for the puck related objects
* Paths accepted:
* #/puck/nav
* #/mx/puck/:containerId/main
* #/mx/puck/add
*
* @method init
*/
PuckController.prototype.init = function() {
	var _this = this;
	var listView;	

	Path.map("#/puck/nav").to(function() {
			EXI.addMainPanel(new PuckWelcomeMainView());
			EXI.clearNavigationPanel();
			EXI.setLoadingNavigationPanel(true);
			listView = new PuckListView();
			listView.onSelect.attach(function(sender, selected) {
				location.hash = "/mx/puck/" + selected[0].Container_containerId+ "/main";
			});

			EXI.addNavigationPanel(listView);
			var onSuccessProposal = function(sender, pucks) {
				listView.load(pucks.slice(0, 100));
				EXI.setLoadingNavigationPanel(false);
			};
			EXI.getDataAdapter({onSuccess : onSuccessProposal}).proposal.proposal.getDewarByProposalId();
	}).enter(this.setPageBackground);
	
	Path.map("#/mx/puck/:containerId/main").to(function() {
		EXI.setLoadingMainPanel(true);
		var onSuccess = function(sender, puck){
			try{
				var mainView = new PuckMainView();
				EXI.addMainPanel(mainView);
				mainView.load(puck);
			}
			catch(e){
				EXI.setError(e.message);
			}
			EXI.setLoadingMainPanel(false);	
		};
		EXI.getDataAdapter({onSuccess: onSuccess}).proposal.shipping.getContainerById(this.params['containerId'],this.params['containerId'],this.params['containerId']);
		
	}).enter(this.setPageBackground);

	Path.map("#/mx/puck/add").to(function() {
		var mainView = new PuckMainView();
		EXI.addMainPanel(mainView);
		var emptyPuck = {"containerId":"","code":null,"containerType":"Puck","capacity":16,"beamlineLocation":null,"sampleChangerLocation":null,"containerStatus":null,"timeStamp":"Jan 15, 2016 2:29:39 PM","sampleVOs":[]};
		mainView.load(emptyPuck);
	}).enter(this.setPageBackground);
};
