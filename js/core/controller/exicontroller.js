function ExiController(){
	this.init();
  
}


ExiController.prototype.loadNavigationPanel = function(listView) {
	/** Cleaning up navigation panel * */
	EXI.clearNavigationPanel();
	EXI.setLoadingNavigationPanel(true);
	
	var onSuccess = function(sender, data) {
		/** Load panel * */
		EXI.addNavigationPanel(listView);
		/** Load data * */
		listView.load(data);
		EXI.setLoadingNavigationPanel(false);
	};
	
	/** Handle error * */
	var onError = function(sender, data) {
		EXI.setLoadingNavigationPanel(false);
	};
	
	/** Load data data * */
	return EXI.getDataAdapter({ onSuccess : onSuccess, onError : onError });
};

ExiController.prototype.init = function(){
    var _this = this;
	function setPageBackground() {

	}
	function notFound() {

	}

	/** Welcome Page **/
	Path.map("#/").to(function() {             
		location.hash = '/welcome';
	}).enter(setPageBackground);
	
	Path.map("#/login").to(function() {
       
        EXI.credentialManager.logout();
		EXI.authenticationForm.show();
	}).enter(setPageBackground);
	
	
	Path.map("#/welcome").to(function() {
        EXI.credentialManager.logout();
        EXI.authenticationForm.show();
	}).enter(setPageBackground);
	
	Path.map("#/welcome/user/:user/main").to(function() {
       
		var user = this.params['user'];		
        var mainView = new ManagerWelcomeMainView();
		EXI.addMainPanel(mainView);
        EXI.hideNavigationPanel();
		mainView.load(user);
	}).enter(setPageBackground);
	

	Path.map("#/welcome/manager/:user/main").to(function() {
       
		var user = this.params['user'];
		var mainView = new ManagerWelcomeMainView();
		EXI.addMainPanel(mainView);
        
        EXI.hideNavigationPanel();
		mainView.load(user);
	}).enter(setPageBackground);
	
    Path.map("#/welcome/manager/:user/date/:start/:end/main").to(function() {                         
		var user = this.params['user'];
		var mainView = new ManagerWelcomeMainView();
		EXI.addMainPanel(mainView);
        EXI.hideNavigationPanel();
		mainView.loadSessionsByDate(user,this.params['start'], this.params['end'] );
	}).enter(setPageBackground);

	Path.map("#/welcome/manager/proposal/:proposal/main").to(function() {                         
		var proposalCode = this.params['proposal'];
		var mainView = new ManagerWelcomeMainView();
		EXI.addMainPanel(mainView);
        EXI.hideNavigationPanel();
		mainView.panel.setLoading(true);
		var onSuccess = function (sender, sessions){
			mainView.displaySessions(sessions, sessions.length + " sessions for proposal " + proposalCode);
			mainView.panel.setLoading(false);
		}
		EXI.getDataAdapter({onSuccess:onSuccess}).proposal.session.getSessionsByProposal(proposalCode);
	}).enter(setPageBackground);

	Path.map("#/logout").to(function() {     
		EXI.credentialManager.logout();
         EXI.hideNavigationPanel();
		EXI.proposalManager.clear();
		
	}).enter(setPageBackground);
	
	// Here we set a "root route".  You may have noticed that when you landed on this
	// page you were automatically "redirected" to the "#/users" route.  The definition
	// below tells PathJS to load this route automatically if one isn't provided.
	Path.root("#/");

	// The `Path.rescue()` method takes a function as an argument, and will be called when
	// a route is activated that you have no yet defined an action for.  On this example
	// page, you'll notice there is no defined route for the "Unicorns!?" link.  Since no
	// route is defined, it calls this method instead.
	Path.rescue(notFound);
	
	
};
