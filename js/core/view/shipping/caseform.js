/**
 * @showTitle
 *
 * #onSaved
 * #onAddPlates
 * #onRemovePlates
 **/
function CaseForm(args) {
	this.id = BUI.id();
	this.width = 600;
	this.showTitle = true;
	if (args != null) {
		if (args.showTitle != null) {
			this.showTitle = args.showTitle;
		}
	}

	this.transportCostLabel = "Transport Value";
    if (EXI.credentialManager.getSiteName().startsWith("MAXIV")){
        this.transportCostLabel = "Transport Value (SEK)";
    }

	this.onSaved = new Event(this);
}

CaseForm.prototype.fillStores = function() {
	var _this = this;
	this.panel.setLoading("Loading Labcontacts from database");

	var proposal = BUI.getProposal();
	proposal.onDataRetrieved.attach(function(sender, data) {
		_this.labContactForSendingStore.loadData(data, false);
		_this.labContactForReturnStore.loadData(data, false);
		_this.panel.setLoading(false);
	});
	proposal.getLabContactsByProposalId();

};

CaseForm.prototype.refresh = function(dewar) {
	this.setDewar(dewar);
};

CaseForm.prototype.getDewar = function() {
	this.dewar.code = Ext.getCmp(this.id + "dewar_code").getValue();
	this.dewar.comments = Ext.getCmp(this.id + "dewar_comments").getValue();
	this.dewar.transportValue = Ext.getCmp(this.id + "dewar_transportValue").getValue();
	this.dewar.storageLocation = this.storageLocationComboBox.getValue();
	//this.dewar.firstExperimentId = this.sessionsCombo.getValue();

	return this.dewar;
};

CaseForm.prototype.setDewar = function(dewar) {
	this.dewar = dewar;
	
	if (this.dewar == null){
		this.dewar={};
		this.dewar["code"] = "";
		this.dewar["transportValue"] = "";
		this.dewar["storageLocation"] = "";
		this.dewar["comments"] = "";
	}
	
	Ext.getCmp(this.id + "dewar_code").setValue(this.dewar.code);
	Ext.getCmp(this.id + "dewar_comments").setValue(this.dewar.comments);
	Ext.getCmp(this.id + "dewar_transportValue").setValue(this.dewar.transportValue);
	this.storageLocationComboBox.setValue(this.dewar.storageLocation);
	
};

CaseForm.prototype.getStorageLocationCombo = function() {
	this.storageLocationComboBox =  BIOSAXS_COMBOMANAGER.getComboStorageTemperature();
	return this.storageLocationComboBox;
};

CaseForm.prototype.getPanel = function(dewar, hideReimb) {

		this.panel = Ext.create('Ext.form.Panel', {
			width : this.width - 10,
//			cls : 'border-grid',
//			margin : 10,
			padding : 10,
			height : 320,
			items : [ {
				xtype: 'container',
				margin: "2 2 2 2",
				collapsible: false,
				defaultType: 'textfield',
				layout: 'anchor',
				items: [
					{
						xtype: 'requiredtextfield',
						fieldLabel: 'Name',
						name: 'code',
						id: this.id + 'dewar_code',
						labelWidth: 200,
						width: 500,
						allowBlank: false,
					},
					this.getStorageLocationCombo(),
					{
						xtype : 'numberfield',
						width : 500,
						labelWidth : 200,
						margin : '10 0 0 0',
						fieldLabel :  this.transportCostLabel,
						id : this.id + 'dewar_transportValue'
					},
					{
						xtype : 'textareafield',
						name : 'comments',
						fieldLabel : 'Comments',
						labelWidth : 200,
						width : 500,
						margin : '10 0 0 0',
						height : 100,
						id : this.id + 'dewar_comments'
					},
			]}]			
		});

if (EXI.credentialManager.getSiteName().startsWith("MAXIV")){
    Ext.getCmp(this.id + 'dewar_transportValue').hide();
}
	this.refresh(dewar);
	return this.panel;
};