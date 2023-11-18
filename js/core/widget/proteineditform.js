function ProteinEditForm (args) {
    this.id = BUI.id();
    this.height = 450;
	this.width = 740;
    this.padding = 10


	if (args != null) {
		if (args.height != null) {
			this.height = args.height;
		}
		if (args.width != null) {
			this.width = args.width;
		}
	}

    this.onSaved = new Event(this);
}

ProteinEditForm.prototype.load = function(protein) {
    this.protein = {};
    if (protein) {
        this.protein = protein;
    }
    this.protein.id = this.id;

	var html = "";
	dust.render("protein.edit.form.template", this.protein, function(err, out){
		html = out;
	});
	$('#' + this.id).hide().html(html).fadeIn('fast');
	this.panel.doLayout();
};

ProteinEditForm.prototype.getPanel = function() {

	this.panel = Ext.create("Ext.panel.Panel",{
		items :	[{
					// cls	: 'border-grid',
                    html : '<div id="' + this.id + '"></div>',
                    autoScroll : false,
					margin : 10,
					padding : this.padding,
					width : this.width
                }]
	});

	return this.panel;
};

ProteinEditForm.prototype.saveProtein = function() {
    var _this = this;
	var protein = this.getProtein();

    var proteinId = null;
    if (this.protein) {
        proteinId = this.protein.proteinId;
    }
    if (proteinId == null){
        proteinId = 0;
    }

    if (this.protein.name == null) {
        BUI.showError("Protein name is mandatory");
        return;
    }

    if (this.protein.acronym == null) {
        BUI.showError("Protein acronym is mandatory");
        return;
    }

    var json = {
		proteinId : proteinId,
		name : this.protein.name,
		acronym : this.protein.acronym

	};
	var onSuccess = function (sender,protein) {
            _this.onSaved.notify(protein);
    }
    //this.panel.setLoading();
    EXI.getDataAdapter({onSuccess : onSuccess}).mx.protein.saveProtein(json);

};

ProteinEditForm.prototype.getProtein = function () {
    var protein = {};
    protein = this.protein;
    if (!protein.proteinId){
        protein.proteinId = null;
    }
    if (!protein.acronym) {
        protein.acronym = null;
    }

    protein.name = $("#" + this.id + "-name").val();
    protein.acronym = $("#" + this.id + "-acronym").val();

    return protein;
}