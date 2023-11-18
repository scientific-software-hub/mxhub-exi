function TrackingMainMenu() {
	this.id = BUI.id();
	MainMenu.call(this, {isHidden : false, cssClass : 'mainMenu'});
}

TrackingMainMenu.prototype.populateCredentialsMenu = MainMenu.prototype.populateCredentialsMenu;
TrackingMainMenu.prototype.init = MainMenu.prototype.init;
TrackingMainMenu.prototype.getPanel = MainMenu.prototype.getPanel;
TrackingMainMenu.prototype._convertToHTMLWhiteSpan = MainMenu.prototype._convertToHTMLWhiteSpan;
TrackingMainMenu.prototype.getAddCredentialMenu = MainMenu.prototype.getAddCredentialMenu;
TrackingMainMenu.prototype.getLoginButton = MainMenu.prototype.getLoginButton;
TrackingMainMenu.prototype.setText = MainMenu.prototype.setText;
TrackingMainMenu.prototype.getHelpMenu = MainMenu.prototype.getHelpMenu;


/**
 * If there is a credential then home tab will redirect to the welcome page (either manager or user)
 */
TrackingMainMenu.prototype.getHomeItem = function() { 
	return {
		text : this._convertToHTMLWhiteSpan("Sessions"),
		cls : 'ExiSAXSMenuToolBar',
		icon : '../images/icon/rsz_ic_home_black_24dp.png',
		handler : function(){
				if (EXI.credentialManager.getCredentials() != null){
					if (EXI.credentialManager.getCredentials().length > 0){
						var username = EXI.credentialManager.getCredentials()[0].username;
						var credential = EXI.credentialManager.getCredentialByUserName(EXI.credentialManager.getCredentials()[0].username);
						if (credential.isManager()){
							location.hash = "/welcome/manager/" + username + "/main";
						}
						else{
							location.hash = "/welcome/user/" + username + "/main";
						}
					}
					else{
						BUI.showError("You should sign up");
					}
				}
				else{
					BUI.showError("You should sign up");
				}
		}
	};
};


TrackingMainMenu.prototype.getShipmentItem = function() { 
	return {
		text : this._convertToHTMLWhiteSpan("Shipments"),
		cls : 'ExiSAXSMenuToolBar',
		icon : '../images/icon/ic_email_black_24dp.png',
		handler : function(){
				location.hash = "/proposal/shipping/nav";
		}
	};
};

TrackingMainMenu.prototype.getAddressesItem = function() { 
	return {
		text : this._convertToHTMLWhiteSpan("Lab-contacts"),
		cls : 'ExiSAXSMenuToolBar',
		icon : '../images/icon/contacts.png',
		handler : function(){
						location.hash = "/proposal/addresses/nav";
		}
	};
};

TrackingMainMenu.prototype.getMenuItems = function() {			
	return [	
    	this.getHomeItem(),
    	this.getShipmentItem(),    	
		this.getAddressesItem(),
		'->', 
		{
			xtype : 'textfield',
			name : 'field1',
			emptyText : 'search shipment',
			hidden : this.isHidden,
			listeners : {
				specialkey : function(field, e) {
                    alert("To be implemented");
					/*if (e.getKey() == e.ENTER) {                        
						location.hash = "/datacollection/macromoleculeAcronym/" + field.getValue() + "/main";
					}*/
				} 
			} 
	}
	];
};


