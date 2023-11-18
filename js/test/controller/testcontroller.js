
/**
* This is the description for routing all the session actions. It means url= #/session/*
*
* @class TestController
* @constructor
*/
function TestController() {
	this.init();
}


TestController.prototype.loadNavigationPanel = ExiController.prototype.loadNavigationPanel;


TestController.prototype.setPageBackground = function() {
};

TestController.prototype.notFound = function() {
};

/**
* Inits the controller for the session related objects
* Paths accepted:
* #/session/nav
* #/session/nav/:sessionId/session
*
* @method init
*/
TestController.prototype.init = function() {
	var _this = this;
	var listView;	
	
	function setPageBackground() {
		_this.setPageBackground();
	}
	function notFound() {
		_this.notFound();
	}

	Path.map("#/navigation").to(function() {		
				
		EXI.clearNavigationPanel();
		EXI.hideNavigationPanel();
        /** Creates an instance of a Test Panel **/		
		var myWidget = new TestListView();
		/** Add panel to the left navigation panel **/		
		EXI.addNavigationPanel(myWidget);
		EXI.setLoadingNavigationPanel("Loading my data");
		/** Loads data into the panel **/		
		myWidget.load([
			{ 'name': 'Lisa',  "email":"lisa@simpsons.com",  "phone":"555-111-1224"  },
			{ 'name': 'Bart',  "email":"bart@simpsons.com",  "phone":"555-222-1234" },
			{ 'name': 'Homer', "email":"homer@simpsons.com",  "phone":"555-222-1244"  },
			{ 'name': 'Marge', "email":"marge@simpsons.com", "phone":"555-222-1254"  }
			]);

		myWidget.onSelect.attach(function(sender, selected) {
			location.hash = "/" + selected[0].name + "/main";
		});

		EXI.setLoadingNavigationPanel(false);
	}).enter(this.setPageBackground);
					
	Path.map("#/main").to(function() {
		var mainView = new TestMainView(this.params['crystalId']);
		EXI.addMainPanel(mainView);	
		mainView.load(this.params['crystalId']);
	}).enter(this.setPageBackground);
	

	Path.map("#/:name/main").to(function() {
		var name = this.params['name'];
		var mainView = new TestMainView();
		EXI.addMainPanel(mainView);	
		mainView.load( name);
	}).enter(this.setPageBackground);

	
	Path.map("#/navigation/clear").to(function() {		
		EXI.clearNavigationPanel();	  
	}).enter(this.setPageBackground);

	Path.map("#/main/clear").to(function() {		
		EXI.clearMainPanel();	  
	}).enter(this.setPageBackground);
	
	Path.map("#/main/setloading").to(function() {			
		EXI.setLoadingMainPanel("I am busy now");	  
	}).enter(this.setPageBackground);

	Path.map("#/main/removeloading").to(function() {			
		EXI.setLoadingMainPanel(false);	  
	}).enter(this.setPageBackground);


	Path.rescue(this.notFound);
};


