"use client"

import { useMemo } from "react"

interface WaveformDisplayProps {
  phase: number
}

export function WaveformDisplay({ phase }: WaveformDisplayProps) {
  // 生成波形数据
  const waveformData = useMemo(() => {
    const points: { x: number; y: number }[] = []
    const width = 380
    
    for (let x = 0; x < width; x++) {
      let y = 100 // 基线
      
      // 模拟GI气枪的特征波形
      // 主脉冲（锐利的负相位开始）
      if (phase >= 20) {
        const pulseStart = (phase - 20) * 8
        const pulseX = x - pulseStart
        
        // Generator产生的主脉冲
        if (pulseX > 0 && pulseX < 60) {
          // 负相位起始
          if (pulseX < 15) {
            y -= 50 * Math.sin((pulseX / 15) * Math.PI) * Math.exp(-pulseX / 30)
          }
          // 正相位
          else if (pulseX < 40) {
            y += 35 * Math.sin(((pulseX - 15) / 25) * Math.PI) * Math.exp(-(pulseX - 15) / 40)
          }
          // 小振荡（被Injector抑制后的残余）
          else {
            y += 8 * Math.sin((pulseX - 40) * 0.3) * Math.exp(-(pulseX - 40) / 20)
          }
        }
        
        // 如果没有Injector，会有更大的气泡振荡（用于对比展示）
      }
      
      points.push({ x: x + 10, y })
    }
    
    return points
  }, [phase])

  // 生成对比波形（无Injector的情况）
  const comparisonData = useMemo(() => {
    const points: { x: number; y: number }[] = []
    const width = 380
    
    for (let x = 0; x < width; x++) {
      let y = 100
      
      if (phase >= 20) {
        const pulseStart = (phase - 20) * 8
        const pulseX = x - pulseStart
        
        if (pulseX > 0 && pulseX < 150) {
          // 主脉冲
          if (pulseX < 15) {
            y -= 50 * Math.sin((pulseX / 15) * Math.PI)
          }
          // 气泡振荡（无抑制）
          else {
            const decay = Math.exp(-(pulseX - 15) / 80)
            y += 40 * Math.sin((pulseX - 15) * 0.15) * decay
          }
        }
      }
      
      points.push({ x: x + 10, y })
    }
    
    return points
  }, [phase])

  const pathData = waveformData.map((p, i) => 
    (i === 0 ? 'M' : 'L') + `${p.x},${p.y}`
  ).join(' ')

  const comparisonPath = comparisonData.map((p, i) => 
    (i === 0 ? 'M' : 'L') + `${p.x},${p.y}`
  ).join(' ')

  return (
    <div className="bg-slate-900 rounded-xl p-4 border border-cyan-500/30">
      <h3 className="text-cyan-400 font-semibold mb-3 text-center">地震波形对比</h3>
      
      <svg viewBox="0 0 400 200" className="w-full h-auto">
        {/* 背景网格 */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="400" height="200" fill="url(#grid)" />
        
        {/* 基线 */}
        <line x1="10" y1="100" x2="390" y2="100" stroke="#475569" strokeWidth="1" strokeDasharray="4" />
        
        {/* 对比波形（无Injector） */}
        <path d={comparisonPath} fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.5" />
        
        {/* GI气枪波形 */}
        <path d={pathData} fill="none" stroke="#22d3ee" strokeWidth="2" />
        
        {/* 时间轴标注 */}
        <text x="200" y="190" textAnchor="middle" fill="#94a3b8" fontSize="10">时间 →</text>
        <text x="15" y="50" fill="#94a3b8" fontSize="9" transform="rotate(-90, 15, 100)">振幅</text>
        
        {/* 图例 */}
        <g transform="translate(250, 15)">
          <line x1="0" y1="5" x2="20" y2="5" stroke="#22d3ee" strokeWidth="2" />
          <text x="25" y="8" fill="#22d3ee" fontSize="9">GI气枪（双腔）</text>
          
          <line x1="0" y1="20" x2="20" y2="20" stroke="#ef4444" strokeWidth="1.5" opacity="0.5" />
          <text x="25" y="23" fill="#ef4444" fontSize="9" opacity="0.7">单腔气枪</text>
        </g>
        
        {/* 波形特征标注 */}
        {phase >= 25 && (
          <g>
            <line x1="60" y1="50" x2="60" y2="70" stroke="#fbbf24" strokeWidth="1" />
            <text x="60" y="45" textAnchor="middle" fill="#fbbf24" fontSize="8">主脉冲</text>
          </g>
        )}
        
        {phase >= 55 && (
          <g>
            <line x1="150" y1="130" x2="150" y2="115" stroke="#a855f7" strokeWidth="1" />
            <text x="150" y="140" textAnchor="middle" fill="#a855f7" fontSize="8">振荡抑制</text>
          </g>
        )}
      </svg>
      
      <div className="mt-3 text-xs text-slate-400 text-center">
        <p>GI双腔气枪通过注入器延迟放气，有效抑制气泡振荡</p>
        <p>获得更锐利、分辨率更高的地震子波</p>
      </div>
    </div>
  )
}
