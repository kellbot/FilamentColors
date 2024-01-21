class TinyStore {
    constructor({autoincrement = true}) {
        this.autoincrement = autoincrement,
        this.data = {};
        this.nextIndex = 1;
    }

    add(records) {
        // Adding multiple
        if (records.length) {

        } else {
            this.addSingle(records);
        }


    }

    addSingle(record) {
        if (this.autoincrement && !record.id) {
            record.id = this.nextIndex;
        }
        this.data[record.id] = record;
        
        this.nextIndex = this.findNextIndex();
           
    }

    findNextIndex() {
        let start = this.nextIndex + 1;
        let foundIndex = false;
        while (!foundIndex) {

            if (!(start in this.data)) {
                foundIndex = start;
            }
        }
        return start;
    }

    import(data) {
        if (data)
            this.data = data;
    }

    export() {
        return this.data;
    }
}