/**
 * Macromolecule form with the general parameters of a macromolecule
 * 
 * @witdh
 * @height
 * 
 * #onSave button save has been clicked
 * #onClose button close has been clicked
 */
function MacromoleculeForm(args) {
	this.id = BUI.id();
	this.width = 700;
	this.height = 700;

	if (args != null) {
		if (args.width != null) {
			this.width = args.width;
		}
		if (args.height != null) {
			this.height = args.height;
		}
	}
	
	/** Events **/
	this.onSave = new Event(this);
	this.onClose = new Event(this);
}

/** Type : is the Ext type then requiredtext or textfield * */
MacromoleculeForm.prototype._getFieldTextWithHelp = function(type, fieldLabel, fieldName, help) {
	return Ext.create('Ext.container.Container', {
		items : [ {
			xtype : type,
			fieldLabel : fieldLabel,
			name : fieldName,
			id : this.id + fieldName
		}, {
			xtype : 'label',
			forId : 'myFieldId',
			text : help,
			margin : "5 0 0 105",
			cls : "inline-help"
		} ]
	});
};

MacromoleculeForm.prototype._getNumericWithHelp = function(type, fieldLabel, fieldName, help) {
	return Ext.create('Ext.container.Container', {
		margin : "0 0 0 10",
		items : [ {
			xtype : type,
			fieldLabel : fieldLabel,
			name : fieldName,
			id : this.id + fieldName,
			decimalPrecision : 6,
			width : 220
		}, {
			xtype : 'label',
			forId : 'myFieldId',
			text : help,
			margin : "5 0 0 10",
			cls : "inline-help"
		} ]
	});
};

MacromoleculeForm.prototype._getButtons = function() {
	var _this = this;
	return [ {
		text : 'Save',
		handler : function() {
			_this._save();
		}
	}
	];
};

/** It persits the macromolecule in the database **/
MacromoleculeForm.prototype._persist = function(macromoleculeId, acronym, name, molecularMass, extintionCoefficient, comments, refractiveIndex, solventViscosity) {
	var proposalId = Ext.getCmp("proposalIdCombo").getValue();
	if (proposalId == null){
			BUI.showError("Please select a proposal");
			return;
	}
	
	/** Checking not duplicated acronym **/
	if (macromoleculeId == null){
		if (EXI.proposalManager.getMacromoleculeByAcronym(acronym) != null){
			BUI.showError("Duplicated acronym");
			return;
		}
	}
	
	if (macromoleculeId == null){
		/** new macromolecule **/
		this.macromolecule = {};
		this.macromolecule.macromoleculeId = null;
	}
	else{
		this.macromolecule.macromoleculeId = macromoleculeId;
	}
	
	this.macromolecule["acronym"] = acronym;
	this.macromolecule["name"] = name;
	this.macromolecule["molecularMass"] = molecularMass;
	this.macromolecule["extintionCoefficient"] = extintionCoefficient;
	this.macromolecule["comments"] = comments;
	this.macromolecule["symmetry"] =  Ext.getCmp(this.id + 'comboSym').getValue();
	this.macromolecule["refractiveIndex"] =  refractiveIndex;
	this.macromolecule["solventViscosity"] =  solventViscosity;
	this.macromolecule["proposalId"] =  proposalId;
	
	var _this = this;
	
	var onSuccess = (function(sender, proposal) {
		var onSuccess2 = function(sender, proposals){
			_this.panel.setLoading(false);
			_this.onSave.notify();
			_this.onClose.notify();
		};
		_this.panel.setLoading("Updading proposal information");
		EXI.getDataAdapter({onSuccess : onSuccess2}).proposal.proposal.update();
		
//		var manager = new ProposalUpdater(); 
//		manager.onSuccess.attach(function(sender, proposals){
//			_this.load(ProposalManager.getBuffers());	
//			_this.panel.setLoading(false);
//			_this.onClose.notify();
//		});
//		_this.panel.setLoading();
//		manager.get(true);
		
	});
	
	this.panel.setLoading("Saving Macromolecule");
	EXI.getDataAdapter({onSuccess: onSuccess }).saxs.macromolecule.saveMacromolecule(this.macromolecule);
};

/** Save the macromolecule in the DB **/
MacromoleculeForm.prototype._save = function() {
	
	var _this = this;
	
	var acronym = this._getField("acronym");
	var name = this._getField("name");
	var molecularMass = this._getField("molecularMass");
	var extintionCoefficient = this._getField("extintionCoefficient");
	var comments = this._getField("comments");
	
	var refractiveIndex = this._getField("refractiveIndex");
	var solventViscosity = this._getField("solventViscosity");
	
	/** Checking required fields **/
	if (name == "") {
		BUI.showError("Name field is mandatory");
		return;
	}
	if (acronym == "") {
		BUI.showError("Acroynm field is mandatory");
		return;
	}

	if (this.macromolecule != null){
		/** Checking if it is a new macromolecule **/
		if (this.macromolecule.macromoleculeId == null){
			/** Check if the acronym exists already **/
			this._persist(null, acronym, name, molecularMass, extintionCoefficient, comments, refractiveIndex, solventViscosity);
		}
		else{
			/** It is an update **/
			this._persist(this.macromolecule.macromoleculeId, acronym, name, molecularMass, extintionCoefficient, comments, refractiveIndex, solventViscosity);
		}
	}
	else{
		/** It is a new macromolecule **/
		this._persist(null, acronym, name, molecularMass, extintionCoefficient, comments, refractiveIndex, solventViscosity);
	}
};



