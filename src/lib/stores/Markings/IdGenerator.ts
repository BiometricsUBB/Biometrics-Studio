export class IDGenerator {
    public static initialValue = 1;

    private currentId: number;

    constructor() {
        this.currentId = IDGenerator.initialValue;
    }

    generateId() {
        this.currentId += 1;
        return this.currentId;
    }

    setId(value: number) {
        this.currentId = value;
    }

    getCurrentId() {
        return this.currentId;
    }
}
