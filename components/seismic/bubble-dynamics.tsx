"use client"

import { useMemo } from "react"

interface BubbleDynamicsProps {
  phase: number // 0-100
}

// 物理参数配置
const CONFIG = {
  pressure: 1800, // PSI - 气枪工作压力
  bubblePeriod: 50, // ms - 气泡振荡周期
  waterDepth: 60, // m - 水深
  totalTime: 200, // ms - 总显示时间，包含主脉冲+3个振荡周期
}

export function BubbleDynamics({ phase }: BubbleDynamicsProps) {
  // 将phase(0-100)映射到时间(0-200ms)
  const currentTime = useMemo(() => {
    return (phase / 100) * CONFIG.totalTime
  }, [phase])

  // ========== 正确的物理模型 ==========
  // 气泡半径演化遵循 Rayleigh-Willis 模型:
  // - t=0: 主脉冲，气泡开始急速膨胀
  // - t≈T/2 (25ms): 气泡膨胀到最大半径 Rmax
  // - t≈T (50ms): 气泡坍缩到最小半径 Rmin，急剧反弹 → 产生第1个振荡脉冲
  // - t≈2T (100ms): 第2个振荡脉冲
  // - t≈3T (150ms): 第3个振荡脉冲
  
  // 单腔气枪气泡半径 - 有明显的振荡
  const getSingleGunBubbleRadius = (t: number): number => {
    if (t < 0) return 0.05
    
    const T = CONFIG.bubblePeriod
    const cycleNumber = Math.floor(t / T)
    const timeInCycle = t % T
    
    // 衰减系数 - 每个周期能量损失约35%
    const damping = Math.pow(0.65, cycleNumber)
    
    // 最大和最小半径（归一化）
    const Rmax = 1.0 * damping
    const Rmin = 0.15 * damping + 0.1 // 最小半径不会完全为0
    
    // 使用正弦函数模拟气泡半径变化
    // 在 t=0 时半径最小（刚释放），t=T/2 时最大，t=T 时又回到最小
    const phaseAngle = (timeInCycle / T) * 2 * Math.PI
    const radius = (Rmax + Rmin) / 2 + ((Rmax - Rmin) / 2) * Math.sin(phaseAngle - Math.PI / 2)
    
    return Math.max(0.1, radius)
  }

  // GI双腔气枪气泡半径 - Injector抑制振荡
  const getGIGunBubbleRadius = (t: number): number => {
    if (t < 0) return 0.05
    
    const T = CONFIG.bubblePeriod
    
    // 第一个半周期：正常膨胀到最大
    if (t < T * 0.5) {
      const phase = t / (T * 0.5)
      return 0.1 + 0.9 * Math.sin(phase * Math.PI / 2)
    }
    
    // Injector在气泡接近最大时注入（t≈20-30ms）
    // 注入后气泡缓慢收缩，不会剧烈坍缩
    if (t < T) {
      const phase = (t - T * 0.5) / (T * 0.5)
      return 1.0 - 0.15 * phase // 缓慢收缩
    }
    
    // 后续：气泡平稳衰减，只有微小波动
    const decayTime = t - T
    const baseRadius = 0.85 * Math.exp(-decayTime / 150) + 0.15
    const microWave = 0.03 * Math.sin(2 * Math.PI * decayTime / 40) * Math.exp(-decayTime / 100)
    
    return Math.max(0.15, baseRadius + microWave)
  }

  // 压力脉冲计算 - 与气泡体积加速度相关 P ∝ d²V/dt²
  // 脉冲在气泡急剧变化时产生：1)初始膨胀 2)坍缩反弹点
  const getSingleGunPressure = (t: number): number => {
    if (t < 0) return 0
    
    const T = CONFIG.bubblePeriod
    
    // 主脉冲 - t=0附近，气泡开始急速膨胀
    if (t < 8) {
      return 1.0 * Math.exp(-t / 3)
    }
    
    // 气泡振荡脉冲 - 在每个周期的坍缩反弹点 (t = nT)
    for (let n = 1; n <= 3; n++) {
      const pulseTime = n * T
      const distance = Math.abs(t - pulseTime)
      if (distance < 8) {
        const damping = Math.pow(0.6, n)
        return damping * 0.75 * Math.exp(-distance / 3)
      }
    }
    
    return 0.02
  }

  const getGIPressure = (t: number): number => {
    if (t < 0) return 0
    
    // 主脉冲 - 与单腔相同
    if (t < 8) {
      return 1.0 * Math.exp(-t / 3)
    }
    
    // GI气枪几乎没有振荡脉冲，只有微弱残余
    const T = CONFIG.bubblePeriod
    if (Math.abs(t - T) < 8) {
      return 0.1 * Math.exp(-Math.abs(t - T) / 4)
    }
    
    return 0.01
  }

  // 当前气泡状态
  const currentState = useMemo(() => {
    const T = CONFIG.bubblePeriod
    const giRadius = getGIGunBubbleRadius(currentTime)
    const singleRadius = getSingleGunBubbleRadius(currentTime)
    
    let stage = ""
    let description = ""
    
    if (currentTime < 5) {
      stage = "主脉冲发射"
      description = "Generator放气，气泡开始急速膨胀，产生主脉冲"
    } else if (currentTime < T * 0.5) {
      stage = "气泡膨胀期"
      description = "气泡快速膨胀，此时GI的Injector准备注气"
    } else if (currentTime < T * 0.7) {
      stage = "GI Injector注气"
      description = `t≈${Math.round(T * 0.5)}ms: Injector注入气体，抑制气泡坍缩`
    } else if (currentTime < T) {
      stage = "气泡收缩期"
      description = "单腔气枪气泡急剧坍缩，GI气枪缓慢收缩"
    } else if (currentTime < T + 8) {
      stage = `第1次振荡脉冲 (t≈${T}ms)`
      description = "单腔气枪：气泡坍缩到最小并急剧反弹，产生振荡脉冲"
    } else if (currentTime < T * 2) {
      stage = "第1振荡周期"
      description = "单腔气枪气泡继续振荡，GI气枪趋于稳定"
    } else if (currentTime < T * 2 + 8) {
      stage = `第2次振荡脉冲 (t≈${T * 2}ms)`
      description = "单腔气枪第2次坍缩反弹"
    } else if (currentTime < T * 3) {
      stage = "第2振荡周期"
      description = "振荡逐渐衰减"
    } else if (currentTime < T * 3 + 8) {
      stage = `第3次振荡脉冲 (t≈${T * 3}ms)`
      description = "单腔气枪第3次坍缩反弹"
    } else {
      stage = "振荡衰减"
      description = "能量逐渐耗散"
    }
    
    return { giRadius, singleRadius, stage, description }
  }, [currentTime])

  // 生成曲线路径数据
  const curveData = useMemo(() => {
    const giRadiusPoints: string[] = []
    const singleRadiusPoints: string[] = []
    const giPressurePoints: string[] = []
    const singlePressurePoints: string[] = []
    
    const chartWidth = 200
    const chartHeight = 60
    
    for (let i = 0; i <= 200; i++) {
      const t = (i / 200) * CONFIG.totalTime
      const x = 30 + (i / 200) * chartWidth
      
      // 只绘制到当前时间
      if (t <= currentTime + 5) {
        // 气泡半径曲线
        const giR = getGIGunBubbleRadius(t)
        const singleR = getSingleGunBubbleRadius(t)
        const yGiR = 75 - giR * 50
        const ySingleR = 75 - singleR * 50
        
        giRadiusPoints.push(`${i === 0 ? 'M' : 'L'}${x},${yGiR}`)
        singleRadiusPoints.push(`${i === 0 ? 'M' : 'L'}${x},${ySingleR}`)
        
        // 压力曲线
        const giP = getGIPressure(t)
        const singleP = getSingleGunPressure(t)
        const yGiP = 155 - giP * 45
        const ySingleP = 155 - singleP * 45
        
        giPressurePoints.push(`${i === 0 ? 'M' : 'L'}${x},${yGiP}`)
        singlePressurePoints.push(`${i === 0 ? 'M' : 'L'}${x},${ySingleP}`)
      }
    }
    
    return {
      giRadius: giRadiusPoints.join(' '),
      singleRadius: singleRadiusPoints.join(' '),
      giPressure: giPressurePoints.join(' '),
      singlePressure: singlePressurePoints.join(' ')
    }
  }, [currentTime])

  // 时间标记位置
  const timeMarkers = [0, 50, 100, 150, 200]
  const markerX = (t: number) => 30 + (t / CONFIG.totalTime) * 200

  return (
    <div className="bg-slate-900 rounded-xl p-4 border border-cyan-500/30">
      <h3 className="text-cyan-400 font-semibold mb-2 text-center">
        气泡膨胀坍缩与压力脉冲演化
      </h3>
      
      {/* 参数显示 */}
      <div className="flex justify-center gap-4 mb-3 text-xs">
        <span className="text-amber-400">工作压力: {CONFIG.pressure} PSI</span>
        <span className="text-cyan-400">气泡周期T = {CONFIG.bubblePeriod}ms</span>
        <span className="text-green-400">水深: {CONFIG.waterDepth}m</span>
      </div>
      
      {/* 气泡可视化对比 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* GI双腔气枪 */}
        <div className="relative">
          <svg viewBox="0 0 180 160" className="w-full h-auto">
            <defs>
              <radialGradient id="giBubbleGrad" cx="30%" cy="30%">
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="60%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#0891b2" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* 水背景 */}
            <rect x="0" y="0" width="180" height="160" fill="#0c4a6e" rx="8" />
            
            {/* 气枪示意 */}
            <rect x="75" y="10" width="30" height="18" rx="3" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
            <text x="90" y="22" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">GI</text>
            
            {/* GI气泡 - 振荡被抑制 */}
            <circle 
              cx="90" 
              cy="85" 
              r={currentState.giRadius * 45}
              fill="url(#giBubbleGrad)"
              opacity="0.75"
              filter="url(#glow)"
            />
            {currentState.giRadius > 0.2 && (
              <ellipse 
                cx={90 - currentState.giRadius * 15} 
                cy={85 - currentState.giRadius * 15} 
                rx={currentState.giRadius * 12}
                ry={currentState.giRadius * 8}
                fill="white"
                opacity="0.4"
              />
            )}
            
            {/* 主脉冲波纹 */}
            {currentTime < 30 && currentTime > 0 && (
              <g opacity={1 - currentTime / 30}>
                {[1, 2, 3].map((i) => (
                  <circle
                    key={i}
                    cx="90"
                    cy="85"
                    r={currentState.giRadius * 45 + currentTime * 1.5 + i * 8}
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="1.5"
                    opacity={0.8 - i * 0.25}
                  />
                ))}
              </g>
            )}
            
            {/* 标签 */}
            <text x="90" y="145" textAnchor="middle" fill="#22c55e" fontSize="11" fontWeight="600">
              GI双腔气枪
            </text>
            <text x="90" y="156" textAnchor="middle" fill="#94a3b8" fontSize="8">
              Injector抑制振荡
            </text>
          </svg>
        </div>
        
        {/* 单腔气枪对比 */}
        <div className="relative">
          <svg viewBox="0 0 180 160" className="w-full h-auto">
            <defs>
              <radialGradient id="singleBubbleGrad" cx="30%" cy="30%">
                <stop offset="0%" stopColor="#fca5a5" />
                <stop offset="60%" stopColor="#f87171" />
                <stop offset="100%" stopColor="#dc2626" />
              </radialGradient>
            </defs>
            
            <rect x="0" y="0" width="180" height="160" fill="#0c4a6e" rx="8" />
            
            <rect x="75" y="10" width="30" height="18" rx="3" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
            <text x="90" y="22" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">单腔</text>
            
            {/* 单腔气泡 - 有明显振荡 */}
            <circle 
              cx="90" 
              cy="85" 
              r={currentState.singleRadius * 45}
              fill="url(#singleBubbleGrad)"
              opacity="0.7"
            />
            {currentState.singleRadius > 0.2 && (
              <ellipse 
                cx={90 - currentState.singleRadius * 12} 
                cy={85 - currentState.singleRadius * 12} 
                rx={currentState.singleRadius * 10}
                ry={currentState.singleRadius * 6}
                fill="white"
                opacity="0.35"
              />
            )}
            
            {/* 振荡脉冲波纹 - 在坍缩反弹点显示 */}
            {[50, 100, 150].map((pulseT, idx) => {
              const dist = Math.abs(currentTime - pulseT)
              if (dist < 15) {
                return (
                  <g key={pulseT} opacity={1 - dist / 15}>
                    {[1, 2, 3].map((i) => (
                      <circle
                        key={i}
                        cx="90"
                        cy="85"
                        r={currentState.singleRadius * 45 + dist * 2 + i * 6}
                        fill="none"
                        stroke="#f87171"
                        strokeWidth="1.2"
                        opacity={0.7 - i * 0.2}
                      />
                    ))}
                  </g>
                )
              }
              return null
            })}
            
            <text x="90" y="145" textAnchor="middle" fill="#f87171" fontSize="11" fontWeight="600">
              单腔气枪
            </text>
            <text x="90" y="156" textAnchor="middle" fill="#94a3b8" fontSize="8">
              气泡振荡周期≈{CONFIG.bubblePeriod}ms
            </text>
          </svg>
        </div>
      </div>
      
      {/* 气泡半径 + 压力脉冲曲线图 */}
      <div className="bg-slate-800/50 rounded-lg p-2">
        <svg viewBox="0 0 260 180" className="w-full h-auto">
          {/* 背景 */}
          <rect x="0" y="0" width="260" height="180" fill="#1e293b" rx="4" />
          
          {/* === 上半部分：气泡半径曲线 === */}
          <text x="130" y="12" textAnchor="middle" fill="#94a3b8" fontSize="9">
            气泡半径 R/Rmax
          </text>
          
          {/* 网格线 */}
          <g opacity="0.3">
            {[25, 45, 65].map((y) => (
              <line key={y} x1="30" y1={y} x2="230" y2={y} stroke="#475569" strokeWidth="0.5" />
            ))}
          </g>
          
          {/* 时间标记线 - 50ms间隔 */}
          {timeMarkers.map((t) => (
            <g key={t}>
              <line 
                x1={markerX(t)} y1="20" x2={markerX(t)} y2="75" 
                stroke={t > 0 && t < 200 ? "#fbbf24" : "#475569"} 
                strokeWidth={t > 0 && t < 200 ? "1" : "0.5"}
                strokeDasharray={t > 0 && t < 200 ? "3,2" : "none"}
                opacity={t > 0 && t < 200 ? 0.6 : 0.3}
              />
            </g>
          ))}
          
          {/* 坐标轴 */}
          <line x1="30" y1="75" x2="230" y2="75" stroke="#64748b" strokeWidth="1" />
          <line x1="30" y1="20" x2="30" y2="75" stroke="#64748b" strokeWidth="1" />
          
          {/* 曲线 */}
          <path d={curveData.singleRadius} fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.8" />
          <path d={curveData.giRadius} fill="none" stroke="#22d3ee" strokeWidth="2" />
          
          {/* 当前时间指示线 */}
          <line 
            x1={30 + (currentTime / CONFIG.totalTime) * 200} y1="20"
            x2={30 + (currentTime / CONFIG.totalTime) * 200} y2="75"
            stroke="#fbbf24" strokeWidth="2"
          />
          
          {/* Y轴标签 */}
          <text x="25" y="25" textAnchor="end" fill="#64748b" fontSize="7">1.0</text>
          <text x="25" y="50" textAnchor="end" fill="#64748b" fontSize="7">0.5</text>
          <text x="25" y="73" textAnchor="end" fill="#64748b" fontSize="7">0</text>
          
          {/* === 下半部分：压力脉冲曲线 === */}
          <text x="130" y="95" textAnchor="middle" fill="#94a3b8" fontSize="9">
            压力脉冲 P (归一化)
          </text>
          
          {/* 标记振荡脉冲位置 */}
          {[50, 100, 150].map((t, idx) => (
            <g key={t}>
              <line 
                x1={markerX(t)} y1="105" x2={markerX(t)} y2="160" 
                stroke="#ef4444" strokeWidth="1" strokeDasharray="3,2" opacity="0.5"
              />
              <text x={markerX(t)} y="172" textAnchor="middle" fill="#ef4444" fontSize="7">
                {t}ms
              </text>
              <text x={markerX(t)} y="102" textAnchor="middle" fill="#fbbf24" fontSize="6">
                振荡{idx + 1}
              </text>
            </g>
          ))}
          
          {/* 主脉冲标记 */}
          <text x={markerX(0) + 5} y="102" textAnchor="start" fill="#22c55e" fontSize="6">
            主脉冲
          </text>
          
          {/* 零线 */}
          <line x1="30" y1="155" x2="230" y2="155" stroke="#475569" strokeWidth="0.5" />
          
          {/* 坐标轴 */}
          <line x1="30" y1="160" x2="230" y2="160" stroke="#64748b" strokeWidth="1" />
          <line x1="30" y1="105" x2="30" y2="160" stroke="#64748b" strokeWidth="1" />
          
          {/* 压力曲线 */}
          <path d={curveData.singlePressure} fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.8" />
          <path d={curveData.giPressure} fill="none" stroke="#22d3ee" strokeWidth="2" />
          
          {/* 当前时间指示线 */}
          <line 
            x1={30 + (currentTime / CONFIG.totalTime) * 200} y1="105"
            x2={30 + (currentTime / CONFIG.totalTime) * 200} y2="160"
            stroke="#fbbf24" strokeWidth="2"
          />
          
          {/* 时间轴标签 */}
          {timeMarkers.map((t) => (
            <text key={t} x={markerX(t)} y="170" textAnchor="middle" fill="#64748b" fontSize="7">
              {t === 0 ? "0" : ""}
            </text>
          ))}
          <text x="235" y="163" textAnchor="start" fill="#64748b" fontSize="7">t(ms)</text>
          
          {/* 图例 */}
          <g transform="translate(150, 82)">
            <line x1="0" y1="0" x2="12" y2="0" stroke="#22d3ee" strokeWidth="2" />
            <text x="15" y="3" fill="#22d3ee" fontSize="7">GI双腔</text>
            <line x1="50" y1="0" x2="62" y2="0" stroke="#ef4444" strokeWidth="2" />
            <text x="65" y="3" fill="#ef4444" fontSize="7">单腔</text>
          </g>
        </svg>
      </div>
      
      {/* 当前时间和状态 */}
      <div className="mt-3 text-center space-y-1">
        <div className="flex justify-center items-center gap-3">
          <span className="text-amber-400 font-mono text-sm">t = {currentTime.toFixed(0)} ms</span>
          <span className="text-cyan-400 font-medium text-sm">{currentState.stage}</span>
        </div>
        <p className="text-slate-400 text-xs">{currentState.description}</p>
      </div>
      
      {/* 物理说明 */}
      <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-500 space-y-1">
        <p><span className="text-amber-400">关键原理：</span>气泡振荡脉冲产生于气泡<span className="text-red-400">坍缩到最小并急剧反弹</span>的时刻 (t = nT, n=1,2,3...)</p>
        <p><span className="text-green-400">GI抑制机制：</span>Injector在气泡膨胀期注入气体，阻止气泡剧烈坍缩，从而消除振荡脉冲</p>
      </div>
    </div>
  )
}
