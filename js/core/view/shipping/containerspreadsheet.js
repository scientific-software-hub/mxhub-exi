class ContainerSpreadSheet extends SpreadSheet {
    constructor(args) {
        super(args);

        this.crystals = {};
        this.proteins = {};
        this.crystalFormList = {};
        this.renderCrystalFormColumn = false;

        if (args != null) {
            if (args.renderCrystalFormColumn != null) {
                this.renderCrystalFormColumn = args.renderCrystalFormColumn;
            }
        }

        this.crystalInfoToIdMap = {};
        this.crystalFormIndex = -1;
        this.spaceGroupIndex = -1;
        this.onModified = new Event(this);
        this.count = 0;
    }

    parseTableData() {
        const parsed = [];
        const data = this.spreadSheet.getData();
        if (data != null && data.length > 0) {
            const columnIds = this.getHeaderId();
            for (let j = 0; j < data.length; j++) {
                if (data[j].length > 1) {
                    const row = {};
                    row['location'] = j + 1;
                    for (let k = 0; k < columnIds.length; k++) {
                        const key = columnIds[k];
                        row[key] = data[j][this.getColumnIndex(key)];
                    }
                    if (row['Protein Acronym'] && row['Protein Acronym'].length > 0) {
                        parsed.push(row);
                    }
                }
            }
        }
        const curated = [];
        for (let i = 0; i < parsed.length; i++) {
            if (parsed[i]['Protein Acronym'] != null) {
                curated.push(parsed[i]);
            }
        }
        return curated;
    }

    load(puck) {
        const _this = this;
        this.puck = puck;
        const container = document.getElementById(this.id + '_samples');
        this.crystalFormIndex = this.getColumnIndex('Crystal Form');
        this.spaceGroupIndex = this.getColumnIndex('Space Group');
        const data = this.getSamplesData(puck);

        function firstRowRenderer(instance, td, row, col, prop, value, cellProperties) {
            Handsontable.renderers.TextRenderer.apply(this, arguments);
            td.style.fontWeight = 'bold';
            td.style.color = 'green';
            td.style.fontSize = '9px';
            td.style.background = '#CEC';
        }

        function ValueRenderer(instance, td, row, col, prop, value, cellProperties) {
            Handsontable.renderers.TextRenderer.apply(this, arguments);
            if (!instance.getDataAtRow(row)[1]) {
                td.style.background = '#EEE';
                return;
            }
            if (col == 2) {
                if (!value || value == '') {
                    td.className = 'custom-row-text-required';
                }
            }
            if (col == _this.spaceGroupIndex) {
                td.style.background = '#EEE';
            }
        }

        Handsontable.renderers.registerRenderer('ValueRenderer', ValueRenderer);
        this.spreadSheet = new Handsontable(container, {
            afterCreateRow: function (index, numberOfRows) {
                data.splice(index, numberOfRows);
            },
            beforeChange: function (changes, source) {
            },
            afterChange: function (changes, source) {
                if (this.lockAfterChange) {
                    return;
                }

                $('.htInvalid').removeClass('htInvalid');
                $('.edit-crystal-button').click(function (sender) {
                    const row = sender.target.id.split('-')[2];
                    const crystal = _this.parseCrystalFormColumn(_this.getData()[row][_this.crystalFormIndex], row);
                    _this.showEditForm(crystal, row);
                });

                if (source == 'edit') {
                    if (changes) {
                        for (let i = 0; i < changes.length; i++) {
                            const change = changes[i];
                            if (change[2] != change[3]) {
                                _this.manageChange(change, source);
                            }
                        }
                    }
                } else if ((source == 'autofill') || (source == 'Autofill.fill')) {
                    if (changes) {
                        this.lockAfterChange = true;
                        const direction = Math.sign(changes[0][0] - _this.spreadSheet.getSelected()[0][0]);
                        if (direction == 1) {
                            for (let i = 0; i < changes.length; i++) {
                                const change = changes[i];
                                if (change[2] != change[3]) {
                                    _this.manageChange(change, source, direction);
                                }
                            }
                        } else {
                            for (let i = changes.length - 1; i >= 0; i--) {
                                const change = changes[i];
                                if (change[2] != change[3]) {
                                    _this.manageChange(change, source, direction);
                                }
                            }
                        }
                        this.lockAfterChange = false;
                    }
                }
            },
            data: data,
            height: this.height,
            width: this.width,
            manualColumnResize: true,
            colWidths: this.getHeaderWidth(),
            colHeaders: this.getHeaderText(),
            stretchH: 'last',
            columns: this.getColumns(),
            licenseKey: ExtISPyB.handsontable_licenseKey,
        });
    }

    getSamplesData(puck) {
        const data = [];
        const samples = puck.sampleVOs;
        samples.sort((a, b) => Number(a.location) - Number(b.location));

        const getSampleByLocation = (samples, location) => {
            for (let i = 0; i < samples.length; i++) {
                if (samples[i].location == Number(location)) {
                    return samples[i];
                }
            }
        };

        const getValue = (value) => value || '';

        for (let i = 0; i < puck.capacity; i++) {
            const sample = getSampleByLocation(samples, i + 1);
            if (sample != null) {
                const crystal = sample.crystalVO;
                const protein = crystal.proteinVO;
                const diffraction = sample.diffractionPlanVO || {};
                data.push([
                    (i + 1),
                    protein.acronym,
                    sample.name,
                    sample.code,
                    this.getCrystalInfo(crystal),
                    '',
                    diffraction.experimentKind,
                    diffraction.aimedResolution,
                    diffraction.requiredResolution,
                    diffraction.preferredBeamDiameter,
                    diffraction.numberOfPositions,
                    diffraction.aimedMultiplicity,
                    diffraction.aimedCompleteness,
                    diffraction.forcedSpaceGroup,
                    diffraction.radiationSensitivity,
                    sample.smiles,
                    diffraction.axisRange,
                    diffraction.minOscWidth,
                    getValue(diffraction['observedResolution']),
                    sample.comments,
                    sample.structureStage
                ]);
            } else {
                data.push([(i + 1)]);
            }
        }
        return data;
    }

    getHeader() {
        const _this = this;
        const editCrystalFormRenderer = (instance, td, row, col, prop, value, cellProperties) => {
            if (value != undefined) {
                td.innerHTML = value;
            }
        };
        return [
            { text: '#', id: 'position', column: { width: 20 } },
            {
                text: 'Protein <br />Acronym', id: 'Protein Acronym', column: {
                    width: 80,
                    type: 'autocomplete',
                    filter: 'true',
                    source: this.getAcronyms()
                }
            },
            { text: 'Sample<br /> Name', id: 'Sample Name', column: { width: 120 } },
            { text: 'Pin <br />BarCode', id: 'Pin BarCode', column: { width: 60 } },
            {
                text: 'Crystal Form', id: 'Crystal Form', column: {
                    width: 230,
                    type: 'autocomplete',
                    filter: 'false',
                    strict: 'false',
                    // regular function: Handsontable passes its context as `this` (with this.instance / this.row)
                    source: function (query, process) {
                        const colIndex = _this.getColumnIndex('Protein Acronym');
                        const protein = EXI.proposalManager.getProteinByAcronym(this.instance.getDataAtCell(this.row, colIndex));
                        if (protein.length > 0) {
                            process(_this.getCrystalInfoByProtein(protein[0]));
                        } else {
                            process([]);
                        }
                    }
                }
            },
            { text: '<span class="glyphicon glyphicon-edit" aria-hidden="true"></span>', id: 'editCrystalForm', column: { width: 30, renderer: editCrystalFormRenderer, editor: false, readOnly: true } },
            {
                text: 'Exp.<br /> Type', id: 'Experiment Type', column: {
                    width: 100,
                    type: 'autocomplete',
                    filter: 'true',
                    source: ['Default', 'OSC']
                }
            },
            { text: 'Aimed<br /> resolution', id: 'Aimed resolution', column: { width: 60 } },
            { text: 'Required<br /> resolution', id: 'Needed resolution', column: { width: 60 } },
            { text: 'Beam <br />Diameter', id: 'Pref. Diameter', column: { width: 60 } },
            { text: 'Number of<br /> positions', id: 'Number Of positions', column: { width: 80 } },
            { text: 'Aimed<br /> multiplicity', id: 'Aimed multiplicity', column: { width: 60 } },
            { text: 'Aimed<br /> Completeness', id: 'Aimed Completeness', column: { width: 80 } },
            {
                text: 'Forced <br /> Space G.', id: 'Space Group', column: {
                    width: 55,
                    type: 'autocomplete',
                    filter: 'true',
                    source: _.concat([''], ExtISPyB.spaceGroups)
                }
            },
            { text: 'Radiation<br /> Sensitivity', id: 'Radiation Sensitivity', column: { width: 80 } },
            { text: 'Smiles', id: 'Smiles', column: { width: 140 } },
            { text: 'Tot Rot. <br />Angle', id: 'axisRange', column: { width: 60 } },
            { text: 'Min Osc.<br />Angle', id: 'minOscWidth', column: { width: 60 } },
            { text: 'Observed <br />resolution', id: 'Pre-observed resolution', column: { width: 80 } },
            { text: 'Comments', id: 'Comments', column: { width: 200 } },
            {
                text: 'Ligands', id: 'Ligands', column: {
                    width: 100,
                    type: 'autocomplete',
                    filter: 'true',
                    source: this.getLigandsGroupName()
                }
            }
        ];
    }

    convertToNumberIfNotEmpty(value) {
        if (value && value != '') {
            return Number(value);
        }
        return null;
    }

    getPuck() {
        const myPuck = JSON.parse(JSON.stringify(this.puck));
        const rows = this.parseTableData();
        const aux = [];

        for (let i = 0; i < rows.length; i++) {
            let sample = {};
            const sampleByLocation = _.filter(myPuck.sampleVOs, (b) => b.location == rows[i].location);
            if (sampleByLocation.length > 0) {
                sample = sampleByLocation[0];
            }

            sample['name'] = rows[i]['Sample Name'];
            sample['code'] = rows[i]['Pin BarCode'];
            sample['smiles'] = rows[i]['Smiles'];
            sample['location'] = rows[i]['location'];
            sample['comments'] = rows[i]['Comments'];
            sample['structureStage'] = rows[i]['Ligands'];

            const proteins = EXI.proposalManager.getProteinByAcronym(rows[i]['Protein Acronym']);
            if (sample['crystalVO'] == null) {
                sample['crystalVO'] = {};
            }
            if (proteins != null) {
                sample['crystalVO']['proteinVO'] = proteins[0];
            }

            const crystal = this.parseCrystalFormColumn(rows[i]['Crystal Form'], i);
            sample['crystalVO']['spaceGroup'] = crystal.spaceGroup ? crystal.spaceGroup : '';
            sample['crystalVO']['cellA'] = crystal.cellA;
            sample['crystalVO']['cellB'] = crystal.cellB;
            sample['crystalVO']['cellC'] = crystal.cellC;
            sample['crystalVO']['cellAlpha'] = crystal.cellAlpha;
            sample['crystalVO']['cellBeta'] = crystal.cellBeta;
            sample['crystalVO']['cellGamma'] = crystal.cellGamma;

            sample['diffractionPlanVO'] = {
                radiationSensitivity: this.convertToNumberIfNotEmpty(rows[i]['Radiation Sensitivity']),
                aimedCompleteness: this.convertToNumberIfNotEmpty(rows[i]['Aimed Completeness']),
                aimedMultiplicity: this.convertToNumberIfNotEmpty(rows[i]['Aimed multiplicity']),
                aimedResolution: this.convertToNumberIfNotEmpty(rows[i]['Aimed resolution']),
                requiredResolution: this.convertToNumberIfNotEmpty(rows[i]['Needed resolution']),
                observedResolution: this.convertToNumberIfNotEmpty(rows[i]['Pre-observed resolution']),
                preferredBeamDiameter: this.convertToNumberIfNotEmpty(rows[i]['Pref. Diameter']),
                numberOfPositions: this.convertToNumberIfNotEmpty(rows[i]['Number Of positions']),
                experimentKind: rows[i]['Experiment Type'],
                axisRange: rows[i]['axisRange'],
                minOscWidth: rows[i]['minOscWidth'],
            };

            aux.push(sample);
        }
        myPuck.sampleVOs = aux;
        return myPuck;
    }

    setRenderCrystalFormColumn(bool) {
        this.renderCrystalFormColumn = bool;
    }

    getProteinsByAcronym(acronym) {
        if (this.proteins[acronym] == null) {
            this.proteins[acronym] = EXI.proposalManager.getProteinByAcronym(acronym);
        }
        return this.proteins[acronym];
    }

    getLigandsGroupName() {
        return _.concat([''], _.uniq(_.map(EXI.proposalManager.getLigands(), (o) => o.groupName)));
    }

    parseCrystalFormColumn(dataAtCrystalFormColumn, row) {
        const parsed = {
            spaceGroup: null,
            cellA: null,
            cellB: null,
            cellC: null,
            cellAlpha: null,
            cellBeta: null,
            cellGamma: null
        };
        if (dataAtCrystalFormColumn != '' && dataAtCrystalFormColumn != null) {
            const proteins = this.getProteinsByAcronym(this.spreadSheet.getDataAtCell(row, this.getColumnIndex('Protein Acronym')));
            if (proteins && proteins.length > 0) {
                parsed.proteinVO = proteins[0];
            }
            if (dataAtCrystalFormColumn == 'NEW') {
                parsed.spaceGroup = 'NEW';
                parsed.crystalId = '';
            } else {
                if (this.crystalInfoToIdMap[dataAtCrystalFormColumn]) {
                    parsed.crystalId = this.crystalInfoToIdMap[dataAtCrystalFormColumn];
                } else {
                    this.getCrystalInfoByProtein(proteins[0]);
                    parsed.crystalId = this.crystalInfoToIdMap[dataAtCrystalFormColumn];
                }
                const splitted = dataAtCrystalFormColumn.split('-');
                parsed.spaceGroup = splitted[0].trim();
                if (splitted.length > 1) {
                    if (splitted[1].trim() == 'undefined') {
                        parsed.cellA = undefined;
                        parsed.cellB = undefined;
                        parsed.cellC = undefined;
                        parsed.cellAlpha = undefined;
                        parsed.cellBeta = undefined;
                        parsed.cellGamma = undefined;
                    } else {
                        const cells = (splitted[1] + '-' + splitted[2]).trim().replace(/[{()}]/g, '').replace(/\s+/g, '');
                        parsed.cellA = (cells.split('-')[0].split(',')[0] == 'null') ? null : cells.split('-')[0].split(',')[0];
                        parsed.cellB = (cells.split('-')[0].split(',')[1] == 'null') ? null : cells.split('-')[0].split(',')[1];
                        parsed.cellC = (cells.split('-')[0].split(',')[1] == 'null') ? null : cells.split('-')[0].split(',')[2];
                        parsed.cellAlpha = (cells.split('-')[1].split(',')[0] == 'null') ? null : cells.split('-')[1].split(',')[0];
                        parsed.cellBeta = (cells.split('-')[1].split(',')[1] == 'null') ? null : cells.split('-')[1].split(',')[1];
                        parsed.cellGamma = (cells.split('-')[1].split(',')[2] == 'null') ? null : cells.split('-')[1].split(',')[2];
                    }
                } else {
                    parsed.cellA = 0;
                    parsed.cellB = 0;
                    parsed.cellC = 0;
                    parsed.cellAlpha = 0;
                    parsed.cellBeta = 0;
                    parsed.cellGamma = 0;
                }
            }
        }
        return parsed;
    }

    getCrystalInfo(crystal) {
        try {
            if (crystal.spaceGroup == null) {
                if (crystal.cellA == null && crystal.cellB == null && crystal.cellC == null &&
                    crystal.cellAlpha == null && crystal.cellBeta == null && crystal.cellGamma == null) {
                    return 'Not set';
                }
            }
            if (crystal.cellA == null) {
                return crystal.spaceGroup + ' - undefined';
            } else if (crystal.cellA == 0 && crystal.cellB == 0 && crystal.cellC == 0 &&
                       crystal.cellAlpha == 0 && crystal.cellBeta == 0 && crystal.cellGamma == 0) {
                return crystal.spaceGroup;
            }
            return crystal.spaceGroup + ' - (' + crystal.cellA + ' , ' + crystal.cellB + ' , ' + crystal.cellC +
                   ' - ' + crystal.cellAlpha + ' , ' + crystal.cellBeta + ' , ' + crystal.cellGamma + ')';
        } catch (e) {
            return '';
        }
    }

    getUnitCellInfo(crystal) {
        let html = '';
        dust.render('shipping.edit.form.unit.cell.template', crystal, (err, out) => {
            html = out;
        });
        return html;
    }

    showEditForm(crystal, row) {
        const editCrystalForm = new EditCrystalFormView();

        editCrystalForm.onSaved.attach((sender, crystal) => {
            const rows = this.parseTableData();
            this.updateCrystalGroup(row, crystal);
            for (let i = 0; i < rows.length; i++) {
                if (rows[i].location - 1 != row) {
                    if (this.crystalInfoToIdMap[rows[i]['Crystal Form']] == crystal.crystalId) {
                        this.updateCrystalGroup(rows[i].location - 1, crystal);
                    }
                }
            }
            win.close();
        });

        const win = Ext.create('Ext.window.Window', {
            title: 'Crystal Form',
            height: 460,
            width: 600,
            modal: true,
            closable: false,
            layout: 'fit',
            items: [editCrystalForm.getPanel()],
            buttons: [{
                text: 'Save',
                handler: () => editCrystalForm.save()
            }, {
                text: 'Cancel',
                handler: () => {
                    if (crystal.spaceGroup == 'NEW') {
                        this.resetCrystalGroup(row);
                    }
                    win.close();
                }
            }]
        }).show();

        editCrystalForm.load(crystal);
    }

    addEditCrystalFormButton(row, column) {
        if (!column) {
            column = this.getColumnIndex('editCrystalForm');
        }
        const button = "<span style='color:blue;cursor: pointer;' id='edit-glyphicon-" + row + "'class='glyphicon glyphicon-edit edit-crystal-button'></span>";
        this.populateCrystalFormButton(row, column, button);
    }

    populateCrystalFormButton(row, column, html) {
        if (column != -1) {
            this.setDataAtCell(row, column, html);
        }
    }

    updateCrystalGroup(row, crystal) {
        if (crystal) {
            this.setDataAtCell(row, this.crystalFormIndex, this.getCrystalInfo(crystal));
            this.addEditCrystalFormButton(row);
        } else {
            this.resetCrystalGroup(row);
        }
    }

    resetCrystalGroup(row) {
        this.setDataAtCell(row, this.crystalFormIndex, '');
        this.setDataAtCell(row, this.spaceGroupIndex, '');
        this.populateCrystalFormButton(row, this.getColumnIndex('editCrystalForm'), '');
    }

    getCrystalsByProteinId(proteinId) {
        if (this.crystals[proteinId] == null) {
            this.crystals[proteinId] = _.filter(EXI.proposalManager.getCrystals(), (o) => o.proteinVO.proteinId == proteinId);
        }
        return this.crystals[proteinId];
    }

    getCrystalByProtein(acronym) {
        if (this.crystals[acronym] == null) {
            const proteins = EXI.proposalManager.getProteinByAcronym(acronym);
            if (proteins && proteins.length > 0) {
                const crystalsByProteinId = this.getCrystalsByProteinId(proteins[0].proteinId);
                if (crystalsByProteinId && crystalsByProteinId.length > 0) {
                    this.crystals[acronym] = _.maxBy(crystalsByProteinId, 'crystalId');
                }
            }
        }
        return this.crystals[acronym];
    }

    manageChange(change, source, direction) {
        const rowIndex = change[0];
        const prevValue = change[3];

        switch (change[1]) {
            case this.crystalFormIndex: {
                const parsed = this.parseCrystalFormColumn(prevValue, rowIndex);
                if (parsed.spaceGroup != undefined) {
                    if (parsed.spaceGroup == 'NEW') {
                        this.showEditForm(parsed, rowIndex);
                    } else {
                        if (this.isCrystalFormAvailable(parsed, this.getData()[rowIndex][this.getColumnIndex('Protein Acronym')])) {
                            this.updateCrystalGroup(rowIndex, parsed);
                        } else {
                            this.resetCrystalGroup(rowIndex);
                        }
                    }
                } else {
                    this.resetCrystalGroup(rowIndex);
                }
                break;
            }

            case this.getColumnIndex('Protein Acronym'): {
                if (prevValue == '') {
                    this.emptyRow(rowIndex);
                } else {
                    if (rowIndex > 0) {
                        const colIdx = this.getColumnIndex('Sample Name');
                        const currentName = this.spreadSheet.getDataAtCell(rowIndex, colIdx);
                        if (currentName == undefined || currentName == '') {
                            const nameSampleAbove = this.spreadSheet.getDataAtCell(rowIndex - 1, colIdx);
                            if (nameSampleAbove != null && nameSampleAbove != '') {
                                const autoincremented = this.autoIncrement(nameSampleAbove, 1);
                                if (autoincremented != '') {
                                    this.setDataAtCell(rowIndex, colIdx, autoincremented);
                                }
                            }
                        }
                    }
                    const parsed = this.parseCrystalFormColumn(this.getData()[rowIndex][this.crystalFormIndex], rowIndex);
                    if (!this.isCrystalFormAvailable(parsed, prevValue)) {
                        this.resetCrystalGroup(rowIndex);
                        const crystal = this.getCrystalByProtein(prevValue);
                        if (crystal) {
                            this.updateCrystalGroup(rowIndex, crystal);
                        }
                    }
                }
                break;
            }

            case this.getColumnIndex('Sample Name'): {
                if (((source == 'autofill') || (source == 'Autofill.fill')) && prevValue != '') {
                    const autoincremented = this.autoIncrement(this.spreadSheet.getDataAtCell(rowIndex - direction, change[1]), direction);
                    if (autoincremented != '') {
                        this.setDataAtCell(rowIndex, change[1], autoincremented);
                    }
                }
                break;
            }
        }

        if (change[1] != this.getColumnIndex('editCrystalForm')) {
            this.onModified.notify(change);
        }
        $('.htInvalid').removeClass('htInvalid');
    }

    autoIncrement(value, direction) {
        const regex = /(\d+)/g;
        const numbers = value.match(regex);
        if (numbers) {
            const lastNumber = numbers[numbers.length - 1];
            if (value.lastIndexOf(lastNumber) == value.length - lastNumber.length) {
                value = value.substring(0, value.length - lastNumber.length) + (parseInt(lastNumber) + direction);
            }
        } else {
            value = value + '1';
        }
        return value;
    }

    isCrystalFormAvailable(parsedCrystalForm, proteinAcronym) {
        const crystalsBySpaceGroupAndAcronym = _.filter(
            EXI.proposalManager.getCrystals(),
            (o) => (o.proteinVO.acronym == proteinAcronym) && (o.spaceGroup == parsedCrystalForm.spaceGroup)
        );
        if (crystalsBySpaceGroupAndAcronym.length > 0) {
            for (let i = 0; i < crystalsBySpaceGroupAndAcronym.length; i++) {
                const crystal = crystalsBySpaceGroupAndAcronym[i];
                if (crystal.cellA == parsedCrystalForm.cellA && crystal.cellB == parsedCrystalForm.cellB &&
                    crystal.cellC == parsedCrystalForm.cellC && crystal.cellAlpha == parsedCrystalForm.cellAlpha &&
                    crystal.cellBeta == parsedCrystalForm.cellBeta && crystal.cellGamma == parsedCrystalForm.cellGamma) {
                    return true;
                }
            }
        }
        return false;
    }

    getCrystalInfoByProtein(protein) {
        if (protein) {
            if (this.crystalFormList[protein.acronym] == null) {
                const src = [];
                const crystalsByProteinId = this.getCrystalsByProteinId(protein.proteinId);
                if (crystalsByProteinId) {
                    for (let i = 0; i < crystalsByProteinId.length; i++) {
                        const crystalInfo = this.getCrystalInfo(crystalsByProteinId[i]);
                        this.crystalInfoToIdMap[crystalInfo] = crystalsByProteinId[i].crystalId;
                        src.push(crystalInfo);
                    }
                }
                this.crystalFormList[protein.acronym] = _.union(['NEW'], src.sort());
            }
            return this.crystalFormList[protein.acronym];
        }
    }
}

window.ContainerSpreadSheet = ContainerSpreadSheet;
