function ProteinListMainView() {
	this.id = BUI.id();

	var _this = this;



}

ProteinListMainView.prototype.getToolbar = function (sessions) {
	var _this = this;
	var items = [];
	items.push(
		{
			xtype: 'textfield',
			name: 'proposalFilter',
			width: 300,
			emptyText: 'Filter by term (proposal or title) or comment',
			listeners: {
				specialkey: function (field, e) {
					if (e.getKey() == e.ENTER) {
						_this.termFilter = field.getValue();
						var filtered = _this.filterByTerm(_this.sessions, _this.termFilter);
						if (_this.beamlineFilter.length > 0) {
							filtered = _this.filterByBeamline(filtered, _this.beamlineFilter);
						}
						_this.store.loadData(filtered, false);
						_this.panel.setTitle(filtered.length + " sessions");
					}
				}
			}
		}
	);
	return Ext.create('Ext.toolbar.Toolbar', {
		items: items
	});
};

ProteinListMainView.prototype.getColumns = function () {
	return [
		{

			dataIndex: 'dataCollectionGroup',
			name: 'dataCollectionGroup',
			flex: 1.5,
			hidden: false,
			renderer: function (grid, e, record) {
				var html = "";
				
				dust.render("proteinlistmainview.template", record.data, function (err, out) {
					html = out;
				});
				return "<div  id=" + record.data.proteinId + ">" + html + "</div>";
			}
		}];
};


ProteinListMainView.prototype.getPanel = function () {


	this.store = Ext.create('Ext.data.Store', {
		fields: ["dataCollectionGroup"]
	});

	var _this = this;

	this.panel = Ext.create('Ext.grid.Panel', {
		border: 1,

		store: this.store,
		id: this.id,
		toolbar: this.getToolbar(),
		minHeight: 900,
		disableSelection: true,
		columns: this.getColumns(),
		viewConfig: {
			enableTextSelection: true,
			stripeRows: false
		}
	});
	return this.panel;
};

ProteinListMainView.prototype.parseData = function (proteins) {
	var _this = this;
	try {
		proteins.sort(function (a, b) {
			return a.acronym.toLowerCase().localeCompare(b.acronym.toLowerCase());
		});
	}
	catch (e) { }

	/**
	 * data looks like
	 * "[60085/ID30B/2017-09-26 01:00:00,60085/ID30B/2017-09-26 01:00:00,...]
	 */

	_.forEach(proteins, function (protein) {
		/** Sessions */
		var keys = {};
		if (protein.sessions == null) {
			protein.sessions = [];
		}
		if (protein.SessionValuesList) {
			var sessions = protein.SessionValuesList.split(",");
			for (var i = 0; i < sessions.length; i++) {
				var tuple = sessions[i].split("/");
				if (tuple) {
					if (tuple.length == 3) {

						if (keys[tuple[0]] == null) {
							protein.sessions.push({
								sessionId: tuple[0],
								beamline: tuple[1],
								date: tuple[2],
							});
							keys[tuple[0]] = true;
						}
					}
				}
			}
		}
		/** Space group */
		if (protein.SpaceGroupModelBuildingPhasingStep) {
			protein.solvedStructureSpaceGroups = _.map(protein.SpaceGroupModelBuildingPhasingStep.split(","), function (sg) { return { "name": sg, "dataCollectionIdList": protein.ModelBuildingPhasingStepDataCollectionIdList } });

		}
		if (protein.ImagesPhasingProgramAttachementIds) {
			protein.imagesPhasingProgramAttachementURL = _.map(protein.ImagesPhasingProgramAttachementIds.split(","), function (sg) { return { "url": EXI.getDataAdapter().mx.phasing.getPhasingFilesByPhasingProgramAttachmentIdAsImage(sg).replace('localhost:8080', 'ispyb.esrf.fr') } });
		}

	});

	return proteins;
};

ProteinListMainView.prototype.load = function (proteins) {
	var _this = this;
	this.proteins = proteins;
	this.panel.setTitle("My Proteins ( " + proteins.length + ")");
	// specify segment of data you want to load using params	
	this.store.loadData(this.parseData(proteins));
	this.attachCallBackAfterRender();

};

