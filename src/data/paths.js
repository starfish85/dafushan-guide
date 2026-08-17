import { haversine, bearing, turnLabel } from '../utils/geo'
import { getPoi, POIS } from './pois'

export const PATH_NODES = Object.fromEntries(
  POIS.map((p) => [p.id, { id: p.id, x: p.x, y: p.y, lat: p.lat, lng: p.lng }]),
)

function edgeKey(a, b) {
  return a < b ? `${a}|${b}` : `${b}|${a}`
}

function buildAdj() {
  const ids = Object.keys(PATH_NODES)
  const pair = new Set()

  const inTree = new Set([ids[0]])
  while (inTree.size < ids.length) {
    let bestD = Infinity
    let bestA
    let bestB
    for (const a of inTree) {
      for (const b of ids) {
        if (inTree.has(b)) continue
        const d = haversine(PATH_NODES[a], PATH_NODES[b])
        if (d < bestD) {
          bestD = d
          bestA = a
          bestB = b
        }
      }
    }
    inTree.add(bestB)
    pair.add(edgeKey(bestA, bestB))
  }

  for (const a of ids) {
    const near = ids
      .filter((b) => b !== a)
      .map((b) => ({ b, d: haversine(PATH_NODES[a], PATH_NODES[b]) }))
      .sort((x, y) => x.d - y.d)
      .slice(0, 2)
    for (const { b } of near) pair.add(edgeKey(a, b))
  }

  const adj = {}
  for (const id of ids) adj[id] = []
  for (const key of pair) {
    const [a, b] = key.split('|')
    const d = haversine(PATH_NODES[a], PATH_NODES[b])
    adj[a].push({ to: b, d })
    adj[b].push({ to: a, d })
  }
  return adj
}

const adj = buildAdj()

export function nearestNodeId(point) {
  let best = null
  let bestD = Infinity
  for (const node of Object.values(PATH_NODES)) {
    const d = haversine(point, node)
    if (d < bestD) {
      bestD = d
      best = node.id
    }
  }
  return best
}

export function nodeForPoi(poiId) {
  if (PATH_NODES[poiId]) return poiId
  const poi = getPoi(poiId)
  if (!poi) return nearestNodeId(POIS[0])
  return nearestNodeId(poi)
}

export function shortestPath(fromId, toId) {
  if (!PATH_NODES[fromId] || !PATH_NODES[toId]) return null
  const dist = {}
  const prev = {}
  const used = new Set()
  for (const id of Object.keys(PATH_NODES)) dist[id] = Infinity
  dist[fromId] = 0

  while (used.size < Object.keys(PATH_NODES).length) {
    let u = null
    let best = Infinity
    for (const id of Object.keys(PATH_NODES)) {
      if (!used.has(id) && dist[id] < best) {
        best = dist[id]
        u = id
      }
    }
    if (u == null) break
    if (u === toId) break
    used.add(u)
    for (const { to, d } of adj[u]) {
      const nd = dist[u] + d
      if (nd < dist[to]) {
        dist[to] = nd
        prev[to] = u
      }
    }
  }

  if (dist[toId] === Infinity) return null
  const ids = []
  let cur = toId
  while (cur) {
    ids.push(cur)
    cur = prev[cur]
  }
  ids.reverse()
  const points = ids.map((id) => PATH_NODES[id])
  return { ids, points, distance: dist[toId] }
}

export function buildRoute(fromPoint, destPoiId) {
  const startId = nearestNodeId(fromPoint)
  const endId = nodeForPoi(destPoiId)
  const path = shortestPath(startId, endId)
  if (!path) return null

  const dest = getPoi(destPoiId)
  const points = [{ ...fromPoint }, ...path.points]
  if (dest) points.push(dest)

  let distance = 0
  for (let i = 1; i < points.length; i++) {
    distance += haversine(points[i - 1], points[i])
  }

  return { ...path, points, distance, dest }
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

  const remainParts = [
    haversine(user, routePoints[Math.min(nearest + 1, routePoints.length - 1)]),
  ]
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
