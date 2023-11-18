/**
 * Edit the information of a buffer
 * 
 * #onRemoveAdditive
 */
function BufferForm(args) {
	this.id = BUI.id();
	this.height = 500;
	this.width = 500;
	if (args != null) {
		if (args.height != null) {
			this.height = args.height;
		}
		if (args.width != null) {
			this.width = args.width;
		}
	}

//	this.onSaved = new Event(this);
	this.onRemoveAdditive = new Event(this);
}

BufferForm.prototype.getBuffer = function() {
	if (this.buffer == null){
		this.buffer = {};
	}
	this.buffer["name"] = Ext.getCmp(this.id + "buffer_name").getValue();
	this.buffer["acronym"] = Ext.getCmp(this.id + "buffer_acronym").getValue();
	this.buffer["comments"] = Ext.getCmp(this.id + "buffer_comments").getValue();
	this.buffer["ph"] = Ext.getCmp(this.id + "buffer_ph").getValue();
	this.buffer["composition"] = Ext.getCmp(this.id + "buffer_composition").getValue();
	this.buffer["proposalId"] = Ext.getCmp(this.id + "proposalIdCombo").getValue();
	return this.buffer;
};

BufferForm.prototype.load = function(buffer) {
	this.buffer = buffer;
	
	if (buffer != null){
		Ext.getCmp(this.id + "buffer_name").setValue(this.buffer.name);
		Ext.getCmp(this.id + "buffer_acronym").setValue(this.buffer.acronym);
		Ext.getCmp(this.id + "buffer_comments").setValue(this.buffer.comments);
		Ext.getCmp(this.id + "buffer_ph").setValue(this.buffer.ph);
		Ext.getCmp(this.id + "buffer_composition").setValue(this.buffer.composition);
	}
	
		if (this.buffer != null){
			if (this.buffer.proposalId != null){
				          
				Ext.getCmp(this.id + "proposalIdCombo").setValue(this.buffer.proposalId);
				Ext.getCmp(this.id + "proposalIdCombo").disable();
			}
		}
};

BufferForm.prototype._getTopPanel = function() {
	return {
		xtype : 'container',
		layout : 'hbox',
		border : 0,
		margin : '40 0 0 0',
		frame : true,
		items : [ {
			xtype : 'container',
			layout : 'hbox',
			items : [ {
				xtype : 'container',
				flex : 1,
				border : false,
				layout : 'anchor',
//				defaultType : 'textfield',
				items : [ {
					xtype: 'requiredtextfield',
					id : this.id + 'buffer_name',
					fieldLabel : 'Name',
					name : 'name',
					width : 300
//					value : this.buffer.name 
					}, {
						xtype: 'requiredtextfield',
					id : this.id + 'buffer_acronym',
					fieldLabel : 'Acronym',
					maskRe:/[a-zA-Z0-9]+/,
					name : 'acronym',
					width : 300
//					value : this.buffer.acronym
				} ] } ] }, {
			xtype : 'container',
			flex : 1,
			layout : 'anchor',
			defaultType : 'textfield',
			margin : '0 0 0 10',
			items : [ {
				id : this.id + 'buffer_ph',
				fieldLabel : 'pH',
				name : 'ph',
//				value : this.buffer.ph,
				xtype : 'numberfield',
				width : 300,
				minValue : 0,
				maxValue : 15 }, 
				
//				{
//					//					xtype : 'requiredtext',
//					xtype : 'Ext.Extended.SearchField',
//					id : 'buffer_composition',
//					fieldLabel : 'Composition',
//					name : 'composition',
//					width : 300
//				}
				{
//					              xtype: 'searchfield',
					              fieldLabel: 'Composition',
					              id : this.id + 'buffer_composition',
					              name: 'composition',
					              width : 300
					          }
				
				
				] } ] };
};


BufferForm.prototype.getToolBar = function() {
	var _this = this;
	return [
	        {
	            text: 'Save',
	            width : 100,
	            handler : function(){
	            	_this.panel.setLoading();
	            	var onSuccess = (function(sender){
	            		_this.panel.setLoading(false);
	            		EXI.getDataAdapter().proposal.proposal.update();
	            	});
	            	EXI.getDataAdapter({ onSuccess : onSuccess}).saxs.buffer.saveBuffer(_this.getBuffer());
	            }
	        }
	];
};

BufferForm.prototype.getPanel = function() {
	var _this =this;
	this.panel = Ext.create('Ext.panel.Panel', {
		layout : 'vbox',
		buttons : this.getToolBar(),
		cls : 'border-grid',
		items : [ 
		         {
						xtype : 'container',
						margin : '10 0 0 20',
						layout : 'vbox',
						items : [ 
										BIOSAXS_COMBOMANAGER.getComboProposal({id : _this.id + "proposalIdCombo" ,labelWidth : 100}), 
										this._getTopPanel(), 
		          						{
											id : this.id + 'buffer_comments',
											xtype : 'textareafield',
											name : 'comments',
											fieldLabel : 'Comments',
											width : 600 ,
											height : 80
										}
						]
		         }
		
		         ] 
		}
	);
	return this.panel;
};

