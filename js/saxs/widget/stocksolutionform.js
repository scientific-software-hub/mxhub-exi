
/**
 * #onSaved
 */
function StockSolutionForm(args) {
	this.id = BUI.id();
	this.actions = [];

	this.height = 500;
	if (args != null) {
		if (args.actions != null) {
			this.actions = args.actions;
		}
		if (args.height != null) {
			this.height = args.height;
		}
	}
	this.onSaved = new Event(this);
}


StockSolutionForm.prototype._getButtons = function() {
	var _this = this;
	return [ {
		text : 'Save',
		handler : function() {
			var onSuccess = function(sender, stockSolution){
					_this.panel.setLoading(false);
					_this.onSaved.notify();
			};
			if (_this.getStockSolution().bufferId == null){
				BUI.showError("Buffer field is mandatory");
				return;
			}
			
			if (_this.getStockSolution().name == ""){
				BUI.showError("Acronym field is mandatory");
				return;
			}
			
			if (_this.getStockSolution().concentration == ""){
				BUI.showError("Concentration field is mandatory");
				return;
			}
			
			if (_this.getStockSolution().volume == ""){
				BUI.showError("Volume field is mandatory");
				return;
			}
			
			_this.panel.setLoading("ISPyB: saving stock solution");
			EXI.getDataAdapter({onSuccess : onSuccess}).saxs.stockSolution.saveStockSolution(_this.getStockSolution());
			
			
		}
	}
	];
};

StockSolutionForm.prototype.getStockSolution = function() {
	if (this.stockSolution != null) {
		this.stockSolution.concentration = Ext.getCmp(this.id + "stockSolution_concentration").getValue();
//		this.stockSolution.storageTemperature = Ext.getCmp(this.id + "stockSolution_storageTemperature").getValue();
		this.stockSolution.storageTemperature =  this.storageLocationComboBox.getValue();
		
		
		this.stockSolution.volume = Ext.getCmp(this.id + "stockSolution_volume").getValue();
		this.stockSolution.comments = Ext.getCmp(this.id + "stockSolution_comments").getValue();
		this.stockSolution.name = Ext.getCmp(this.id + "stockSolution_name").getValue();
		this.stockSolution.proposalId = Ext.getCmp("proposalIdCombo").getValue();
		this.stockSolution.bufferId = this.bufferCombo.getValue();

		if (this.macromoleculeCombo.getValue() != null) {
			this.stockSolution.macromoleculeId = this.macromoleculeCombo.getValue();
		} else {
			this.stockSolution.macromolecule3VO = null;
		}
		

	} else {
		return {
			concentration : Ext.getCmp(this.id + "stockSolution_concentration").getValue(),
//			storageTemperature : Ext.getCmp(this.id + "stockSolution_storageTemperature").getValue(),
			storageTemperature : this.storageLocationComboBox.getValue(),
			volume : Ext.getCmp(this.id + "stockSolution_volume").getValue(),
			comments : Ext.getCmp(this.id + "stockSolution_comments").getValue(),
			name : Ext.getCmp(this.id + "stockSolution_name").getValue(),
			bufferId : this.bufferCombo.getValue(),
			macromoleculeId : this.macromoleculeCombo.getValue(),
			proposalId :  Ext.getCmp("proposalIdCombo").getValue()
		};
	}
	return this.stockSolution;
};

StockSolutionForm.prototype.load = function(stockSolution) {
	this.stockSolution = stockSolution;
	if (stockSolution != null) {
		if (stockSolution.macromoleculeId != null) {
			this.macromoleculeCombo.setValue(stockSolution.macromoleculeId);
		}
		this.bufferCombo.setValue(stockSolution.bufferId);
		Ext.getCmp(this.id + "stockSolution_concentration").setValue(this.stockSolution.concentration);
//		Ext.getCmp(this.id + "stockSolution_storageTemperature").setValue(this.stockSolution.storageTemperature);
		this.storageLocationComboBox.setValue(this.stockSolution.storageTemperature);
		Ext.getCmp(this.id + "stockSolution_volume").setValue(this.stockSolution.volume);
		Ext.getCmp(this.id + "stockSolution_name").setValue(this.stockSolution.name);
		Ext.getCmp(this.id + "stockSolution_comments").setValue(this.stockSolution.comments);
		
		if (stockSolution != null){
			if (stockSolution.proposalId != null){
				Ext.getCmp("proposalIdCombo").setValue(stockSolution.proposalId);
				Ext.getCmp("proposalIdCombo").disable();
			}
		}
		
	}
};

