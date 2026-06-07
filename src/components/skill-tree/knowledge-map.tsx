'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
  type XYPosition,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ZoomIn, ZoomOut, Maximize2, Lock, CheckCircle2, Unlock, BookOpen } from 'lucide-react'
import { LanguageSwitcher, getLocalizedText } from './language-switcher'

interface MapNodeData {
  nodeId: string
  title: string
  titleHi: string | null
  titleTe: string | null
  difficulty: string
  xp: number
  contentType: string
  realmId: number
  realmTitle: string
  realmIcon: string
  realmColor: string
  spirit: string
  status: 'locked' | 'available' | 'in_progress' | 'completed'
  label: string
}

interface MapRealm {
  id: number
  realmNumber: number
  title: string
  icon: string
  color: string
  spirit: string
}

interface MapEdge {
  id: string
  source: string
  target: string
  relationship: string
  label: string | null
  strength: number
}

interface MapData {
  nodes: {
    id: number
    nodeId: string
    title: string
    titleHi: string | null
    titleTe: string | null
    difficulty: string
    xp: number
    contentType: string
    realmId: number
    subRealm: string | null
    status: string
  }[]
  edges: MapEdge[]
  realms: MapRealm[]
}

interface NodeProgressInfo {
  nodeId: number
  nodeNodeId: string
  status: 'locked' | 'available' | 'in_progress' | 'completed'
}

// Custom node component with status indicators
function SkillNode({ data }: NodeProps<Node<MapNodeData>>) {
  const d = data as unknown as MapNodeData
  const [hovered, setHovered] = useState(false)

  const getStatusStyle = () => {
    switch (d.status) {
      case 'completed':
        return {
          borderColor: '#10B981',
          backgroundColor: hovered ? '#10B98150' : '#10B98125',
          boxShadow: hovered ? '0 0 20px #10B98140' : '0 0 8px #10B98120',
          icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
        }
      case 'in_progress':
        return {
          borderColor: '#F59E0B',
          backgroundColor: hovered ? '#F59E0B50' : '#F59E0B25',
          boxShadow: hovered ? '0 0 20px #F59E0B40' : '0 0 8px #F59E0B20',
          icon: <BookOpen className="h-3.5 w-3.5 text-amber-500" />,
        }
      case 'available':
        return {
          borderColor: d.realmColor,
          backgroundColor: hovered ? `${d.realmColor}50` : `${d.realmColor}25`,
          boxShadow: hovered ? `0 0 20px ${d.realmColor}40` : `0 0 8px ${d.realmColor}20`,
          icon: <Unlock className="h-3.5 w-3.5" style={{ color: d.realmColor }} />,
        }
      default: // locked
        return {
          borderColor: '#6B728060',
          backgroundColor: hovered ? '#6B728020' : '#6B728010',
          boxShadow: 'none',
          icon: <Lock className="h-3.5 w-3.5 text-gray-400" />,
        }
    }
  }

  const statusStyle = getStatusStyle()

  return (
    <div
      className="group relative cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-1 !h-1" />
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-1 !h-1" />

      {/* Node circle */}
      <div
        className="flex items-center justify-center rounded-full border-2 transition-all duration-300"
        style={{
          width: d.status === 'locked' ? 30 : 36,
          height: d.status === 'locked' ? 30 : 36,
          borderColor: statusStyle.borderColor,
          backgroundColor: statusStyle.backgroundColor,
          boxShadow: statusStyle.boxShadow,
          transform: hovered ? 'scale(1.15)' : 'scale(1)',
          opacity: d.status === 'locked' ? 0.5 : 1,
        }}
      >
        <span className="text-xs" role="img">{d.realmIcon}</span>
      </div>

      {/* Status indicator - small icon at bottom-right */}
      <div
        className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-card border flex items-center justify-center"
        style={{ borderColor: statusStyle.borderColor }}
      >
        {statusStyle.icon}
      </div>

      {/* Tooltip */}
      {hovered && (
        <div
          className="absolute z-50 -top-20 left-1/2 -translate-x-1/2 rounded-lg border border-border/80 bg-card/95 backdrop-blur-sm px-3 py-2 shadow-xl whitespace-nowrap pointer-events-none"
          style={{ borderColor: `${d.realmColor}60` }}
        >
          <p className="text-xs font-bold text-foreground truncate max-w-[200px]">{d.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[9px] text-muted-foreground">{d.nodeId}</span>
            <span className="text-[9px] font-semibold" style={{ color: d.realmColor }}>{d.xp} XP</span>
            <Badge
              variant="outline"
              className={`text-[7px] font-bold px-1 py-0 h-3 ${
                d.status === 'completed'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                  : d.status === 'in_progress'
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25'
                  : d.status === 'available'
                  ? 'bg-primary/15 text-primary border-primary/25'
                  : 'bg-muted text-muted-foreground border-border'
              }`}
            >
              {d.status === 'in_progress' ? 'In Progress' : d.status.charAt(0).toUpperCase() + d.status.slice(1)}
            </Badge>
          </div>
        </div>
      )}
    </div>
  )
}

const nodeTypes = { skillNode: SkillNode }

function calculateNodePositions(
  nodes: MapData['nodes'],
  realms: MapRealm[]
): Map<string, XYPosition> {
  const positions = new Map<string, XYPosition>()
  const realmMap = new Map(realms.map((r) => [r.id, r]))

  // Group nodes by realm
  const realmNodes = new Map<number, MapData['nodes']>()
  for (const node of nodes) {
    if (!realmNodes.has(node.realmId)) realmNodes.set(node.realmId, [])
    realmNodes.get(node.realmId)!.push(node)
  }

  // Grid layout for realms: 4 columns
  const colsPerRow = 4
  const realmSpacingX = 600
  const realmSpacingY = 500
  const nodeSpacingX = 70
  const nodeSpacingY = 70
  const nodesPerRow = 6

  let realmIndex = 0
  for (const [realmId, rNodes] of realmNodes) {
    const realmRow = Math.floor(realmIndex / colsPerRow)
    const realmCol = realmIndex % colsPerRow
    const baseX = realmCol * realmSpacingX + 100
    const baseY = realmRow * realmSpacingY + 100

    // Sort nodes by nodeId
    rNodes.sort((a, b) => a.nodeId.localeCompare(b.nodeId, undefined, { numeric: true }))

    for (let i = 0; i < rNodes.length; i++) {
      const nodeRow = Math.floor(i / nodesPerRow)
      const nodeCol = i % nodesPerRow
      positions.set(rNodes[i].nodeId, {
        x: baseX + nodeCol * nodeSpacingX,
        y: baseY + nodeRow * nodeSpacingY,
      })
    }
    realmIndex++
  }

  return positions
}

// Zoom controls component
function ZoomControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow()

  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border/60 bg-card/90 backdrop-blur-sm shadow-lg overflow-hidden">
      <button
        onClick={() => zoomIn({ duration: 200 })}
        className="flex items-center justify-center h-8 w-8 text-foreground hover:bg-accent transition-colors border-b border-border/60"
        title="Zoom In"
      >
        <ZoomIn className="h-4 w-4" />
      </button>
      <button
        onClick={() => zoomOut({ duration: 200 })}
        className="flex items-center justify-center h-8 w-8 text-foreground hover:bg-accent transition-colors border-b border-border/60"
        title="Zoom Out"
      >
        <ZoomOut className="h-4 w-4" />
      </button>
      <button
        onClick={() => fitView({ duration: 300, padding: 0.2 })}
        className="flex items-center justify-center h-8 w-8 text-foreground hover:bg-accent transition-colors"
        title="Fit View"
      >
        <Maximize2 className="h-4 w-4" />
      </button>
    </div>
  )
}

