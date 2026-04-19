class SpreadSheet {
    constructor(args) {
        this.id = BUI.id();
        this.height = 440;
        this.width = 500;
        this.containerType = 'OTHER';

        this.acronyms = undefined;
        this.forceUpdate = false;

        if (args != null) {
            if (args.height != null) this.height = args.height;
            if (args.width != null) this.width = args.width;
            if (args.containerType != null) this.containerType = args.containerType;
            if (args.cells != null) this.cells = args.cells;
        }
    }

    getPanel() {
        this.panel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            items: [{
                html: '<div  style="overflow: auto;overflow-y: hidden; border:1px solid gray;background-color:white;height:100px;"; id="' + this.id + '_samples"; ></div>',
                height: this.height,
                width: this.width,
                autoScroll: true,
                resizable: true
            }]
        });
        return this.panel;
    }

    setLoading(bool) {
        this.panel.setLoading(bool);
    }

    reloadAcronyms() {
        this.forceUpdate = true;
        this.acronyms = null;
        this.acronyms = this.getAcronyms(true);
    }

    getAcronyms(force) {
        if (force != null) {
            this.forceUpdate = force;
        }
        if (this.acronyms == null) {
            this.acronyms = _.map(EXI.proposalManager.getProteins(this.forceUpdate), 'acronym').sort((a, b) => {
                if (a.toLowerCase() < b.toLowerCase()) return -1;
                if (a.toLowerCase() > b.toLowerCase()) return 1;
                return 0;
            });
        }
        return this.acronyms;
    }

    setContainerType(containerType) {
        this.containerType = containerType;
    }

    getHeaderWidth() {
        return _.map(this.getHeader(), 'column.width');
    }

    getHeaderId() {
        return _.map(this.getHeader(), 'id');
    }

    getHeaderText() {
        return _.map(this.getHeader(), 'text');
    }

    getColumns() {
        return _.map(this.getHeader(), 'column');
    }

    loadData(data) {
        this.data = data;
        const container = document.getElementById(this.id + '_samples');
        this.spreadSheet = new Handsontable(container, {
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

    getData() {
        return this.spreadSheet.getData();
    }

    setDataAtCell(rowIndex, columnIndex, value) {
        if ((this.getData()[rowIndex][columnIndex] == null) && (value == '')) {
            return;
        }
        if (this.getData()[rowIndex][columnIndex] == value) {
            return;
        }
        this.spreadSheet.setDataAtCell(rowIndex, columnIndex, value);
    }

    disableAll() {
        this.spreadSheet.updateSettings({ readOnly: true });
    }

    getColumnIndex(colId) {
        return _.findIndex(this.getHeader(), { id: colId });
    }

    updateNumberOfRows(n) {
        if (this.spreadSheet) {
            let data = this.spreadSheet.getData();
            if (data.length < n) {
                for (let i = data.length + 1; i <= n; i++) {
                    data.push([i]);
                }
            } else {
                data = data.slice(0, n);
            }
            this.spreadSheet.loadData(data);
        }
    }

    emptyRow(row) {
        const columnIds = this.getHeaderId();
        for (let i = 1; i < columnIds.length; i++) {
            this.setDataAtCell(row, i, '');
        }
    }
}

window.SpreadSheet = SpreadSheet;
