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

// 场景比例: 水体 y=80(水面) ~ 320(海底) 共240px = 60m，即 4px/m
const PX_PER_M = 4
const SOURCE_X = 285 // 气枪水平位置
const SOURCE_Y = 110 // 气枪放气口/气泡中心（近水面）
const SEABED_Y = 325 // 震源正下方附近的海底位置

export function SurveyScene({ phase, time }: SurveySceneProps) {
  // 将phase映射到时间
  const currentTime = (phase / 100) * CONFIG.totalTime
  const T = CONFIG.bubblePeriod

  // 计算地震波传播 - 波前垂直半径(px)，1500m/s × 4px/m = 6px/ms
  const waveRadius = useMemo(() => {
    if (currentTime < 2) return 0
    // 波前从震源到海底约 (325-110)/4 ≈ 54m，约36ms到达海底，与反射波起始时刻一致
    return Math.min(450, currentTime * CONFIG.soundSpeed * PX_PER_M / 1000)
  }, [currentTime])

  // 反射波 - 从海底返回（下行波前到达海底时开始）
  const reflectionPhase = useMemo(() => {
    const travelTimeToBottom = ((SEABED_Y - SOURCE_Y) / PX_PER_M / CONFIG.soundSpeed) * 1000 // ms
    if (currentTime < travelTimeToBottom) return 0
    return Math.min(350, (currentTime - travelTimeToBottom) * 4)
  }, [currentTime])

  // 单腔气枪对比：气泡振荡波 - 在t=50, 100, 150ms产生（GI气枪中被抑制，此处以虚线示意单腔情形）
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
          
          {/* 水体裁剪 - 波前只在水面以下显示 */}
          <clipPath id="underwaterClip">
            <rect x="0" y="80" width="800" height="440" />
          </clipPath>
          
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
            d={`M 232 100 Q 280 128 360 128 L 790 150`}
            fill="none" 
            stroke="#fbbf24" 
            strokeWidth="2.5"
          />
          
          {/* 48个检波器（水听器） - 等间距显示代表性的16个位置 */}
          {Array.from({ length: 16 }).map((_, i) => {
            const progress = i / 15
            const x = 360 + progress * 430
            const y = 128 + progress * 22 + Math.sin(time * 0.003 + i) * 1.5
            // 16个图标等间距对应第1~48道，通道号按比例取整: CH1, CH4, ..., CH23, ..., CH48
            const channelNum = Math.round(1 + progress * (CONFIG.channels - 1))
            return (
              <g key={i} transform={`translate(${x}, ${y})`}>
                {/* 水听器图标 - 小圆柱体形状 */}
                <rect x="-5" y="-3" width="10" height="6" rx="2" fill="#22c55e" stroke="#15803d" strokeWidth="0.8" />
                {/* 只在关键位置显示通道号 */}
                {(i === 0 || i === 7 || i === 15) && (
                  <text x="0" y="12" textAnchor="middle" fill="#86efac" fontSize="6" fontWeight="500">
                    CH{channelNum}
                  </text>
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
        
        {/* GI气枪震源 - 近水面拖曳，气泡在放气口处形成 */}
        <g transform={`translate(${SOURCE_X}, ${SOURCE_Y - 14})`}>
          {/* 主气泡 - 根据时间演化，中心位于气枪放气口 */}
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
                  // 逐渐衰减（t=T 时为25，与收缩段末端连续）
                  bubbleR = 17 * Math.exp(-(currentTime - T) / 100) + 8
                }
                return (
                  <>
                    <circle
                      cx="0"
                      cy="14"
                      r={Math.max(5, bubbleR)}
                      fill="#67e8f9"
                      opacity={Math.max(0.2, 0.7 - currentTime / 250)}
                    />
                    {/* 小气泡 - 向水面上浮 */}
                    {[0, 1, 2].map((j) => {
                      const bPhase = (currentTime + j * 15) % 60
                      if (bPhase > 45) return null
                      return (
                        <circle
                          key={j}
                          cx={[-28, 28, -34][j]}
                          cy={20 - bPhase * 0.6}
                          r={2 + bPhase * 0.05}
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
          
          {/* 气枪本体 - 双腔结构 */}
          <rect x="-22" y="-14" width="44" height="28" rx="5" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
          <rect x="-17" y="-10" width="14" height="20" fill="#7f1d1d" rx="2" />
          <text x="-10" y="4" textAnchor="middle" fill="#fca5a5" fontSize="6" fontWeight="bold">G</text>
          <rect x="3" y="-10" width="14" height="20" fill="#450a0a" rx="2" />
          <text x="10" y="4" textAnchor="middle" fill="#fca5a5" fontSize="6" fontWeight="bold">I</text>
          
          <text x="28" y="-1" textAnchor="start" fill="#fca5a5" fontSize="8" fontWeight="bold">GI Airgun</text>
          <text x="28" y="9" textAnchor="start" fill="#fca5a5" fontSize="6">{CONFIG.pressure} PSI</text>
          
          {/* 气管连接 - 至船尾 */}
          <path d="M -22 0 Q -36 -2 -51 -6" fill="none" stroke="#fbbf24" strokeWidth="2" />
        </g>
        
        {/* 主地震波传播 - 下行波 (t=0开始) */}
        {waveRadius > 0 && waveRadius < 400 && (
          <g opacity={Math.max(0.1, 1 - waveRadius / 500)} clipPath="url(#underwaterClip)">
            {[1.0, 0.85, 0.7].map((scale, i) => (
              <ellipse
                key={i}
                cx={SOURCE_X}
                cy={SOURCE_Y}
                rx={(waveRadius * scale) / 0.55}
                ry={waveRadius * scale}
                fill="none"
                stroke="#22d3ee"
                strokeWidth={2 - i * 0.5}
                opacity={1 - i * 0.3}
              />
            ))}
            <text x={SOURCE_X} y={SOURCE_Y + waveRadius * 0.6} textAnchor="middle" fill="#22d3ee" fontSize="8" opacity={Math.max(0.3, 1 - waveRadius / 300)}>
              主脉冲 (t=0)
            </text>
          </g>
        )}
        
        {/* 单腔气枪对比：气泡振荡产生的次生波（虚线）- GI气枪中已被Injector抑制 */}
        {bubbleOscillationWaves.map((wave, idx) => (
          <g key={wave.time} opacity={wave.opacity} clipPath="url(#underwaterClip)">
            {[0.3, 0.5].map((scale, i) => (
              <ellipse
                key={i}
                cx={SOURCE_X}
                cy={SOURCE_Y}
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
              x={SOURCE_X + wave.radius * 0.4} 
              y={SOURCE_Y + wave.radius * 0.2} 
              fill="#f97316" 
              fontSize="7" 
              opacity={wave.opacity}
            >
              单腔对比 振荡{idx + 1} (t={wave.time}ms)
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
            <line x1={SOURCE_X} y1={SOURCE_Y} x2="350" y2="325" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="4" />
            {/* 反射波 */}
            <line x1="350" y1="325" x2="480" y2="135" stroke="#f97316" strokeWidth="1.5" strokeDasharray="4" />
            {/* 标注 */}
            <text x="300" y="235" fill="#22d3ee" fontSize="8" transform="rotate(73, 300, 235)">入射波</text>
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
        
        {/* 信号接收指示 - 反射波到达水听器时的闪烁效果（不显示额外文字避免重复） */}
        {reflectionPhase > 60 && (
          <g>
            {[0, 4, 8, 12].map((i) => {
              const progress = i / 15
              const x = 360 + progress * 430 // 与拖缆位置一致
              const y = 128 + progress * 22
              const delay = i * 10
              if (reflectionPhase < 60 + delay || reflectionPhase > 120 + delay) return null
              return (
                <g key={i}>
                  {/* 接收信号的脉冲效果 - 黄色光环 */}
                  <circle cx={x} cy={y} r="8" fill="none" stroke="#fbbf24" strokeWidth="2" opacity="0.8">
                    <animate attributeName="r" values="8;14;8" dur="0.4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0.2;0.8" dur="0.4s" repeatCount="indefinite" />
                  </circle>
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
