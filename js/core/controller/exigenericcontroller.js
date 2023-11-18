/**
* Super class for the controllers. It manages the setPageBackground and notFound methods
*
* @class ExiGenericController
* @constructor
*/
function ExiGenericController() {
	this.init();
}

ExiGenericController.prototype.authenticateAndRedirect = function(proposal, redirection) {
	var user = null;
	var onAuthenticated = function(){								
		EXI.credentialManager.setActiveProposal(user, proposal);			
		location.hash = redirection;
		authenticationForm.window.close();
	}
	var authenticationForm = new AuthenticationForm();
	authenticationForm.onAuthenticate.attach(function(sender, args){	
		user = args.user;		
		EXI.authenticate(args.user, args.password, args.site, args.exiUrl, args.properties, onAuthenticated);	
		
	});

	authenticationForm.show();
};

ExiGenericController.prototype.redirect = function(proposal, redirection) {	
	EXI.credentialManager.setActiveProposal(EXI.credentialManager.getCredentials()[0].username, proposal);	
	location.hash = redirection;
};


ExiGenericController.prototype.setPageBackground = function() {

};

ExiGenericController.prototype.notFound = function() {

};


