class PuckFormView {
    constructor(args) {
        this.id = BUI.id();

        this.specialCharacterInfoPanelId = this.id + '_specialCharacterInfoPanelId';
        this.uniquenessInfoPanelId = this.id + '_uniquenessInfoPanelId';

        this.height = 500;
        this.width = 500;
        this.unsavedChanges = false;
        this.proposalSamples = [];

        if (args != null) {
            if (args.height != null) this.height = args.height;
            if (args.width != null) this.width = args.width;
        }

        this.containerSpreadSheet = new ContainerSpreadSheet({ width: Ext.getBody().getWidth() - 100, height: 600 });
        this.containerSpreadSheet.onModified.attach(() => {
            this.unsavedChanges = true;
        });

        this.capacityCombo = new ContainerTypeComboBox({ label: 'Type:', labelWidth: 100, width: 250, initDisabled: true });
        this.capacityCombo.onSelected.attach((sender, data) => {
            this.unsavedChanges = true;
            this.containerTypeChanged(data.capacity);
        });

        this.onRemoved = new Event(this);
        this.onSaved = new Event(this);
    }

    load(containerId, shippingId, shippingStatus) {
        this.shippingId = shippingId;
        this.shippingStatus = shippingStatus;
        this.containerId = containerId;
        this.panel.setTitle('Shipment');
        this.panel.tab.on('click', () => this.returnToShipment());

        const onSuccess = (sender, puck) => {
            this.puck = puck;
            if (puck != null) {
                Ext.getCmp(this.id + 'puck_name').setValue(this.puck.code);
                if (this.puck.capacity) {
                    this.capacityCombo.setValue(this.puck.capacity);
                } else {
                    $.notify('ERROR: The capacity of the container is not defined.', 'error');
                }
                Ext.getCmp(this.id + 'puck_beamline').setValue(this.puck.beamlineName);
                Ext.getCmp(this.id + 'puck_sampleChangerLocation').setValue(this.puck.sampleChangerLocation);
                Ext.getCmp(this.id + 'puck_status').setValue(this.puck.containerStatus);
            }
            this.fillSamplesGrid(puck);
        };
        EXI.getDataAdapter({ onSuccess }).proposal.shipping.getContainerById(this.containerId, this.containerId, this.containerId);

        this.getSamplesFromProposal();
    }

    fillSamplesGrid(puck) {
        this.containerSpreadSheet.setLoading(true);
        const onSuccess = (sender, samples) => {
            if (samples) {
                this.containerSpreadSheet.setRenderCrystalFormColumn(samples.length > 0);
                this.containerSpreadSheet.setContainerType(puck.containerType);
                this.containerSpreadSheet.load(puck);
                if (this.shippingStatus != 'processing') {
                    const withoutCollection = _.filter(samples, { DataCollectionGroup_dataCollectionGroupId: null });
                    if (withoutCollection.length == samples.length) {
                        Ext.getCmp(this.id + '_save_button').enable();
                        Ext.getCmp(this.id + '_remove_button').enable();
                        this.capacityCombo.enable();
                    }
                } else {
                    this.containerSpreadSheet.disableAll();
                }
                this.containerSpreadSheet.setLoading(false);
                if (this.containerSpreadSheet.renderCrystalFormColumn) {
                    this.setValuesForEditCrystalColumn();
                }
            }
        };
        EXI.getDataAdapter({ onSuccess }).mx.sample.getSamplesByContainerId(puck.containerId);
    }

    getSamplesFromProposal() {
        const onGetShipmentsSuccess = (sender, data) => {
            const promises = data.map((shipmentId) => new Promise((resolve, reject) => {
                EXI.getDataAdapter({
                    onSuccess: (sender, data) => resolve(data),
                    onError: (error) => reject(error)
                }).mx.sample.getSamplesByShipmentId(shipmentId);
            }));

            Promise.all(promises)
                .then((data) => {
                    this.proposalSamples = data.flat();
                    $.notify(`Retrieved ${this.proposalSamples.length} samples for the selected session`, 'info');
                    this.containerSpreadSheet.proposalSamples = this.proposalSamples;
                })
                .catch(() => {
                    console.error('Error was produced when getSamplesFromProposal()');
                });
        };

        EXI.getDataAdapter({
            onSuccess: onGetShipmentsSuccess,
            onError: () => console.log('Error was produced when getSamplesFromProposal()')
        }).proposal.shipping.getAllShipmentIdsForSessionByShippingId(this.shippingId);
    }

