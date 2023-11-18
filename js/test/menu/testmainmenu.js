function TestMainMenu() {
	this.id = BUI.id();
	MainMenu.call(this, {isHidden : false, cssClass : 'mainMenu'});
}

TestMainMenu.prototype.populateCredentialsMenu = MainMenu.prototype.populateCredentialsMenu;
TestMainMenu.prototype.init = MainMenu.prototype.init;
TestMainMenu.prototype.getPanel = MainMenu.prototype.getPanel;
TestMainMenu.prototype._convertToHTMLWhiteSpan = MainMenu.prototype._convertToHTMLWhiteSpan;
TestMainMenu.prototype.getAddCredentialMenu = MainMenu.prototype.getAddCredentialMenu;
TestMainMenu.prototype.getLoginButton = MainMenu.prototype.getLoginButton;
TestMainMenu.prototype.setText = MainMenu.prototype.setText;
TestMainMenu.prototype.getHelpMenu = MainMenu.prototype.getHelpMenu;
TestMainMenu.prototype.getHomeItem = MainMenu.prototype.getHomeItem;
TestMainMenu.prototype.getShipmentItem = MainMenu.prototype.getShipmentItem;



TestMainMenu.prototype.getMenuExample = function() {
	function onItemCheck(item, checked) {
		if (item.text == "Navigation") {
			location.hash = "/navigation";
		}
		if (item.text == "Main") {
			location.hash = "/main";
		}
		if (item.text == "Clear Navigation Panel") {
			location.hash = "/navigation/clear";
		}
		if (item.text == "Clear Main Panel") {
			location.hash = "/main/clear";
		}
		if (item.text == "Set Main Loading") {
			location.hash = "/main/setloading";
		}
		if (item.text == "Remove Main Loading") {
			location.hash = "/main/removeloading";
		}
	}
	var menu = Ext.create('Ext.menu.Menu', {
		items : [ 
			{
				
				text : 'Navigation',
				icon : '../images/icon/sessions.png',
				handler : onItemCheck
			},
			{
				
				text : 'Main',
				icon : '../images/icon/sessions.png',
				handler : onItemCheck
			},
			'-',
			{
				
				text : 'Clear Navigation Panel',
				icon : '../images/icon/sessions.png',
				handler : onItemCheck
			},
			{
				
				text : 'Clear Main Panel',
				icon : '../images/icon/sessions.png',
				handler : onItemCheck
			},
			'-',
			{
				
				text : 'Set Main Loading',
				icon : '../images/icon/sessions.png',
				handler : onItemCheck
			},
			{
				
				text : 'Remove Main Loading',
				icon : '../images/icon/sessions.png',
				handler : onItemCheck
			}
		] ,
		listeners : {            
        }
	});

	return menu;
};


TestMainMenu.prototype.getMenuItems = function() {	
    		
	return [	    	
    	{
				text : this._convertToHTMLWhiteSpan("Examples"),
				cls : 'ExiSAXSMenuToolBar',
				hidden : this.isHidden,
				menu : this.getMenuExample() 		 
		}, 
		'->', 
		{
			xtype : 'textfield',
			name : 'field1',
			emptyText : 'search macromolecule',
			hidden : this.isHidden,
			listeners : {
				specialkey : function(field, e) {
					if (e.getKey() == e.ENTER) {                        
						location.hash = "/datacollection/macromoleculeAcronym/" + field.getValue() + "/main";
					}
				} 
			} 
	}
	];
};




TestMainMenu.prototype.getPreparationMenu = function() {
	var _this = this;
	function onItemCheck(item, checked) {
		if (item.text == "Macromolecules") {
			location.hash = "/saxs/macromolecule/nav";
		}
		if (item.text == "Buffers") {
			location.hash = "/saxs/buffer/nav";
		}

		if (item.text == "Sample Tracking") {
			location.hash = "/saxs/shipping/nav";
		}

		if (item.text == "My Experiments") {
			location.hash = "/saxs/template/nav";
		}
	}

	return Ext.create('Ext.menu.Menu', {
		items : [ 
	          {
				text : 'Macromolecules',
				icon : '../images/icon/macromolecule.png',
				handler : onItemCheck 
			}, 
			{
				text : 'Buffers',
				icon : '../images/icon/buffer.jpg',
				handler : onItemCheck 
			}, 

			"-", 
			{
				text : 'My Experiments',
				icon : '../images/icon/edit.png',
				handler : onItemCheck 
			}

		] });
};


TestMainMenu.prototype.getDataReductionMenu = function() {
	var _this = this;
	function onItemCheck(item, checked) {
		if (item.text == "Sessions") {
			_this.onSessionClicked.notify();
		}
		if (item.text == "Subtraction") {
			location.hash = "/tool/subtraction/main";
		}
		if (item.text == "Experiments") {
			_this.onExperimentClicked.notify();
		}
	}

	return Ext.create('Ext.menu.Menu', {
		items : [ {
			text : '<span class="menuCategoryItem">SEC</span>' }, "-", {
			text : 'Background Test' }, {
			text : 'Baseline Checker' }, {
			text : 'Frame Merge' }, "-", {
			text : '<span class="menuCategoryItem">INDIVIDUAL CONCENTRATION</span>' }, "-", {
			text : 'Subtraction',
			checked : false,
			group : 'theme',
			checkHandler : onItemCheck }, {
			text : 'Average' }, "-", {
			text : '<span class="menuCategoryItem">COMBINING</span>' }, "-", {
			text : 'Merging tool' } ] });
};

TestMainMenu.prototype.getOnlineDataAnalisysMenu = function() {
	var _this = this;
	function onItemCheck(item, checked) {
		if (item.text == "Structure Validation") {
			location.hash = "/tool/crysol/main";
		}
		if (item.text == "Job list") {
			location.hash = "/tool/list";
		}
	}

	return Ext.create('Ext.menu.Menu', {
		items : [
		{
			text : 'Structure Validation',
			checked : false,
			group : 'theme',
			handler : onItemCheck },
			"-",
			{
				text : 'Job list',
				checked : false,
				group : 'theme',
				handler : onItemCheck }
		] });
};

