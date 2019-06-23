import { TileType } from "./TileType";
import Tile from "./Tile";

const canvas = document.querySelector('#canvas') as any;
const context = canvas.getContext('2d');

canvas.width = 600;
canvas.height = 600;

interface PathNode {
  tile: Tile;
  parent: PathNode | null;
  fValue: number;
  hValue: number;
}

const fillStyleStack = Array<string>();
const strokeStyleStack = Array<string>();

const pushFillStyle = (style: string) => {
  fillStyleStack.push(style);
  context.fillStyle = style;
}

const popFillStyle = () => {
  fillStyleStack.pop();
  context.fillStyle = fillStyleStack[fillStyleStack.length - 1] || '#FFFFFF';
}

const pushStrokeStyle = (style: string) => {
  strokeStyleStack.push(style);
  context.strokeStyle = style;
}

const popStrokeStyle = () => {
  strokeStyleStack.pop();
  context.strokeStyle = strokeStyleStack[strokeStyleStack.length - 1] || '#000000';
}

enum TypeColors {
  Goal = '#FF0000', Block = '#000000', Open = '#FFFFFF', Entity = '#00FF00'
}
let selectedTileType = TileType.Block;

let debug = true;

const gridSize = 20;
const tileSize = 20;
const tiles = Array<Array<Tile>>();
for(let x = 0;x < gridSize;x++) {
  const column = [];
  for (let y=0;y < gridSize;y++) {
    column[y] = { x, y, selected: false, type: TileType.Open };
  }
  tiles.push(column);
}
const selectedColor = '#0000FF';
let goalTile: Tile | null = null;
let entityTile: Tile | null = null;

