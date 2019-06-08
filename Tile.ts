import { TileType } from "./TileType";

class Tile {
  x: number;
  y: number;
  selected: boolean;
  type: string;
  [key: number]: Tile;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.selected = false;
    this.type = TileType.Open;
  }
}

export default Tile;