function DatacollectionForm(args) {
    this.id = BUI.id();
	this.data = {id : this.id};
}

DatacollectionForm.prototype.show = function(){
    var _this = this;

    var html = "";
    dust.render("datacollection.form.template", this.data, function(err,out){
        html = out;
    });

    $("body").append(html);

	$('#' + this.id + '-start-datepicker').datetimepicker({
		defaultDate : new Date(),
		format : "DD-MM-YYYY"
	});

	$('#' + this.id + '-end-datepicker').datetimepicker({
        defaultDate : new Date(),
        format : "DD-MM-YYYY"
    });

    $("#" + this.id + "-plot").unbind('click').click(function(sender){
        _this.plot();
    });

    $("#" + this.id + "-download").unbind('click').click(function(sender){
        _this.download();
    });

    $("#" + this.id + "-modal").on('hidden.bs.modal', function(){
        $(this).remove();
    });

    $("#" + this.id + "-modal").modal();
};

DatacollectionForm.prototype.load = function(data) {
	this.data = data;
    if (!this.data) {
        this.data = {};
    }
    this.data.id = this.id;

	if (this.data.keys) {
		this.data.chunkedKeys = _.chunk(this.data.keys,Math.ceil(this.data.keys.length/3.0));
	}

	if (!this.data.types){
		this.data.types = [
								{display : "50", value : "50"},
								{display : "200", value : "200"},
								{display : "No limit", value : "100000"}
							]
	}

	if (!this.data.beamlines) {
		this.data.beamlines = EXI.credentialManager.getBeamlinesByTechnique("MX");
	}

    var html = "";
    dust.render("datacollection.form.template", this.data, function (err, out) {
        html = out;
    });

	$('#' + this.id).hide().html(html).fadeIn('fast');

	$('#' + this.id + '-start-datepicker').datetimepicker({
		defaultDate : new Date(),
		format : "DD-MM-YYYY"
	});

	$('#' + this.id + '-end-datepicker').datetimepicker({
        defaultDate : new Date(),
        format : "DD-MM-YYYY"
    });
}

DatacollectionForm.prototype.plot = function() {
	var startDate= moment($("#" + this.id + "-start-date").val(),"DD-MM-YYYY").format("YYYY-MM-DD");
	var endDate= moment($("#" + this.id + "-end-date").val(),"DD-MM-YYYY").format("YYYY-MM-DD");
	var checkedValues = [];
	$('.datacollection-checkbox:checked').each(function(i){
		checkedValues.push($(this).val());
	});
	var imageslimit = $("#" + this.id + "-type").val();
	var proposals = $("#" + this.id + "-proposals").val();
	if (proposals == ""){
	    proposals = "0";
	}
	var beamline = $("#" + this.id + "-beamline").val();

	if (startDate != "Invalid date" && endDate != "Invalid date" && endDate >= startDate && checkedValues.length > 0) {
		url = "";
		if (beamline != ""){
			url = EXI.getDataAdapter().mx.stats.getDatacollectionStatisticsByDateAndBeamline(imageslimit,startDate,endDate,proposals,beamline);
		} else {
			url = EXI.getDataAdapter().mx.stats.getDatacollectionStatisticsByDate(imageslimit,startDate,endDate,proposals);
		}
		var urlParams = "url=" + url + "&/&title=" + this.data.title + "&/&x=" + checkedValues.toString() + "&";
		if (beamline != ""){
		    urlParams = urlParams.replace("&beamlinenames=", "&/&beamlinenames=");
		}
		window.open("../viewer/bar/index.html?" + urlParams,"_blank");
	} else {
		$("#" + this.id + "-checkox-div").notify("Set the dates correctly and select the values to plot.", { className : "error",elementPosition: 'top left'});
	}
}

DatacollectionForm.prototype.download = function() {
	var startDate= moment($("#" + this.id + "-start-date").val(),"DD-MM-YYYY").format("YYYY-MM-DD");
	var endDate= moment($("#" + this.id + "-end-date").val(),"DD-MM-YYYY").format("YYYY-MM-DD");
	var checkedValues = [];
	$('.datacollection-checkbox:checked').each(function(i){
		checkedValues.push($(this).val());
	});
	var imageslimit = $("#" + this.id + "-type").val();
	var proposals = $("#" + this.id + "-proposals").val();
	if (proposals == ""){
	    proposals = "0";
	}
	var beamline = $("#" + this.id + "-beamline").val();

	if (startDate != "Invalid date" && endDate != "Invalid date" && endDate >= startDate && checkedValues.length > 0) {
		url = "";
		if (beamline != ""){
			url = EXI.getDataAdapter().mx.stats.getDatacollectionStatisticsByDateAndBeamline(imageslimit,startDate,endDate,proposals,beamline);
		} else {
			url = EXI.getDataAdapter().mx.stats.getDatacollectionStatisticsByDate(imageslimit,startDate,endDate,proposals);
		}
		var urlParams = "url=" + url + "&/&title=" + this.data.title + "&/&x=" + checkedValues.toString() + "&";
		if (beamline != ""){
		    urlParams = urlParams.replace("&beamlinenames=", "&/&beamlinenames=");
		}
		debugger;
		// Keep using the same iframe
            var iframe = Ext.get('downloadIframe');
            iframe && Ext.destroy(iframe);

            Ext.DomHelper.append(document.body, {
                tag: 'iframe',
                id:'downloadIframe',
                frameBorder: 0,
                width: 0,
                height: 0,
                css: 'display:none;visibility:hidden;height: 0px;',
                src: url
            });
		//window.open("../viewer/bar/index.html?" + urlParams,"_blank");
	} else {
		$("#" + this.id + "-checkox-div").notify("Set the dates correctly and select the values to downlaod.", { className : "error",elementPosition: 'top left'});
	}
}