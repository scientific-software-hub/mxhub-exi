class CSVPuckFormView extends PuckFormView {
    constructor(args) {
        super(args);

        // Replace parent's ContainerSpreadSheet with the CSV variant
        this.containerSpreadSheet = new CSVContainerSpreadSheet({
            width: Ext.getBody().getWidth() - 100,
            height: Ext.getBody().getHeight() - 500,
        });

        this.dewarNameControlledList = [];
        this.containerNameControlledList = [];

        this.uniquenessParcelPanelId = this.id + '_uniquenessParcelPanelId';
        this.acceptedContainerListPanelId = this.id + '_acceptedContainerListPanelId';
        this.uniquenessContainerNamelPanelId = this.id + '_uniquenessContainerNamelPanelId';
        this.uniquenessSampleNamePanelId = this.id + '_uniquenessSampleNamePanelId';
        this.noSpecialSymbolsSampleNameId = this.id + '_noSpecialSymbolsSampleNameId';
        this.noSpecialSymbolsProteinNameId = this.id + '_noSpecialSymbolsProteinNameId';
        this.noProteinInDb = this.id + '_noProteinInDbPanelId';
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
                text: 'Add Protein',
                id: 'add_protein_puck_item',
                width: 150,
                height: 30,
                disabled: true,
                handler: () => this.addProtein()
            },
            {
                text: 'Save',
                id: this.id + '_save_button',
                width: 100,
                height: 30,
                disabled: false,
                handler: () => this.save()
            },
            {
                text: 'Return to shipment',
                width: 200,
                height: 30,
                handler: () => this.returnToShipment()
            }
        ];
    }

    displayErrors(errors, panelId, message) {
        if (errors && errors.length > 0) {
            const rows = _.map(errors, (o) => Number(o.rowIndex) + 1);
            $('#' + panelId).notify('Rows: ' + rows + ' ' + message, { position: 'bottom' });
            $('#' + panelId).className = 'error';
            $('#' + panelId).fadeIn().fadeOut().fadeIn().fadeOut().fadeIn().fadeOut().fadeIn();
            return true;
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

    save() {
        const sampleNamesProteinIds = _.cloneDeep(this.proposalSamples);
        EXI.proposalManager.getProteins(true);
        const parcels = this.containerSpreadSheet.getParcels();
        if (parcels.length === 0) {
            $.notify('Sorry. There are no Dewars to safe! Please use Browse button to upload Dewars', 'error');
            return;
        }

        const isValid = this.containerSpreadSheet.isDataValid(sampleNamesProteinIds);
        if (isValid) {
            this.panel.setLoading('Saving CSV');
            EXI.getDataAdapter({
                onSuccess: (sender, puck) => {
                    this.panel.setLoading(false);
                    this.returnToShipment();
                },
                onError: (sender, error) => {
                    this.panel.setLoading(false);
                    EXI.setError(error.responseText);
                    $.notify(error.responseText, 'error');
                }
            }).proposal.shipping.addDewarsToShipment(this.shippingId, parcels);
        } else {
            $.notify('Sorry. Your data contain errors!', 'error');
            const errors = this.containerSpreadSheet.getErrors();
            if (this.displayErrors(errors.INCORRECT_PARCEL_NAME, this.uniquenessParcelPanelId, ' contain parcel names that are not unique within the proposal')) return;
            if (this.displayErrors(errors.INCORRECT_CONTAINER_NAME, this.uniquenessContainerNamelPanelId, '')) return;
            if (this.displayErrors(errors.INCORRECT_CONTAINER_TYPE, this.acceptedContainerListPanelId, '')) return;
            if (this.displayErrors(errors.INCORRECT_SAMPLE_POSITION, this.uniquenessSampleNamePanelId, '')) return;
            if (this.displayErrors(errors.NO_PROTEIN_IN_DB, this.noProteinInDb, '')) return;
            if (this.displayErrors(errors.DUPLICATE_SAMPLE_NAME, this.uniquenessSampleNamePanelId, '')) return;
            if (this.displayErrors(errors.INCORRECT_SAMPLE_NAME, this.noSpecialSymbolsSampleNameId, '')) return;
            if (this.displayErrors(errors.INCORRECT_PROTEIN_NAME, this.noSpecialSymbolsProteinNameId, '')) return;
        }
    }

    getWarningPanelsHTML() {
        let html = '';
        let siteName = '';
        let showOnlyUnipuckMessageValue = false;
        if (EXI.credentialManager.getSiteName().startsWith('MAXIV')) {
            showOnlyUnipuckMessageValue = true;
            siteName = 'MAXIV';
        } else if (EXI.credentialManager.getSiteName().startsWith('DESY')) {
            showOnlyUnipuckMessageValue = true;
            siteName = 'DESY';
        }
        dust.render('csvpuckformview.template', {
            noProteinInDb: this.noProteinInDb,
            uniquenessParcelPanelId: this.uniquenessParcelPanelId,
            acceptedContainerListPanelId: this.acceptedContainerListPanelId,
            uniquenessContainerNamelPanelId: this.uniquenessContainerNamelPanelId,
            uniquenessSampleNamePanelId: this.uniquenessSampleNamePanelId,
            noSpecialSymbolsSampleNameId: this.noSpecialSymbolsSampleNameId,
            noSpecialSymbolsProteinNameId: this.noSpecialSymbolsProteinNameId,
            showOnlyUnipuckMessage: showOnlyUnipuckMessageValue,
            siteName
        }, (err, out) => {
            html = out;
        });
        return html;
    }

    getPanel() {
        this.panel = Ext.create('Ext.panel.Panel', {
            autoScroll: true,
            icon: this.icon,
            layout: 'fit',
            padding: 10,
            border: 0,
            items: [this.getContainer()]
        });
        this.panel.on('boxready', () => {
            if (EXI.credentialManager.isUserAllowedAddProtein()) {
                Ext.getCmp('add_protein_puck_item').enable();
            } else {
                Ext.getCmp('add_protein_puck_item').disable();
            }
            if (this.onBoxReady) {
                this.onBoxReady();
            }
        });
        return this.panel;
    }

    getContainer() {
        let html = '';
        let siteName = '';
        if (EXI.credentialManager.getSiteName().startsWith('MAXIV')) siteName = 'MAXIV';
        if (EXI.credentialManager.getSiteName().startsWith('DESY')) siteName = 'DESY';

        dust.render('csvimportmainview.template', {
            id: 'file_' + this.id,
            siteName
        }, (err, out) => {
            html = out;
        });

        this.panel = Ext.create('Ext.panel.Panel', {
            autoScroll: true,
            buttons: this.getToolBar(),
            layout: 'vbox',
            items: [
                { html, height: 60, margin: 10 },
                { html: this.getWarningPanelsHTML() },
                this.containerSpreadSheet.getPanel(),
            ]
        });
        return this.panel;
    }

    csvToArray(csvContent) {
        if (csvContent) {
            const allTextLines = csvContent.split(/\r\n|\n/);
            if (allTextLines && allTextLines.length > 0) {
                const lines = [];
                for (let i = 0; i < allTextLines.length - 1; i++) {
                    if (!allTextLines[i].trim().startsWith('#')) {
                        lines.push(allTextLines[i].split(','));
                    }
                }
                return lines;
            }
        }
    }

    setFileUploadListeners() {
        const handleFileSelect = (evt) => {
            const files = evt.target.files;
            for (let i = 0, f; f = files[i]; i++) {
                const reader = new FileReader();
                reader.onload = ((f) => {
                    $('#box_file_' + this.id).val(f.name);
                    $('#box_info_' + this.id).html(f.size / 1024 + ' KB');
                    return (e) => {
                        this.containerSpreadSheet.loadData(this.csvToArray(e.target.result));
                    };
                })(f);
                reader.readAsText(f);
            }
        };

        document.getElementById('file_' + this.id).addEventListener('change', handleFileSelect, false);
        document.getElementById('file_' + this.id).disabled = false;
    }

    load(shippingId) {
        this.panel.setTitle('Import CSV');
        this.shippingId = shippingId;
        this.containerSpreadSheet.loadData([[]]);

        setTimeout(() => this.setFileUploadListeners(), 1000);

        if (shippingId != null) {
            this.panel.setLoading();
            EXI.getDataAdapter({
                onSuccess: (sender, shipment) => {
                    this.shipment = shipment;
                    this.dewarNameControlledList = _.map(this.shipment.dewarVOs, 'code');
                    for (let i = 0; i < shipment.dewarVOs.length; i++) {
                        this.containerNameControlledList = this.containerNameControlledList.concat(
                            _.map(shipment.dewarVOs[i].containerVOs, 'code')
                        );
                    }
                    this.containerSpreadSheet.setContainerNameControlledList(this.containerNameControlledList);
                    this.containerSpreadSheet.setDewarNameControlledList(this.dewarNameControlledList);
                    this.panel.setLoading(false);
                },
                onError: () => this.panel.setLoading(false)
            }).proposal.shipping.getShipment(shippingId);
        }

        this.getSamplesFromProposal();
    }
}

window.CSVPuckFormView = CSVPuckFormView;