ProteinListMainView.prototype.displayCrystalTab = function (target, proteinId) {
	var _this = this;
	this.targetCrystalTab = target;
	this.crystalTabProteinId = proteinId;
	var onSuccess = function (sender, data) {		
		var html = "";
		dust.render("crystal.proteinlistmainview.template", data, function (err, out) {
			html = html + out;
		});

		$(target).html(html);

        if (EXI.credentialManager.getSiteName().startsWith("MAXIV")){
            $(".crystal-add").show();
        } else {
            $(".crystal-add").hide();
        }

		/** Add and Edit buttons for crystal form and new structure*/
		function clickEvents() {
		    /** Add */
            if (EXI.credentialManager.getSiteName().startsWith("MAXIV")){
                $(".crystal-add").bind('click').click(function (sender) {
                    //var crystalId = sender.target.getAttribute("id");
                    var addCrystalForm = new AddCrystalFormView();
                    var window = Ext.create('Ext.window.Window', {
                        title: 'Add Crystal Form',
                        height: 460,
                        width: 600,
                        modal: true,
                        closable: false,
                        layout: 'fit',
                        items: [addCrystalForm.getPanel()],
                        buttons: [{
                            text: 'Save',
                            handler: function () {
                                addCrystalForm.onSaved.attach(function(sender, data){
                                    /** Reload tables */
                                    _this.displayCrystalTab(_this.targetCrystalTab, _this.crystalTabProteinId);
                                    window.close();
                                });
                                addCrystalForm.save();
                            }
                        }, {
                            text: 'Cancel',
                            handler: function () {
                                window.close();
                            }
                        }]
                    }).show();
                    addCrystalForm.load(proteinId);
                });
            }

		    /** Edit */
			$(".crystal-edit").bind('click').click(function (sender) {
				var crystalId = sender.target.getAttribute("id");
				var editCrystalForm = new EditCrystalFormView();
				var window = Ext.create('Ext.window.Window', {
					title: 'Crystal Form',
					height: 460,
					width: 600,
					modal: true,
					closable: false,
					layout: 'fit',
					items: [editCrystalForm.getPanel()],
					buttons: [{
						text: 'Save',
						handler: function () {
							editCrystalForm.onSaved.attach(function(sender, data){
								/** Reload tables */							
								_this.displayCrystalTab(_this.targetCrystalTab, _this.crystalTabProteinId);
								window.close();
							});
							editCrystalForm.save();																											
						}
					}, {
						text: 'Cancel', 
						handler: function () {						
							window.close();
						}
					}]
				}).show();			
					
				editCrystalForm.load(_.find(EXI.proposalManager.getCrystals(), function (o) { return o.crystalId == parseFloat(crystalId); }));
			});

			/** new structure */
			$(".new-structure").bind('click').click(function (sender) {
				var crystalId = sender.target.getAttribute("id");
				var editCrystalStructure = new EditCrystalStructure();
				var window = Ext.create('Ext.window.Window', {
					title: 'Add new Structure',
					height: 460,
					width: 600,
					modal: true,
					closable: false,
					layout: 'fit',
					items: [editCrystalStructure.getPanel()],
					buttons: [{
						text: 'Save',
						handler: function () {
							editCrystalStructure.onSaved.attach(function(sender, data){
								/** Reload tables */							
								_this.displayCrystalTab(_this.targetCrystalTab, _this.crystalTabProteinId);
								window.close();
							});
							editCrystalStructure.save();																											
						}
					}, {
						text: 'Cancel', 
						handler: function () {						
							window.close();
						}
					}]
				}).show();
				var crystal = _.find(EXI.proposalManager.getCrystals(), function (o) { return o.crystalId == parseFloat(crystalId); })				
				editCrystalStructure.load(crystal);
			});

			$(".remove-structure").bind('click').click(function (sender) {
				var structureId = sender.target.getAttribute("id");
				var crystalId = sender.target.getAttribute("crystalId");
				var onRemovedSuccess = function(sender, data){
						_this.displayCrystalTab(_this.targetCrystalTab, _this.crystalTabProteinId);						
				}
				var onRemovedError = function(sender, data){
					alert("There was an error during the process");
				}
				EXI.getDataAdapter({onSuccess: onRemovedSuccess, onError: onRemovedError}).mx.crystal.removeStructure(crystalId, structureId);
			});
			

		}

		var timer3 = setTimeout(clickEvents, 500, this);

	}
	var onError = function (data) {

	}
	EXI.getDataAdapter({ onSuccess: onSuccess, onError: onError }).mx.crystal.getCrystalsByProteinId(proteinId);

};

ProteinListMainView.prototype.attachCallBackAfterRender = function () {
	var _this = this;
	var tabsEvents = function (grid) {
		this.grid = grid;
		$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
			var target = $(e.target).attr("href");
			if (target) {
				/** Activate tab of data collections */
				if (target.startsWith("#cr")) {
					var proteinId = target.slice(4);

					_this.displayCrystalTab(target, proteinId);

				}
			}
		});
		_this.panel.doLayout();

	};
	var timer3 = setTimeout(tabsEvents, 500, _this);

};













