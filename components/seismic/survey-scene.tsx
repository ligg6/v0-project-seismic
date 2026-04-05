"use client"

import { useMemo } from "react"

interface SurveySceneProps {
  phase: number
  time: number // 用于动画
}

export function SurveyScene({ phase, time }: SurveySceneProps) {
  // 计算地震波传播
  const waveRadius = useMemo(() => {
    if (phase < 20) return 0
    return Math.min(400, (phase - 20) * 8)
  }, [phase])

  // 反射波
  const reflectionPhase = useMemo(() => {
    if (waveRadius < 150) return 0 // 波还没到海底
    return Math.min(300, (waveRadius - 150) * 0.8)
  }, [waveRadius])

  return (
    <div className="bg-gradient-to-b from-sky-200 via-sky-300 to-sky-400 rounded-xl overflow-hidden border border-cyan-500/30">
      <svg viewBox="0 0 800 500" className="w-full h-auto">
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
          
          {/* 波纹效果 */}
          <filter id="waveFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          
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
        <circle cx="700" cy="40" r="25" fill="#fbbf24" filter="url(#glowEffect)" />
        
        {/* 云 */}
        <g fill="white" opacity="0.8">
          <ellipse cx="100" cy="30" rx="40" ry="15" />
          <ellipse cx="130" cy="25" rx="30" ry="12" />
          <ellipse cx="300" cy="45" rx="35" ry="12" />
        </g>
        
        {/* 水面 */}
        <rect x="0" y="80" width="800" height="200" fill="url(#waterSurface)" />
        
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
        
        {/* 拖缆系统 */}
        <g>
          {/* 主拖缆 */}
          <path 
            d={`M 270 100 Q 350 120 450 130 T 650 140 T 780 145`}
            fill="none" 
            stroke="#fbbf24" 
            strokeWidth="3"
            strokeDasharray="10 5"
          />
          
          {/* 检波器组（水听器） */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const x = 300 + i * 60
            const y = 115 + i * 4 + Math.sin(time * 0.003 + i) * 2
            return (
              <g key={i} transform={`translate(${x}, ${y})`}>
                <rect x="-8" y="-3" width="16" height="6" rx="2" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
                <circle cx="0" cy="0" r="2" fill="#bbf7d0" />
              </g>
            )
          })}
          
          {/* 拖缆标签 */}
          <text x="500" y="160" textAnchor="middle" fill="#fef3c7" fontSize="10" fontWeight="500">
            多道拖缆 (水听器阵列)
          </text>
        </g>
        
        {/* GI气枪震源 */}
        <g transform="translate(280, 130)">
          {/* 气枪本体 */}
          <rect x="-15" y="-10" width="30" height="20" rx="3" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
          <rect x="-10" y="-6" width="8" height="12" fill="#7f1d1d" />
          <rect x="2" y="-6" width="8" height="12" fill="#450a0a" />
          <text x="0" y="25" textAnchor="middle" fill="#fca5a5" fontSize="8" fontWeight="bold">GI Airgun</text>
          
          {/* 气管连接 */}
          <path d="M 0 -10 Q 0 -25 -10 -35 L -30 -55" fill="none" stroke="#fbbf24" strokeWidth="2" />
          
          {/* 气泡效果 */}
          {phase >= 20 && phase < 80 && (
            <g>
              {[0, 1, 2].map((i) => {
                const bubblePhase = (phase - 20 + i * 10) % 60
                if (bubblePhase < 0 || bubblePhase > 40) return null
                const size = 5 + bubblePhase * 0.8
                const y = 15 + bubblePhase * 2
                return (
                  <circle
                    key={i}
                    cx={-5 + i * 5}
                    cy={y}
                    r={size}
                    fill="#67e8f9"
                    opacity={0.6 - bubblePhase / 80}
                  />
                )
              })}
            </g>
          )}
        </g>
        
        {/* 地震波传播 */}
        {waveRadius > 0 && (
          <g opacity={Math.max(0.1, 1 - waveRadius / 500)}>
            {[0.3, 0.6, 0.9].map((scale, i) => (
              <ellipse
                key={i}
                cx="280"
                cy="135"
                rx={waveRadius * scale}
                ry={waveRadius * scale * 0.6}
                fill="none"
                stroke="#22d3ee"
                strokeWidth={2 - i * 0.5}
                opacity={1 - i * 0.3}
              />
            ))}
          </g>
        )}
        
        {/* 海底 */}
        <path 
          d="M 0 280 Q 100 290 200 285 T 400 295 T 600 280 T 800 290 L 800 500 L 0 500 Z" 
          fill="url(#seabedGradient)" 
        />
        
        {/* 地层1 */}
        <path 
          d="M 0 330 Q 150 340 300 335 T 550 345 T 800 340 L 800 500 L 0 500 Z" 
          fill="url(#layer1)" 
        />
        
        {/* 地层2 - 含油气层（目标层） */}
        <path 
          d="M 0 400 Q 200 390 350 395 T 600 385 T 800 395 L 800 500 L 0 500 Z" 
          fill="url(#layer2)" 
        />
        
        {/* 油气藏标示 */}
        <ellipse cx="450" cy="420" rx="80" ry="25" fill="#fbbf24" opacity="0.4" />
        <text x="450" y="425" textAnchor="middle" fill="#fef3c7" fontSize="10" fontWeight="bold">油气藏</text>
        
        {/* 反射波 */}
        {reflectionPhase > 0 && reflectionPhase < 200 && (
          <g opacity={Math.max(0.1, 1 - reflectionPhase / 250)}>
            {[0.3, 0.6, 0.9].map((scale, i) => (
              <ellipse
                key={i}
                cx="350"
                cy="285"
                rx={reflectionPhase * scale}
                ry={reflectionPhase * scale * 0.4}
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
        {phase >= 30 && phase < 80 && (
          <g opacity="0.6">
            {/* 入射波 */}
            <line x1="280" y1="135" x2="350" y2="285" stroke="#22d3ee" strokeWidth="1" strokeDasharray="4" />
            {/* 反射波 */}
            <line x1="350" y1="285" x2="450" y2="135" stroke="#f97316" strokeWidth="1" strokeDasharray="4" />
            {/* 标注 */}
            <text x="300" y="210" fill="#22d3ee" fontSize="8" transform="rotate(50, 300, 210)">入射波</text>
            <text x="420" y="200" fill="#f97316" fontSize="8" transform="rotate(-45, 420, 200)">反射波</text>
          </g>
        )}
        
        {/* 标注说明 */}
        <g fill="white" fontSize="10">
          <text x="20" y="95" fill="#0369a1" fontWeight="500">水深: ~30m (浅水)</text>
          <text x="20" y="300" fill="#92400e" fontWeight="500">海底沉积层</text>
          <text x="20" y="360" fill="#a16207" fontWeight="500">地层界面1</text>
          <text x="20" y="430" fill="#65a30d" fontWeight="500">储层 (含油气)</text>
        </g>
        
        {/* 信号接收指示 */}
        {reflectionPhase > 100 && (
          <g>
            {[0, 1, 2, 3].map((i) => {
              const x = 400 + i * 60
              const delay = i * 15
              if (reflectionPhase < 100 + delay) return null
              return (
                <g key={i}>
                  <circle cx={x} cy={125 + i * 3} r="4" fill="#22c55e" opacity="0.8">
                    <animate attributeName="r" values="4;8;4" dur="0.5s" repeatCount="1" />
                  </circle>
                </g>
              )
            })}
          </g>
        )}
        
        {/* 图例 */}
        <g transform="translate(620, 20)">
          <rect x="0" y="0" width="170" height="100" rx="5" fill="rgba(15, 23, 42, 0.8)" />
          <text x="85" y="18" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">图例说明</text>
          
          <circle cx="15" cy="35" r="4" fill="#dc2626" />
          <text x="25" y="38" fill="white" fontSize="8">GI双腔气枪震源</text>
          
          <line x1="10" y1="50" x2="25" y2="50" stroke="#22d3ee" strokeWidth="2" />
          <text x="30" y="53" fill="white" fontSize="8">下行地震波</text>
          
          <line x1="10" y1="65" x2="25" y2="65" stroke="#f97316" strokeWidth="2" strokeDasharray="3" />
          <text x="30" y="68" fill="white" fontSize="8">反射波</text>
          
          <rect x="10" y="77" width="15" height="6" rx="2" fill="#22c55e" />
          <text x="30" y="83" fill="white" fontSize="8">水听器 (检波器)</text>
        </g>
      </svg>
    </div>
  )
}
