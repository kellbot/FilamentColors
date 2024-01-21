class TinyStore {
    constructor({autoincrement = true}) {
        this.autoincrement = autoincrement,
        this.data = {};
        this.nextIndex = 1;
    }

    add(records) {
        // Adding multiple
        if (records.length) {
            let rec = 1;
        } else {
            this.addSingle(records);
        }


    }

    addSingle(record) {
        
        this.nextIndex = this.findNextIndex();
        console.log("NExt index:" + this.nextIndex);
        if (this.autoincrement && !record.id) {
            record.id = this.nextIndex;
            console.log("adding single record" + this.nextIndex);
        }
        this.data[record.id] = record;
        
           
    }

    findNextIndex() {
       
        let start = this.nextIndex + 1;
        let foundIndex = false;
        while (!foundIndex) {

            if (!(start in this.data)) {
                foundIndex = start;
            } else {
                start++;
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