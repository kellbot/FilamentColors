// Requires either a filamentcolorsxyz ID or a manufacturer and color name
class CollectedFilament {
    constructor(data = {}){
        
        this.xyzid = data.xyzid; // ID from filamentcolors.xyz entry
        this.manufacturerId = data.manufacturerId; // Manufacturer ID
        this.color_name = data.colorName; // String color name

        if (!this.xyzid && !(this.manufacturerId && this.colorName))
            throw new Error('Filament must have either an ID number of manufacturer and name');    
    }
}

class FilamentCollection {
    constructor(saveData) {
        this.filaments = saveData ? saveData : [];
    }

    // (CollectedFilament)
    add(filament) {
        this.filaments.push(filament);

    }



    save(key) {
        const saveObject = {};
        saveObject[key] = this.filaments;

        chrome.storage.sync.set(saveObject).then(() => {
            console.log("Saved");
            console.log(saveObject);
        });
    }

    addByXYZ(id) {
        if (this.includesXYZ(id)) throw new Error ("Filament is aready in collection");

        let filament = new CollectedFilament({xyzid: id});
        this.filaments.push(filament);
    }

    removeByXYZ(id) {
        let remainingFilaments = this.filaments.filter((filament) => {
            
            return filament.xyzid !== id;
        });
        console.log(remainingFilaments);
        this.filaments = remainingFilaments;
    }

    addByMfgAndColor(manufacturerId, colorName){
        let filament = new CollectedFilament({manufacturerId: manufacturerId, colorName: colorName});
        this.filaments.push(filament);
    }

    // Look for a specific filamentcolors item in the collection
    includesXYZ(id) {
        return this.filaments.some(obj => obj.xyzid === id);
    }
}