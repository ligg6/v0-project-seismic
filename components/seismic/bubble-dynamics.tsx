"use client"

import { useMemo } from "react"

interface BubbleDynamicsProps {
  phase: number
}

export function BubbleDynamics({ phase }: BubbleDynamicsProps) {
  // 计算气泡状态
  const bubbleState = useMemo(() => {
    // GI气枪气泡演化
    // 0-20: 无气泡
    // 20-35: 快速膨胀（Generator放气）
    // 35-55: 缓慢膨胀 + Injector介入
    // 55-75: 稳定坍缩
    // 75-100: 残余振荡（很小）
    
    if (phase < 20) {
      return { radius: 0, pressure: 0, stage: "充气准备" }
    } else if (phase < 35) {
      const t = (phase - 20) / 15
      return { 
        radius: 40 * Math.sqrt(t), 
        pressure: 100 * (1 - t * 0.6),
        stage: "Generator放气 - 气泡快速膨胀"
      }
    } else if (phase < 55) {
      const t = (phase - 35) / 20
      return { 
        radius: 40 + 20 * t, 
        pressure: 40 - 20 * t,
        stage: "Injector注气 - 抑制振荡"
      }
    } else if (phase < 75) {
      const t = (phase - 55) / 20
      return { 
        radius: 60 * (1 - t * 0.7), 
        pressure: 20 + 30 * t,
        stage: "气泡坍缩 - 能量释放"
      }
    } else {
      const t = (phase - 75) / 25
      const oscillation = Math.sin(t * Math.PI * 3) * 5 * (1 - t)
      return { 
        radius: 18 + oscillation, 
        pressure: 50 + 20 * t,
        stage: "残余振荡 - 趋于稳定"
      }
    }
  }, [phase])

  // 对比：单腔气枪气泡
  const singleBubbleState = useMemo(() => {
    if (phase < 20) {
      return { radius: 0 }
    } else if (phase < 35) {
      const t = (phase - 20) / 15
      return { radius: 40 * Math.sqrt(t) }
    } else {
      // 单腔气枪会有显著的气泡振荡
      const t = (phase - 35) / 65
      const baseRadius = 40 + 20 * Math.sin(t * Math.PI)
      const oscillation = 25 * Math.sin(t * Math.PI * 4) * Math.exp(-t * 2)
      return { radius: Math.max(10, baseRadius + oscillation) }
    }
  }, [phase])

  // 生成压力-体积曲线数据
  const pvCurveData = useMemo(() => {
    const giPoints: { x: number; y: number }[] = []
    const singlePoints: { x: number; y: number }[] = []
    
    const currentPhase = Math.min(phase, 100)
    
    for (let p = 0; p <= currentPhase; p += 2) {
      // GI气枪
      let giRadius = 0
      if (p >= 20 && p < 35) {
        giRadius = 40 * Math.sqrt((p - 20) / 15)
      } else if (p >= 35 && p < 55) {
        giRadius = 40 + 20 * ((p - 35) / 20)
      } else if (p >= 55 && p < 75) {
        giRadius = 60 * (1 - ((p - 55) / 20) * 0.7)
      } else if (p >= 75) {
        giRadius = 18 + Math.sin(((p - 75) / 25) * Math.PI * 3) * 5 * (1 - (p - 75) / 25)
      }
      
      // 单腔
      let singleRadius = 0
      if (p >= 20 && p < 35) {
        singleRadius = 40 * Math.sqrt((p - 20) / 15)
      } else if (p >= 35) {
        const t = (p - 35) / 65
        singleRadius = 40 + 20 * Math.sin(t * Math.PI) + 25 * Math.sin(t * Math.PI * 4) * Math.exp(-t * 2)
      }
      
      if (giRadius > 0) giPoints.push({ x: p * 2, y: 150 - giRadius * 2 })
      if (singleRadius > 0) singlePoints.push({ x: p * 2, y: 150 - singleRadius * 2 })
    }
    
    return { gi: giPoints, single: singlePoints }
  }, [phase])

  const giPath = pvCurveData.gi.length > 1 
    ? pvCurveData.gi.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x + 20},${p.y}`).join(' ')
    : ''
  
  const singlePath = pvCurveData.single.length > 1
    ? pvCurveData.single.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x + 20},${p.y}`).join(' ')
    : ''

  return (
    <div className="bg-slate-900 rounded-xl p-4 border border-cyan-500/30">
      <h3 className="text-cyan-400 font-semibold mb-3 text-center">气泡膨胀坍缩动态</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* 气泡可视化 */}
        <div className="relative">
          <svg viewBox="0 0 200 200" className="w-full h-auto">
            {/* 水背景 */}
            <defs>
              <radialGradient id="giBubbleGrad" cx="40%" cy="40%">
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="50%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#0891b2" />
              </radialGradient>
              <radialGradient id="singleBubbleGrad" cx="40%" cy="40%">
                <stop offset="0%" stopColor="#fca5a5" />
                <stop offset="50%" stopColor="#f87171" />
                <stop offset="100%" stopColor="#dc2626" />
              </radialGradient>
              <filter id="bubbleGlow">
                <feGaussianBlur stdDeviation="2" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <rect x="0" y="0" width="200" height="200" fill="#0c4a6e" />
            
            {/* 水纹 */}
            <g opacity="0.2">
              {[0, 1, 2, 3].map((i) => (
                <line key={i} x1="0" y1={50 + i * 40} x2="200" y2={50 + i * 40} 
                      stroke="#67e8f9" strokeWidth="0.5" />
              ))}
            </g>
            
            {/* 气枪图示 */}
            <rect x="85" y="15" width="30" height="20" rx="3" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
            <text x="100" y="28" textAnchor="middle" fill="white" fontSize="6">GI</text>
            
            {/* GI气枪气泡 */}
            {bubbleState.radius > 0 && (
              <g>
                <circle 
                  cx="100" 
                  cy="100" 
                  r={bubbleState.radius}
                  fill="url(#giBubbleGrad)"
                  opacity="0.7"
                  filter="url(#bubbleGlow)"
                  className="transition-all duration-100"
                />
                {/* 气泡高光 */}
                <ellipse 
                  cx={100 - bubbleState.radius * 0.3} 
                  cy={100 - bubbleState.radius * 0.3} 
                  rx={bubbleState.radius * 0.3}
                  ry={bubbleState.radius * 0.2}
                  fill="white"
                  opacity="0.4"
                />
              </g>
            )}
            
            {/* 压力波纹 */}
            {phase >= 20 && phase < 50 && (
              <g opacity={(50 - phase) / 30}>
                {[1, 2, 3].map((i) => (
                  <circle
                    key={i}
                    cx="100"
                    cy="100"
                    r={bubbleState.radius + 10 + i * 15}
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="1"
                    opacity={1 - i * 0.3}
                  />
                ))}
              </g>
            )}
            
            {/* 标注 */}
            <text x="100" y="180" textAnchor="middle" fill="#67e8f9" fontSize="10" fontWeight="500">
              GI双腔气枪
            </text>
            <text x="100" y="192" textAnchor="middle" fill="#94a3b8" fontSize="8">
              半径: {bubbleState.radius.toFixed(1)} (归一化)
            </text>
          </svg>
        </div>
        
        {/* 对比：单腔气枪 */}
        <div className="relative">
          <svg viewBox="0 0 200 200" className="w-full h-auto">
            <rect x="0" y="0" width="200" height="200" fill="#0c4a6e" />
            
            <g opacity="0.2">
              {[0, 1, 2, 3].map((i) => (
                <line key={i} x1="0" y1={50 + i * 40} x2="200" y2={50 + i * 40} 
                      stroke="#fca5a5" strokeWidth="0.5" />
              ))}
            </g>
            
            <rect x="85" y="15" width="30" height="20" rx="3" fill="#991b1b" stroke="#7f1d1d" strokeWidth="1" />
            <text x="100" y="28" textAnchor="middle" fill="white" fontSize="6">单腔</text>
            
            {/* 单腔气枪气泡 - 有明显振荡 */}
            {singleBubbleState.radius > 0 && (
              <g>
                <circle 
                  cx="100" 
                  cy="100" 
                  r={Math.abs(singleBubbleState.radius)}
                  fill="url(#singleBubbleGrad)"
                  opacity="0.6"
                  className="transition-all duration-50"
                />
                <ellipse 
                  cx={100 - singleBubbleState.radius * 0.3} 
                  cy={100 - singleBubbleState.radius * 0.3} 
                  rx={Math.abs(singleBubbleState.radius) * 0.25}
                  ry={Math.abs(singleBubbleState.radius) * 0.15}
                  fill="white"
                  opacity="0.3"
                />
              </g>
            )}
            
            {/* 振荡波纹 - 更多且不规则 */}
            {phase >= 35 && (
              <g opacity="0.4">
                {[1, 2, 3, 4].map((i) => (
                  <circle
                    key={i}
                    cx="100"
                    cy="100"
                    r={singleBubbleState.radius + 5 + i * 12 + Math.sin(phase * 0.2 + i) * 5}
                    fill="none"
                    stroke="#f87171"
                    strokeWidth="0.8"
                    opacity={0.8 - i * 0.15}
                  />
                ))}
              </g>
            )}
            
            <text x="100" y="180" textAnchor="middle" fill="#fca5a5" fontSize="10" fontWeight="500">
              单腔气枪 (对比)
            </text>
            <text x="100" y="192" textAnchor="middle" fill="#94a3b8" fontSize="8">
              半径: {singleBubbleState.radius.toFixed(1)} (振荡明显)
            </text>
          </svg>
        </div>
      </div>
      
      {/* 气泡半径随时间变化曲线 */}
      <div className="mt-4">
        <h4 className="text-slate-400 text-sm mb-2 text-center">气泡半径-时间曲线</h4>
        <svg viewBox="0 0 240 160" className="w-full h-auto">
          <rect x="0" y="0" width="240" height="160" fill="#1e293b" rx="4" />
          
          {/* 网格 */}
          <g opacity="0.2">
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={`h${i}`} x1="20" y1={30 + i * 30} x2="220" y2={30 + i * 30} stroke="#475569" />
            ))}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <line key={`v${i}`} x1={20 + i * 40} y1="30" x2={20 + i * 40} y2="150" stroke="#475569" />
            ))}
          </g>
          
          {/* 坐标轴 */}
          <line x1="20" y1="150" x2="220" y2="150" stroke="#64748b" strokeWidth="1" />
          <line x1="20" y1="30" x2="20" y2="150" stroke="#64748b" strokeWidth="1" />
          
          {/* 曲线 */}
          {singlePath && (
            <path d={singlePath} fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.6" />
          )}
          {giPath && (
            <path d={giPath} fill="none" stroke="#22d3ee" strokeWidth="2" />
          )}
          
          {/* 当前点 */}
          {bubbleState.radius > 0 && (
            <circle 
              cx={20 + phase * 2} 
              cy={150 - bubbleState.radius * 2}
              r="4"
              fill="#22d3ee"
            />
          )}
          
          {/* 标签 */}
          <text x="120" y="12" textAnchor="middle" fill="#94a3b8" fontSize="8">气泡半径演化</text>
          <text x="220" y="148" textAnchor="end" fill="#64748b" fontSize="7">时间</text>
          <text x="12" y="90" fill="#64748b" fontSize="7" transform="rotate(-90, 12, 90)">半径</text>
          
          {/* 图例 */}
          <line x1="140" y1="20" x2="155" y2="20" stroke="#22d3ee" strokeWidth="2" />
          <text x="160" y="23" fill="#22d3ee" fontSize="7">GI双腔</text>
          <line x1="185" y1="20" x2="200" y2="20" stroke="#ef4444" strokeWidth="1.5" opacity="0.6" />
          <text x="205" y="23" fill="#ef4444" fontSize="7">单腔</text>
        </svg>
      </div>
      
      {/* 状态说明 */}
      <div className="mt-3 text-center">
        <p className="text-cyan-400 text-sm font-medium">{bubbleState.stage}</p>
        <p className="text-slate-500 text-xs mt-1">
          GI气枪通过Injector延迟注气，有效抑制气泡振荡，获得更锐利的地震子波
        </p>
      </div>
    </div>
  )
}