class Point {
  public x: number;
  public y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

interface ScenarioTile { x: number, y: number, tileType: TileType };

function loadScenario(start: Point, scenarioTiles: Array<Array<string>>) {
  scenarioTiles.forEach((row, y) => {
    row.forEach((tile, x) => {
      switch(tile) {
        case 'o': {
          tiles[x + start.x][y + start.y].type = TileType.Open;
          break;
        }
        case 'e': {
          entityTile = tiles[x + start.x][y + start.y];
          tiles[x + start.x][y + start.y].type = TileType.Entity;
          break;
        }
        case 'g': {
          tiles[x + start.x][y + start.y].type = TileType.Goal;
          goalTile = tiles[x + start.x][y + start.y];
          break;
        }
        case 'b': {
          tiles[x + start.x][y + start.y].type = TileType.Block;
          break;
        }
      }
    });
  });
}
let currentPath = Array<Tile>();

function loadScenario1() {
  const startPoint = new Point(0, 0);
  const tiles = [
    ['o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','g',],
    ['o','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','o',],
    ['o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','b','o',],
    ['o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','b','o',],
    ['o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','b','o',],
    ['o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','b','o',],
    ['o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','b','o',],
    ['o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','b','o',],
    ['o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','b','o',],
    ['o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','b','o',],
    ['o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','b','o',],
    ['o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','b','o',],
    ['o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','b','o',],
    ['o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','b','o',],
    ['o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','b','o',],
    ['o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','b','o',],
    ['o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','b','o',],
    ['o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','b','o',],
    ['o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','b','o',],
    ['e','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o',],
  ];
  loadScenario(startPoint, tiles);
}
loadScenario1();

//  create grid
draw(tiles);

function drawPath (path: Array<Tile>) {
  if (!path) return;
  context.strokeStyle = '#000000';
  context.beginPath();
  path.forEach((p, i) => {
    const point = { x: p.x * tileSize + tileSize / 2, y: p.y * tileSize + tileSize / 2 };

    if (i === 0) {
      context.moveTo(point.x, point.y);
    } else {
      context.lineTo(point.x, point.y);
    }
  });
  context.stroke();
}

function draw(tiles: Tile[][]) {
  context.fillStyle = '#FFFFFF';
  context.fillRect(0,0,canvas.width, canvas.height);
  context.fillStyle = '#000000';
  for (let x = 0; x < tiles.length; x++) {
    for (let y = 0; y < tiles[x].length;y++) {
      const tile = tiles[x][y];
      if (tile.selected) {
        pushStrokeStyle(selectedColor);
        context.strokeRect(x*tileSize, y*tileSize, tileSize, tileSize);
        popStrokeStyle();
      } else {
        context.strokeRect(x*tileSize, y*tileSize, tileSize, tileSize);
      }

      if (tile.inClosed) {
        pushFillStyle('mediumblue');
        context.fillRect(x*tileSize + 1, y*tileSize + 1, tileSize-2, tileSize-2);
        popFillStyle();
      } else
      if (tile.inOpen) {
        pushFillStyle('cornflowerblue');
        context.fillRect(x*tileSize + 1, y*tileSize + 1, tileSize-2, tileSize-2);
        popFillStyle();
      } else {
        pushFillStyle(TypeColors[tile.type]);
        context.fillRect(x*tileSize + 1, y*tileSize + 1, tileSize-2, tileSize-2);
        popFillStyle();
      }
    }
  }
  drawPath(currentPath);
}

function getNeighbours(tile: Tile) {
  const directions = [
    { x: -1, y: -1}, { x: 0, y: -1},{ x: 1, y: -1},
    { x: -1, y: 0},                 { x: 1, y: 0},
    { x: -1, y: 1},  { x: 0, y: 1}, { x: 1, y: 1},
  ];
  return directions.map(d => ({ x: d.x + tile.x, y: d.y + tile.y }))
    .filter(n => n.x >= 0 && n.y >= 0 && n.x < gridSize && n.y < gridSize)
    .map(x => tiles[x.x][x.y]);
}

const costToGoal = (tile: Tile, goal: Tile) => {
  return Math.sqrt(Math.pow(Math.abs(tile.x - goal.x),2) + Math.pow(Math.abs(tile.y - goal.y), 2)); 
}

const costFromStart = (tile: Tile, start: Tile) => {
  return Math.sqrt(Math.pow(Math.abs(tile.x - start.x), 2) + Math.pow(Math.abs(tile.y - start.y),2)); 
}

const findCheapestNode = (list: PathNode[], goal: Tile, start: Tile): PathNode => {
  const min = list.reduce((min: PathNode, curr: PathNode) => {
    const distanceToGoal = costToGoal(curr.tile, goal);
    const distanceToStart = costFromStart(curr.tile, start);
    if ((distanceToGoal + distanceToStart) < min.fValue) {
      min = { fValue: distanceToGoal, hValue: distanceToStart, tile: curr.tile, parent: curr.parent };
    }
    return min;
  }, { ...list[0], fValue: costToGoal(list[0].tile, goal), hValue: costFromStart(list[0].tile, start) });
  return min;
}

const tileToPathNode = (tile: Tile, parent: PathNode, fValue: number, hValue: number): PathNode => ({ tile, parent, fValue, hValue }); 

const getSuccessors = (pathNode: PathNode): Array<PathNode> => {
  const neighbours = getNeighbours(pathNode.tile)
    .filter(node => node.type !== TileType.Block);

  return neighbours.map(tile => tileToPathNode(tile, pathNode, pathNode.fValue, pathNode.hValue));
}

interface Identifiable<T> {
  getKey(): string;
}

class Collection<T extends Identifiable<T>> {
  hashSet: any; //  will change to prio queue
  array: Array<T>;

  constructor() {
    this.hashSet = {};
    this.array = [];
  }

  add(value: T) {
    this.array.push(value);
    this.hashSet[value.getKey()] = value;
  }

  test(value: T) {
    return !!this.hashSet[value.getKey()];
  }

