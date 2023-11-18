function ProposalExiController() {
	this.init();
}

ProposalExiController.prototype.loadNavigationPanel = ExiController.prototype.loadNavigationPanel;

ProposalExiController.prototype.setPageBackground = function() {
};

ProposalExiController.prototype.notFound = function() {
};


ProposalExiController.prototype.init = function() {
	var _this = this;

		function setPageBackground() {
			_this.setPageBackground();
		}
		function notFound() {
			_this.notFound();
		}

		function loadNavigationPanel(listView) {
			return _this.loadNavigationPanel(listView);
		}
		
		var listView = null;
		var adapter = null;

		

		Path.map("#/proposal/session/nav").to(function() {
			listView = new SessionListView();
			/** When selected move to hash * */
			listView.onSelect.attach(function(sender, selected) {
                
				if (EXI.credentialManager.getTechniqueByBeamline(selected[0].beamlineName) == "SAXS"){
					location.hash = "/session/nav/" + selected[0].sessionId + "/session";
				}
				else{
					location.hash = "/mx/datacollection/session/" + selected[0].sessionId + "/main";
				}
				
			});
            
			adapter = loadNavigationPanel(listView);
			adapter.proposal.session.getSessions();
						
		}).enter(this.setPageBackground);
	

		
		Path.map("#/proposal/address/:lacontactId/main").to(function() {
			var mainView = new AddressMainView();
			EXI.addMainPanel(mainView);
			mainView.load(this.params['lacontactId']);
		}).enter(this.setPageBackground);
		

		Path.map("#/puck/:containerId/main").to(function() {
			var mainView = new PuckMainView();
			EXI.addMainPanel(mainView);
			mainView.load(this.params['containerId']);
		}).enter(this.setPageBackground);

		
		Path.map("#/ligands/list").to(function() {
		
			EXI.clearNavigationPanel();
			EXI.hideNavigationPanel();
			
			EXI.setLoadingMainPanel("Searching for ligands");
			var main = new LigandsMainView();
			EXI.addMainPanel(main);			
			var onSuccessProtein = function(sender, ligands) {								
				main.load(ligands);
				EXI.setLoadingMainPanel(false);
			};
			EXI.getDataAdapter({onSuccess : onSuccessProtein}).proposal.proposal.getLigandsByProposalId();
		}).enter(this.setPageBackground);

		

		
};
