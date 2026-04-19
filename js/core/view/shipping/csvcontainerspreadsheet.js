class CSVContainerSpreadSheet extends ContainerSpreadSheet {
    constructor(args) {
        super(args);

        this.crystals = {};
        this.proteins = {};
        this.crystalFormList = {};

        this.acronyms = undefined;
        this.forceUpdate = false;

        this.crystalFormIndex = -1;
        this.spaceGroupIndex = -1;

        this.onModified = new Event(this);
        this.count = 0;

        this.cellColorBackground = this.getParcelColors();
        this.parcelColorBackground = {};
        this.proposalSamples = [];

        if (EXI.credentialManager.getSiteName().startsWith('MAXIV') || EXI.credentialManager.getSiteName().startsWith('DESY')) {
            this.containerTypeControlledList = [
                { name: 'Unipuck', capacity: 16 }
            ];
        } else {
            this.containerTypeControlledList = [
                { name: 'Unipuck', capacity: 16 },
                { name: 'SPINEpuck', capacity: 10 }
            ];
        }

        this.dewarNameControlledList = new Set();
        this.containerNameControlledList = new Set();
        this.puckValidator = new PuckValidator();

        this.PARCELNAME_INDEX = 0;
        this.CONTAINERNAME_INDEX = 1;
        this.CONTAINERTYPE_INDEX = 2;
        this.SAMPLEPOSITION_INDEX = 3;
        this.PROTEINACRONYM_INDEX = 4;
        this.SAMPLENAME_INDEX = 5;

        this.errors = this.resetErrors();
    }

    _getContainerTypeControlledListNames() {
        return _.map(this.containerTypeControlledList, 'name');
    }

    resetErrors() {
        return {
            INCORRECT_PARCEL_NAME: [],
            INCORRECT_CONTAINER_NAME: [],
            INCORRECT_CONTAINER_TYPE: [],
            INCORRECT_SAMPLE_POSITION: [],
            DUPLICATE_SAMPLE_NAME: [],
            INCORRECT_SAMPLE_NAME: [],
            INCORRECT_PROTEIN_NAME: [],
            NO_PROTEIN_IN_DB: []
        };
    }

    getErrors() {
        return this.errors;
    }

    isDataValid(sampleNamesProteinIds) {
        this.errors = this.resetErrors();
        const data = this.spreadSheet.getData();
        let isValid = true;

        const sampleNames = this.spreadSheet.getDataAtCol(this.SAMPLENAME_INDEX);
        const proteinIds = this.spreadSheet.getDataAtCol(this.PROTEINACRONYM_INDEX)
            .map((acronym) => this.getProteinByAcronym(acronym))
            .filter((protein) => protein)
            .map((protein) => protein.proteinId);

        const conflicts = this.puckValidator.checkSampleNames(sampleNames, proteinIds, sampleNamesProteinIds);
        isValid = conflicts.length === 0;

        for (let i = 0; i < data.length; i++) {
            if (this.validateRow(data[i], i, sampleNamesProteinIds) == false) {
                isValid = false;
            }
            if (conflicts.includes(data[i][this.SAMPLENAME_INDEX])) {
                this.errors.DUPLICATE_SAMPLE_NAME.push({
                    value: data[i][this.SAMPLEPOSITION_INDEX],
                    rowIndex: i
                });
            }
        }
        return isValid;
    }

    validateRow(row, rowIndex, sampleNamesProteinIds) {
        const parcelName = row[this.PARCELNAME_INDEX];
        const containerName = row[this.CONTAINERNAME_INDEX];
        const containerType = row[this.CONTAINERTYPE_INDEX];
        const samplePosition = row[this.SAMPLEPOSITION_INDEX];
        const proteinName = row[this.PROTEINACRONYM_INDEX];
        const sampleName = row[this.SAMPLENAME_INDEX];
        let validateRow = true;

        if (!this.isSampleNameValid(sampleName)) {
            this.errors.INCORRECT_SAMPLE_NAME.push({ value: sampleName, rowIndex });
            validateRow = false;
        }
        if (!this.isProteinNameValid(proteinName)) {
            this.errors.INCORRECT_PROTEIN_NAME.push({ value: proteinName, rowIndex });
            validateRow = false;
        }
        if (!this.isParcelNameValid(parcelName)) {
            this.errors.INCORRECT_PARCEL_NAME.push({ value: parcelName, rowIndex });
            validateRow = false;
        }
        if (!this.isContainerNameValid(containerName)) {
            this.errors.INCORRECT_CONTAINER_NAME.push({ value: containerName, rowIndex });
            validateRow = false;
        }
        if (!this.isContainerTypeValid(containerType)) {
            this.errors.INCORRECT_CONTAINER_TYPE.push({ value: containerType, rowIndex });
            validateRow = false;
        }
        if (!this.isSamplePositionValid(containerType, samplePosition)) {
            this.errors.INCORRECT_SAMPLE_POSITION.push({ value: samplePosition, rowIndex });
            validateRow = false;
        }
        if (!this.isProteinInDB(proteinName)) {
            this.errors.NO_PROTEIN_IN_DB.push({ value: proteinName, rowIndex });
            validateRow = false;
        }
        return validateRow;
    }

    getParcelColors() {
        return [
            { color: '#0099ff', containers: [{ color: '#4db8ff' }, { color: '#80ccff' }, { color: '#b3e0ff' }, { color: '#e6f5ff' }] },
            { color: '#33cc33', containers: [{ color: '#5cd65c' }, { color: '#85e085' }, { color: '#adebad' }, { color: '#d6f5d6#' }] },
            { color: '#ffbb33', containers: [{ color: '#ffcc66' }, { color: '#ffdd99' }, { color: '#ffeecc' }, { color: '#fff7e6' }] },
            { color: '#bb33ff', containers: [{ color: '#cc66ff' }, { color: '#dd99ff' }, { color: '#e6b3ff' }, { color: '#eeccff' }] }
        ];
    }

    // Overrides SpreadSheet.loadData — adds afterCreateRow/beforeChange/afterChange Handsontable hooks
    loadData(data) {
        function firstRowRenderer(instance, td, row, col, prop, value, cellProperties) {
            Handsontable.renderers.TextRenderer.apply(this, arguments);
            td.style.fontWeight = 'bold';
            td.style.color = 'green';
            td.style.fontSize = '9px';
            td.style.background = '#CEC';
        }

        function ValueRenderer(instance, td, row, col, prop, value, cellProperties) {
            Handsontable.renderers.TextRenderer.apply(this, arguments);
        }

        Handsontable.renderers.registerRenderer('ValueRenderer', ValueRenderer);
        this.spreadSheet = new Handsontable(
            document.getElementById(this.id + '_samples'), {
                afterCreateRow: function (index, numberOfRows) {
                    data.splice(index, numberOfRows);
                },
                beforeChange: function (changes, source) {
                },
                afterChange: function (changes, source) {
                },
                cells: function (row, col, prop) {
                },
                data: data,
                height: this.height,
                width: this.width,
                manualColumnResize: true,
                colWidths: this.getHeaderWidth(),
                colHeaders: this.getHeaderText(),
                stretchH: 'last',
                columns: this.getColumns(),
                rowHeaders: true,
                invalidCellClassName: 'custom-row-text-required',
                licenseKey: ExtISPyB.handsontable_licenseKey,
            });
    }

    getParcelsByRows(rows) {
        return _.groupBy(rows, 'parcel');
    }

    getContainersByRows(rows) {
        return _.groupBy(rows, 'containerCode');
    }

    getProteinByAcronym(acronym) {
        const proteins = EXI.proposalManager.getProteinByAcronym(acronym);
        if (proteins && proteins.length > 0) {
            return proteins[0];
        }
        return null;
    }

    emptyToNull(value) {
        return value === '' ? null : value;
    }

    getParcels() {
        const getDiffractionPlanByRow = (row) => ({
            radiationSensivity: this.emptyToNull(row['Radiation Sensitivity']),
            aimedCompleteness: this.emptyToNull(row['Aimed Completeness']),
            aimedMultiplicity: this.emptyToNull(row['Aimed Multiplicity']),
            aimedResolution: this.emptyToNull(row['Aimed Resolution']),
            requiredResolution: this.emptyToNull(row['Required Resolution']),
            forcedSpaceGroup: this.emptyToNull(row['forcedSpaceGroup']),
            experimentKind: this.emptyToNull(row['experimentKind']),
            observedResolution: this.emptyToNull(row['Observed Resolution']),
            preferredBeamDiameter: this.emptyToNull(row['Beam Diameter']),
            numberOfPositions: this.emptyToNull(row['Number Of positions']),
            axisRange: this.emptyToNull(row['axisRange']),
            minOscWidth: this.emptyToNull(row['minOscWidth'])
        });

        const getCrystalByRow = (row) => ({
            spaceGroup: this.emptyToNull(row['Space Group']),
            cellA: this.emptyToNull(row['a']),
            cellB: this.emptyToNull(row['b']),
            cellC: this.emptyToNull(row['c']),
            cellAlpha: this.emptyToNull(row['alpha']),
            cellBeta: this.emptyToNull(row['beta']),
            cellGamma: this.emptyToNull(row['gamma']),
            proteinVO: this.getProteinByAcronym(row['Protein Acronym'])
        });

        const getSamplesByContainerRows = (rows) => {
            if (!rows) return [];
            return rows.map((r) => ({
                name: r['Sample Name'],
                location: r['position'],
                diffractionPlanVO: getDiffractionPlanByRow(r),
                crystalVO: getCrystalByRow(r),
                smiles: r['Smiles'],
                comments: r['Comments']
            }));
        };

        const getContainerType = (rows) => rows && rows[0] && rows[0].containerType ? rows[0].containerType : undefined;

        const getContainerCapacity = (rows) => {
            if (rows && rows[0] && rows[0].containerType) {
                return rows[0].containerType.toUpperCase() === 'SPINEPUCK' ? 10 : 16;
            }
        };

        const rows = this.parseTableData();
        const dewars3vo = [];
        const parcels = this.getParcelsByRows(rows);
        for (const parcel of Object.keys(parcels)) {
            const containerVOs = [];
            const containers = this.getContainersByRows(parcels[parcel]);
            for (const key of Object.keys(containers)) {
                const containerRows = containers[key];
                containerVOs.push({
                    code: _.trim(containerRows[0].containerCode),
                    containerType: getContainerType(containerRows),
                    capacity: getContainerCapacity(containerRows),
                    sampleVOs: getSamplesByContainerRows(containerRows)
                });
            }
            dewars3vo.push({
                code: _.trim(parcel),
                type: 'Dewar',
                containerVOs
            });
        }
        return dewars3vo;
    }

    setContainerNameControlledList(containerNameControlledList) {
        this.containerNameControlledList = new Set(containerNameControlledList);
    }

    setDewarNameControlledList(dewarNameControlledList) {
        this.dewarNameControlledList = new Set(dewarNameControlledList);
    }

    manageChange(change, source, direction) {
        switch (change[1]) {
            case this.crystalFormIndex:
                break;
            case this.getColumnIndex('Protein Acronym'):
                break;
            case this.getColumnIndex('Sample group'):
                break;
        }
        $('.htInvalid').removeClass('htInvalid');
    }

    getParcelColor(parcelName) {
        if (!this.parcelColorBackground[parcelName]) {
            this.parcelColorBackground[parcelName] = this.cellColorBackground[_.size(this.parcelColorBackground) % this.cellColorBackground.length];
            this.parcelColorBackground[parcelName].name = parcelName;
        }
        return this.parcelColorBackground[parcelName].color;
    }

    getContainerColor(parcelName, containerName) {
        if (this.parcelColorBackground[parcelName]) {
            const assignedColorIndex = _.findIndex(
                _.map(this.parcelColorBackground[parcelName].containers, 'name'),
                (o) => o == containerName
            );
            if (assignedColorIndex == -1) {
                for (let i = 0; i < this.parcelColorBackground[parcelName].containers.length; i++) {
                    if (!this.parcelColorBackground[parcelName].containers[i].name) {
                        this.parcelColorBackground[parcelName].containers[i].name = containerName;
                        return this.parcelColorBackground[parcelName].containers[i].color;
                    }
                }
            } else {
                return this.parcelColorBackground[parcelName].containers[assignedColorIndex].color;
            }
        }
        return '#FFFFFF';
    }

    isContainerTypeValid(containerType) {
        if (containerType) {
            if (containerType != undefined) {
                const foundContainerType = _.find(this.containerTypeControlledList, (o) => o.name == containerType);
                if (foundContainerType) {
                    return true;
                }
            }
        }
        return false;
    }

    isSamplePositionValid(containerType, samplePosition) {
        const found = _.find(this.containerTypeControlledList, (o) => o.name == containerType);
        if (found == null) {
            return false;
        }
        try {
            if (found.capacity < parseInt(samplePosition)) {
                return false;
            }
        } catch (e) {
            return false;
        }
        return true;
    }

    isValueFilled(value) {
        return !(value == undefined || value == '');
    }

    isParcelNameValid(parcelName) {
        if (parcelName == undefined || parcelName == '') {
            return false;
        }
        if (this.dewarNameControlledList.has(parcelName)) {
            return false;
        }
        return true;
    }

    isProteinInDB(proteinName) {
        const protein = this.getProteinByAcronym(proteinName);
        return !(protein == undefined || protein == '' || protein == null);
    }

    isSampleNameValid(sampleName) {
        return /^[a-zA-Z0-9_-]+$/.test(sampleName);
    }

    isProteinNameValid(proteinName) {
        return /^[a-zA-Z0-9_-]+$/.test(proteinName);
    }

    isContainerNameValid(containerName) {
        return !this.containerNameControlledList.has(containerName);
    }

    getHeader() {
        const _this = this;

        const mandatoryParameterRenderer = (instance, td, row, col, prop, value, cellProperties) => {
            if (!this.isValueFilled(value)) {
                td.className = 'custom-row-text-required';
            }
            td.innerHTML = value;
        };

        const numericParameterRenderer = (instance, td, row, col, prop, value, cellProperties) => {
            try {
                if (value == undefined || value == '') {
                    td.innerHTML = value;
                } else if (isNaN(value)) {
                    td.className = 'custom-row-text-required';
                    td.innerHTML = value;
                } else {
                    td.innerHTML = parseFloat(value);
                }
            } catch (e) {
                td.className = 'custom-row-text-required';
                td.innerHTML = value;
            }
        };

        const proteinParameterRenderer = (instance, td, row, col, prop, value, cellProperties) => {
            if (value == undefined || value == '') {
                td.className = 'custom-row-text-required';
                return;
            }
            const protein = _.find(this.getAcronyms(), (o) => o == value);
            if (!protein) {
                td.className = 'custom-row-text-required';
            }
            td.innerHTML = value;
        };

        const sampleParameterRenderer = (instance, td, row, col, prop, value, cellProperties) => {
            td.innerHTML = value;
        };

        const parcelDisplayCell = (instance, td, row, col, prop, value, cellProperties) => {
            if (!this.isParcelNameValid(value)) {
                td.className = 'custom-row-text-required';
            } else {
                td.style.background = this.getParcelColor(value);
            }
            td.innerHTML = value;
        };

        const containerNameParameterRenderer = (instance, td, row, col, prop, value, cellProperties) => {
            if (this.containerNameControlledList.has(value)) {
                td.className = 'custom-row-text-required';
            } else {
                td.style.background = this.getContainerColor(instance.getDataAtCell(row, col - 1), value);
            }
            td.innerHTML = value;
        };

        const containerTypeParameterRenderer = (instance, td, row, col, prop, value, cellProperties) => {
            if (this.isContainerTypeValid(value) == false) {
                td.className = 'custom-row-text-required';
            }
            td.innerHTML = value;
        };

        const samplePositionParameterRenderer = (instance, td, row, col, prop, value, cellProperties) => {
            const rowContainerType = instance.getSourceDataAtCell(row, this.CONTAINERTYPE_INDEX);
            if (!this.isSamplePositionValid(rowContainerType, value)) {
                td.className = 'custom-row-text-required';
            }
            td.innerHTML = value;
        };

        return [
            { text: 'Dewar <br /> Name', id: 'parcel', column: { width: 80, renderer: parcelDisplayCell } },
            { text: 'Container <br /> Name', id: 'containerCode', column: { width: 80, renderer: containerNameParameterRenderer } },
            {
                text: 'Container <br />Type', id: 'containerType', column: {
                    width: 80,
                    type: 'dropdown',
                    source: this._getContainerTypeControlledListNames(),
                    renderer: containerTypeParameterRenderer
                }
            },
            { text: 'Position', id: 'position', column: { width: 20, renderer: samplePositionParameterRenderer } },
            {
                text: 'Protein <br />Acronym', id: 'Protein Acronym', column: {
                    width: 80,
                    type: 'autocomplete',
                    filter: 'true',
                    renderer: proteinParameterRenderer,
                    source: this.getAcronyms(true)
                }
            },
            { text: 'Sample <br /> Name', id: 'Sample Name', column: { width: 120, renderer: sampleParameterRenderer } },
            { text: 'Pin <br />Barcode', id: 'Pin BarCode', column: { width: 60 } },
            {
                text: 'Space <br />group', id: 'Space Group', column: {
                    width: 40,
                    type: 'dropdown',
                    source: _.concat([''], ExtISPyB.spaceGroups)
                }
            },
            { text: 'a', id: 'a', column: { width: 25, renderer: numericParameterRenderer } },
            { text: 'b', id: 'b', column: { width: 25, renderer: numericParameterRenderer } },
            { text: 'c', id: 'c', column: { width: 25, renderer: numericParameterRenderer } },
            { text: '&alpha;', id: 'alpha', column: { width: 25, renderer: numericParameterRenderer } },
            { text: '&beta;', id: 'beta', column: { width: 25, renderer: numericParameterRenderer } },
            { text: '&gamma;', id: 'gamma', column: { width: 25, renderer: numericParameterRenderer } },
            {
                text: 'Exp.<br /> Type', id: 'experimentKind', column: {
                    width: 90,
                    type: 'dropdown',
                    source: ['Default', 'OSC']
                }
            },
            { text: 'Aimed <br />Resolution', id: 'Aimed Resolution', column: { width: 60, renderer: numericParameterRenderer } },
            { text: 'Required <br />Resolution', id: 'Required Resolution', column: { width: 60, renderer: numericParameterRenderer } },
            { text: 'Beam <br />Diameter', id: 'Beam Diameter', column: { width: 60, renderer: numericParameterRenderer } },
            { text: 'Number of<br /> positions', id: 'Number Of positions', column: { width: 60, renderer: numericParameterRenderer } },
            { text: 'Aimed <br /> Multiplicity', id: 'Aimed Multiplicity', column: { width: 60, renderer: numericParameterRenderer } },
            { text: 'Aimed <br /> Completeness', id: 'Aimed Completeness', column: { width: 80, renderer: numericParameterRenderer } },
            {
                text: 'Forced <br /> SPG', id: 'forcedSpaceGroup', column: {
                    width: 60,
                    type: 'dropdown',
                    source: _.concat([''], ExtISPyB.spaceGroups)
                }
            },
            { text: 'Radiation <br /> Sensitivity', id: 'Radiation Sensitivity', column: { width: 60, renderer: numericParameterRenderer } },
            { text: 'SMILES', id: 'Smiles', column: { width: 60 } },
            { text: 'Tot Rot. <br />Angle', id: 'axisRange', column: { width: 60, renderer: numericParameterRenderer } },
            { text: 'Min Osc. <br />Angle', id: 'minOscWidth', column: { width: 60, renderer: numericParameterRenderer } },
            { text: 'Observed <br />Resolution', id: 'Observed Resolution', column: { width: 60, renderer: numericParameterRenderer } },
            { text: 'Comments', id: 'Comments', column: { width: 200 } }
        ];
    }
}

window.CSVContainerSpreadSheet = CSVContainerSpreadSheet;
