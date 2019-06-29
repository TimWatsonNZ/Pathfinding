import { TileType } from "./TileType";
import Tile from "./Tile";
import { PathNode } from "./PathNode";
import { aStar } from "./aStar";
import { Point } from "./Point";

const canvas = document.querySelector('#canvas') as any;
const context = canvas.getContext('2d');

canvas.width = 600;
canvas.height = 600;


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
let currentPath = Array<PathNode>();

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

function drawPath (path: Array<PathNode>) {
  if (!path) return;
  context.strokeStyle = '#000000';
  context.beginPath();
  path.forEach((pathNode, i) => {
    const p = pathNode.tile;
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

canvas.addEventListener('click', (event: MouseEvent) => {
  const { layerX, layerY } = event;
  const columnIndex = Math.floor(layerX/tileSize);
  if (!tiles[columnIndex]) return;

  const rowIndex = Math.floor(layerY/tileSize);
  const tile = tiles[columnIndex][rowIndex];
  if (!tile) return;

  tile.selected = !tile.selected;

  const pathNode = currentPath.find(path => path.tile.x === columnIndex && path.tile.y === rowIndex);

  if (pathNode) {
    console.log(pathNode.hValue);
    console.log(pathNode.fValue);
  }

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
    currentPath = aStar(tiles, entityTile, goalTile, true);
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