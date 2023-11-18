function ExportPDFForm(args) {
    this.id = BUI.id();

    this.templateData = {id : this.id};
};

ExportPDFForm.prototype.show = function(){
    var _this = this;
    
    var html = "";
    dust.render("export.pdf.form.template", this.templateData, function(err,out){
        html = out;
    });

    $("body").append(html);
    $("#" + this.id + "-export").unbind('click').click(function(sender){
        _this.export();
    });

    $("#" + this.id + "-dewars").multiselect({
													enableFiltering: true,
													enableCaseInsensitiveFiltering: true,
													includeSelectAllOption: true
												});

    $("#" + this.id + "-modal").on('hidden.bs.modal', function(){
        $(this).remove();
    });
    
    $("#" + this.id + "-modal").modal();
};


ExportPDFForm.prototype.load = function (shipment) {
    this.templateData.shipment = shipment;
};

ExportPDFForm.prototype.export = function () {
    var sortViewer = $('input[name=optradio]:checked').val();
    var dewarIdList = $("#" + this.id + "-dewars").val();
    if (dewarIdList) {
        var url = EXI.getDataAdapter().proposal.dewar.exportPDF(dewarIdList.toString(),sortViewer);
        window.open(url,"_blank");
        $("#" + this.id + "-modal").modal('hide');
    } else {
        $("#" + this.id + "-notify").notify("Select at least one parcel","warn");
    }
};