  remove(value: T) {
    this.array = this.array.filter(x => x.getKey() !== value.getKey());
  }
}

function aStar(start: Tile, goal: Tile): Array<Tile> {
  console.time('aStar');

  const startPathNode = { tile: start, parent: null, fValue: 0, hValue: 0 } as PathNode;
  let open = [...getSuccessors(startPathNode)];
  const closed = [startPathNode];
  
  tiles.forEach(column => {
    column.forEach(tile => {
      if (tile.inOpen) {
        tile.inOpen = false;
      }
      if (tile.inClosed) {
        tile.inClosed = false;
      }
    })
  })
  
  while (open.length > 0) {
    const cheapestNode = findCheapestNode(open, goal, start);

    open = open.filter(pathNode => !(pathNode.tile.x === cheapestNode.tile.x && pathNode.tile.y === cheapestNode.tile.y));
    
    const successors = getSuccessors(cheapestNode);
    
    for(let i=0;i < successors.length; i++) {
      
      const successor = successors[i];
      if (successor.tile.x === goal.x && successor.tile.y == goal.y) {
        const path = Array<Tile>();
        
        if (debug) {
          open.forEach(pathNode => pathNode.tile.inOpen = true);
          closed.forEach(pathNode => pathNode.tile.inClosed = true);
        }
        tracePath(successor, path);

        console.timeEnd('aStar');
        return path;
      }

      const samePositionOpen = open.find(n => n.tile.x === successor.tile.x && n.tile.y === successor.tile.y);
      if (samePositionOpen && samePositionOpen.fValue <= successor.fValue) {
        continue;
      }

      const samePositionClosed = closed.find(n => n.tile.x === successor.tile.x && n.tile.y === successor.tile.y);
      if (samePositionClosed && samePositionClosed.fValue <= successor.fValue) {
        continue;
      }

      open.push(successor);
    }
    closed.push(cheapestNode);
  }
}

const tracePath = (node: PathNode, path: Array<Tile>) => {
  path.push(node.tile);
  if (!node.parent) {
    return;
  }

  tracePath(node.parent, path);
}


canvas.addEventListener('click', (event: MouseEvent) => {
  const { layerX, layerY } = event;
  const column = tiles[Math.floor(layerX/tileSize)];
  if (!column) return;

  const tile = column[Math.floor(layerY/tileSize)];
  if (!tile) return;

  tile.selected = !tile.selected;

  draw(tiles);
});

canvas.addEventListener('contextmenu', (event: MouseEvent) => {
  event.preventDefault();
  const { layerX, layerY } = event;
  const column = tiles[Math.floor(layerX/tileSize)];
  if (!column) return;

  const tile = column[Math.floor(layerY/tileSize)];
  if (!tile) return;

  if (selectedTileType === TileType.Goal) {
    if (goalTile) goalTile.type = TileType.Open;
    goalTile = tile;
  }
  if (selectedTileType === TileType.Entity) {
    if (entityTile) entityTile.type = TileType.Open;
    entityTile = tile;
  }
  tile.type = selectedTileType;

  if (entityTile && goalTile) {
    currentPath = aStar(entityTile, goalTile);
  }

  draw(tiles);
  return false;
}, false);

window.addEventListener('keydown', (event) => {
  if (event.key === 'b') {
    selectedTileType = TileType.Block;
    (document.querySelector("#radioBlock") as any).checked = true;
  }
  if (event.key === 'e') {
    selectedTileType = TileType.Entity;
    (document.querySelector("#radioEntity") as any).checked = true;
  }
  if (event.key === 'g') {
    selectedTileType = TileType.Goal;
    (document.querySelector("#radioGoal") as any).checked = true;
  }
  if (event.key === 'o') {
    selectedTileType = TileType.Open;
    (document.querySelector("#radioOpen") as any).checked = true;
  }
});

document.querySelectorAll("input[name='tileType']").forEach(element => element.addEventListener('click', (event) => {
  const selected = document.querySelector("input[name='tileType']:checked");
  
  switch (selected.getAttribute('value')) {
    case 'block': {
      selectedTileType = TileType.Block;
      return;
    }
    case 'entity': {
      selectedTileType = TileType.Entity;
      return;
    }
    case 'goal': {
      selectedTileType = TileType.Goal;
      return;
    }
    case 'open': {
      selectedTileType = TileType.Open;
      return;
  }
    default:
      return;
  }
}));