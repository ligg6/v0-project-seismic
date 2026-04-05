"use client"

import { useEffect, useState } from "react"

interface GIAirgunDetailProps {
  phase: number // 0-100 表示工作周期进度
}

export function GIAirgunDetail({ phase }: GIAirgunDetailProps) {
  // 根据相位计算各部分状态
  // 0-20: Generator充气完成，等待触发
  // 20-30: Generator放气，产生主脉冲
  // 30-50: 气泡膨胀，Injector等待
  // 50-60: Injector放气，抑制气泡振荡
  // 60-100: 气泡坍缩，系统复位

  const getGeneratorPressure = () => {
    if (phase < 20) return 100
    if (phase < 30) return 100 - (phase - 20) * 10
    return 0
  }

  const getInjectorPressure = () => {
    if (phase < 50) return 100
    if (phase < 60) return 100 - (phase - 50) * 10
    return 0
  }

  const getBubbleSize = () => {
    if (phase < 20) return 0
    if (phase < 50) return Math.min(1, (phase - 20) / 30) // 膨胀
    if (phase < 60) return 1 // 保持
    return Math.max(0.2, 1 - (phase - 60) / 40) // 坍缩
  }

  const generatorPressure = getGeneratorPressure()
  const injectorPressure = getInjectorPressure()
  const bubbleSize = getBubbleSize()

  const getPhaseDescription = () => {
    if (phase < 20) return "充气阶段 - 高压气体充入双腔"
    if (phase < 30) return "发生器放气 - 产生主地震脉冲"
    if (phase < 50) return "气泡膨胀 - 注入器等待最佳时机"
    if (phase < 60) return "注入器放气 - 抑制气泡振荡"
    return "气泡坍缩 - 系统复位准备下一周期"
  }

  return (
    <div className="bg-slate-900 rounded-xl p-4 border border-cyan-500/30">
      <h3 className="text-cyan-400 font-semibold mb-3 text-center">GI Mini Airgun 双腔气枪结构</h3>
      
      <svg viewBox="0 0 400 300" className="w-full h-auto">
        {/* 背景水域 */}
        <defs>
          <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0369a1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0.5" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <radialGradient id="bubbleGradient" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0.3" />
          </radialGradient>
        </defs>
        
        <rect x="0" y="0" width="400" height="300" fill="url(#waterGradient)" />
        
        {/* 气枪主体 */}
        <g transform="translate(80, 80)">
          {/* 外壳 */}
          <rect x="0" y="0" width="240" height="80" rx="8" 
                fill="#374151" stroke="#6b7280" strokeWidth="2" />
          
          {/* Generator腔 (左侧) */}
          <g>
            <rect x="10" y="10" width="100" height="60" rx="4" 
                  fill="#1f2937" stroke="#4b5563" strokeWidth="1" />
            <text x="60" y="25" textAnchor="middle" fill="#94a3b8" fontSize="10">Generator</text>
            <text x="60" y="38" textAnchor="middle" fill="#94a3b8" fontSize="8">(发生器腔)</text>
            
            {/* 压力指示 */}
            <rect x="20" y="45" width="80" height="15" rx="2" fill="#1e293b" />
            <rect x="22" y="47" width={76 * generatorPressure / 100} height="11" rx="1" 
                  fill={generatorPressure > 50 ? "#22c55e" : "#ef4444"} 
                  className="transition-all duration-200" />
            <text x="60" y="55" textAnchor="middle" fill="white" fontSize="8">
              {Math.round(generatorPressure)}%
            </text>
          </g>
          
          {/* Injector腔 (右侧) */}
          <g>
            <rect x="130" y="10" width="100" height="60" rx="4" 
                  fill="#1f2937" stroke="#4b5563" strokeWidth="1" />
            <text x="180" y="25" textAnchor="middle" fill="#94a3b8" fontSize="10">Injector</text>
            <text x="180" y="38" textAnchor="middle" fill="#94a3b8" fontSize="8">(注入器腔)</text>
            
            {/* 压力指示 */}
            <rect x="140" y="45" width="80" height="15" rx="2" fill="#1e293b" />
            <rect x="142" y="47" width={76 * injectorPressure / 100} height="11" rx="1" 
                  fill={injectorPressure > 50 ? "#3b82f6" : "#f97316"} 
                  className="transition-all duration-200" />
            <text x="180" y="55" textAnchor="middle" fill="white" fontSize="8">
              {Math.round(injectorPressure)}%
            </text>
          </g>
          
          {/* 高压气管连接 */}
          <line x1="60" y1="0" x2="60" y2="-20" stroke="#fbbf24" strokeWidth="3" />
          <line x1="180" y1="0" x2="180" y2="-20" stroke="#fbbf24" strokeWidth="3" />
          <line x1="60" y1="-20" x2="180" y2="-20" stroke="#fbbf24" strokeWidth="3" />
          <line x1="120" y1="-20" x2="120" y2="-35" stroke="#fbbf24" strokeWidth="3" />
          <text x="120" y="-40" textAnchor="middle" fill="#fbbf24" fontSize="9">高压气源</text>
          
          {/* 放气口 */}
          <rect x="55" y="80" width="10" height="15" fill={phase >= 20 && phase < 30 ? "#ef4444" : "#374151"} />
          <rect x="175" y="80" width="10" height="15" fill={phase >= 50 && phase < 60 ? "#3b82f6" : "#374151"} />
        </g>
        
        {/* 气泡 */}
        {bubbleSize > 0 && (
          <g>
            <circle 
              cx="200" 
              cy={200 + (1 - bubbleSize) * 20} 
              r={20 + bubbleSize * 40} 
              fill="url(#bubbleGradient)"
              filter="url(#glow)"
              className="transition-all duration-300"
            />
            {/* 气泡内部纹理 */}
            <circle 
              cx={195 - bubbleSize * 10} 
              cy={195 + (1 - bubbleSize) * 15} 
              r={5 + bubbleSize * 10} 
              fill="rgba(255,255,255,0.3)"
            />
          </g>
        )}
        
        {/* 地震波 - 从放气口发出 */}
        {phase >= 20 && phase < 40 && (
          <g opacity={(40 - phase) / 20}>
            {[1, 2, 3].map((i) => (
              <circle
                key={i}
                cx="200"
                cy="175"
                r={20 + (phase - 20) * 3 * i}
                fill="none"
                stroke="#22d3ee"
                strokeWidth="1.5"
                opacity={1 - i * 0.25}
              />
            ))}
          </g>
        )}
        
        {/* Injector波 */}
        {phase >= 50 && phase < 70 && (
          <g opacity={(70 - phase) / 20}>
            {[1, 2].map((i) => (
              <circle
                key={i}
                cx="200"
                cy="175"
                r={10 + (phase - 50) * 2 * i}
                fill="none"
                stroke="#a855f7"
                strokeWidth="1"
                opacity={1 - i * 0.3}
              />
            ))}
          </g>
        )}
        
        {/* 标签 */}
        <g>
          <text x="200" y="285" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="500">
            {getPhaseDescription()}
          </text>
        </g>
      </svg>
      
      {/* 工作原理说明 */}
      <div className="mt-3 text-xs text-slate-400 space-y-1">
        <p><span className="text-green-400">●</span> Generator腔: 产生主地震脉冲</p>
        <p><span className="text-blue-400">●</span> Injector腔: 延迟注气抑制气泡振荡</p>
        <p><span className="text-cyan-400">●</span> 气泡: 双腔协同控制，获得锐利子波</p>
      </div>
    </div>
  )
}
