/**
* This is the description for routing all the session actions. It means url= #/session/*
*
* @class SessionController
* @constructor
*/
function SessionController() {
	this.init();
}

SessionController.prototype.setPageBackground = ExiGenericController.prototype.setPageBackground;
SessionController.prototype.notFound = ExiGenericController.prototype.notFound;

/**
* Inits the controller for the session related objects
* Paths accepted:
* #/session/nav
* #/session/nav/:sessionId/session
*
* @method init
*/
SessionController.prototype.init = function() {
	var _this = this;
	var listView;	

	Path.map("#/session/nav").to(function() {
			EXI.clearNavigationPanel();
            EXI.hideNavigationPanel();	
		
            var mainView = new SessionMainView({
                title : "Sessions"
            });
           
            EXI.addMainPanel(mainView);
            
            var onSuccess = function(sender, data){          
                 mainView.load(EXI.proposalManager.getSessions());         
                 EXI.setLoadingMainPanel(false);    
            };
            EXI.setLoadingMainPanel();
            EXI.getDataAdapter({
                onSuccess : onSuccess                
            }).proposal.session.getSessions();         	

	}).enter(this.setPageBackground);

	

	Path.rescue(this.notFound);
};
