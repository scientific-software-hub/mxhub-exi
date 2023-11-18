function ExiTracking() {    
	 Exi.call(this, {
		 					menu: new TrackingMainMenu(),
		 					anonymousMenu: new MainMenu(),
		 					controllers : [new TrackingExiController(),  new ProposalExiController(), new SessionController(), new LabContactExiController()]
	 });
}

ExiTracking.prototype.loadSelected = Exi.prototype.loadSelected;
ExiTracking.prototype.addMainPanel = Exi.prototype.addMainPanel;
ExiTracking.prototype.getSelectedDataCollections = Exi.prototype.getSelectedDataCollections;
ExiTracking.prototype.addNavigationPanel = Exi.prototype.addNavigationPanel;
ExiTracking.prototype.clearNavigationPanel = Exi.prototype.clearNavigationPanel;
ExiTracking.prototype.clearMainPanel = Exi.prototype.clearMainPanel;
ExiTracking.prototype.setLoadingNavigationPanel = Exi.prototype.setLoadingNavigationPanel;
ExiTracking.prototype.setError = Exi.prototype.setError;
ExiTracking.prototype.setLoading = Exi.prototype.setLoading;
ExiTracking.prototype.setLoadingMainPanel = Exi.prototype.setLoadingMainPanel;
ExiTracking.prototype.show = Exi.prototype.show;
ExiTracking.prototype.setAnonymousMenu = Exi.prototype.setAnonymousMenu;
ExiTracking.prototype.setUserMenu = Exi.prototype.setUserMenu;
ExiTracking.prototype.appendDataAdapterParameters = Exi.prototype.appendDataAdapterParameters;
ExiTracking.prototype.hideNavigationPanel = Exi.prototype.hideNavigationPanel;
ExiTracking.prototype.showNavigationPanel = Exi.prototype.showNavigationPanel;
ExiTracking.prototype.addTimer = Exi.prototype.addTimer;
ExiTracking.prototype.clearTimers = Exi.prototype.clearTimers;
ExiTracking.prototype.addMainPanelWithTimer = Exi.prototype.addMainPanelWithTimer;
ExiTracking.prototype.addNavigationPanelWithTimer = Exi.prototype.addNavigationPanelWithTimer;


ExiTracking.prototype.getHeader = function(){
    var html = "";
    var data = {
        version         : ExtISPyB.version,
        release_date    : ExtISPyB.release_date
       
        
    };
    
    dust.render("trackingheader.template", data, function(err, out){        
		html = out;
     });
    return html;	
};

ExiTracking.prototype.getDataAdapter = function(args){
	return new MxDataAdapterFactory(this.appendDataAdapterParameters(args));
};

