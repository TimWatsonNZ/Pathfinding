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
let goalTile = null;
let entityTile = null;

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
  drawPath(currentPath);
}

let currentPath = [];
function simplePathFind(start, end) {
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

function getNeighbours(tile) {
  const directions = [
    { x: -1, y: -1}, { x: 0, y: -1},{ x: 1, y: -1},
    { x: -1, y: 0},                 { x: 1, y: 0},
    { x: -1, y: 1},  { x: 0, y: 1}, { x: 1, y: 1},
  ];
  return directions.map(d => ({ x: d.x + tile.x, y: d.y + tile.y }))
    .filter(n => n.x >= 0 && n.y >= 0 && n.x < gridSize && n.y < gridSize);
}

function aStar(start, goal) {
  let open = [...getNeighbours(start).map(node => ({ node, parent: start}))];
  const closed = [{ node: { x: start.x, y: start. y}}];

  const f = (node, goal) => {
    return Math.abs(node.x - goal.x) + Math.abs(node.y - goal.y); 
  }

  const nodeWithMinimalF = (list, goal) => {
    const min = list.reduce((min, curr) => {
      const distance = f(curr.node, goal);
      if (distance < min.distance) {
        min = { distance, node: curr };
      }
      return min;
    }, { node: list[0], distance: f(list[0].node, goal)});
    return min;
  }

  while (open.length > 0) {
    const minF = nodeWithMinimalF(open, goal);
    open = open.filter(n => !(n.x === minF.node.x && n.y === minF.node.y));
    const successors = getNeighbours(minF.node.node).map(node => ({ node, parent: minF.node }));
    
    for(let i=0;i < successors.length; i++) {
      const s = successors[i];
      if (s.node.x === goal.x && s.node.y == goal.y) {
        const path = [];
        tracePath(s, path);
        return path.map(p => {
          return { x: p.x * tileSize + tileSize / 2, y: p.y * tileSize + tileSize / 2 };
        });
      }
      const samePositionOpen = open.filter(n => n.node.x === s.node.x && n.node.y === s.node.y);
      if (samePositionOpen && samePositionOpen.distance < s.distance) continue;

      const samePositionClosed = closed.filter(n => n.node.x === s.node.x && n.node.y === s.node.y);
      if (samePositionClosed && samePositionClosed.distance < s.distance) continue;

      open.push(s);
    }
    closed.push(minF);
  }
}

const tracePath = (node, path) => {
  if (!node.parent) {
    console.log(`X: ${node.x}, Y: ${node.y}`);
    path.push({ x: node.x, y: node.y });
    return;
  }
  path.push({ x: node.node.x, y: node.node.y });
  console.log(`X: ${node.node.x}, Y: ${node.node.y}`);
  tracePath(node.parent, path);
}

const drawPath = (path) => {
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
  if (selectedTileType === tileTypes.Goal) {
    if (goalTile) goalTile.type = tileTypes.Open;
    goalTile = tile;
  }
  if (selectedTileType === tileTypes.Entity) {
    if (entityTile) entityTile.type = tileTypes.Open;
    entityTile = tile;
  }

  if (entityTile && goalTile) {
    // currentPath = simplePathFind(entityTile, goalTile);
    currentPath = aStar(entityTile, goalTile);
  }

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