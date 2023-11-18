function EditCrystalStructure(args) {
	this.id = BUI.id();

	this.width = 600;
	this.height = 500;
	this.showTitle = true;

	this.types =  ["PDB", "FASTA"];
	this.label = "Group Name";
	if (args != null) {
		if (args.showTitle != null) {
			this.showTitle = args.showTitle;
		}
		if (args.width != null) {
			this.width = args.width;
		}
		if (args.height != null) {
			this.height = args.height;
		}
		if (args.types != null) {
			this.types = args.types;
		}
		if (args.label != null) {
			this.label = args.label;
		}
	}

	this.onSaved = new Event(this);
};

EditCrystalStructure.prototype.getPanel = function () {

	this.panel = Ext.create("Ext.panel.Panel", {
		items: [{
			html: '<div id="' + this.id + '"></div>',
			autoScroll: false,
			padding: this.padding,
			width: this.width,
		}]
	});

	return this.panel;
};

/**
 * Crystal might be null and then it is store as proposal
 */
EditCrystalStructure.prototype.load = function (crystal) {

	if (crystal){
		this.crystal = crystal;	
		
		this.crystal.url = EXI.getDataAdapter().mx.crystal.getSaveStructureURL(this.crystal.crystalId);
	}
	else{
		this.crystal = {};
		this.crystal.url = EXI.getDataAdapter().proposal.proposal.saveStructure();
	}
	this.crystal.label = this.label;
	this.crystal.types = this.types;
	dust.render("structure.crystal.edit.form.template", this.crystal, function (err, out) {
		html = out;
	}); 

	$('#' + this.id).hide().html(html).fadeIn('fast');
	this.panel.doLayout();
} 



EditCrystalStructure.prototype.save = function () {
	var _this = this;	
	$("#structure-form").submit(function (e) {		
		e.preventDefault();
		/** Setting the filename */
		$("#structure-fileName").val($("#structure-input-file").val().split('\\').pop());
		var formData = new FormData(this);	
		_this.panel.setLoading();
		
		$.ajax({
			url: this.action,
			type: 'POST',
			data: formData,
			success: function (data) {
				_this.onSaved.notify(data);
				_this.panel.setLoading(false);
			},
			error : function(error){
				alert("There was an error in the server");
			},
			cache: false,
			contentType: false,
			processData: false
		});
	});

	$("#structure-form").submit();

};


