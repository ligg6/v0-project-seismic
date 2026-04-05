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
}

export function SurveyScene({ phase, time }: SurveySceneProps) {
  // 计算地震波传播 - 基于水深60m
  const waveRadius = useMemo(() => {
    if (phase < 15) return 0
    // 波速约1500m/s，60m水深约40ms到达海底
    return Math.min(450, (phase - 15) * 9)
  }, [phase])

  // 反射波 - 从海底返回
  const reflectionPhase = useMemo(() => {
    // 海底位置对应waveRadius约180
    if (waveRadius < 180) return 0 
    return Math.min(350, (waveRadius - 180) * 0.9)
  }, [waveRadius])

  // 计算当前时间
  const currentTime = useMemo(() => {
    if (phase < 15) return 0
    return Math.round(((phase - 15) / 85) * 200)
  }, [phase])

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
        <g transform="translate(150, 50)">
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
        
        {/* 拖缆系统 - 多通道 */}
        <g>
          {/* 主拖缆 */}
          <path 
            d={`M 270 100 Q 350 120 450 130 T 650 145 T 780 150`}
            fill="none" 
            stroke="#fbbf24" 
            strokeWidth="3"
            strokeDasharray="10 5"
          />
          
          {/* 检波器组（水听器） - 多通道 */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
            const x = 300 + i * 45
            const y = 115 + i * 3 + Math.sin(time * 0.003 + i) * 2
            return (
              <g key={i} transform={`translate(${x}, ${y})`}>
                <rect x="-8" y="-3" width="16" height="6" rx="2" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
                <circle cx="0" cy="0" r="2" fill="#bbf7d0" />
                <text x="0" y="12" textAnchor="middle" fill="#bbf7d0" fontSize="5">CH{i+1}</text>
              </g>
            )
          })}
          
          {/* 拖缆标签 */}
          <text x="520" y="170" textAnchor="middle" fill="#fef3c7" fontSize="10" fontWeight="500">
            多道拖缆 (12通道水听器阵列)
          </text>
        </g>
        
        {/* GI气枪震源 */}
        <g transform="translate(280, 140)">
          {/* 气枪本体 - 双腔结构 */}
          <rect x="-20" y="-12" width="40" height="24" rx="4" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
          <rect x="-15" y="-8" width="12" height="16" fill="#7f1d1d" />
          <text x="-9" y="3" textAnchor="middle" fill="#fca5a5" fontSize="5">G</text>
          <rect x="3" y="-8" width="12" height="16" fill="#450a0a" />
          <text x="9" y="3" textAnchor="middle" fill="#fca5a5" fontSize="5">I</text>
          <text x="0" y="28" textAnchor="middle" fill="#fca5a5" fontSize="8" fontWeight="bold">GI Airgun</text>
          <text x="0" y="38" textAnchor="middle" fill="#fca5a5" fontSize="6">{CONFIG.pressure} PSI</text>
          
          {/* 气管连接 */}
          <path d="M 0 -12 Q 0 -30 -15 -45 L -40 -70" fill="none" stroke="#fbbf24" strokeWidth="2" />
          
          {/* 气泡效果 - 显示膨胀坍缩 */}
          {phase >= 15 && phase < 85 && (
            <g>
              {/* 主气泡 */}
              {(() => {
                let bubbleR = 0
                if (phase < 40) {
                  bubbleR = 8 + (phase - 15) * 0.8
                } else if (phase < 60) {
                  bubbleR = 28 - (phase - 40) * 0.5
                } else {
                  bubbleR = 18 - (phase - 60) * 0.3
                }
                return (
                  <circle
                    cx="0"
                    cy={50 + (phase - 15) * 0.5}
                    r={Math.max(5, bubbleR)}
                    fill="#67e8f9"
                    opacity={0.6 - (phase - 15) / 150}
                  />
                )
              })()}
              {/* 小气泡 */}
              {[0, 1, 2].map((i) => {
                const bubblePhase = (phase - 15 + i * 8) % 50
                if (bubblePhase > 35) return null
                const size = 3 + bubblePhase * 0.3
                const y = 45 + bubblePhase * 2
                return (
                  <circle
                    key={i}
                    cx={-6 + i * 6}
                    cy={y}
                    r={size}
                    fill="#67e8f9"
                    opacity={0.5 - bubblePhase / 80}
                  />
                )
              })}
            </g>
          )}
        </g>
        
        {/* 地震波传播 - 下行波 */}
        {waveRadius > 0 && (
          <g opacity={Math.max(0.1, 1 - waveRadius / 550)}>
            {[0.3, 0.6, 0.9].map((scale, i) => (
              <ellipse
                key={i}
                cx="280"
                cy="145"
                rx={waveRadius * scale}
                ry={waveRadius * scale * 0.55}
                fill="none"
                stroke="#22d3ee"
                strokeWidth={2 - i * 0.5}
                opacity={1 - i * 0.3}
              />
            ))}
          </g>
        )}
        
        {/* 气泡振荡产生的次生波 - 50ms周期后 */}
        {phase >= 45 && phase < 75 && (
          <g opacity={(75 - phase) / 30 * 0.5}>
            {[0.2, 0.4].map((scale, i) => (
              <ellipse
                key={`bubble-wave-${i}`}
                cx="280"
                cy="145"
                rx={(phase - 45) * 4 * scale}
                ry={(phase - 45) * 4 * scale * 0.5}
                fill="none"
                stroke="#f97316"
                strokeWidth={1}
                strokeDasharray="4 2"
                opacity={0.5 - i * 0.2}
              />
            ))}
            <text x="320" y={145 + (phase - 45) * 2} fill="#f97316" fontSize="7" opacity="0.7">
              气泡振荡波 (t≈{CONFIG.bubblePeriod}ms)
            </text>
          </g>
        )}
        
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
        <text x="450" y="465" textAnchor="middle" fill="#fef3c7" fontSize="10" fontWeight="bold">油气藏</text>
        
        {/* 反射波 */}
        {reflectionPhase > 0 && reflectionPhase < 250 && (
          <g opacity={Math.max(0.1, 1 - reflectionPhase / 300)}>
            {[0.3, 0.6, 0.9].map((scale, i) => (
              <ellipse
                key={i}
                cx="380"
                cy="325"
                rx={reflectionPhase * scale}
                ry={reflectionPhase * scale * 0.35}
                fill="none"
                stroke="#f97316"
                strokeWidth={1.5 - i * 0.3}
                opacity={1 - i * 0.3}
                strokeDasharray="5 3"
              />
            ))}
          </g>
        )}
        
        {/* 射线路径标注 */}
        {phase >= 25 && phase < 85 && (
          <g opacity="0.6">
            {/* 入射波 */}
            <line x1="280" y1="145" x2="380" y2="325" stroke="#22d3ee" strokeWidth="1" strokeDasharray="4" />
            {/* 反射波 */}
            <line x1="380" y1="325" x2="500" y2="140" stroke="#f97316" strokeWidth="1" strokeDasharray="4" />
            {/* 标注 */}
            <text x="310" y="240" fill="#22d3ee" fontSize="8" transform="rotate(55, 310, 240)">入射波</text>
            <text x="460" y="220" fill="#f97316" fontSize="8" transform="rotate(-50, 460, 220)">反射波</text>
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
        
        {/* 信号接收指示 */}
        {reflectionPhase > 80 && (
          <g>
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const x = 420 + i * 45
              const delay = i * 12
              if (reflectionPhase < 80 + delay) return null
              return (
                <g key={i}>
                  <circle cx={x} cy={128 + i * 2} r="5" fill="#22c55e" opacity="0.8">
                    <animate attributeName="r" values="5;9;5" dur="0.4s" repeatCount="1" />
                  </circle>
                  <text x={x} y={145 + i * 2} textAnchor="middle" fill="#22c55e" fontSize="6">接收</text>
                </g>
              )
            })}
          </g>
        )}
        
        {/* 时间和状态显示 */}
        <g transform="translate(620, 10)">
          <rect x="0" y="0" width="170" height="115" rx="5" fill="rgba(15, 23, 42, 0.85)" />
          <text x="85" y="18" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">勘探参数</text>
          
          <text x="10" y="35" fill="#fbbf24" fontSize="8">气枪压力: {CONFIG.pressure} PSI</text>
          <text x="10" y="48" fill="#22d3ee" fontSize="8">水深: {CONFIG.waterDepth}m</text>
          <text x="10" y="61" fill="#a855f7" fontSize="8">气泡周期: {CONFIG.bubblePeriod}ms</text>
          <text x="10" y="74" fill="#94a3b8" fontSize="8">声速: {CONFIG.soundSpeed}m/s</text>
          <text x="10" y="87" fill="#67e8f9" fontSize="8">当前时间: {currentTime}ms</text>
          
          <line x1="10" y1="93" x2="160" y2="93" stroke="#475569" strokeWidth="1" />
          
          <circle cx="20" cy="105" r="4" fill="#dc2626" />
          <text x="30" y="108" fill="white" fontSize="7">GI气枪震源</text>
          
          <rect x="90" y="101" width="12" height="6" rx="2" fill="#22c55e" />
          <text x="107" y="108" fill="white" fontSize="7">水听器</text>
        </g>
      </svg>
    </div>
  )
}
