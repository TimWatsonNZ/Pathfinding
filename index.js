const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

canvas.width = 600;
canvas.height = 600;

document.body.appendChild(canvas);
context.pushFillStyle = (style) => {
  context.fillStyleStack = context.fillStyleStack || [];
  context.fillStyleStack.push(style);
  context.fillStyle = style;
}

context.popFillStyle = () => {
  context.fillStyleStack = context.fillStyleStack || [];
  context.fillStyleStack.pop();
  context.fillStyle = context.fillStyleStack[context.fillStyleStack.length - 1] || '#FFFFFF';
}

context.pushStrokeStyle = (style) => {
  context.strokeStyleStack = context.strokeStyleStack || [];
  context.strokeStyleStack.push(style);
  context.strokeStyle = style;
}

context.popStrokeStyle = () => {
  context.strokeStyleStack = context.strokeStyleStack || [];
  context.strokeStyleStack.pop();
  context.strokeStyle = context.strokeStyleStack[context.strokeStyleStack.length - 1] || '#000000';
}

const tileTypes = { Goal: 'Goal', Block: 'Block', Open: 'Open', Entity: 'Entity' }
const typeColors = {
  Goal: '#FF0000', Block: '#000000', Open: '#FFFFFF', Entity: '#00FF00'
}
let selectedTileType = tileTypes.Block;

const gridSize = 20;
const tileSize = 20;
const tiles = [];
for(let x = 0;x < gridSize;x++) {
  const column = [];
  for (let y=0;y < gridSize;y++) {
    column[y] = { x, y, selected: false, type: tileTypes.Open };
  }
  tiles.push(column);
}
const selectedColor = '#0000FF';

function draw(tiles) {
  context.fillStyle = '#FFFFFF';
  context.fillRect(0,0,canvas.width, canvas.height);
  context.fillStyle = '#000000';
  for (let x = 0; x < tiles.length; x++) {
    for (let y = 0; y < tiles[x].length;y++) {
      if (tiles[x][y].selected) {
        context.pushStrokeStyle(selectedColor);
        context.strokeRect(x*tileSize, y*tileSize, tileSize, tileSize);
        context.popStrokeStyle();
      } else {
        context.strokeRect(x*tileSize, y*tileSize, tileSize, tileSize);
      }

      context.pushFillStyle(typeColors[tiles[x][y].type]);
      context.fillRect(x*tileSize + 1, y*tileSize + 1, tileSize-2, tileSize-2);
      context.popFillStyle();
    }
  }
}

let currentPath = [];
function pathFind(start, end) {
  const path = [];
  path.push(start);
  let node = start;

  while (node.x !== end.x && node.y !== end.y) {
    
  }
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
  draw(tiles);
});

canvas.addEventListener('contextmenu', event => {
  event.preventDefault();
  const { layerX, layerY } = event;
  const column = tiles[Math.floor(layerX/tileSize)];
  if (!column) return;

  const tile = column[Math.floor(layerY/tileSize)];
  if (!tile) return;

  tile.type = selectedTileType;
  draw(tiles);
  return false;
}, false);

window.addEventListener('keydown', (event) => {
  if (event.key === 'b') {
    selectedTileType = tileTypes.Block;
  }
  if (event.key === 'e') {
    selectedTileType = tileTypes.Entity;
  }
  if (event.key === 'g') {
    selectedTileType = tileTypes.Goal;
  }
  if (event.key === 'o') {
    selectedTileType = tileTypes.Open;
  }
});