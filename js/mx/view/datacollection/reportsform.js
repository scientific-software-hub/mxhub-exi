function ReportsForm(args) {
    this.id = BUI.id();

    this.templateData = {id : this.id};
};

ReportsForm.prototype.show = function(){
    var _this = this;
    
    var html = "";
    dust.render("reports.form.template", this.templateData, function(err,out){
        html = out;
    });

    $("body").append(html);
    $("#" + this.id + "-general-report-doc").unbind('click').click(function(sender){
        var html = _this.generateGeneralReport();
        var fileName = _this.proposal.Proposal_proposalCode + _this.proposal.Proposal_proposalNumber + "_Session_" + _this.session.beamLineName + "_" + moment(new Date(_this.session.BLSession_startDate)).format("YYYYMMDD") + ".doc";
        _this.downloadHTML(html, fileName);
    });

    $("#" + this.id + "-modal").on('hidden.bs.modal', function(){
        $(this).remove();
    });
    
    $("#" + this.id + "-modal").modal();
};

ReportsForm.prototype.load = function (sessionId, proposal,dataCollectionGroup,energyScans,xfeScans) {
    var _this = this;
    this.proposal = proposal;
    this.dataCollectionGroup = dataCollectionGroup;
    this.energyScans = energyScans;
    this.xfeScans = xfeScans;
    if (proposal && sessionId) {
        var onSuccess = function (sender, session) {
            if (session && session.length > 0){
                _this.session = session[0];
                $(".report-btn").removeAttr('disabled');
            }
        }

        EXI.getDataAdapter({onSuccess:onSuccess}).proposal.session.getSessionByProposalSessionId(this.proposal.Proposal_proposalCode + this.proposal.Proposal_proposalNumber,sessionId);
    }

    if (this.energyScans){
        _.map(this.energyScans,function(e) {
            e.choochURL = EXI.getDataAdapter().mx.energyscan.getChoochJpegByEnergyScanId(e.energyScanId);
        });
    }
};

ReportsForm.prototype.generateGeneralReport = function () {
    var html = this.getHTMLHeader();
    var reportData = {
                        proposal : this.proposal, 
                        session : this.session, 
                        datacollections : JSON.parse(JSON.stringify(this.dataCollectionGroup)), 
                        energyScans : this.energyScans, 
                        xfeScans : this.xfeScans
    };
    if ($("#" + this.id + "-include-failed").is(':checked')){
        _.remove(reportData.datacollections, function (d) {return d.DataCollection_runStatus.toUpperCase().match("FAILED")});
    }
    dust.render("general.report.doc.template", reportData, function(err,out){
        html += out;
    });

    html += '</body></html>';

    return html;
};

ReportsForm.prototype.getHTMLHeader = function () {
    var header = "";
    dust.render("report.header.template",[],function(err,out){
        header = out;
    });
    return header;
};

ReportsForm.prototype.downloadHTML = function(html,fileName) {
    var byteNumbers = new Uint8Array(html.length);

    for (var i = 0; i < html.length; i++) {
        byteNumbers[i] = html.charCodeAt(i);
    }
    var blob = new Blob([byteNumbers], {type: 'text/html'});

    saveAs(blob,fileName);
};