function KnowledgeMapInner() {
  const { goBackSkillTree, openNode, skillLanguage } = useAppStore()
  const [data, setData] = useState<MapData | null>(null)
  const [nodeProgressMap, setNodeProgressMap] = useState<Map<number, NodeProgressInfo>>(new Map())

  // Fetch map data
  useEffect(() => {
    let cancelled = false
    fetch('/api/skill-tree/map')
      .then((res) => res.json())
      .then((d) => { if (!cancelled) setData(d) })
      .catch(console.error)
    return () => { cancelled = true }
  }, [])

  // Fetch progress data
  useEffect(() => {
    let cancelled = false
    fetch('/api/skill-tree/progress')
      .then((res) => res.json())
      .then((d) => {
        if (cancelled) return
        const map = new Map<number, NodeProgressInfo>()
        if (d.progress && Array.isArray(d.progress)) {
          for (const p of d.progress) {
            map.set(p.nodeId, {
              nodeId: p.nodeId,
              nodeNodeId: p.nodeNodeId,
              status: p.status,
            })
          }
        }
        setNodeProgressMap(map)
      })
      .catch(console.error)
    return () => { cancelled = true }
  }, [])

  const { rfNodes, rfEdges } = useMemo(() => {
    if (!data) return { rfNodes: [] as Node[], rfEdges: [] as Edge[] }

    const positions = calculateNodePositions(data.nodes, data.realms)
    const realmMap = new Map(data.realms.map((r) => [r.id, r]))

    const rfNodes: Node[] = data.nodes.map((n) => {
      const realm = realmMap.get(n.realmId)
      const pos = positions.get(n.nodeId) || { x: 0, y: 0 }
      const progress = nodeProgressMap.get(n.id)
      const status = progress?.status || 'locked'

      return {
        id: n.nodeId,
        type: 'skillNode',
        position: pos,
        data: {
          nodeId: n.nodeId,
          title: getLocalizedText(n, 'title', skillLanguage),
          titleHi: n.titleHi,
          titleTe: n.titleTe,
          difficulty: n.difficulty,
          xp: n.xp,
          contentType: n.contentType,
          realmId: n.realmId,
          realmTitle: realm?.title || '',
          realmIcon: realm?.icon || '',
          realmColor: realm?.color || '#10B981',
          spirit: realm?.spirit || '',
          status,
          label: n.nodeId,
        },
      }
    })

    const rfEdges: Edge[] = data.edges
      .filter((e): e is MapEdge & { source: string; target: string } => !!e.source && !!e.target)
      .map((e) => {
        const sourceRealm = data.nodes.find((n) => n.nodeId === e.source)
        const isCrossRealm = sourceRealm && data.nodes.find((n) => n.nodeId === e.target && n.realmId !== sourceRealm.realmId)
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          animated: isCrossRealm || e.relationship === 'cross_realm',
          style: {
            stroke: isCrossRealm ? '#F59E0B60' : `${sourceRealm ? realmMap.get(sourceRealm.realmId)?.color || '#10B981' : '#10B981'}30`,
            strokeWidth: e.strength || 1,
          },
          label: e.label || undefined,
          labelStyle: { fill: '#888', fontSize: 9, fontWeight: 500 },
          labelBgStyle: { fill: 'transparent' },
          labelBgPadding: [2, 4] as [number, number],
          type: 'default',
        }
      })

    return { rfNodes, rfEdges }
  }, [data, skillLanguage, nodeProgressMap])

  const [nodes, , onNodesChange] = useNodesState(rfNodes)
  const [edges, , onEdgesChange] = useEdgesState(rfEdges)

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      openNode(node.id)
    },
    [openNode]
  )

  if (!data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    )
  }

  const realmMap = new Map(data.realms.map((r) => [r.id, r]))

  // Count statuses for legend
  const statusCounts = {
    completed: rfNodes.filter((n) => (n.data as unknown as MapNodeData).status === 'completed').length,
    inProgress: rfNodes.filter((n) => (n.data as unknown as MapNodeData).status === 'in_progress').length,
    available: rfNodes.filter((n) => (n.data as unknown as MapNodeData).status === 'available').length,
    locked: rfNodes.filter((n) => (n.data as unknown as MapNodeData).status === 'locked').length,
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border/60 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={goBackSkillTree}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <span className="text-sm font-bold text-foreground">Knowledge Map</span>
          <span className="hidden sm:inline text-xs text-muted-foreground">({data.nodes.length} nodes • {data.edges.length} connections)</span>
        </div>
        <LanguageSwitcher />
      </div>

      {/* Map container */}
      <div className="flex-1 relative" style={{ height: 'calc(100vh - 160px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.05}
          maxZoom={3}
          proOptions={{ hideAttribution: true }}
          className="bg-background dark:bg-[#0a0f0c]"
        >
          <Background
            gap={40}
            size={1}
            color="var(--grid-line)"
          />
          <Controls
            showInteractive={false}
            className="!hidden"
          />
          <MiniMap
            nodeColor={(node) => {
              const d = node.data as unknown as MapNodeData
              if (d?.status === 'completed') return '#10B981'
              if (d?.status === 'in_progress') return '#F59E0B'
              if (d?.status === 'available') return d?.realmColor || '#10B981'
              return '#6B728080'
            }}
            maskColor="rgba(0,0,0,0.7)"
            className="!bg-card/90 !border-border/60 !rounded-lg !shadow-lg"
            pannable
            zoomable
          />

          {/* Custom zoom controls */}
          <div className="absolute bottom-4 left-4 z-10">
            <ZoomControls />
          </div>
        </ReactFlow>
      </div>

      {/* Legend bar */}
      <div className="border-t border-border/60 bg-card/50 backdrop-blur-sm px-4 sm:px-6 py-3 overflow-x-auto no-scrollbar">
        <div className="flex items-start gap-6 min-w-max">
          {/* Status Legend */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0">Status</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full border-2 border-emerald-500 bg-emerald-500/25" />
                <span className="text-xs text-muted-foreground">Completed ({statusCounts.completed})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full border-2 border-amber-500 bg-amber-500/25" />
                <span className="text-xs text-muted-foreground">In Progress ({statusCounts.inProgress})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full border-2 border-primary bg-primary/25" />
                <span className="text-xs text-muted-foreground">Available ({statusCounts.available})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full border-2 border-gray-400/40 bg-gray-400/10 opacity-50" />
                <span className="text-xs text-muted-foreground">Locked ({statusCounts.locked})</span>
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="h-6 w-px bg-border/60 shrink-0" />

          {/* Realm Legend */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0">Realms</span>
            <div className="flex flex-wrap gap-2">
              {data.realms.map((realm) => (
                <div key={realm.id} className="flex items-center gap-1.5 text-xs">
                  <div
                    className="h-3 w-3 rounded-full border"
                    style={{ backgroundColor: `${realm.color}30`, borderColor: realm.color }}
                  />
                  <span className="text-muted-foreground font-medium">{realm.icon} {realm.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function KnowledgeMap() {
  return (
    <ReactFlowProvider>
      <KnowledgeMapInner />
    </ReactFlowProvider>
  )
}
