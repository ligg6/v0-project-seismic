"use client"

import { useMemo } from "react"

interface BubbleDynamicsProps {
  phase: number
}

// 参数配置
const CONFIG = {
  pressure: 1800, // PSI
  bubblePeriod: 50, // ms - 气泡振荡周期
  waterDepth: 60, // m
  oscillationCycles: 3, // 显示2-3个气泡振荡周期
}

export function BubbleDynamics({ phase }: BubbleDynamicsProps) {
  // 计算时间（总周期约250ms，显示2-3个振荡周期，每个约50ms）
  const currentTime = useMemo(() => {
    if (phase < 15) return 0
    return Math.round(((phase - 15) / 85) * 250) // 0-250ms
  }, [phase])

  // 计算气泡状态 - 基于50ms周期
  const bubbleState = useMemo(() => {
    // GI气枪气泡演化
    // 0-15: 无气泡
    // 15-30: 快速膨胀（Generator放气，0-50ms内达到最大）
    // 30-45: Injector介入，抑制振荡
    // 45-100: 稳定坍缩，残余小振荡（2-3个周期）
    
    if (phase < 15) {
      return { radius: 0, pressure: 0, stage: "充气准备", time: 0 }
    } else if (phase < 30) {
      const t = (phase - 15) / 15
      return { 
        radius: 45 * Math.sqrt(t), 
        pressure: 100 * (1 - t * 0.6),
        stage: "Generator放气 - 气泡快速膨胀",
        time: currentTime
      }
    } else if (phase < 45) {
      const t = (phase - 30) / 15
      return { 
        radius: 45 + 15 * t, 
        pressure: 40 - 20 * t,
        stage: `Injector注气 - 抑制振荡 (t≈${CONFIG.bubblePeriod}ms)`,
        time: currentTime
      }
    } else if (phase < 65) {
      const t = (phase - 45) / 20
      return { 
        radius: 60 * (1 - t * 0.6), 
        pressure: 20 + 30 * t,
        stage: "第1次坍缩 - 能量释放",
        time: currentTime
      }
    } else if (phase < 80) {
      // 残余振荡 - 被抑制后很小
      const t = (phase - 65) / 15
      const oscillation = Math.sin(t * Math.PI * 2) * 5 * (1 - t * 0.5)
      return { 
        radius: 24 + oscillation, 
        pressure: 50 + 15 * t,
        stage: "残余振荡 - 幅度小",
        time: currentTime
      }
    } else {
      // 第2-3个周期，振幅更小
      const t = (phase - 80) / 20
      const oscillation = Math.sin(t * Math.PI * 3) * 3 * (1 - t)
      return { 
        radius: 20 + oscillation, 
        pressure: 65 + 20 * t,
        stage: "趋于稳定",
        time: currentTime
      }
    }
  }, [phase, currentTime])

  // 对比：单腔气枪气泡 - 显示2-3个明显的振荡周期
  const singleBubbleState = useMemo(() => {
    if (phase < 15) {
      return { radius: 0 }
    } else if (phase < 30) {
      const t = (phase - 15) / 15
      return { radius: 45 * Math.sqrt(t) }
    } else {
      // 单腔气枪会有显著的气泡振荡 - 50ms周期，2-3个完整周期
      const t = (phase - 30) / 70 // 归一化时间
      // 模拟衰减的振荡，周期约50ms
      const oscillationFreq = (2 * Math.PI) / (50 / 200) * t // 调整频率使其符合50ms周期
      const amplitude = 30 * Math.exp(-t * 1.5) // 衰减振幅
      const baseRadius = 45 - t * 20 // 基础半径逐渐减小
      const oscillation = amplitude * Math.sin(t * Math.PI * CONFIG.oscillationCycles * 2)
      return { radius: Math.max(10, baseRadius + oscillation) }
    }
  }, [phase])

  // 生成气泡半径-时间曲线数据
  const pvCurveData = useMemo(() => {
    const giPoints: { x: number; y: number }[] = []
    const singlePoints: { x: number; y: number }[] = []
    
    const currentPhase = Math.min(phase, 100)
    
    for (let p = 0; p <= currentPhase; p += 1) {
      // GI气枪 - 被抑制的振荡
      let giRadius = 0
      if (p >= 15 && p < 30) {
        giRadius = 45 * Math.sqrt((p - 15) / 15)
      } else if (p >= 30 && p < 45) {
        giRadius = 45 + 15 * ((p - 30) / 15)
      } else if (p >= 45 && p < 65) {
        giRadius = 60 * (1 - ((p - 45) / 20) * 0.6)
      } else if (p >= 65 && p < 80) {
        const t = (p - 65) / 15
        giRadius = 24 + Math.sin(t * Math.PI * 2) * 5 * (1 - t * 0.5)
      } else if (p >= 80) {
        const t = (p - 80) / 20
        giRadius = 20 + Math.sin(t * Math.PI * 3) * 3 * (1 - t)
      }
      
      // 单腔 - 明显的振荡，2-3个周期
      let singleRadius = 0
      if (p >= 15 && p < 30) {
        singleRadius = 45 * Math.sqrt((p - 15) / 15)
      } else if (p >= 30) {
        const t = (p - 30) / 70
        const amplitude = 30 * Math.exp(-t * 1.5)
        const baseRadius = 45 - t * 20
        singleRadius = Math.max(10, baseRadius + amplitude * Math.sin(t * Math.PI * CONFIG.oscillationCycles * 2))
      }
      
      if (giRadius > 0) giPoints.push({ x: p * 2, y: 130 - giRadius * 1.8 })
      if (singleRadius > 0) singlePoints.push({ x: p * 2, y: 130 - singleRadius * 1.8 })
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
      <h3 className="text-cyan-400 font-semibold mb-2 text-center">气泡膨胀坍缩动态对比</h3>
      
      {/* 参数显示 */}
      <div className="flex justify-center gap-4 mb-3 text-xs">
        <span className="text-amber-400">气泡周期T≈{CONFIG.bubblePeriod}ms</span>
        <span className="text-cyan-400">当前时间: {currentTime}ms</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* GI双腔气枪气泡可视化 */}
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
            <rect x="85" y="15" width="30" height="20" rx="3" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
            <text x="100" y="28" textAnchor="middle" fill="white" fontSize="6">GI</text>
            
            {/* GI气枪气泡 - 振荡被抑制 */}
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
            
            {/* 压力波纹 - 主脉冲 */}
            {phase >= 15 && phase < 45 && (
              <g opacity={(45 - phase) / 30}>
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
            <text x="100" y="175" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="500">
              GI双腔气枪
            </text>
            <text x="100" y="188" textAnchor="middle" fill="#94a3b8" fontSize="8">
              振荡被有效抑制
            </text>
          </svg>
        </div>
        
        {/* 对比：单腔气枪 - 显示2-3个振荡周期 */}
        <div className="relative">
          <svg viewBox="0 0 200 200" className="w-full h-auto">
            <rect x="0" y="0" width="200" height="200" fill="#0c4a6e" />
            
            <g opacity="0.2">
              {[0, 1, 2, 3].map((i) => (
                <line key={i} x1="0" y1={50 + i * 40} x2="200" y2={50 + i * 40} 
                      stroke="#fca5a5" strokeWidth="0.5" />
              ))}
            </g>
            
            <rect x="85" y="15" width="30" height="20" rx="3" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
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
            
            {/* 振荡波纹 - 更多且不规则，表示2-3个振荡周期 */}
            {phase >= 30 && (
              <g opacity="0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <circle
                    key={i}
                    cx="100"
                    cy="100"
                    r={singleBubbleState.radius + 5 + i * 10 + Math.sin(phase * 0.15 + i) * 5}
                    fill="none"
                    stroke="#f87171"
                    strokeWidth="0.8"
                    opacity={0.8 - i * 0.12}
                  />
                ))}
              </g>
            )}
            
            <text x="100" y="175" textAnchor="middle" fill="#f87171" fontSize="10" fontWeight="500">
              单腔气枪 (对比)
            </text>
            <text x="100" y="188" textAnchor="middle" fill="#94a3b8" fontSize="8">
              2-3个振荡周期 (T≈{CONFIG.bubblePeriod}ms)
            </text>
          </svg>
        </div>
      </div>
      
      {/* 气泡半径随时间变化曲线 - 显示50ms周期标记 */}
      <div className="mt-4">
        <h4 className="text-slate-400 text-sm mb-2 text-center">气泡半径-时间曲线 (气泡周期T≈{CONFIG.bubblePeriod}ms)</h4>
        <svg viewBox="0 0 260 160" className="w-full h-auto">
          <rect x="0" y="0" width="260" height="160" fill="#1e293b" rx="4" />
          
          {/* 网格 */}
          <g opacity="0.2">
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={`h${i}`} x1="30" y1={25 + i * 25} x2="240" y2={25 + i * 25} stroke="#475569" />
            ))}
            {/* 时间刻度线 - 每50ms一条 */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <line key={`v${i}`} x1={30 + i * 42} y1="25" x2={30 + i * 42} y2="130" stroke="#475569" />
            ))}
          </g>
          
          {/* 50ms周期标记 */}
          <g>
            {[1, 2, 3].map((i) => (
              <g key={i}>
                <line x1={30 + i * 42} y1="25" x2={30 + i * 42} y2="130" stroke="#fbbf24" strokeWidth="1" strokeDasharray="3" opacity="0.5" />
                <text x={30 + i * 42} y="140" textAnchor="middle" fill="#fbbf24" fontSize="7">{i * 50}ms</text>
              </g>
            ))}
          </g>
          
          {/* 坐标轴 */}
          <line x1="30" y1="130" x2="240" y2="130" stroke="#64748b" strokeWidth="1" />
          <line x1="30" y1="25" x2="30" y2="130" stroke="#64748b" strokeWidth="1" />
          
          {/* 曲线 */}
          {singlePath && (
            <path d={singlePath} fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.7" />
          )}
          {giPath && (
            <path d={giPath} fill="none" stroke="#22d3ee" strokeWidth="2" />
          )}
          
          {/* 当前点 */}
          {bubbleState.radius > 0 && (
            <circle 
              cx={30 + phase * 2} 
              cy={130 - bubbleState.radius * 1.8}
              r="4"
              fill="#22d3ee"
            />
          )}
          
          {/* 振荡周期标注 */}
          <g>
            <rect x="60" y="95" width="80" height="20" fill="#1e293b" stroke="#ef4444" strokeWidth="1" rx="2" opacity="0.8" />
            <text x="100" y="108" textAnchor="middle" fill="#ef4444" fontSize="7">第1-3振荡周期</text>
          </g>
          
          {/* 标签 */}
          <text x="135" y="12" textAnchor="middle" fill="#94a3b8" fontSize="9">气泡半径演化 (显示2-3个振荡周期)</text>
          <text x="240" y="128" textAnchor="end" fill="#64748b" fontSize="7">t (ms)</text>
          <text x="20" y="77" fill="#64748b" fontSize="7" transform="rotate(-90, 20, 77)">半径</text>
          
          {/* 图例 */}
          <g transform="translate(150, 18)">
            <line x1="0" y1="5" x2="15" y2="5" stroke="#22d3ee" strokeWidth="2" />
            <text x="20" y="8" fill="#22d3ee" fontSize="7">GI双腔</text>
            <line x1="55" y1="5" x2="70" y2="5" stroke="#ef4444" strokeWidth="1.5" opacity="0.7" />
            <text x="75" y="8" fill="#ef4444" fontSize="7">单腔</text>
          </g>
        </svg>
      </div>
      
      {/* 状态说明 */}
      <div className="mt-3 text-center">
        <p className="text-cyan-400 text-sm font-medium">{bubbleState.stage}</p>
        <p className="text-slate-500 text-xs mt-1">
          单腔气枪: 主脉冲后每{CONFIG.bubblePeriod}ms出现一次气泡振荡 | GI气枪: Injector在t≈{CONFIG.bubblePeriod}ms注气有效抑制振荡
        </p>
      </div>
    </div>
  )
}
