import Tile from "./Tile";
import { Identifiable } from "./Identifiable";
import { Measurable } from "./Measurable";

export class PathNode implements Identifiable, Measurable {
  tile: Tile;
  parent: PathNode | null;
  fValue: number;
  hValue: number;

  constructor(tile: Tile, parent: PathNode | null, fValue: number, hValue: number) {
    this.tile = tile;
    this.parent = parent;
    this.fValue = fValue;
    this.hValue = hValue;
  }

  getKey() {
    return `${this.tile.x};${this.tile.y}`;
  }

  getMeasure() {
    return this.fValue + this.hValue;
  }
}