StockSolutionForm.prototype.getBufferCombo = function() {
	this.bufferCombo = BIOSAXS_COMBOMANAGER.getComboBuffers(EXI.proposalManager.getBuffers(), {
		labelWidth : 150,
		margin : '0 0 10 0',
		width : 400

	});
	return this.bufferCombo;
};

StockSolutionForm.prototype.getMacromoleculeCombo = function() {
	this.macromoleculeCombo = BIOSAXS_COMBOMANAGER.getComboMacromoleculeByMacromolecules(EXI.proposalManager.getMacromolecules(), {
		labelWidth : 150,
		margin : '0 0 10 0',
		width : 400

	});
	return this.macromoleculeCombo;
};

StockSolutionForm.prototype.refresh = function() {
};

StockSolutionForm.prototype._getTopPanel = function() {
	
	this.storageLocationComboBox =  BIOSAXS_COMBOMANAGER.getComboStorageTemperature({labelWidth : 150, width : 400});
	return {
		xtype : 'container',
		layout : 'hbox',
		border : 0,
		buttons : this._getButtons(),
		items : [ {
			xtype : 'container',
			layout : 'hbox',
			items : [ {
				xtype : 'container',
				flex : 1,
				border : false,
				layout : 'anchor',
				defaultType : 'textfield',
				items : [
				BIOSAXS_COMBOMANAGER.getComboProposal({labelWidth : 150, width : 400}),
				this.getMacromoleculeCombo(), 
				this.getBufferCombo(),
				{
					xtype: 'requiredtextfield',
					id : this.id + 'stockSolution_name',
					fieldLabel : 'Acronym',
					labelWidth : 150,
					width : 400
				}, {
					xtype: 'requiredtextfield',
					id : this.id + 'stockSolution_concentration',
					fieldLabel : 'Conc. (mg/ml)',
					labelWidth : 150,
					width : 400
				},
				this.storageLocationComboBox,
//				{
//					id : this.id + 'stockSolution_storageTemperature',
//					fieldLabel : 'Storage Temp.(C)',
//					labelWidth : 150,
//					width : 250
//				}, 
				{
					xtype: 'requiredtextfield',
					id : this.id + 'stockSolution_volume',
					fieldLabel : 'Volume (&#181l)',
					labelWidth : 150,
					width : 400
				} ]
			} ]
		} ]
	};

};


StockSolutionForm.prototype.getPanel = function() {
	this.panel =  Ext.create('Ext.panel.Panel', {
		padding : 0,
		buttons : this._getButtons(),
		cls : 'border-grid',
		items : [
		         {
		        	 	 xtype : 'container',
		        	 	 padding : 20,
				         items : [
							         this._getTopPanel(), 
							         {
							        	 id : this.id + 'stockSolution_comments',
							        	 xtype : 'textareafield',
							        	 name : 'comments',
							        	 fieldLabel : 'Comments',
							        	 labelWidth : 150,
							        	 width : '100%',
							        	 height : 100
							         }]
		         }]
	});
	return this.panel;
};

StockSolutionForm.prototype.input = function() {
	return {
		stock : {
			"stockSolutionId" : 6,
			"proposalId" : 3124,
			"macromoleculeId" : 5933,
			"bufferId" : 811,
			"instructionSet3VO" : null,
			"boxId" : 305861,
			"storageTemperature" : "20",
			"volume" : "300",
			"concentration" : "1.2",
			"comments" : "Buffer EDTA with A",
			"name" : "A_EDTA_1.2",
			"samples" : [],
			"buffer" : "EDTA",
			"macromolecule" : "A"
		},
		proposal : new MeasurementGrid().input().proposal
	};
};

StockSolutionForm.prototype.test = function(targetId) {
	var stockSolutionForm = new StockSolutionForm();
	BIOSAXS.proposal = new Proposal(stockSolutionForm.input().proposal);
	var panel = stockSolutionForm.getPanel(new Shipment(stockSolutionForm.input().stock));
	panel.render(targetId);
};
