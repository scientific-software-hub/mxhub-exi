function ExiMX() {
	 Exi.call(this, {
		 					menu: new MXMainMenu(),
							managerMenu : new MXManagerMenu(),
		 					anonymousMenu: new MainMenu(),
		 					controllers : [									
									new SessionController(), 									
									new OfflineExiController(), 
									new ProposalExiController(), 
									new LabContactExiController(),
									new PuckController(),
									new CrystalController(),
									new ProteinController(),
									new AutoprocIntegrationController(),
									new MxDataCollectionController(),
									new WorkflowController(),
									new MxPrepare(),
									new ImageController(),
                                    new PhasingController(),
                                    new XfeController(),
                                    new BeamlineParameterController(),
									new SAXSExiController(),
									new EMDataCollectionController()
								 
									
							],
		 					headerCssClass : 'mxTitlePanel'

	 });
}

ExiMX.prototype.loadSelected = Exi.prototype.loadSelected;
ExiMX.prototype.addMainPanel = Exi.prototype.addMainPanel;
ExiMX.prototype.getSelectedDataCollections = Exi.prototype.getSelectedDataCollections;
ExiMX.prototype.addNavigationPanel = Exi.prototype.addNavigationPanel;
ExiMX.prototype.clearNavigationPanel = Exi.prototype.clearNavigationPanel;
ExiMX.prototype.clearMainPanel = Exi.prototype.clearMainPanel;
ExiMX.prototype.setLoadingNavigationPanel = Exi.prototype.setLoadingNavigationPanel;
ExiMX.prototype.setLoadingMainPanel = Exi.prototype.setLoadingMainPanel;
ExiMX.prototype.setError = Exi.prototype.setError;
ExiMX.prototype.setLoading = Exi.prototype.setLoading;
ExiMX.prototype.show = Exi.prototype.show;
ExiMX.prototype.setAnonymousMenu = Exi.prototype.setAnonymousMenu;
ExiMX.prototype.setUserMenu = Exi.prototype.setUserMenu;
ExiMX.prototype.setManagerMenu = Exi.prototype.setManagerMenu;
ExiMX.prototype.manageMenu = Exi.prototype.manageMenu;
ExiMX.prototype.appendDataAdapterParameters = Exi.prototype.appendDataAdapterParameters;
ExiMX.prototype.hideNavigationPanel = Exi.prototype.hideNavigationPanel;
ExiMX.prototype.showNavigationPanel = Exi.prototype.showNavigationPanel;
ExiMX.prototype.showNavigationPanel = Exi.prototype.showNavigationPanel;
ExiMX.prototype.addTimer = Exi.prototype.addTimer;
ExiMX.prototype.clearTimers = Exi.prototype.clearTimers;
ExiMX.prototype.addMainPanelWithTimer = Exi.prototype.addMainPanelWithTimer;
ExiMX.prototype.addNavigationPanelWithTimer = Exi.prototype.addNavigationPanelWithTimer;
ExiMX.prototype.authenticate = Exi.prototype.authenticate;
ExiMX.prototype.openWelcomePage = Exi.prototype.openWelcomePage;
ExiMX.prototype.afterRender = Exi.prototype.afterRender;


 

ExiMX.prototype.getHeader = function(){
    var html = "";
    var data = {
        version         : ExtISPyB.version,
        release_date    : ExtISPyB.release_date,
        site            : ExtISPyB.default_site
       
        
    };
    dust.render("mxheader", data, function(err, out){
		html = out;
     });
    return html;	
};

ExiMX.prototype.getDataAdapter = function(args){
	
	return  new MxDataAdapterFactory(this.appendDataAdapterParameters(args));
};
