import { bearing, haversine, latLngToXy, turnLabel, xyToLatLng } from '../utils/geo'
import { getPoi } from './pois'
import { GRID_H, GRID_W, WALK_CELLS } from './roads'

const walk = new Set(WALK_CELLS)
const N8 = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
]

function idx(x, y) {
  return y * GRID_W + x
}

function cellXY(i) {
  return [i % GRID_W, Math.floor(i / GRID_W)]
}

function cellToLatLng(x, y) {
  return xyToLatLng(x / (GRID_W - 1), y / (GRID_H - 1))
}

function snapCell(gx, gy) {
  const clampedX = Math.max(0, Math.min(GRID_W - 1, Math.round(gx)))
  const clampedY = Math.max(0, Math.min(GRID_H - 1, Math.round(gy)))
  if (walk.has(idx(clampedX, clampedY))) return [clampedX, clampedY]
  let best = [clampedX, clampedY]
  let bestD = Infinity
  for (const cell of WALK_CELLS) {
    const [x, y] = cellXY(cell)
    const d = (x - clampedX) * (x - clampedX) + (y - clampedY) * (y - clampedY)
    if (d < bestD) {
      bestD = d
      best = [x, y]
    }
  }
  return best
}

export function snapToRoad(point) {
  const { x, y } = point.x != null ? point : latLngToXy(point)
  const [cx, cy] = snapCell(x * (GRID_W - 1), y * (GRID_H - 1))
  return { ...cellToLatLng(cx, cy), cell: [cx, cy] }
}

function astar(start, goal) {
  const startI = idx(start[0], start[1])
  const goalI = idx(goal[0], goal[1])
  if (!walk.has(startI) || !walk.has(goalI)) return null

  const came = new Map()
  const gScore = new Map([[startI, 0]])
  const open = [startI]
  const inOpen = new Set([startI])

  while (open.length) {
    let bestAt = 0
    let bestF = Infinity
    for (let i = 0; i < open.length; i++) {
      const id = open[i]
      const [x, y] = cellXY(id)
      const f = (gScore.get(id) || 1e15) + Math.hypot(x - goal[0], y - goal[1])
      if (f < bestF) {
        bestF = f
        bestAt = i
      }
    }
    const current = open.splice(bestAt, 1)[0]
    inOpen.delete(current)
    if (current === goalI) {
      const path = [current]
      let cur = current
      while (came.has(cur)) {
        cur = came.get(cur)
        path.push(cur)
      }
      path.reverse()
      return path.map(cellXY)
    }

    const [x, y] = cellXY(current)
    for (const [dx, dy] of N8) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= GRID_W || ny >= GRID_H) continue
      const ni = idx(nx, ny)
      if (!walk.has(ni)) continue
      const step = dx && dy ? 1.414 : 1
      const tentative = (gScore.get(current) || 1e15) + step
      if (tentative < (gScore.get(ni) ?? 1e15)) {
        came.set(ni, current)
        gScore.set(ni, tentative)
        if (!inOpen.has(ni)) {
          open.push(ni)
          inOpen.add(ni)
        }
      }
    }
  }
  return null
}

function simplify(cells) {
  if (cells.length < 3) return cells
  const out = [cells[0]]
  for (let i = 1; i < cells.length - 1; i++) {
    const [ax, ay] = out[out.length - 1]
    const [bx, by] = cells[i]
    const [cx, cy] = cells[i + 1]
    if ((bx - ax) * (cy - by) !== (by - ay) * (cx - bx)) out.push(cells[i])
  }
  out.push(cells[cells.length - 1])
  return out
}

export function buildRoute(fromPoint, destPoiId) {
  const dest = getPoi(destPoiId)
  if (!fromPoint || !dest) return null

  const start = snapToRoad(fromPoint)
  const end = snapToRoad(dest)
  const cells = astar(start.cell, end.cell)
  if (!cells) return null

  const kept = simplify(cells)
  const mid = kept.map(([x, y]) => cellToLatLng(x, y))
  const points = [fromPoint, ...mid, dest]

  let distance = 0
  for (let i = 1; i < points.length; i++) distance += haversine(points[i - 1], points[i])

  return { points, distance, dest, cells: kept }
}

export function nextInstruction(user, routePoints) {
  if (!user || !routePoints || routePoints.length < 2) {
    return { text: '正在规划路线', remain: 0, nextTurn: '', nextTurnDist: 0 }
  }

  let nearest = 0
  let nearestD = Infinity
  for (let i = 0; i < routePoints.length; i++) {
    const d = haversine(user, routePoints[i])
    if (d < nearestD) {
      nearestD = d
      nearest = i
    }
  }

  const remainParts = [haversine(user, routePoints[Math.min(nearest + 1, routePoints.length - 1)])]
  for (let i = nearest + 1; i < routePoints.length - 1; i++) {
    remainParts.push(haversine(routePoints[i], routePoints[i + 1]))
  }
  const remain = remainParts.reduce((s, n) => s + n, 0)
  const brg = bearing(user, routePoints[Math.min(routePoints.length - 1, nearest + 1)])

  let turn = '直行'
  let turnAt = remain
  for (let i = Math.max(1, nearest); i < routePoints.length - 1; i++) {
    const inB = bearing(routePoints[i - 1], routePoints[i])
    const outB = bearing(routePoints[i], routePoints[i + 1])
    const label = turnLabel(inB, outB)
    if (label !== '直行') {
      turn = label
      turnAt = haversine(user, routePoints[i])
      break
    }
  }

  const nearEnd = remain < 35
  const text = nearEnd
    ? '即将到达目的地'
    : turn === '直行'
      ? `沿路向前约${Math.round(Math.max(remain, 10))}米`
      : `前方${Math.max(10, Math.round(turnAt))}米${turn}`

  return {
    text,
    remain,
    bearing: brg,
    nextTurn: turn,
    nextTurnDist: turnAt,
    arrived: remain < 28 && nearestD < 40,
  }
}
