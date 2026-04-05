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
  const getPhaseLabel = (p: number) => {
    if (p < 20) return "充气阶段"
    if (p < 30) return "Generator放气"
    if (p < 50) return "气泡膨胀"
    if (p < 60) return "Injector放气"
    if (p < 80) return "气泡坍缩"
    return "系统复位"
  }

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
          <div 
            className={`flex-1 rounded-l transition-colors ${phase >= 0 ? 'bg-green-500' : 'bg-slate-600'}`}
            title="充气阶段"
          />
          <div 
            className={`flex-1 transition-colors ${phase >= 20 ? 'bg-yellow-500' : 'bg-slate-600'}`}
            title="Generator放气"
          />
          <div 
            className={`flex-1 transition-colors ${phase >= 30 ? 'bg-orange-500' : 'bg-slate-600'}`}
            title="气泡膨胀"
          />
          <div 
            className={`flex-1 transition-colors ${phase >= 50 ? 'bg-purple-500' : 'bg-slate-600'}`}
            title="Injector放气"
          />
          <div 
            className={`flex-1 transition-colors ${phase >= 60 ? 'bg-blue-500' : 'bg-slate-600'}`}
            title="气泡坍缩"
          />
          <div 
            className={`flex-1 rounded-r transition-colors ${phase >= 80 ? 'bg-cyan-500' : 'bg-slate-600'}`}
            title="系统复位"
          />
        </div>
        
        {/* 阶段标签 */}
        <div className="flex text-[10px] text-slate-500 mt-1">
          <span className="flex-1 text-center">充气</span>
          <span className="flex-1 text-center">G放</span>
          <span className="flex-1 text-center">膨胀</span>
          <span className="flex-1 text-center">I放</span>
          <span className="flex-1 text-center">坍缩</span>
          <span className="flex-1 text-center">复位</span>
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
          充气
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPhaseChange(20)}
          className="bg-slate-700/50 border-slate-600 hover:bg-slate-600 text-xs text-slate-300"
        >
          G放气
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPhaseChange(50)}
          className="bg-slate-700/50 border-slate-600 hover:bg-slate-600 text-xs text-slate-300"
        >
          I放气
        </Button>
      </div>
    </div>
  )
}