    getPanel() {
        let html = '';
        dust.render('puckformview.template', {
            specialCharacterInfoPanelId: this.specialCharacterInfoPanelId,
            uniquenessInfoPanelId: this.uniquenessInfoPanelId
        }, (err, out) => {
            html = out;
        });

        this.panel = Ext.create('Ext.panel.Panel', {
            autoScroll: true,
            buttons: this.getToolBar(),
            items: [
                {
                    xtype: 'container',
                    margin: '5 0 2 5',
                    layout: 'hbox',
                    items: [
                        {
                            xtype: 'requiredtextfield',
                            id: this.id + 'puck_name',
                            fieldLabel: 'Name',
                            name: 'name',
                            width: 250,
                            margin: '5 5 5 5',
                            labelWidth: 50,
                        },
                        this.capacityCombo.getPanel(),
                        {
                            xtype: 'textfield',
                            id: this.id + 'puck_beamline',
                            fieldLabel: 'Beamline',
                            width: 250,
                            disabled: true,
                            margin: '5 5 5 10',
                            labelWidth: 75
                        },
                        {
                            xtype: 'textfield',
                            id: this.id + 'puck_sampleChangerLocation',
                            fieldLabel: '#Sample Changer',
                            width: 300,
                            disabled: true,
                            margin: '5 5 5 5',
                            labelWidth: 150
                        },
                        {
                            xtype: 'textfield',
                            id: this.id + 'puck_status',
                            fieldLabel: 'Status',
                            width: 250,
                            disabled: true,
                            margin: '5 5 5 5',
                            labelWidth: 50
                        },
                        {
                            xtype: 'toolbar',
                            id: 'add_protein_puck_item',
                            ui: 'footer',
                            dock: 'bottom',
                            items: ['->', {
                                text: 'Add Protein',
                                iconCls: 'icon-clear-group',
                                scope: this,
                                handler: function () {
                                    this.addProtein();
                                }
                            }],
                            disabled: true
                        }
                    ],
                },
                { html },
                this.containerSpreadSheet.getPanel()
            ]
        });

        this.panel.on('boxready', () => {
            if (EXI.credentialManager.isUserAllowedAddProtein()) {
                Ext.getCmp('add_protein_puck_item').enable();
            } else {
                Ext.getCmp('add_protein_puck_item').disable();
            }
        });

        return this.panel;
    }

    getToolBar() {
        return [
            {
                text: 'Remove',
                id: this.id + '_remove_button',
                width: 100,
                height: 30,
                disabled: true,
                cls: 'btn-red',
                handler: () => {
                    Ext.MessageBox.show({
                        title: 'Remove',
                        msg: 'Removing a puck from this parcel will remove also its content. <br />Are you sure you want to continue?',
                        buttons: Ext.MessageBox.YESNO,
                        fn: (result) => { if (result == 'yes') this.removePuck(); },
                        animateTarget: 'mb4',
                        icon: Ext.MessageBox.QUESTION
                    });
                }
            },
            '->',
            {
                text: 'Save',
                id: this.id + '_save_button',
                width: 100,
                height: 30,
                disabled: true,
                handler: () => this.save(true)
            },
            {
                text: 'Return to shipment',
                width: 200,
                height: 30,
                handler: () => this.returnToShipment()
            }
        ];
    }

    removePuck() {
        this.panel.setLoading();
        const onSuccess = (sender, data) => {
            this.panel.setLoading(false);
            location.href = '#/shipping/' + this.shippingId + '/main';
        };
        EXI.getDataAdapter({ onSuccess }).proposal.shipping.removeContainerById(this.containerId, this.containerId, this.containerId);
    }

    returnToShipment() {
        if (this.puck) {
            if (this.puck.code != Ext.getCmp(this.id + 'puck_name').getValue()) {
                this.unsavedChanges = true;
            }
        }
        if (this.unsavedChanges) {
            this.showReturnWarning();
        } else {
            location.href = '#/shipping/' + this.shippingId + '/main';
        }
    }

    addProtein() {
        const proteinEditForm = new ProteinEditForm({ width: 600, height: 700 });

        proteinEditForm.onSaved.attach((sender, protein) => {
            this.containerSpreadSheet.reloadAcronyms();
            win.close();
        });

        const win = Ext.create('Ext.window.Window', {
            title: 'Protein',
            height: 500,
            width: 700,
            padding: '10 10 10 10',
            modal: true,
            layout: 'fit',
            items: [proteinEditForm.getPanel()],
            buttons: [{
                text: 'Save',
                handler: () => proteinEditForm.saveProtein()
            }, {
                text: 'Cancel',
                handler: () => win.close()
            }]
        }).show();

        proteinEditForm.load();
    }

    displaySpecialCharacterWarning(message) {
        $('#' + this.specialCharacterInfoPanelId).notify(message, { position: 'right' });
        $('#' + this.specialCharacterInfoPanelId).fadeIn().fadeOut().fadeIn().fadeOut().fadeIn().fadeOut().fadeIn();
    }

