function MacromoleculeMainView() {
	
	this.icon = '../images/icon/macromolecule.png';
	this.queueGridList = [];

	MainView.call(this);

	this.macromoleculeForm = new MacromoleculeForm({
		height : 800,
		collapsed : false,
		tbar : true
	});
	
	this.rigidBodyModelingForm = new RigidBodyModelingForm({
//		width : this.width - 30,
//		height : this.height - 50,
	});
	
	this.rigidBodyModelingForm.onSave.attach(function(sender, macromolecule) {
//		_this.onSave.notify(macromolecule);
	});
	
	
	var _this = this;
	
	this.onSelect = new Event(this);
	this.onDeselect = new Event(this);
}

MacromoleculeMainView.prototype.getPanel = MainView.prototype.getPanel;

MacromoleculeMainView.prototype.getHeader = function(beamlineName, startDate) {
	return "<span class='item'>" + beamlineName + "</span><span class='item_description'>" + startDate + "</span>";
};

MacromoleculeMainView.prototype.getSelected = function() {
	var selected = [];
	for (var i = 0; i < this.queueGridList.length; i++) {
		selected = this.queueGridList[i].getSelected().concat(selected);
	}
	return selected;
};

MacromoleculeMainView.prototype.getTabs = function() {
	return  Ext.createWidget('tabpanel',
			{
				plain : true,
//				margin : '5 0 0 0',
				items : [
					{
						tabConfig : {
							title : 'General'
						},
						items : [ {
							xtype : 'container',
							layout : 'fit',
							height : 600,
							padding : 0,
							items : [ 
							         
							         this.macromoleculeForm.getPanel()
							]
						}

						]
					},
					{
						tabConfig : {
							title : 'Advanced'
						},
						items : [ {
							xtype : 'container',
							layout : 'fit',
							height : 500,
							padding : 0,
							items : [ 
							         this.rigidBodyModelingForm.getPanel()
							]
						}

						]
					}
			]});
};


MacromoleculeMainView.prototype.getContainer = function() {
	return Ext.create('Ext.container.Container', {
	    layout: {
	        type: 'anchor'
	    },
	    defaults : {
			anchor : '100%',
			hideEmptyLabel : false },
	    margin : 30,
		bodyStyle : {
			"background-color" : "#E6E6E6" 
		},
	    items: [
	            this.getTabs()
	            ]
	});
};


MacromoleculeMainView.prototype.load = function(macromoleculeId) {
	this.panel.setLoading();
	var macromolecule = EXI.proposalManager.getMacromoleculeById(macromoleculeId);
	this.panel.setTitle(macromolecule.acronym);
	this.macromoleculeForm.load(macromolecule);
	this.rigidBodyModelingForm.load(macromolecule);
	this.panel.setLoading(false);
};
