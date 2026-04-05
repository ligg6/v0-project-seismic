"use client"

import { useMemo } from "react"

interface WaveformDisplayProps {
  phase: number
}

// 参数配置
const CONFIG = {
  bubblePeriod: 50, // ms - 气泡振荡周期
  oscillationCycles: 3, // 显示2-3个气泡振荡周期
}

export function WaveformDisplay({ phase }: WaveformDisplayProps) {
  // 生成GI气枪波形数据 - 振荡被抑制
  const waveformData = useMemo(() => {
    const points: { x: number; y: number }[] = []
    const width = 380
    
    for (let x = 0; x < width; x++) {
      let y = 100 // 基线
      
      // 模拟GI气枪的特征波形
      if (phase >= 15) {
        const pulseStart = (phase - 15) * 6
        const pulseX = x - pulseStart
        
        // Generator产生的主脉冲 (t=0)
        if (pulseX > 0 && pulseX < 80) {
          // 负相位起始
          if (pulseX < 12) {
            y -= 55 * Math.sin((pulseX / 12) * Math.PI) * Math.exp(-pulseX / 40)
          }
          // 正相位
          else if (pulseX < 35) {
            y += 40 * Math.sin(((pulseX - 12) / 23) * Math.PI) * Math.exp(-(pulseX - 12) / 50)
          }
          // 小残余振荡（被Injector抑制后） - 周期约50ms对应的位置
          else {
            // 只有很小的残余振荡
            const decayFactor = Math.exp(-(pulseX - 35) / 40)
            y += 6 * Math.sin((pulseX - 35) * 0.15) * decayFactor
          }
        }
      }
      
      points.push({ x: x + 10, y })
    }
    
    return points
  }, [phase])

  // 生成对比波形（单腔气枪 - 无Injector的情况，显示2-3个振荡周期）
  const comparisonData = useMemo(() => {
    const points: { x: number; y: number }[] = []
    const width = 380
    
    for (let x = 0; x < width; x++) {
      let y = 100
      
      if (phase >= 15) {
        const pulseStart = (phase - 15) * 6
        const pulseX = x - pulseStart
        
        if (pulseX > 0 && pulseX < 200) {
          // 主脉冲
          if (pulseX < 12) {
            y -= 55 * Math.sin((pulseX / 12) * Math.PI)
          }
          // 气泡振荡（无抑制）- 50ms周期，2-3个完整周期
          else {
            const t = (pulseX - 12) / 188 // 归一化时间
            // 衰减的振荡，周期约50ms (对应约40像素)
            const period = 40 // 像素
            const decay = Math.exp(-t * 2)
            // 2-3个振荡周期
            y += 38 * Math.sin((pulseX - 12) / period * Math.PI * 2) * decay
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
      <h3 className="text-cyan-400 font-semibold mb-2 text-center">地震波形对比 (气泡周期T≈{CONFIG.bubblePeriod}ms)</h3>
      
      <svg viewBox="0 0 400 220" className="w-full h-auto">
        {/* 背景网格 */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="400" height="220" fill="url(#grid)" />
        
        {/* 基线 */}
        <line x1="10" y1="100" x2="390" y2="100" stroke="#475569" strokeWidth="1" strokeDasharray="4" />
        
        {/* 50ms周期标记线 */}
        {[1, 2, 3].map((i) => {
          const x = 10 + (phase >= 15 ? (phase - 15) * 6 : 0) + 12 + i * 40
          if (x > 380) return null
          return (
            <g key={i}>
              <line x1={x} y1="30" x2={x} y2="170" stroke="#fbbf24" strokeWidth="1" strokeDasharray="3 2" opacity="0.4" />
              <text x={x} y="25" textAnchor="middle" fill="#fbbf24" fontSize="7" opacity="0.7">{i * 50}ms</text>
            </g>
          )
        })}
        
        {/* 对比波形（单腔气枪）- 显示2-3个振荡 */}
        <path d={comparisonPath} fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.6" />
        
        {/* GI气枪波形 */}
        <path d={pathData} fill="none" stroke="#22d3ee" strokeWidth="2.5" />
        
        {/* 时间轴标注 */}
        <text x="200" y="210" textAnchor="middle" fill="#94a3b8" fontSize="10">时间 (ms) →</text>
        <text x="15" y="50" fill="#94a3b8" fontSize="9" transform="rotate(-90, 15, 100)">振幅</text>
        
        {/* 图例 */}
        <g transform="translate(230, 12)">
          <line x1="0" y1="5" x2="20" y2="5" stroke="#22d3ee" strokeWidth="2.5" />
          <text x="25" y="8" fill="#22d3ee" fontSize="9">GI气枪（双腔）</text>
          
          <line x1="0" y1="20" x2="20" y2="20" stroke="#ef4444" strokeWidth="1.5" opacity="0.6" />
          <text x="25" y="23" fill="#ef4444" fontSize="9" opacity="0.8">单腔气枪</text>
        </g>
        
        {/* 波形特征标注 */}
        {phase >= 20 && (
          <g>
            <line x1="55" y1="45" x2="55" y2="60" stroke="#22c55e" strokeWidth="1" />
            <text x="55" y="40" textAnchor="middle" fill="#22c55e" fontSize="8">主脉冲</text>
            <text x="55" y="185" textAnchor="middle" fill="#22c55e" fontSize="7">(t=0)</text>
          </g>
        )}
        
        {/* 第1个振荡周期标注 (50ms) */}
        {phase >= 40 && (
          <g>
            <line x1="95" y1="130" x2="95" y2="150" stroke="#f97316" strokeWidth="1" />
            <text x="95" y="162" textAnchor="middle" fill="#f97316" fontSize="7">第1振荡</text>
            <text x="95" y="172" textAnchor="middle" fill="#f97316" fontSize="6">(t≈50ms)</text>
          </g>
        )}
        
        {/* 第2个振荡周期标注 (100ms) */}
        {phase >= 60 && (
          <g>
            <line x1="135" y1="70" x2="135" y2="85" stroke="#f97316" strokeWidth="1" opacity="0.7" />
            <text x="135" y="65" textAnchor="middle" fill="#f97316" fontSize="7" opacity="0.7">第2振荡</text>
          </g>
        )}
        
        {/* 第3个振荡周期标注 (150ms) */}
        {phase >= 75 && (
          <g>
            <line x1="175" y1="115" x2="175" y2="130" stroke="#f97316" strokeWidth="1" opacity="0.5" />
            <text x="175" y="140" textAnchor="middle" fill="#f97316" fontSize="6" opacity="0.5">第3振荡</text>
          </g>
        )}
        
        {/* Injector抑制区域标注 */}
        {phase >= 50 && (
          <g>
            <rect x="70" y="75" width="120" height="50" fill="#a855f7" opacity="0.1" rx="3" />
            <text x="130" y="88" textAnchor="middle" fill="#a855f7" fontSize="8">Injector注气抑制区</text>
            <text x="130" y="115" textAnchor="middle" fill="#22d3ee" fontSize="7">GI: 振荡被有效抑制</text>
          </g>
        )}
      </svg>
      
      <div className="mt-3 text-xs text-slate-400">
        <div className="flex justify-between">
          <p><span className="text-cyan-400">GI双腔气枪:</span> Injector在t≈{CONFIG.bubblePeriod}ms注气抑制振荡</p>
          <p><span className="text-red-400">单腔气枪:</span> 每{CONFIG.bubblePeriod}ms出现振荡</p>
        </div>
        <p className="text-center mt-1 text-slate-500">GI气枪获得更锐利、分辨率更高的地震子波，有利于浅层高分辨率勘探</p>
      </div>
    </div>
  )
}
