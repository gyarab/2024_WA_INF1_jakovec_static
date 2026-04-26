export class Area {
    /** 
    @param {string} type - AREATYPES.[area type]
    @param {number} x - x coordinate(left upper corner)
    @param {number} y - y coordinate(left upper corner)  
    @param {number} sizeX - x size of the city  
    @param {number} sizeY - x size of the city
    @param {string} name - self explanatory
    @param {number} peeps - population
    @param {string} description - self explanatory
    @param {string} building - which char is here
    */
    constructor(type,x,y,sizeX,sizeY,name, peeps, description, building) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.name = name;
        this.peeps = peeps;
        this.description = description;
        this.building = building;
    }
}