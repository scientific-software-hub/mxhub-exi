function DateRangePicker(args) {
    this.id = BUI.id();

    this.targetId = null;
    this.templateData = {id : this.id};

    if (args) {
        if (args.mode) {
            this.mode = args.mode;
        }
    }

    this.onSelected = new Event(this);
}

DateRangePicker.prototype.show = function(){
    var _this = this;
    
    var html = "";
    dust.render("daterangepicker.template", this.templateData, function(err,out){
        html = out;
    });

    $("body").append(html);
    $("#" + this.id + "-select").unbind('click').click(function(sender){
        _this.select();
    });

    $('#' + this.id + '-datepicker1').datetimepicker({
		defaultDate : new Date(),
		format : "DD-MM-YYYY"
	});
    $('#' + this.id + '-datepicker2').datetimepicker({
		defaultDate : new Date(),
		format : "DD-MM-YYYY",
        useCurrent: false
    });
    // Linked datepickers
    $('#' + this.id + '-datepicker1').on("dp.change", function (e) {
        if ($('#' + _this.id + '-datepicker2').data("DateTimePicker").viewDate() < e.date) {
            $('#' + _this.id + '-datepicker2').data("DateTimePicker").date(e.date);
        }
        $('#' + _this.id + '-datepicker2').data("DateTimePicker").minDate(e.date);
    });

    $("#" + this.id + "-modal").on('hidden.bs.modal', function(){
        $(this).remove();
    });
    
    $("#" + this.id + "-modal").modal();
};

DateRangePicker.prototype.select = function(){
    var startDate = moment($("#" + this.id + "-date1").val(),"DD-MM-YYYY").format("DD-MM-YYYY");
    var endDate = moment($("#" + this.id + "-date2").val(),"DD-MM-YYYY").format("DD-MM-YYYY");
    if (startDate != "Invalid date" && endDate != "Invalid date") {
        this.onSelected.notify({
                                    startDate   : startDate,
                                    endDate     : endDate
                                });
        $("#" + this.id + "-modal").modal('hide');
    } else {
        $("#" + this.id + "-form").notify("Select the start and the end date", { className : "error",elementPosition: 'top left'});
    }
}