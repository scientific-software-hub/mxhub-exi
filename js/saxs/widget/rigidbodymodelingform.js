/**
 * Example form
 * 
 * @witdh
 * @height
 */
function RigidBodyModelingForm(args) {
	this.id = BUI.id();
	this.width = 700;
	this.height = 500;

	if (args != null) {
		if (args.width != null) {
			this.width = args.width;
		}
		if (args.height != null) {
			this.height = args.height;
		}
	}

	var _this = this;
	this.rigidBodyGrid = new AprioriRigidBodyGrid();
	
	this.rigidBodyGrid.onUploadFile.attach(function(sender, type, title){
		_this.openUploadManager(EXI.getDataAdapter().saxs.macromolecule.getAddPDBURL(_this.macromolecule.macromoleculeId));	
	});
	
	this.rigidBodyGrid.onRemove.attach(function(sender, type, title){
		_this._update();
	});
	
	this.onSave = new Event(this);
	
}

RigidBodyModelingForm.prototype.openUploadManager = function(url) {
	var _this = this;
	var widget = new UploaderWidget(url);
	widget.onUploaded.attach(function(sender){
		_this.panel.setLoading();
		EXI.proposalManager.get(true);
		_this.load(EXI.proposalManager.getMacromoleculeById(_this.macromolecule.macromoleculeId));
		_this.panel.setLoading(false);
	});
	widget.show();
};

RigidBodyModelingForm.prototype._getItems = function() {
	var _this = this;
	

	return [ {
		xtype : 'label',
		forId : 'myFieldId',
		text : 'Information for model fit, mixture analysis and rigid body modeling',
		margin : '15 0 20 10',
		cls : "inline-help"
	},
	this.rigidBodyGrid.getPanel(), 
	{
		xtype : 'label',
		forId : 'myFieldId',
		text : 'Distance restraints may be imposed on the model using contacts conditions file (OPTIONAL)',
		margin : '25 0 5 10',
		cls : "inline-help"
	},
	{
		xtype : 'container',
		layout : 'hbox',
		items : [ {
			xtype : 'container',
			border : false,
			layout : 'hbox',
			items : [ {
				xtype : 'label',
				forId : 'myFieldId',
				text : 'Contact Description File: (Optional)',
				width : 150,
				margin : '10 0 0 10'
			}, {
				id : this.id + "contactsDescriptionFilePath",
				xtype : 'textfield',
				hideLabel : true,
				margin : '10 0 0 0',
				width : 400
//				disabled: true
			}, {
				text : 'Upload',
				xtype : 'button',
				margin : "10 0 0 10",
				width : 80,
				handler : function() {
					_this.openUploadManager(EXI.getDataAdapter().saxs.macromolecule.getContactDescriptionUploadFileURL(_this.macromolecule.macromoleculeId));
				}
			}, {
				text : 'Remove',
				id : _this.id + "_remove",
				xtype : 'button',
				margin : "10 0 0 10",
				width : 80,
				handler : function() {
					_this.panel.setLoading(true);
					var onSuccess = function onSuccess(){
						EXI.proposalManager.get(true);
						_this.load(EXI.proposalManager.getMacromoleculeById(_this.macromolecule.macromoleculeId));
						_this.panel.setLoading(false);
					};
					
					
					
					EXI.getDataAdapter({
						onSuccess : onSuccess,
					}).saxs.macromolecule.removeContactDescriptionFile(_this.macromolecule.macromoleculeId);
				}
			} ]
		} ]
	}, {
		xtype : 'panel',
		html : "<span class='inline-help' >Go to <a target='_blank' href='http://www.embl-hamburg.de/biosaxs/manuals/sasrefcvmx.html#input-format'>SASREF manual</a> for further information</span>",
		margin : "10 0 0 160",
		border : 0
		
	}
	];

};

/** Because update is a jsp page we don't know if the user has uploaded a file or not  then we need to refresh **/
RigidBodyModelingForm.prototype._update = function(macromoleculeId, type, title) {
	var _this = this;
	BIOSAXS.proposal.onInitialized.attach(function() {
		if (BIOSAXS.proposal != null) {
			_this.refresh(BIOSAXS.proposal.getMacromoleculeById(_this.macromolecule.macromoleculeId));
			_this.panel.setLoading(false);
		}
	});
	this.panel.setLoading();
	BIOSAXS.proposal.init();
};


RigidBodyModelingForm.prototype.getPanel = function() {
	var _this = this;
	this.panel = Ext.create('Ext.form.Panel', {
		width : this.width,
		height : this.height,
		cls : 'border-grid',
		defaultType : 'textfield',
		items : this._getItems(),
		padding : 20,
		listeners : {
			afterrender : function(){
				_this._populate();
			}
		}
	});
	return this.panel;
};

/** Populates could be call when the DOM is not filled yet **/ 
RigidBodyModelingForm.prototype._populate = function() {
	if (this.macromolecule != null){
		if (Ext.getCmp(this.id + "contactsDescriptionFilePath") != null){
			if (this.macromolecule.contactsDescriptionFilePath != null){
				Ext.getCmp(this.id + "contactsDescriptionFilePath").setValue(this.macromolecule.contactsDescriptionFilePath);
				Ext.getCmp(this.id + "_remove").enable();
			}
			else{
				Ext.getCmp(this.id + "_remove").disable();
				Ext.getCmp(this.id + "contactsDescriptionFilePath").setValue("");
				
			}
		}
	}
};

/** It populates the form * */
RigidBodyModelingForm.prototype.load = function(macromolecule) {
	this.macromolecule = macromolecule;
	this.rigidBodyGrid.load(macromolecule);
	this._populate();
};

RigidBodyModelingForm.prototype.input = function() {
	return {};
};


/** It populates the form **/
RigidBodyModelingForm.prototype.test = function(targetId) {
	var macromoleculeForm = new RigidBodyModelingForm();
	var panel = macromoleculeForm.getPanel();
	panel.render(targetId);
};

