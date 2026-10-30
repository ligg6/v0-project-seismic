"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, RotateCcw, FastForward, Rewind } from "lucide-react"

interface ControlPanelProps {
  phase: number
  isPlaying: boolean
  speed: number
  onPhaseChange: (phase: number) => void
  onPlayPause: () => void
  onReset: () => void
  onSpeedChange: (speed: number) => void
}

export function ControlPanel({
  phase,
  isPlaying,
  speed,
  onPhaseChange,
  onPlayPause,
  onReset,
  onSpeedChange
}: ControlPanelProps) {
  // 统一时间轴: phase 0-100 对应 t = phase*2 ms (0-200ms)，气泡周期 T = 50ms
  const getPhaseLabel = (p: number) => {
    const t = p * 2
    if (t < 5) return "Generator放气 (主脉冲)"
    if (t < 20) return "气泡膨胀"
    if (t < 30) return "Injector注气 (t≈25ms)"
    if (t < 45) return "GI气泡缓慢收缩"
    for (const n of [1, 2, 3]) {
      if (Math.abs(t - n * 50) < 5) return `单腔振荡${n} (t≈${n * 50}ms)`
    }
    if (t < 160) return "单腔振荡周期 (GI平稳衰减)"
    return "振荡衰减"
  }

  // 阶段进度条分段 (按时间比例): 0-20ms, 20-30ms, 30-50ms, 50-160ms, 160-200ms
  const stages = [
    { start: 0, end: 10, color: "bg-green-500", title: "Generator放气 + 气泡膨胀 (0-20ms)", label: "膨胀" },
    { start: 10, end: 15, color: "bg-purple-500", title: "Injector注气 (t≈25ms)", label: "I注" },
    { start: 15, end: 25, color: "bg-blue-500", title: "GI气泡缓慢收缩 (30-50ms)", label: "收缩" },
    { start: 25, end: 80, color: "bg-orange-500", title: "单腔振荡 50/100/150ms (GI被抑制)", label: "单腔振荡" },
    { start: 80, end: 100, color: "bg-cyan-500", title: "振荡衰减 (160-200ms)", label: "衰减" },
  ]

  return (
    <div className="bg-slate-800/80 backdrop-blur rounded-xl p-4 border border-cyan-500/30">
      <h3 className="text-cyan-400 font-semibold mb-4 text-center">动画控制</h3>
      
      {/* 播放控制 */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="bg-slate-700 border-slate-600 hover:bg-slate-600 text-white"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSpeedChange(Math.max(0.25, speed - 0.25))}
          className="bg-slate-700 border-slate-600 hover:bg-slate-600 text-white"
        >
          <Rewind className="h-4 w-4" />
        </Button>
        
        <Button
          onClick={onPlayPause}
          className={`${isPlaying ? 'bg-orange-600 hover:bg-orange-700' : 'bg-cyan-600 hover:bg-cyan-700'} text-white px-6`}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSpeedChange(Math.min(3, speed + 0.25))}
          className="bg-slate-700 border-slate-600 hover:bg-slate-600 text-white"
        >
          <FastForward className="h-4 w-4" />
        </Button>
      </div>
      
      {/* 速度显示 */}
      <div className="text-center text-sm text-slate-400 mb-4">
        播放速度: <span className="text-cyan-400 font-mono">{speed.toFixed(2)}x</span>
      </div>
      
      {/* 进度条 */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>工作周期进度</span>
          <span className="font-mono">{phase.toFixed(0)}%</span>
        </div>
        <Slider
          value={[phase]}
          onValueChange={([value]) => onPhaseChange(value)}
          max={100}
          step={1}
          className="w-full"
        />
      </div>
      
      {/* 阶段指示 */}
      <div className="mt-4 space-y-2">
        <div className="text-sm text-slate-300 text-center font-medium">
          当前阶段: <span className="text-cyan-400">{getPhaseLabel(phase)}</span>
        </div>
        
        {/* 阶段进度条 */}
        <div className="flex gap-1 h-2">
          {stages.map((st, i) => (
            <div
              key={st.title}
              className={`transition-colors ${i === 0 ? 'rounded-l' : ''} ${i === stages.length - 1 ? 'rounded-r' : ''} ${phase >= st.start ? st.color : 'bg-slate-600'}`}
              style={{ flexGrow: st.end - st.start, flexBasis: 0 }}
              title={st.title}
            />
          ))}
        </div>
        
        {/* 阶段标签 */}
        <div className="relative h-4 text-[10px] text-slate-500 mt-1">
          {stages.map((st) => (
            <span
              key={st.title}
              className="absolute -translate-x-1/2 whitespace-nowrap"
              style={{ left: `${(st.start + st.end) / 2}%` }}
            >
              {st.label}
            </span>
          ))}
        </div>
      </div>
      
      {/* 快捷跳转 */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPhaseChange(0)}
          className="bg-slate-700/50 border-slate-600 hover:bg-slate-600 text-xs text-slate-300"
        >
          G放气
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPhaseChange(12.5)}
          className="bg-slate-700/50 border-slate-600 hover:bg-slate-600 text-xs text-slate-300"
        >
          I注气
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPhaseChange(25)}
          className="bg-slate-700/50 border-slate-600 hover:bg-slate-600 text-xs text-slate-300"
        >
          单腔振荡1
        </Button>
      </div>
    </div>
  )
}
