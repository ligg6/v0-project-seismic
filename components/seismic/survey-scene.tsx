"use client"

import { useMemo } from "react"

interface SurveySceneProps {
  phase: number
  time: number // 用于动画
}

// 参数配置
const CONFIG = {
  pressure: 1800, // PSI
  bubblePeriod: 50, // ms - 气泡振荡周期
  waterDepth: 60, // m
  soundSpeed: 1500, // m/s 水中声速
  channels: 48, // 48通道水听器
  totalTime: 200, // ms
}

export function SurveyScene({ phase, time }: SurveySceneProps) {
  // 将phase映射到时间
  const currentTime = (phase / 100) * CONFIG.totalTime
  const T = CONFIG.bubblePeriod

  // 计算地震波传播 - 基于水深60m
  const waveRadius = useMemo(() => {
    if (currentTime < 2) return 0
    // 波速约1500m/s，60m水深约40ms到达海底
    return Math.min(450, currentTime * 5)
  }, [currentTime])

  // 反射波 - 从海底返回（约40ms后开始）
  const reflectionPhase = useMemo(() => {
    const travelTimeToBottom = (CONFIG.waterDepth / CONFIG.soundSpeed) * 1000 // ms
    if (currentTime < travelTimeToBottom) return 0
    return Math.min(350, (currentTime - travelTimeToBottom) * 4)
  }, [currentTime])

  // 气泡振荡波 - 在t=50, 100, 150ms产生（单腔气枪效应演示）
  const bubbleOscillationWaves = useMemo(() => {
    const waves: { time: number; radius: number; opacity: number }[] = []
    const oscillationTimes = [T, T * 2, T * 3] // 50, 100, 150ms
    
    oscillationTimes.forEach((oscTime, idx) => {
      if (currentTime > oscTime && currentTime < oscTime + 60) {
        const elapsed = currentTime - oscTime
        waves.push({
          time: oscTime,
          radius: elapsed * 4,
          opacity: Math.max(0.1, 0.5 - elapsed / 120) * Math.pow(0.65, idx)
        })
      }
    })
    
    return waves
  }, [currentTime, T])

  return (
    <div className="bg-gradient-to-b from-sky-200 via-sky-300 to-sky-400 rounded-xl overflow-hidden border border-cyan-500/30">
      <svg viewBox="0 0 800 520" className="w-full h-auto">
        <defs>
          {/* 水面渐变 */}
          <linearGradient id="waterSurface" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
          
          {/* 海底渐变 */}
          <linearGradient id="seabedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#92400e" />
            <stop offset="50%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>
          
          {/* 地层渐变 */}
          <linearGradient id="layer1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a16207" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>
          
          <linearGradient id="layer2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#65a30d" />
            <stop offset="100%" stopColor="#4d7c0f" />
          </linearGradient>
          
          {/* 发光效果 */}
          <filter id="glowEffect">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* 天空 */}
        <rect x="0" y="0" width="800" height="80" fill="#7dd3fc" />
        
        {/* 太阳 */}
        <circle cx="720" cy="40" r="25" fill="#fbbf24" filter="url(#glowEffect)" />
        
        {/* 云 */}
        <g fill="white" opacity="0.8">
          <ellipse cx="100" cy="30" rx="40" ry="15" />
          <ellipse cx="130" cy="25" rx="30" ry="12" />
          <ellipse cx="300" cy="45" rx="35" ry="12" />
        </g>
        
        {/* 水面 - 60m水深，按比例显示 */}
        <rect x="0" y="80" width="800" height="240" fill="url(#waterSurface)" />
        
        {/* 水深标尺 */}
        <g transform="translate(760, 85)">
          <line x1="0" y1="0" x2="0" y2="230" stroke="white" strokeWidth="1" opacity="0.5" />
          <line x1="-5" y1="0" x2="5" y2="0" stroke="white" strokeWidth="1" opacity="0.5" />
          <line x1="-5" y1="115" x2="5" y2="115" stroke="white" strokeWidth="1" opacity="0.5" />
          <line x1="-5" y1="230" x2="5" y2="230" stroke="white" strokeWidth="1" opacity="0.5" />
          <text x="15" y="5" fill="white" fontSize="8">0m</text>
          <text x="15" y="118" fill="white" fontSize="8">30m</text>
          <text x="15" y="235" fill="white" fontSize="8">{CONFIG.waterDepth}m</text>
        </g>
        
        {/* 水面波纹 */}
        <g opacity="0.3">
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={i}
              d={`M 0 ${85 + i * 8} Q ${100 + Math.sin(time * 0.002 + i) * 20} ${83 + i * 8 + Math.sin(time * 0.003 + i) * 3}, 200 ${85 + i * 8} T 400 ${85 + i * 8} T 600 ${85 + i * 8} T 800 ${85 + i * 8}`}
              fill="none"
              stroke="white"
              strokeWidth="1"
            />
          ))}
        </g>
        
        {/* 勘探船 */}
        <g transform="translate(120, 50)">
          {/* 船体 */}
          <path d="M 0 40 L 20 60 L 100 60 L 120 40 L 100 40 L 90 50 L 30 50 L 20 40 Z" 
                fill="#1e3a5f" stroke="#0f172a" strokeWidth="1" />
          {/* 船舱 */}
          <rect x="35" y="20" width="50" height="20" fill="#334155" stroke="#1e293b" strokeWidth="1" />
          <rect x="40" y="25" width="10" height="10" fill="#67e8f9" opacity="0.5" />
          <rect x="55" y="25" width="10" height="10" fill="#67e8f9" opacity="0.5" />
          <rect x="70" y="25" width="10" height="10" fill="#67e8f9" opacity="0.5" />
          {/* 驾驶舱 */}
          <rect x="45" y="5" width="30" height="15" fill="#475569" stroke="#334155" strokeWidth="1" />
          <rect x="50" y="8" width="8" height="8" fill="#38bdf8" opacity="0.6" />
          <rect x="62" y="8" width="8" height="8" fill="#38bdf8" opacity="0.6" />
          {/* 天线 */}
          <line x1="60" y1="5" x2="60" y2="-10" stroke="#64748b" strokeWidth="2" />
          <circle cx="60" cy="-12" r="3" fill="#ef4444" />
          {/* 船名 */}
          <text x="60" y="55" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">SURVEY</text>
        </g>
        
        {/* 48通道多道拖缆系统 */}
        <g>
          {/* 主拖缆 - 更长以容纳48通道 */}
          <path 
            d={`M 240 100 Q 320 115 420 125 T 620 140 T 795 148`}
            fill="none" 
            stroke="#fbbf24" 
            strokeWidth="2.5"
          />
          
          {/* 48个检波器（水听器） - 分组显示 */}
          {/* 显示代表性的通道，标注总数 */}
          {Array.from({ length: 16 }).map((_, i) => {
            const progress = i / 15
            const x = 260 + progress * 520
            const y = 108 + progress * 38 + Math.sin(time * 0.003 + i) * 1.5
            const channelNum = Math.round(1 + (i / 15) * 47)
            return (
              <g key={i} transform={`translate(${x}, ${y})`}>
                <rect x="-6" y="-2.5" width="12" height="5" rx="1.5" fill="#22c55e" stroke="#15803d" strokeWidth="0.8" />
                <circle cx="0" cy="0" r="1.5" fill="#bbf7d0" />
                {/* 只显示部分通道号 */}
                {(i === 0 || i === 5 || i === 10 || i === 15) && (
                  <text x="0" y="10" textAnchor="middle" fill="#bbf7d0" fontSize="5">CH{channelNum}</text>
                )}
              </g>
            )
          })}
          
          {/* 拖缆标签 */}
          <g transform="translate(500, 165)">
            <rect x="-80" y="-10" width="160" height="20" rx="4" fill="rgba(15, 23, 42, 0.7)" />
            <text x="0" y="4" textAnchor="middle" fill="#fef3c7" fontSize="10" fontWeight="500">
              {CONFIG.channels}通道多道拖缆 (水听器阵列)
            </text>
          </g>
        </g>
        
        {/* GI气枪震源 */}
        <g transform="translate(250, 135)">
          {/* 气枪本体 - 双腔结构 */}
          <rect x="-22" y="-14" width="44" height="28" rx="5" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
          <rect x="-17" y="-10" width="14" height="20" fill="#7f1d1d" rx="2" />
          <text x="-10" y="4" textAnchor="middle" fill="#fca5a5" fontSize="6" fontWeight="bold">G</text>
          <rect x="3" y="-10" width="14" height="20" fill="#450a0a" rx="2" />
          <text x="10" y="4" textAnchor="middle" fill="#fca5a5" fontSize="6" fontWeight="bold">I</text>
          
          <text x="0" y="28" textAnchor="middle" fill="#fca5a5" fontSize="8" fontWeight="bold">GI Airgun</text>
          <text x="0" y="38" textAnchor="middle" fill="#fca5a5" fontSize="6">{CONFIG.pressure} PSI</text>
          
          {/* 气管连接 */}
          <path d="M 0 -14 Q 0 -35 -20 -50 L -60 -75" fill="none" stroke="#fbbf24" strokeWidth="2" />
          
          {/* 主气泡 - 根据时间演化 */}
          {currentTime > 2 && currentTime < 180 && (
            <g>
              {(() => {
                let bubbleR = 0
                if (currentTime < T * 0.5) {
                  // 膨胀期
                  bubbleR = 8 + (currentTime / (T * 0.5)) * 22
                } else if (currentTime < T) {
                  // 缓慢收缩（GI效果）
                  bubbleR = 30 - ((currentTime - T * 0.5) / (T * 0.5)) * 5
                } else {
                  // 逐渐衰减
                  bubbleR = 25 * Math.exp(-(currentTime - T) / 100) + 8
                }
                return (
                  <>
                    <circle
                      cx="0"
                      cy={55 + (currentTime / 200) * 20}
                      r={Math.max(5, bubbleR)}
                      fill="#67e8f9"
                      opacity={Math.max(0.2, 0.7 - currentTime / 250)}
                    />
                    {/* 小气泡 */}
                    {[0, 1, 2].map((j) => {
                      const bPhase = (currentTime + j * 15) % 60
                      if (bPhase > 45) return null
                      return (
                        <circle
                          key={j}
                          cx={-8 + j * 8}
                          cy={50 + bPhase * 1.5}
                          r={2 + bPhase * 0.15}
                          fill="#67e8f9"
                          opacity={0.5 - bPhase / 100}
                        />
                      )
                    })}
                  </>
                )
              })()}
            </g>
          )}
        </g>
        
        {/* 主地震波传播 - 下行波 (t=0开始) */}
        {waveRadius > 0 && waveRadius < 400 && (
          <g opacity={Math.max(0.1, 1 - waveRadius / 500)}>
            {[0.3, 0.6, 0.9].map((scale, i) => (
              <ellipse
                key={i}
                cx="250"
                cy="140"
                rx={waveRadius * scale}
                ry={waveRadius * scale * 0.55}
                fill="none"
                stroke="#22d3ee"
                strokeWidth={2 - i * 0.5}
                opacity={1 - i * 0.3}
              />
            ))}
            <text x="250" y={140 + waveRadius * 0.4} textAnchor="middle" fill="#22d3ee" fontSize="8" opacity={Math.max(0.3, 1 - waveRadius / 300)}>
              主脉冲 (t=0)
            </text>
          </g>
        )}
        
        {/* 气泡振荡产生的次生波 - 50ms周期后（单腔气枪效应演示） */}
        {bubbleOscillationWaves.map((wave, idx) => (
          <g key={wave.time} opacity={wave.opacity}>
            {[0.3, 0.5].map((scale, i) => (
              <ellipse
                key={i}
                cx="250"
                cy="140"
                rx={wave.radius * scale}
                ry={wave.radius * scale * 0.5}
                fill="none"
                stroke="#f97316"
                strokeWidth={1.2 - i * 0.3}
                strokeDasharray="5 3"
                opacity={0.7 - i * 0.3}
              />
            ))}
            <text 
              x={250 + wave.radius * 0.4} 
              y={140 + wave.radius * 0.2} 
              fill="#f97316" 
              fontSize="7" 
              opacity={wave.opacity}
            >
              振荡{idx + 1} (t={wave.time}ms)
            </text>
          </g>
        ))}
        
        {/* 海底 - 60m深度 */}
        <path 
          d="M 0 320 Q 100 330 200 325 T 400 335 T 600 320 T 800 330 L 800 520 L 0 520 Z" 
          fill="url(#seabedGradient)" 
        />
        
        {/* 地层1 */}
        <path 
          d="M 0 370 Q 150 380 300 375 T 550 385 T 800 380 L 800 520 L 0 520 Z" 
          fill="url(#layer1)" 
        />
        
        {/* 地层2 - 含油气层（目标层） */}
        <path 
          d="M 0 440 Q 200 430 350 435 T 600 425 T 800 435 L 800 520 L 0 520 Z" 
          fill="url(#layer2)" 
        />
        
        {/* 油气藏标示 */}
        <ellipse cx="450" cy="460" rx="80" ry="25" fill="#fbbf24" opacity="0.4" />
        <text x="450" y="465" textAnchor="middle" fill="#fef3c7" fontSize="10" fontWeight="bold">目标油气藏</text>
        
        {/* 反射波 - 从海底返回 */}
        {reflectionPhase > 0 && reflectionPhase < 280 && (
          <g opacity={Math.max(0.1, 1 - reflectionPhase / 350)}>
            {[0.3, 0.6, 0.9].map((scale, i) => (
              <ellipse
                key={i}
                cx="350"
                cy="325"
                rx={reflectionPhase * scale}
                ry={reflectionPhase * scale * 0.35}
                fill="none"
                stroke="#f97316"
                strokeWidth={1.5 - i * 0.3}
                opacity={1 - i * 0.3}
                strokeDasharray="6 3"
              />
            ))}
          </g>
        )}
        
        {/* 射线路径标注 */}
        {currentTime > 20 && currentTime < 150 && (
          <g opacity="0.6">
            {/* 入射波 */}
            <line x1="250" y1="140" x2="350" y2="325" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="4" />
            {/* 反射波 */}
            <line x1="350" y1="325" x2="480" y2="135" stroke="#f97316" strokeWidth="1.5" strokeDasharray="4" />
            {/* 标注 */}
            <text x="285" y="235" fill="#22d3ee" fontSize="8" transform="rotate(50, 285, 235)">入射波</text>
            <text x="430" y="220" fill="#f97316" fontSize="8" transform="rotate(-50, 430, 220)">反射波</text>
          </g>
        )}
        
        {/* 标注说明 */}
        <g fill="white" fontSize="10">
          <text x="20" y="95" fill="#0369a1" fontWeight="500">水面</text>
          <text x="20" y="200" fill="#0c4a6e" fontWeight="500">浅水层 (水深{CONFIG.waterDepth}m)</text>
          <text x="20" y="340" fill="#92400e" fontWeight="500">海底沉积层</text>
          <text x="20" y="400" fill="#a16207" fontWeight="500">地层界面1</text>
          <text x="20" y="470" fill="#65a30d" fontWeight="500">储层 (含油气)</text>
        </g>
        
        {/* 信号接收指示 - 48通道选择性显示 */}
        {reflectionPhase > 60 && (
          <g>
            {[0, 3, 6, 9, 12, 15].map((i) => {
              const progress = i / 15
              const x = 380 + progress * 400
              const delay = i * 8
              if (reflectionPhase < 60 + delay) return null
              return (
                <g key={i}>
                  <circle cx={x} cy={125 + progress * 22} r="5" fill="#22c55e" opacity="0.9">
                    <animate attributeName="r" values="5;8;5" dur="0.3s" repeatCount="1" />
                  </circle>
                  <text x={x} y={140 + progress * 22} textAnchor="middle" fill="#22c55e" fontSize="5">
                    CH{Math.round(1 + (i / 15) * 47)}
                  </text>
                </g>
              )
            })}
          </g>
        )}
        
        {/* 时间和状态显示 */}
        <g transform="translate(615, 10)">
          <rect x="0" y="0" width="175" height="130" rx="5" fill="rgba(15, 23, 42, 0.9)" />
          <text x="87" y="18" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">勘探参数</text>
          
          <line x1="10" y1="25" x2="165" y2="25" stroke="#475569" strokeWidth="1" />
          
          <text x="12" y="40" fill="#fbbf24" fontSize="9">气枪压力: {CONFIG.pressure} PSI</text>
          <text x="12" y="54" fill="#22d3ee" fontSize="9">水深: {CONFIG.waterDepth}m</text>
          <text x="12" y="68" fill="#a855f7" fontSize="9">气泡周期T: {CONFIG.bubblePeriod}ms</text>
          <text x="12" y="82" fill="#94a3b8" fontSize="9">声速: {CONFIG.soundSpeed}m/s</text>
          <text x="12" y="96" fill="#22c55e" fontSize="9">通道数: {CONFIG.channels}道</text>
          <text x="12" y="110" fill="#67e8f9" fontSize="9" fontWeight="500">当前时间: {currentTime.toFixed(0)}ms</text>
          
          <line x1="10" y1="118" x2="165" y2="118" stroke="#475569" strokeWidth="1" />
          
          <circle cx="22" cy="125" r="4" fill="#dc2626" />
          <text x="32" y="128" fill="white" fontSize="7">GI气枪</text>
          
          <rect x="85" y="121" width="10" height="5" rx="1" fill="#22c55e" />
          <text x="100" y="127" fill="white" fontSize="7">{CONFIG.channels}道水听器</text>
        </g>
      </svg>
    </div>
  )
}
