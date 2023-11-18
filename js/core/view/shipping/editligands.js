function EditLigands(args) {
	this.id = BUI.id();

	this.width = 600;
	this.height = 500;
	this.showTitle = true;
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
	}

	this.onSaved = new Event(this);
};

EditLigands.prototype.getPanel = function () {

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

EditLigands.prototype.load = function (crystal) {
	var _this = this;

	this.crystal = crystal;
	
	this.crystal.url = EXI.getDataAdapter().mx.crystal.getSaveStructureURL(this.crystal.crystalId);
	dust.render("structure.crystal.edit.form.template", this.crystal, function (err, out) {
		html = out;
	}); 

	$('#' + this.id).hide().html(html).fadeIn('fast');
	this.panel.doLayout();
} 



EditLigands.prototype.save = function () {
	var _this = this;	
	$("#structure-form").submit(function (e) {		
		e.preventDefault();
		/** Setting the filename */
		$("#structure-fileName").val($("#structure-input-file").val().split('\\').pop());
		var formData = new FormData(this);		
		$.ajax({
			url: this.action,
			type: 'POST',
			data: formData,
			success: function (data) {
				_this.onSaved.notify();
			},
			cache: false,
			contentType: false,
			processData: false
		});
	});

	$("#structure-form").submit();

};


