class gameAssets{

    stages = {};
    items = {};
    itemUnlocks = {};
    records = {};

    constructor(stages,items,itemUnlocks,records) {
        this.stages = stages;
        this.items = items;
        this.itemUnlocks = itemUnlocks;
        this.records = records;
    }

    async update(newRecords) {      
        this.records = newRecords;       
    }
}

export default gameAssets;