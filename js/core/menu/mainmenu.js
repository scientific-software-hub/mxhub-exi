function MainMenu(args) {
	this.id = BUI.id();
	this.loginButtonId = 'loginButton' + this.id;
	this.cssClass = 'mainMenu';
	this.isHidden = true;
	if (args != null){
		if (args.cssClass != null){
			this.cssClass = args.cssClass;
		}
		if (args.isHidden != null){
			this.isHidden = args.isHidden;
		}
	}
}

MainMenu.prototype.getMenuItems = function() { return [];};


/**
 * If there is a credential then home tab will redirect to the welcome page (either manager or user)
 */
MainMenu.prototype.getHomeItem = function(homeLabel) {
    if (homeLabel == null || homeLabel == ""){
        homeLabel = "Home";
    }
	return {
		text : this._convertToHTMLWhiteSpan(homeLabel),
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



MainMenu.prototype.getShipmentItem = function() { 
	var _this = this;

	// function getBiosaxsMenu() {
	// 	var _this = this;
	// 	function onItemCheck(item, checked) {
	// 		if (item.text == "Stock Solutions") {
	// 			location.hash = "/saxs/stocksolution/nav";
	// 		}
	// 	}
	//
	// 	return Ext.create('Ext.menu.Menu', {
	// 		items : [
	// 					{
	// 						text : 'Stock Solutions',
	// 						icon : '../images/icon/testtube.png',
	// 						handler : onItemCheck
	// 					}
	// 		] });
	// }

	function getLabContactsMenu() {
		var _this = this;
		var addNewDisabled = true;
		/*if (EXI.credentialManager.getSiteName().startsWith("MAXIV")){
				addNewDisabled = false;
		}*/
		function onItemCheck(item, checked) {
			if (item.text == "Add new") {
				var addressEditForm = new AddressEditForm();
	
				addressEditForm.onSaved.attach(function (sender, address) {
				debugger;
					window.close();
					location.hash = "#/proposal/address/" + address.labContactId + "/main";
				});

				var window = Ext.create('Ext.window.Window', {
					title : 'Shipping Address Card',
					height: 550,
	   				width: 750,
					modal : true,
					layout : 'fit',
					items : [ addressEditForm.getPanel() ],
					buttons : [ {
							text : 'Save',
							handler : function() {
								addressEditForm.save();
							}
						}, {
							text : 'Cancel',
							handler : function() {
								window.close();
							}
						} ]
				}).show();

				addressEditForm.load();
			} else if (item.text == "List") {
				location.hash = "/proposal/addresses/nav";
			}
		}

		return Ext.create('Ext.menu.Menu', {
			items : [ 
						/*{
							text : 'Add new --',
							icon : '../images/icon/add.png',
							handler : onItemCheck,
							disabled : addNewDisabled
						}, */
						{
							text : 'List',
							icon : '../images/icon/ic_list_black_24dp.png',
							handler : onItemCheck 
						} 
			] });
	}
	
	function getShipmentsMenu() {
		var _this = this;
		function onItemCheck(item, checked) {
			if (item.text == "Add new") {
				var shippingEditForm = new ShipmentEditForm({width : 600, height : 700});
				
				shippingEditForm.onSaved.attach(function (sender, shipment) {
					window.close();
					location.hash = "#/shipping/"+ shipment.shippingId +"/main"
				});

				var window = Ext.create('Ext.window.Window', {
					title : 'Shipment',
					height : 500,
					width : 650,
					padding : '10 10 10 10',
					modal : true,
					layout : 'fit',
					items : [ shippingEditForm.getPanel() ],
					buttons : [ {
							text : 'Save',
							handler : function() {
								debugger
								shippingEditForm.saveShipment();
							}
						}, {
							text : 'Cancel',
							handler : function() {
								window.close();
							}
						} ]
				}).show();

				shippingEditForm.load();
			} else if (item.text == "List") {
				location.hash = "/proposal/shipping/nav";
			}
			
		}

		return Ext.create('Ext.menu.Menu', {
			items : [ 
						{
							text : 'Add new',
							icon : '../images/icon/add.png',
							handler : onItemCheck 
						}, {
							text : 'List',
							icon : '../images/icon/ic_list_black_24dp.png',
							handler : onItemCheck 
						} 
			] });
	}
	
	return {
		text : this._convertToHTMLWhiteSpan("Shipment"),
		cls : 'ExiSAXSMenuToolBar',
//		hidden : this.isHidden,
        disabled : false,
		menu : Ext.create('Ext.menu.Menu', {
			items : [ 
						// {
						//     id   : 'biosax_item',
						// 	text : 'BioSAXS',
						// 	icon : '../images/icon/macromolecule.png',
						// 	menu: getBiosaxsMenu()
						// },
						{
						    id   : 'addresses_item',
							text : 'Manage shipping addresses',
							icon : '../images/icon/contacts.png',
							menu : getLabContactsMenu() 
						}, 
						{
						    id   : 'shipments_item',
							text : 'Shipments',
							icon : '../images/icon/shipping.png',
							menu : getShipmentsMenu() 
						} 
					],
					 listeners : {
                                     'beforeshow' : function(menu) {
                                         if (EXI.credentialManager.hasActiveProposal()) {
                                            // Ext.getCmp('biosax_item').enable();
                                            Ext.getCmp('addresses_item').enable();
                                            Ext.getCmp('shipments_item').enable();
                                         } else {
                                            // Ext.getCmp('biosax_item').disable();
                                            Ext.getCmp('addresses_item').disable();
                                            Ext.getCmp('shipments_item').disable();
                                         }
                                     }
                                 }
	    })
	};

};

MainMenu.prototype.getProteinCrystalsMenu = function() {
		function onItemCheck(item, checked) {
			if (item.text == "Add new Protein") {
				var proteinEditForm = new ProteinEditForm({width : 600, height : 700});

				proteinEditForm.onSaved.attach(function (sender, protein) {
					window.close();
					//location.hash = "#/protein/" + protein.proteinId + "/main";
					location.hash = "/protein/list";
				});

				var window = Ext.create('Ext.window.Window', {
                                title : 'Protein',
                                height : 500,
                                width : 700,
                                padding : '10 10 10 10',
                                modal : true,
                                layout : 'fit',
                                items : [ proteinEditForm.getPanel() ],
                                buttons : [ {
                                        text : 'Save',
                                        handler : function() {
                                            proteinEditForm.saveProtein();
                                        }
                                    }, {
                                        text : 'Cancel',
                                        handler : function() {
                                            window.close();
                                        }
                                    } ]
                            }).show();

				proteinEditForm.load();
			} else if (item.text == "List") {
				location.hash = "/protein/list";
			} else if (item.text == "Ligands") {
                location.hash = "#/ligands/list";
            }
        }

        var menu = Ext.create('Ext.menu.Menu', {
                items : [
                            {
                                id : 'add_proteins_item',
                                text : 'Add new Protein',
                                icon : '../images/icon/add.png',
                                handler : onItemCheck,
                                disabled : true
                            }, {
                                id : 'list_proteins_item',
                                text : 'List',
                                icon : '../images/icon/ic_list_black_24dp.png',
                                handler : onItemCheck
                            }, {
                                id : 'ligands_item',
                                text : 'Ligands',
                                icon : '../images/icon/macromolecule.png',
                                handler : onItemCheck
                            }
                ],
                 listeners : {
                                 'beforeshow' : function(menu) {
                                     if (EXI.credentialManager.hasActiveProposal()) {
                                        Ext.getCmp('list_proteins_item').enable();
                                        Ext.getCmp('ligands_item').enable();
                                        if (EXI.credentialManager.isUserAllowedAddProtein()){
                                            Ext.getCmp('add_proteins_item').enable();
                                        } else {
                                            Ext.getCmp('add_proteins_item').disable();
                                        }
                                     } else {
                                        Ext.getCmp('add_proteins_item').disable();
                                        Ext.getCmp('list_proteins_item').disable();
                                        Ext.getCmp('ligands_item').disable();
                                     }
                                 }
                             }
        });
        return menu;
};

MainMenu.prototype.getDataExplorerMenu = function() {
	function onItemCheck(item, checked) {
		if (item.text == "Calendar") {
			location.hash = "/session/nav";
		}
		if (item.text == "Experiments") {
			location.hash = "/experiment/nav";
		}
	}
	var menu = Ext.create('Ext.menu.Menu', {
		items : [ 
			{
				id : 'calendar_item',
				text : 'Calendar',
				icon : '../images/icon/sessions.png',
				handler : onItemCheck
			}
		] ,
		listeners : {
            'beforeshow' : function(menu) {
                if (EXI.credentialManager.hasActiveProposal()) {
					Ext.getCmp('calendar_item').enable();
				} else {
					Ext.getCmp('calendar_item').disable();
				}
            }
        }
	});

	return menu;
};

MainMenu.prototype.getHelpMenu = function() {
	var _this = this;
	function onItemCheck(item, checked) {
		if (item.text == "ISPyB Web services API Map") {
			window.open('/exi/documentation/ispyb-api-ws/print.html');
		}
		if (item.text == "Job list") {
			location.hash = "/tool/list";
		}
	}

	return Ext.create('Ext.menu.Menu', {
		items : [

		{
			text : 'Developer',
			checked : false,
			group : 'theme',
			menu : {       
                    items: [
                        {
                            text: 'ISPyB Web services API Map',
                            handler: onItemCheck
                        }, {
                            text: 'How to retrieve data from ISPyB?',
                            handler: onItemCheck
                        }, {
                            text: 'EXI Router',
                            handler: onItemCheck
                        }, {
                            text: 'EXI List Views Objects',
                            handler: onItemCheck
                        }, {
                            text: 'EXI Main View Objects',
                            handler: onItemCheck
                        }
                    ]
                }
		},
		"-",
		{
				text : 'About',
				checked : false,
				group : 'theme',
				handler : onItemCheck }
		] });
};

MainMenu.prototype.getAddCredentialMenu = function() {
	if (EXI.credentialManager.getCredentials() != null){
		if (EXI.credentialManager.getCredentials().length > 0){
			return {
				icon : '../images/icon/rsz_1ic_input_black_24dp.png',
				height : 30,
				text : 'Add',
				handler : function() {
						window.location.href = '#/login';
				} 
			};
		}
	}
};

MainMenu.prototype.populateCredentialsMenu = function() {
	this.credentialsMenu.removeAll();
	var credentialDisplay = "";
	var logo = "../images/icon/rsz_esrflogo80.gif";
	if (EXI.credentialManager.getSiteName().startsWith("MAXIV")){
	    logo = "../images/icon/maxiv-favicon.ico";
	}
	if (EXI.credentialManager.getSiteName().startsWith("DESY")){
		logo = "../images/icon/desy-favicon.ico";
	}
	if (EXI.credentialManager.getCredentials() != null) {
		for (var i = 0; i < EXI.credentialManager.getCredentials().length; i++) {
			credentialDisplay = EXI.credentialManager.getCredentials()[i].username;
			if (EXI.credentialManager.getCredentials()[i].activeProposals.length > 0) {
				for (var j = 0; j < EXI.credentialManager.getCredentials()[i].activeProposals.length; j++) {
					credentialDisplay = EXI.credentialManager.getCredentials()[i].activeProposals[j] + "@" + EXI.credentialManager.getCredentials()[i].username;
					this.credentialsMenu.add({
						text : credentialDisplay,
						icon : logo,
						disabled : true });
				}
			} else {
				this.credentialsMenu.add({
					text : credentialDisplay,
					icon : logo,
					disabled : true });
				
			}
			
			
		}
	} 
	if (EXI.credentialManager.getCredentials().length > 0){
		Ext.getCmp(this.loginButtonId).setText("<span style='color:white'>Log out <span style='font-weight:bold;'>" + credentialDisplay + " </span> </span>");
		Ext.getCmp(this.loginButtonId).setIcon("../images/rsz_logout.png");
	}
	else{
		Ext.getCmp(this.loginButtonId).setText("<span style='color:white'>Sign In</span>");
		Ext.getCmp(this.loginButtonId).setIcon("../images/rsz_login.png");
	}
	
	
};

MainMenu.prototype._convertToHTMLWhiteSpan = function(text) {
	return '<span style="color:white">' + text +'</span>';
};

MainMenu.prototype.isLoggedIn = function() {
	return (EXI.credentialManager.getCredentials().length > 0);
};


MainMenu.prototype.getLoginButton = function() {
	var icon =  "../images/rsz_login.png";
	var text =  this._convertToHTMLWhiteSpan("Sign In");
	
	if (EXI.credentialManager.getCredentials().length > 0){
		icon =  "../images/rsz_logout.png";
		text =  this._convertToHTMLWhiteSpan("log out");
	}
	
	return {
		xtype 	: 'splitbutton',
		id	: this.loginButtonId,
		text 	: text,
		cls 	: 'button_log_out',
		icon 	: icon,
		menu 	: this.credentialsMenu,
		handler : function() {
			if (EXI.credentialManager.getCredentials().length == 0){
				location.hash = "/login";
			}
			else{
				location.hash = "/logout";
			}
		} 
	};
};

MainMenu.prototype.getPanel = function() {
	
	
	this.credentialsMenu = new Ext.menu.Menu({
		id : this.id + "menu",
		items : [this.getAddCredentialMenu()] 
	});
	
	var items  = this.getMenuItems();
	items.push('->');
	items.push(this.getLoginButton());
	
	this.tb = Ext.create('Ext.toolbar.Toolbar', {
		cls : this.cssClass,
		items : items
	});
	return this.tb;
};
