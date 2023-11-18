function LabContactExiController() {
	this.init();
}

LabContactExiController.prototype.loadNavigationPanel = ExiController.prototype.loadNavigationPanel;

LabContactExiController.prototype.setPageBackground = function() {
};

LabContactExiController.prototype.notFound = function() {
};



LabContactExiController.prototype.init = function() {
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
		
		Path.map("#/proposal/addresses/nav").to(function() {
			EXI.clearNavigationPanel();
			EXI.setLoadingNavigationPanel(true);
			listView = new AddressListView();
			listView.onSelect.attach(function(sender, selected) {
				location.hash = "/proposal/address/" + selected[0].labContactId + "/main";
			});
			
			EXI.addNavigationPanel(listView);
			adapter = loadNavigationPanel(listView);
			adapter.proposal.labcontacts.getLabContacts();
			
			/** Loading welcome page **/
			// EXI.addMainPanel(new AddressWelcomeMainView());
			
		}).enter(this.setPageBackground);
		
		Path.map("#/proposal/address/:labcontactId/main").to(function() {
			var mainView = new AddressMainView();
			EXI.addMainPanel(mainView);
			mainView.load(this.params['labcontactId']);
		}).enter(this.setPageBackground);
		
};
