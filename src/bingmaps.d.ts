declare namespace Microsoft.Maps {
    export class Map {
      constructor(mapElement: HTMLElement, options?: MapOptions);
  
      entities: EntityCollection; // Add the entities property to the Map class
    }
  
    export interface MapOptions {
      center: Location;
      zoom: number;
    }
  
    export class Location {
      constructor(latitude: number, longitude: number);
    }
  
    export class Pushpin {
      constructor(location: Location, options?: PushpinOptions);
    }
  
    export interface PushpinOptions {
      color?: string;
      icon?: string;
    }
  
    // Add the EntityCollection interface
    interface EntityCollection {
      push(entity: MapEntity): void;
    }
  
    // Add the MapEntity interface (you can add more properties as needed)
    interface MapEntity {
      // Add your desired properties here
    }
  }