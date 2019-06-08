import { TileType } from "./TileType";
import Tile from "./Tile";

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

canvas.width = 600;
canvas.height = 600;

interface PathNode {
  tile: Tile;
  parent: PathNode | null;
  fValue: number;
}

document.body.appendChild(canvas);
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

function draw(tiles: Tile[][]) {
  context.fillStyle = '#FFFFFF';
  context.fillRect(0,0,canvas.width, canvas.height);
  context.fillStyle = '#000000';
  for (let x = 0; x < tiles.length; x++) {
    for (let y = 0; y < tiles[x].length;y++) {
      if (tiles[x][y].selected) {
        pushStrokeStyle(selectedColor);
        context.strokeRect(x*tileSize, y*tileSize, tileSize, tileSize);
        popStrokeStyle();
      } else {
        context.strokeRect(x*tileSize, y*tileSize, tileSize, tileSize);
      }

      pushFillStyle(TypeColors[tiles[x][y].type]);
      context.fillRect(x*tileSize + 1, y*tileSize + 1, tileSize-2, tileSize-2);
      popFillStyle();
    }
  }
  drawPath(currentPath);
}

let currentPath = Array<Tile>();
function simplePathFind(start: Tile, end: Tile) {
  const path = [];
  path.push(start);

  let point = { x: start.x, y: start.y };
  while (point.x !== end.x || point.y !== end.y) {
    if (point.x > end.x) {
      point.x--
    }
    if (point.x < end.x) {
      point.x++;
    }

    if (point.y > end.y) {
      point.y--;
    }
    if (point.y < end.y) {
      point.y++;
    }
    path.push(tiles[point.x][point.y]);
  }

  return path.map(p => {
    return { x: p.x * tileSize + tileSize / 2, y: p.y * tileSize + tileSize / 2 };
  });
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

function aStar(start: Tile, goal: Tile) {
  const startPathNode = { tile: start, parent: null, fValue: 0 } as PathNode;
  let open = [...getNeighbours(start).map(tile => ({ tile, parent: startPathNode, fValue: 0}))];
  const closed = [startPathNode];

  const f = (tile: Tile, goal: Tile) => {
    return Math.abs(tile.x - goal.x) + Math.abs(tile.y - goal.y); 
  }

  const nodeWithMinimalF = (list: PathNode[], goal: Tile): PathNode => {
    const min = list.reduce((min: PathNode, curr: PathNode) => {
      const distance = f(curr.tile, goal);
      if (distance < min.fValue) {
        min = { fValue: distance, tile: curr.tile, parent: curr.parent };
      }
      return min;
    }, { ...list[0], fValue: f(list[0].tile, goal) });
    return min;
  }

  const tileToPathNode = (tile: Tile, parent: PathNode, fValue: number): PathNode => ({ tile, parent, fValue }); 

  const getSuccessors = (pathNode: PathNode): Array<PathNode> => {
    const neighbours = getNeighbours(pathNode.tile)
      .filter(node => node.type !== TileType.Block);

    return neighbours.map(tile => tileToPathNode(tile, pathNode, pathNode.fValue));
  }


  while (open.length > 0) {
    const minF = nodeWithMinimalF(open, goal);
    open = open.filter(pathNode => !(pathNode.tile.x === minF.tile.x && pathNode.tile.y === minF.tile.y));
    
    const successors = getSuccessors(minF);
    
    for(let i=0;i < successors.length; i++) {
      
      const successor = successors[i];
      if (successor.tile.x === goal.x && successor.tile.y == goal.y) {
        const path = Array<Tile>();
        tracePath(successor, path);

        return path.map(tile => {
          return { x: tile.x * tileSize + tileSize / 2, y: tile.y * tileSize + tileSize / 2 };
        });
      }

      const samePositionOpen = open.find(n => n.tile.x === successor.tile.x && n.tile.y === successor.tile.y);
      if (samePositionOpen && samePositionOpen.fValue < successor.fValue) continue;

      const samePositionClosed = closed.find(n => n.tile.x === successor.tile.x && n.tile.y === successor.tile.y);
      if (samePositionClosed && samePositionClosed.fValue < successor.fValue) continue;

      open.push(successor);
    }
    closed.push(minF);
  }
}

const tracePath = (node: PathNode, path: Array<Tile>) => {
  if (!node.parent) {
    console.log(`X: ${node.tile.x}, Y: ${node.tile.y}`);
    path.push(node.tile);
    return;
  }
  path.push();
  console.log(`X: ${node.tile.x}, Y: ${node.tile.y}`);
  tracePath(node.parent, path);
}

const drawPath = (path: Array<Tile>) => {
  context.strokeStyle = '#000000';
  context.beginPath();
  path.forEach((p, i) => {
    if (i === 0) {
      context.moveTo(p.x, p.y);
    } else {
      context.lineTo(p.x, p.y);
    }
  });
  context.stroke();
}

//  create grid
draw(tiles);

canvas.addEventListener('click', (event) => {
  const { layerX, layerY } = event;
  const column = tiles[Math.floor(layerX/tileSize)];
  if (!column) return;

  const tile = column[Math.floor(layerY/tileSize)];
  if (!tile) return;

  tile.selected = !tile.selected;
  console.log(JSON.stringify(tile));
  draw(tiles);
});

canvas.addEventListener('contextmenu', event => {
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
    // currentPath = simplePathFind(entityTile, goalTile);
    aStar(entityTile, goalTile);
  }

  draw(tiles);
  return false;
}, false);

window.addEventListener('keydown', (event) => {
  if (event.key === 'b') {
    selectedTileType = TileType.Block;
  }
  if (event.key === 'e') {
    selectedTileType = TileType.Entity;
  }
  if (event.key === 'g') {
    selectedTileType = TileType.Goal;
  }
  if (event.key === 'o') {
    selectedTileType = TileType.Open;
  }
});