MacromoleculeForm.prototype._getItems = function() {
	var _this = this;
	/** Symmetry combo box **/
	var symmetry = Ext.create('Ext.data.Store', {
		fields : [ 's' ],
		data : this._getSymmetries()
	});

	this.symmetryComboBox = Ext.create('Ext.form.ComboBox', {
		fieldLabel : 'Symmetry',
		store : symmetry,
		id : this.id + 'comboSym',
		queryMode : 'local',
		displayField : 's',
		valueField : 's',
		value : "P1", 
		margin : "0 0 0 30",
		width : 220
	});
	return [ BIOSAXS_COMBOMANAGER.getComboProposal({labelWidth : 100}),
	         this._getFieldTextWithHelp("requiredtextfield", "Name", "name", "Long name. i.e: Bovine serum albumin"),
			 this._getFieldTextWithHelp("requiredtextfield", "Acronym", "acronym", "Acronym will be used in the files and analisys. i.e: BSA"),
			 this._getFieldTextWithHelp("textfield", "Mol. Mass (Da)", "molecularMass", "Atomic mass estimation measured in Da"),
			{
				xtype : 'container',
				layout : 'hbox',
				margin : "10 0 0 0",
				items :[
				        	this._getNumericWithHelp("numberfield", "Extinction coef.", "extintionCoefficient", ""),
							this.symmetryComboBox
				        ]
			},
			{
				xtype : 'container',
				layout : 'hbox',
				margin : "5 0 0 0",
				items :[
				        	this._getNumericWithHelp("numberfield", "Refractive Index", "refractiveIndex", "How radiation propagates through the medium"),
							this._getNumericWithHelp("numberfield", "Solvent Viscosity", "solventViscosity", "")
				]
					
		
			},
			
			
			{
				id : this.id + "comments",
				xtype : 'textareafield',
				name : 'comments',
				margin : '35 0 0 10',
				fieldLabel : 'Comments',
				width : this.width - 100,
				height : 100
			} ];
	
	return  Ext.create('Ext.form.Panel', {
		width : this.width,
		height : this.height,
		items : this._getItems()
	});
};

MacromoleculeForm.prototype._getSymmetries = function() {
	return  [ {
		"s" : "P1"
	}, {
		"s" : "P2"
	}, {
		"s" : "P3"
	}, {
		"s" : "P4"
	}, {
		"s" : "P5"
	}, {
		"s" : "P6"
	}, {
		"s" : "P32"
	}, {
		"s" : "P42"
	}, {
		"s" : "P52"
	}, {
		"s" : "P62"
	}, {
		"s" : "P222"
	} ];
};

MacromoleculeForm.prototype.getPanel = function() {
	this.panel =  Ext.create('Ext.panel.Panel', {
		layout : 'hbox',
		buttons : this._getButtons(),
		cls : 'border-grid',
		items : [
		         {
					xtype : 'container',
					margin : '20 0 0 20',
					layout : 'vbox',
					items : this._getItems()
		         }]
	});
	return this.panel;
};


/** Populates each text field by field name and value **/
MacromoleculeForm.prototype._populateField = function(fieldName, value) {
	if (value != null){
		Ext.getCmp(this.id + fieldName).setValue(value);
	}
};

/** Gets the value of a textfield **/
MacromoleculeForm.prototype._getField = function(fieldName) {
	return Ext.getCmp(this.id + fieldName).getValue();
};


/** It populates the form **/
MacromoleculeForm.prototype.load = function(macromolecule) {
	this.macromolecule = macromolecule;
	if (macromolecule != null){
		this._populateField("name", macromolecule.name);
		this._populateField("acronym", macromolecule.acronym);
		this._populateField("extintionCoefficient", macromolecule.extintionCoefficient);
		this._populateField("molecularMass", macromolecule.molecularMass);
		this._populateField("comments", macromolecule.comments);
		this._populateField("refractiveIndex", macromolecule.refractiveIndex);
		this._populateField("solventViscosity", macromolecule.solventViscosity);
		if (macromolecule.symmetry != null){
			Ext.getCmp(this.id + 'comboSym').setValue(macromolecule.symmetry);
		}
		if (this.macromolecule.proposalId != null){
			Ext.getCmp("proposalIdCombo").setValue(this.macromolecule.proposalId);
			Ext.getCmp("proposalIdCombo").disable();
		}
		
	}
};


MacromoleculeForm.prototype.input = function() {
	return {};
};


/** It populates the form **/
MacromoleculeForm.prototype.test = function(targetId) {
	var macromoleculeForm = new MacromoleculeForm();
	macromoleculeForm.onClose.attach(function(sender){
		alert("Click on close");
	});
	var panel = macromoleculeForm.getPanel();
	panel.render(targetId);
};


