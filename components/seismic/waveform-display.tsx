"use client"

import { useMemo } from "react"

interface WaveformDisplayProps {
  phase: number
}

// 参数配置 - 与气泡动态组件一致
const CONFIG = {
  bubblePeriod: 50, // ms - 气泡振荡周期
  totalTime: 200, // ms - 总显示时间
  pixelsPerMs: 1.8, // 像素/毫秒的映射
}

export function WaveformDisplay({ phase }: WaveformDisplayProps) {
  // 当前时间
  const currentTime = (phase / 100) * CONFIG.totalTime

  // 生成GI气枪波形数据 - 振荡被抑制
  const waveformData = useMemo(() => {
    const points: { x: number; y: number }[] = []
    const width = 360
    const pxPerMs = CONFIG.pixelsPerMs
    
    for (let x = 0; x < width; x++) {
      let y = 100 // 基线
      const t = x / pxPerMs // 转换为毫秒
      
      if (t <= currentTime) {
        // 主脉冲 (t=0附近)
        if (t < 8) {
          // 锐利的负峰后跟正峰
          if (t < 3) {
            y -= 50 * Math.sin((t / 3) * Math.PI)
          } else if (t < 8) {
            y += 35 * Math.sin(((t - 3) / 5) * Math.PI) * Math.exp(-(t - 3) / 10)
          }
        }
        // Injector注入后，只有微弱残余
        else if (t >= CONFIG.bubblePeriod - 5 && t < CONFIG.bubblePeriod + 5) {
          // 在50ms处有很小的残余脉冲（被抑制后）
          const dist = t - CONFIG.bubblePeriod
          y += 8 * Math.exp(-Math.abs(dist) / 3) * Math.sin(dist * 0.8)
        }
        else if (t > 10) {
          // 平稳衰减
          y += 3 * Math.sin(t * 0.1) * Math.exp(-t / 80)
        }
      }
      
      points.push({ x: x + 30, y })
    }
    
    return points
  }, [currentTime])

  // 生成对比波形（单腔气枪 - 显示清晰的振荡脉冲）
  const comparisonData = useMemo(() => {
    const points: { x: number; y: number }[] = []
    const width = 360
    const pxPerMs = CONFIG.pixelsPerMs
    const T = CONFIG.bubblePeriod
    
    for (let x = 0; x < width; x++) {
      let y = 100
      const t = x / pxPerMs
      
      if (t <= currentTime) {
        // 主脉冲 (t=0) - 与GI相同
        if (t < 8) {
          if (t < 3) {
            y -= 50 * Math.sin((t / 3) * Math.PI)
          } else if (t < 8) {
            y += 35 * Math.sin(((t - 3) / 5) * Math.PI) * Math.exp(-(t - 3) / 10)
          }
        }
        // 第1次气泡振荡脉冲 (t≈50ms) - 气泡坍缩反弹产生
        else if (t >= T - 5 && t < T + 8) {
          const dist = t - T
          const amplitude = 35 * 0.6 // 衰减后的振幅
          if (dist < 0) {
            // 脉冲前的微小前兆
            y += 5 * Math.exp(dist / 2)
          } else if (dist < 3) {
            y -= amplitude * Math.sin((dist / 3) * Math.PI)
          } else if (dist < 8) {
            y += amplitude * 0.7 * Math.sin(((dist - 3) / 5) * Math.PI) * Math.exp(-(dist - 3) / 8)
          }
        }
        // 第2次气泡振荡脉冲 (t≈100ms)
        else if (t >= T * 2 - 5 && t < T * 2 + 8) {
          const dist = t - T * 2
          const amplitude = 35 * 0.35 // 进一步衰减
          if (dist >= 0 && dist < 3) {
            y -= amplitude * Math.sin((dist / 3) * Math.PI)
          } else if (dist >= 3 && dist < 8) {
            y += amplitude * 0.7 * Math.sin(((dist - 3) / 5) * Math.PI) * Math.exp(-(dist - 3) / 8)
          }
        }
        // 第3次气泡振荡脉冲 (t≈150ms)
        else if (t >= T * 3 - 5 && t < T * 3 + 8) {
          const dist = t - T * 3
          const amplitude = 35 * 0.2 // 继续衰减
          if (dist >= 0 && dist < 3) {
            y -= amplitude * Math.sin((dist / 3) * Math.PI)
          } else if (dist >= 3 && dist < 8) {
            y += amplitude * 0.6 * Math.sin(((dist - 3) / 5) * Math.PI) * Math.exp(-(dist - 3) / 8)
          }
        }
        // 振荡间的小波动
        else if (t > 10) {
          y += 4 * Math.sin(t * 0.15) * Math.exp(-t / 100)
        }
      }
      
      points.push({ x: x + 30, y })
    }
    
    return points
  }, [currentTime])

  const pathData = waveformData.map((p, i) => 
    (i === 0 ? 'M' : 'L') + `${p.x},${p.y}`
  ).join(' ')

  const comparisonPath = comparisonData.map((p, i) => 
    (i === 0 ? 'M' : 'L') + `${p.x},${p.y}`
  ).join(' ')

  // 计算时间标记位置
  const timeToX = (t: number) => 30 + t * CONFIG.pixelsPerMs

  return (
    <div className="bg-slate-900 rounded-xl p-4 border border-cyan-500/30">
      <h3 className="text-cyan-400 font-semibold mb-2 text-center">
        地震波形对比 (气泡振荡周期T = {CONFIG.bubblePeriod}ms)
      </h3>
      
      <svg viewBox="0 0 400 230" className="w-full h-auto">
        {/* 背景 */}
        <rect width="400" height="230" fill="#1e293b" rx="4" />
        
        {/* 背景网格 */}
        <defs>
          <pattern id="waveGrid" width="18" height="18" patternUnits="userSpaceOnUse">
            <path d="M 18 0 L 0 0 0 18" fill="none" stroke="#334155" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect x="30" y="30" width="360" height="140" fill="url(#waveGrid)" />
        
        {/* 基线 */}
        <line x1="30" y1="100" x2="390" y2="100" stroke="#475569" strokeWidth="1" />
        
        {/* 时间刻度线 - 每50ms */}
        {[0, 50, 100, 150, 200].map((t) => (
          <g key={t}>
            <line 
              x1={timeToX(t)} y1="30" x2={timeToX(t)} y2="170" 
              stroke={t === 0 ? "#22c55e" : "#fbbf24"} 
              strokeWidth={t === 0 ? "1.5" : "1"}
              strokeDasharray={t === 0 ? "none" : "4,3"}
              opacity={t === 0 ? 0.8 : 0.5}
            />
            <text x={timeToX(t)} y="185" textAnchor="middle" fill={t === 0 ? "#22c55e" : "#fbbf24"} fontSize="9">
              {t}ms
            </text>
          </g>
        ))}
        
        {/* 振荡脉冲标注区域 */}
        {[50, 100, 150].map((t, idx) => {
          if (currentTime < t - 5) return null
          return (
            <g key={t}>
              {/* 标记振荡脉冲位置 */}
              <text x={timeToX(t)} y="22" textAnchor="middle" fill="#ef4444" fontSize="7">
                振荡{idx + 1}
              </text>
              {/* 小三角箭头 */}
              <polygon 
                points={`${timeToX(t)},26 ${timeToX(t) - 3},30 ${timeToX(t) + 3},30`} 
                fill="#ef4444" 
                opacity="0.6"
              />
            </g>
          )
        })}
        
        {/* 主脉冲标注 */}
        <text x={timeToX(0) + 15} y="22" textAnchor="start" fill="#22c55e" fontSize="8" fontWeight="500">
          主脉冲
        </text>
        
        {/* 对比波形（单腔气枪）*/}
        <path d={comparisonPath} fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.7" />
        
        {/* GI气枪波形 */}
        <path d={pathData} fill="none" stroke="#22d3ee" strokeWidth="2.5" />
        
        {/* 当前时间指示线 */}
        <line 
          x1={timeToX(currentTime)} y1="30" 
          x2={timeToX(currentTime)} y2="170" 
          stroke="#ffffff" strokeWidth="1.5" opacity="0.6"
        />
        <circle cx={timeToX(currentTime)} cy="100" r="3" fill="#ffffff" />
        
        {/* 坐标轴 */}
        <line x1="30" y1="170" x2="390" y2="170" stroke="#64748b" strokeWidth="1" />
        <line x1="30" y1="30" x2="30" y2="170" stroke="#64748b" strokeWidth="1" />
        
        {/* 轴标签 */}
        <text x="210" y="200" textAnchor="middle" fill="#94a3b8" fontSize="10">时间 t (ms)</text>
        <text x="15" y="100" fill="#94a3b8" fontSize="9" textAnchor="middle" transform="rotate(-90, 15, 100)">振幅 P</text>
        
        {/* 图例 */}
        <g transform="translate(250, 205)">
          <line x1="0" y1="0" x2="18" y2="0" stroke="#22d3ee" strokeWidth="2.5" />
          <text x="22" y="3" fill="#22d3ee" fontSize="8">GI双腔气枪</text>
          
          <line x1="90" y1="0" x2="108" y2="0" stroke="#ef4444" strokeWidth="2" opacity="0.7" />
          <text x="112" y="3" fill="#ef4444" fontSize="8">单腔气枪</text>
        </g>
        
        {/* 关键标注 */}
        {currentTime > 30 && (
          <g>
            {/* GI抑制效果说明 */}
            <rect x="100" y="115" width="85" height="18" fill="#22c55e" opacity="0.15" rx="2" />
            <text x="142" y="127" textAnchor="middle" fill="#22c55e" fontSize="7">
              GI振荡被抑制
            </text>
          </g>
        )}
        
        {currentTime > 55 && (
          <g>
            {/* 单腔气枪振荡说明 */}
            <rect x="80" y="52" width="95" height="16" fill="#ef4444" opacity="0.15" rx="2" />
            <text x="127" y="63" textAnchor="middle" fill="#ef4444" fontSize="7">
              单腔气枪振荡脉冲
            </text>
          </g>
        )}
      </svg>
      
      {/* 说明文字 */}
      <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
        <div className="text-slate-400">
          <p className="text-cyan-400 font-medium mb-1">GI双腔气枪特征:</p>
          <ul className="space-y-0.5 text-slate-500">
            <li>- 主脉冲锐利，能量集中</li>
            <li>- 振荡脉冲被Injector有效抑制</li>
            <li>- 高分辨率，适合浅层勘探</li>
          </ul>
        </div>
        <div className="text-slate-400">
          <p className="text-red-400 font-medium mb-1">单腔气枪特征:</p>
          <ul className="space-y-0.5 text-slate-500">
            <li>- 主脉冲后{CONFIG.bubblePeriod}ms出现振荡</li>
            <li>- 2-3个振荡周期干扰地震记录</li>
            <li>- 降低地震分辨率</li>
          </ul>
        </div>
      </div>
      
      {/* 物理原理提示 */}
      <div className="mt-2 pt-2 border-t border-slate-700 text-center text-xs text-slate-500">
        振荡脉冲产生于气泡<span className="text-amber-400">坍缩到最小体积时的急剧反弹</span>，周期T与气枪容量、工作压力及气枪沉放深度相关
      </div>
    </div>
  )
}