    displayUniquenessWarning(message) {
        $('#' + this.uniquenessInfoPanelId).notify(message, { position: 'right' });
        $('#' + this.uniquenessInfoPanelId).fadeIn().fadeOut().fadeIn().fadeOut().fadeIn().fadeOut().fadeIn();
    }

    checkSampleNames(sampleNames, proteinIds) {
        return new PuckValidator().checkSampleNames(sampleNames, proteinIds, this.proposalSamples);
    }

    save(returnToShipment) {
        const puck = this.containerSpreadSheet.getPuck();

        if (puck.sampleVOs && puck.sampleVOs.length > 0) {
            const sampleNames = _.map(puck.sampleVOs, 'name');
            for (const name of sampleNames) {
                if (name == undefined || name == '') {
                    this.displaySpecialCharacterWarning('There are samples without a Sample Name');
                    return;
                }
            }
        }

        if (puck.sampleVOs && puck.sampleVOs.length > 0) {
            const idSet = new Set(puck.sampleVOs.map((item) => item.blSampleId));
            this.proposalSamples.reduceRight((_, item, i, arr) => {
                if (idSet.has(item.BLSample_blSampleId)) arr.splice(i, 1);
            }, null);
            const sampleNames = _.map(puck.sampleVOs, 'name');
            const proteinIds = _.map(puck.sampleVOs, 'crystalVO.proteinVO.proteinId');
            const conflicts = this.checkSampleNames(sampleNames, proteinIds);
            if (conflicts.length > 0) {
                this.displayUniquenessWarning('Sample names are not unique for the session. Please change: ' + conflicts);
                return;
            }
        }

        puck.code = Ext.getCmp(this.id + 'puck_name').getValue();
        puck.capacity = this.capacityCombo.getSelectedCapacity();
        puck.containerType = this.capacityCombo.getSelectedType();

        const format = /[ ~`!@#$%^&*()+\=\[\]{};':"\\|,.<>\/?]/;
        const specialCharacter = [];
        const specialCharacterRow = [];
        for (let i = 0; i < puck.sampleVOs.length; i++) {
            if (format.test(puck.sampleVOs[i].name)) {
                specialCharacter.push(puck.sampleVOs[i].name);
                specialCharacterRow.push(i + 1);
            }
        }

        if (specialCharacter.length === 0) {
            this.panel.setLoading('Saving Puck');
            EXI.getDataAdapter({
                onSuccess: (sender, puck) => {
                    this.unsavedChanges = false;
                    this.panel.setLoading(false);
                    if (returnToShipment) {
                        location.href = '#/shipping/' + this.shippingId + '/main';
                    } else {
                        this.load(this.containerId, this.shippingId);
                    }
                },
                onError: (sender, error) => {
                    this.panel.setLoading(false);
                    EXI.setError(error.responseText);
                }
            }).proposal.shipping.saveContainer(this.containerId, this.containerId, this.containerId, puck);
        } else {
            this.displaySpecialCharacterWarning(specialCharacter + ' contains special characters. Rows:  #' + specialCharacterRow);
        }
    }

    containerTypeChanged(capacity) {
        const newType = this.capacityCombo.getTypeByCapacity(capacity);
        this.puck.capacity = capacity;
        this.containerSpreadSheet.setContainerType(newType);
        this.containerSpreadSheet.updateNumberOfRows(capacity);
    }

    setValuesForEditCrystalColumn() {
        const rows = this.containerSpreadSheet.parseTableData();
        const columnIndex = this.containerSpreadSheet.getColumnIndex('editCrystalForm');
        for (let i = 0; i < rows.length; i++) {
            this.containerSpreadSheet.addEditCrystalFormButton(rows[i].location - 1, columnIndex);
        }
        this.panel.doLayout();
    }

    showReturnWarning() {
        const win = Ext.create('Ext.window.Window', {
            title: 'Container',
            width: 250,
            layout: 'fit',
            modal: true,
            items: [{
                html: '<div class="container-fluid" style="margin:10px;"><div class="row"><span style="font-size:14px;color: #666;">Do you want to save the changes to the container ' + this.puck.code + '?</span></div></div>',
            }],
            buttons: [{
                text: 'Yes',
                handler: () => { win.close(); this.save(true); }
            }, {
                text: 'No',
                handler: () => { win.close(); location.href = '#/shipping/' + this.shippingId + '/main'; }
            }, {
                text: 'Cancel',
                handler: () => win.close()
            }]
        });
        win.show();
    }
}

window.PuckFormView = PuckFormView;
