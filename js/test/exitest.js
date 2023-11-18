function ExiTEST() {
	 Exi.call(this, {
		 					menu: new TestMainMenu(),
                            managerMenu : new SAXSManagerMenu(),
		 					anonymousMenu: new TestMainMenu(),
                            controllers : [new TestController(), new ProposalExiController()]
	 });
}

ExiTEST.prototype.loadSelected = Exi.prototype.loadSelected;
ExiTEST.prototype.addMainPanel = Exi.prototype.addMainPanel;
ExiTEST.prototype.getSelectedDataCollections = Exi.prototype.getSelectedDataCollections;
ExiTEST.prototype.addNavigationPanel = Exi.prototype.addNavigationPanel;
ExiTEST.prototype.clearNavigationPanel = Exi.prototype.clearNavigationPanel;
ExiTEST.prototype.clearMainPanel = Exi.prototype.clearMainPanel;
ExiTEST.prototype.setLoadingNavigationPanel = Exi.prototype.setLoadingNavigationPanel;
ExiTEST.prototype.setError = Exi.prototype.setError;
ExiTEST.prototype.setLoading = Exi.prototype.setLoading;
ExiTEST.prototype.setLoadingMainPanel = Exi.prototype.setLoadingMainPanel;
ExiTEST.prototype.show = Exi.prototype.show;
ExiTEST.prototype.setAnonymousMenu = Exi.prototype.setAnonymousMenu;
ExiTEST.prototype.setUserMenu = Exi.prototype.setUserMenu;
ExiTEST.prototype.setManagerMenu = Exi.prototype.setManagerMenu;
ExiTEST.prototype.manageMenu = Exi.prototype.manageMenu;
ExiTEST.prototype.appendDataAdapterParameters = Exi.prototype.appendDataAdapterParameters;
ExiTEST.prototype.hideNavigationPanel = Exi.prototype.hideNavigationPanel;
ExiTEST.prototype.showNavigationPanel = Exi.prototype.showNavigationPanel;
ExiTEST.prototype.addTimer = Exi.prototype.addTimer;
ExiTEST.prototype.clearTimers = Exi.prototype.clearTimers;
ExiTEST.prototype.addMainPanelWithTimer = Exi.prototype.addMainPanelWithTimer;
ExiTEST.prototype.addNavigationPanelWithTimer = Exi.prototype.addNavigationPanelWithTimer;
ExiTEST.prototype.authenticate = Exi.prototype.authenticate;
ExiTEST.prototype.openWelcomePage = Exi.prototype.openWelcomePage;


ExiTEST.prototype.afterRender = function(){    
	this.mainMenu.populateCredentialsMenu();
	Path.listen();   
};

ExiTEST.prototype.getHeader = function(){
    var html = "";
    var data = {
        version         : 'TEST',
        release_date    : ExtISPyB.release_date               
    };
    dust.render("testheader", data, function(err, out){
		html = out;
     });
    return html;	
};


ExiTEST.prototype.getDataAdapter = function(args){
	return new SaxsDataAdapterFactory(this.appendDataAdapterParameters(args));
};



