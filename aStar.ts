import { PathNode } from "./PathNode";
import Tile from "./Tile";
import { TileType } from "./TileType";
import { Collection } from "./Collection";

export function aStar(tiles: Array<Array<Tile>>, start: Tile, goal: Tile, debug?: boolean): Array<Tile> {
  console.time('aStar');

  const startPathNode = new PathNode(start, null, 0, 0);
  let open = new Collection<PathNode>();

  [...getSuccessors(tiles, startPathNode, goal, start)].forEach(pathNode => open.insert(pathNode));
  let closed = new Collection<PathNode>();
  closed.insert(startPathNode);
  
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
  
  while (open.count() > 0) {
    const cheapestNode = open.pop();
    
    const successors = getSuccessors(tiles, cheapestNode, goal, start);
    
    for(let i=0;i < successors.length; i++) {
      
      const successor = successors[i];
      if (successor.tile.x === goal.x && successor.tile.y == goal.y) {
        const path = Array<Tile>();
        
        if (debug) {
          open.toArray().forEach(pathNode => pathNode.tile.inOpen = true);
          closed.toArray().forEach(pathNode => pathNode.tile.inClosed = true);
        }
        tracePath(successor, path);

        console.timeEnd('aStar');
        return path;
      }

      const samePositionOpen = open.find(successor);
      if (samePositionOpen && samePositionOpen.fValue <= successor.fValue) {
        continue;
      }

      const samePositionClosed = closed.find(successor);
      if (samePositionClosed && samePositionClosed.fValue <= successor.fValue) {
        continue;
      }

      open.insert(successor);
    }
    closed.insert(cheapestNode);
  }
}

const getSuccessors = (tiles: Array<Array<Tile>>, pathNode: PathNode, goal: Tile, start: Tile): Array<PathNode> => {
  const neighbours = getNeighbours(tiles, pathNode.tile)
    .filter(node => node.type !== TileType.Block);

  return neighbours.map(tile => {
    const fValue = costToGoal(tile, goal);
    const hValue = costFromStart(tile, start) + pathNode.hValue;
    return new PathNode(tile, pathNode, fValue, hValue)
  });
}

function getNeighbours(tiles: Array<Array<Tile>>, tile: Tile) {
  const directions = [
    { x: -1, y: -1}, { x: 0, y: -1},{ x: 1, y: -1},
    { x: -1, y: 0},                 { x: 1, y: 0},
    { x: -1, y: 1},  { x: 0, y: 1}, { x: 1, y: 1},
  ];
  return directions.map(d => ({ x: d.x + tile.x, y: d.y + tile.y }))
    .filter(n => n.x >= 0 && n.y >= 0 && n.x < tiles.length && n.y < tiles.length)
    .map(x => tiles[x.x][x.y]);
}

const costToGoal = (tile: Tile, goal: Tile) => {
  return Math.sqrt(Math.pow(Math.abs(tile.x - goal.x),2) + Math.pow(Math.abs(tile.y - goal.y), 2)); 
}

const costFromStart = (tile: Tile, start: Tile) => {
  return Math.sqrt(Math.pow(Math.abs(tile.x - start.x), 2) + Math.pow(Math.abs(tile.y - start.y),2)); 
}

const tracePath = (node: PathNode, path: Array<Tile>) => {
  path.push(node.tile);
  if (!node.parent) {
    return;
  }

  tracePath(node.parent, path);
}