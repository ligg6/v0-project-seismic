"use client"

interface GIAirgunDetailProps {
  phase: number // 0-100 表示工作周期进度，映射到0-200ms
}

// 参数配置
const CONFIG = {
  pressure: 1800, // PSI
  bubblePeriod: 50, // ms - 气泡振荡周期 T
  waterDepth: 60, // m
  totalTime: 200, // ms - 总显示时间
}

export function GIAirgunDetail({ phase }: GIAirgunDetailProps) {
  // 将phase(0-100)映射到时间(0-200ms)
  const currentTime = (phase / 100) * CONFIG.totalTime
  const T = CONFIG.bubblePeriod

  // ========== 正确的物理时序 ==========
  // t=0: Generator放气，产生主脉冲，气泡开始急速膨胀
  // t≈25ms (T/2): 气泡膨胀到最大半径，Injector此时注入气体
  // t≈50ms (T): 单腔气枪气泡坍缩到最小，急剧反弹 → 振荡脉冲1
  // t≈100ms (2T): 振荡脉冲2
  // t≈150ms (3T): 振荡脉冲3

  // Generator压力 - 在t=0瞬间释放
  const getGeneratorPressure = () => {
    if (currentTime < 2) return 100 - currentTime * 50 // 快速释放
    return 0
  }

  // Injector压力 - 在t≈25ms(气泡最大时)释放
  const getInjectorPressure = () => {
    const injectorFireTime = T * 0.5 // 25ms
    if (currentTime < injectorFireTime - 3) return 100
    if (currentTime < injectorFireTime + 5) {
      const releasePhase = (currentTime - (injectorFireTime - 3)) / 8
      return Math.max(0, 100 - releasePhase * 100)
    }
    return 0
  }

  // 气泡半径演化 - 基于Rayleigh模型
  const getBubbleRadius = () => {
    if (currentTime < 1) return 0.05
    
    // 第一个半周期：膨胀到最大
    if (currentTime < T * 0.5) {
      const expandPhase = currentTime / (T * 0.5)
      return 0.05 + 0.95 * Math.sin(expandPhase * Math.PI / 2)
    }
    
    // Injector注入后：缓慢收缩（GI效果）
    if (currentTime < T) {
      const shrinkPhase = (currentTime - T * 0.5) / (T * 0.5)
      return 1.0 - 0.15 * shrinkPhase
    }
    
    // 后续：平稳衰减
    const decayTime = currentTime - T
    return Math.max(0.2, 0.85 * Math.exp(-decayTime / 120) + 0.15)
  }

  const generatorPressure = getGeneratorPressure()
  const injectorPressure = getInjectorPressure()
  const bubbleRadius = getBubbleRadius()

  // 阶段判断和描述
  const getPhaseInfo = () => {
    if (currentTime < 3) {
      return {
        stage: "主脉冲发射",
        description: `t=0ms: Generator放气，产生主地震脉冲`,
        gState: "releasing",
        iState: "charged"
      }
    }
    if (currentTime < T * 0.4) {
      return {
        stage: "气泡膨胀期",
        description: `t=${currentTime.toFixed(0)}ms: 气泡快速膨胀中`,
        gState: "empty",
        iState: "charged"
      }
    }
    if (currentTime < T * 0.6) {
      return {
        stage: "Injector注气",
        description: `t≈${Math.round(T*0.5)}ms: 气泡达最大，Injector注入气体抑制坍缩`,
        gState: "empty",
        iState: "releasing"
      }
    }
    if (currentTime < T - 5) {
      return {
        stage: "气泡缓慢收缩",
        description: `t=${currentTime.toFixed(0)}ms: GI气枪气泡缓慢收缩（振荡被抑制）`,
        gState: "empty",
        iState: "empty"
      }
    }
    if (currentTime < T + 5) {
      return {
        stage: `单腔振荡点 (t≈${T}ms)`,
        description: `单腔气枪此时产生第1振荡脉冲，GI无明显振荡`,
        gState: "empty",
        iState: "empty"
      }
    }
    if (currentTime < T * 2 - 5) {
      return {
        stage: "第1振荡周期后",
        description: `t=${currentTime.toFixed(0)}ms: GI气枪气泡平稳衰减`,
        gState: "empty",
        iState: "empty"
      }
    }
    if (currentTime < T * 2 + 5) {
      return {
        stage: `单腔振荡点 (t≈${T*2}ms)`,
        description: `单腔气枪第2振荡脉冲位置`,
        gState: "empty",
        iState: "empty"
      }
    }
    if (currentTime < T * 3 - 5) {
      return {
        stage: "第2振荡周期后",
        description: `t=${currentTime.toFixed(0)}ms: 气泡继续衰减`,
        gState: "empty",
        iState: "empty"
      }
    }
    if (currentTime < T * 3 + 5) {
      return {
        stage: `单腔振荡点 (t≈${T*3}ms)`,
        description: `单腔气枪第3振荡脉冲位置`,
        gState: "empty",
        iState: "empty"
      }
    }
    return {
      stage: "振荡衰减期",
      description: `t=${currentTime.toFixed(0)}ms: 能量耗散`,
      gState: "empty",
      iState: "empty"
    }
  }

  const phaseInfo = getPhaseInfo()

  // 判断是否显示振荡脉冲标记
  const isNearOscillation = (targetT: number) => Math.abs(currentTime - targetT) < 8

  return (
    <div className="bg-slate-900 rounded-xl p-4 border border-cyan-500/30">
      <h3 className="text-cyan-400 font-semibold mb-2 text-center">GI Mini Airgun 双腔气枪结构与工作时序</h3>
      
      {/* 参数显示 */}
      <div className="flex justify-center gap-4 mb-3 text-xs">
        <span className="text-amber-400">压力: {CONFIG.pressure} PSI</span>
        <span className="text-cyan-400">气泡周期T = {CONFIG.bubblePeriod}ms</span>
        <span className="text-blue-400">水深: {CONFIG.waterDepth}m</span>
      </div>
      
      <svg viewBox="0 0 400 320" className="w-full h-auto">
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
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0.3" />
          </radialGradient>
        </defs>
        
        <rect x="0" y="0" width="400" height="320" fill="url(#waterGradient)" />
        
        {/* 气枪主体 */}
        <g transform="translate(80, 60)">
          {/* 外壳 */}
          <rect x="0" y="0" width="240" height="80" rx="8" 
                fill="#374151" stroke="#6b7280" strokeWidth="2" />
          
          {/* Generator腔 (左侧) */}
          <g>
            <rect x="10" y="10" width="100" height="60" rx="4" 
                  fill="#1f2937" stroke={phaseInfo.gState === "releasing" ? "#ef4444" : "#4b5563"} 
                  strokeWidth={phaseInfo.gState === "releasing" ? 2 : 1} />
            <text x="60" y="22" textAnchor="middle" fill="#94a3b8" fontSize="10">Generator</text>
            <text x="60" y="34" textAnchor="middle" fill="#94a3b8" fontSize="8">(发生器腔)</text>
            
            {/* 压力指示 */}
            <rect x="20" y="42" width="80" height="18" rx="2" fill="#1e293b" />
            <rect x="22" y="44" width={76 * generatorPressure / 100} height="14" rx="1" 
                  fill={generatorPressure > 50 ? "#22c55e" : generatorPressure > 0 ? "#fbbf24" : "#475569"} 
                  className="transition-all duration-100" />
            <text x="60" y="55" textAnchor="middle" fill="white" fontSize="8" fontWeight="500">
              {Math.round(generatorPressure * CONFIG.pressure / 100)} PSI
            </text>
            
            {/* t=0标记 */}
            <text x="60" y="75" textAnchor="middle" fill="#22c55e" fontSize="7">t=0 放气</text>
          </g>
          
          {/* Injector腔 (右侧) */}
          <g>
            <rect x="130" y="10" width="100" height="60" rx="4" 
                  fill="#1f2937" stroke={phaseInfo.iState === "releasing" ? "#3b82f6" : "#4b5563"} 
                  strokeWidth={phaseInfo.iState === "releasing" ? 2 : 1} />
            <text x="180" y="22" textAnchor="middle" fill="#94a3b8" fontSize="10">Injector</text>
            <text x="180" y="34" textAnchor="middle" fill="#94a3b8" fontSize="8">(注入器腔)</text>
            
            {/* 压力指示 */}
            <rect x="140" y="42" width="80" height="18" rx="2" fill="#1e293b" />
            <rect x="142" y="44" width={76 * injectorPressure / 100} height="14" rx="1" 
                  fill={injectorPressure > 50 ? "#3b82f6" : injectorPressure > 0 ? "#fbbf24" : "#475569"} 
                  className="transition-all duration-100" />
            <text x="180" y="55" textAnchor="middle" fill="white" fontSize="8" fontWeight="500">
              {Math.round(injectorPressure * CONFIG.pressure / 100)} PSI
            </text>
            
            {/* t=T/2标记 */}
            <text x="180" y="75" textAnchor="middle" fill="#3b82f6" fontSize="7">t≈{T/2}ms 注气</text>
          </g>
          
          {/* 高压气管连接 */}
          <line x1="60" y1="0" x2="60" y2="-20" stroke="#fbbf24" strokeWidth="3" />
          <line x1="180" y1="0" x2="180" y2="-20" stroke="#fbbf24" strokeWidth="3" />
          <line x1="60" y1="-20" x2="180" y2="-20" stroke="#fbbf24" strokeWidth="3" />
          <line x1="120" y1="-20" x2="120" y2="-35" stroke="#fbbf24" strokeWidth="3" />
          <text x="120" y="-40" textAnchor="middle" fill="#fbbf24" fontSize="9">高压气源 {CONFIG.pressure} PSI</text>
          
          {/* 放气口指示 */}
          <rect x="55" y="80" width="10" height="12" fill={phaseInfo.gState === "releasing" ? "#ef4444" : "#374151"} />
          <rect x="175" y="80" width="10" height="12" fill={phaseInfo.iState === "releasing" ? "#3b82f6" : "#374151"} />
          
          {phaseInfo.gState === "releasing" && (
            <text x="60" y="105" textAnchor="middle" fill="#ef4444" fontSize="8" fontWeight="bold">主脉冲!</text>
          )}
          {phaseInfo.iState === "releasing" && (
            <text x="180" y="105" textAnchor="middle" fill="#3b82f6" fontSize="8" fontWeight="bold">注气抑制!</text>
          )}
        </g>
        
        {/* 气泡 */}
        {currentTime > 1 && (
          <g>
            <circle 
              cx="200" 
              cy={185 + (1 - bubbleRadius) * 15} 
              r={15 + bubbleRadius * 45} 
              fill="url(#bubbleGradient)"
              filter="url(#glow)"
            />
            {/* 气泡内部高光 */}
            <ellipse 
              cx={195 - bubbleRadius * 12} 
              cy={180 + (1 - bubbleRadius) * 12} 
              rx={4 + bubbleRadius * 10} 
              ry={3 + bubbleRadius * 6}
              fill="rgba(255,255,255,0.4)"
            />
            {/* 气泡半径标注 */}
            <text x="200" y={190 + (1 - bubbleRadius) * 15} textAnchor="middle" fill="white" fontSize="8">
              R≈{(bubbleRadius * 0.35).toFixed(2)}m
            </text>
          </g>
        )}
        
        {/* 主脉冲地震波 - 从t=0开始 */}
        {currentTime > 0 && currentTime < 40 && (
          <g opacity={Math.max(0.1, 1 - currentTime / 40)}>
            {[1, 2, 3].map((i) => (
              <circle
                key={i}
                cx="200"
                cy="170"
                r={20 + currentTime * 3 * i}
                fill="none"
                stroke="#22d3ee"
                strokeWidth={2 - i * 0.5}
                opacity={0.9 - i * 0.25}
              />
            ))}
            <text x="200" y={170 - 25 - currentTime * 2} textAnchor="middle" fill="#22d3ee" fontSize="8">
              主脉冲 (t=0)
            </text>
          </g>
        )}
        
        {/* Injector注入波 - 在t≈25ms */}
        {currentTime > T * 0.45 && currentTime < T * 0.7 && (
          <g opacity={(T * 0.7 - currentTime) / (T * 0.25)}>
            {[1, 2].map((i) => (
              <circle
                key={i}
                cx="200"
                cy="185"
                r={8 + (currentTime - T * 0.45) * 2 * i}
                fill="none"
                stroke="#a855f7"
                strokeWidth={1.5 - i * 0.3}
                opacity={0.8 - i * 0.3}
              />
            ))}
          </g>
        )}
        
        {/* 时间轴 - 显示关键时间点 */}
        <g transform="translate(30, 260)">
          <line x1="0" y1="0" x2="340" y2="0" stroke="#475569" strokeWidth="1" />
          
          {/* 时间刻度 */}
          {[0, 25, 50, 100, 150, 200].map((t) => {
            const x = (t / CONFIG.totalTime) * 340
            const isOscillation = t === 50 || t === 100 || t === 150
            const isInjector = t === 25
            return (
              <g key={t}>
                <line x1={x} y1="-5" x2={x} y2="5" 
                      stroke={isOscillation ? "#ef4444" : isInjector ? "#3b82f6" : "#64748b"} 
                      strokeWidth={isOscillation || isInjector ? 2 : 1} />
                <text x={x} y="18" textAnchor="middle" 
                      fill={isOscillation ? "#ef4444" : isInjector ? "#3b82f6" : "#94a3b8"} 
                      fontSize="8" fontWeight={isOscillation || isInjector ? "bold" : "normal"}>
                  {t}ms
                </text>
                {t === 0 && <text x={x} y="30" textAnchor="middle" fill="#22c55e" fontSize="6">G放气</text>}
                {t === 25 && <text x={x} y="30" textAnchor="middle" fill="#3b82f6" fontSize="6">I注气</text>}
                {t === 50 && <text x={x} y="30" textAnchor="middle" fill="#ef4444" fontSize="6">振荡1</text>}
                {t === 100 && <text x={x} y="30" textAnchor="middle" fill="#ef4444" fontSize="6">振荡2</text>}
                {t === 150 && <text x={x} y="30" textAnchor="middle" fill="#ef4444" fontSize="6">振荡3</text>}
              </g>
            )
          })}
          
          {/* 当前时间指示器 */}
          <circle cx={(currentTime / CONFIG.totalTime) * 340} cy="0" r="5" fill="#fbbf24" />
          <line x1={(currentTime / CONFIG.totalTime) * 340} y1="-15" 
                x2={(currentTime / CONFIG.totalTime) * 340} y2="-8" 
                stroke="#fbbf24" strokeWidth="2" />
        </g>
        
        {/* 振荡脉冲标记 - 在t=50,100,150ms时显示 */}
        {[T, T * 2, T * 3].map((oscT, idx) => {
          if (isNearOscillation(oscT)) {
            return (
              <g key={oscT} opacity={1 - Math.abs(currentTime - oscT) / 8}>
                <rect x="280" y={65 + idx * 25} width="110" height="22" rx="4" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="1" />
                <text x="335" y={80 + idx * 25} textAnchor="middle" fill="#ef4444" fontSize="9">
                  单腔振荡{idx + 1} (t={oscT}ms)
                </text>
              </g>
            )
          }
          return null
        })}
        
        {/* 当前状态显示 */}
        <g>
          <rect x="10" y="300" width="380" height="18" rx="3" fill="rgba(30, 41, 59, 0.8)" />
          <text x="200" y="313" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="500">
            {phaseInfo.stage} | {phaseInfo.description}
          </text>
        </g>
      </svg>
      
      {/* 关键时序说明 */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div className="bg-green-500/10 rounded p-2 border border-green-500/30">
          <p className="text-green-400 font-medium">t = 0ms</p>
          <p className="text-slate-400">Generator放气</p>
          <p className="text-slate-500">产生主脉冲</p>
        </div>
        <div className="bg-blue-500/10 rounded p-2 border border-blue-500/30">
          <p className="text-blue-400 font-medium">t ≈ {T/2}ms (T/2)</p>
          <p className="text-slate-400">Injector注气</p>
          <p className="text-slate-500">气泡达最大时抑制</p>
        </div>
        <div className="bg-red-500/10 rounded p-2 border border-red-500/30">
          <p className="text-red-400 font-medium">t = {T}, {T*2}, {T*3}ms</p>
          <p className="text-slate-400">振荡脉冲位置</p>
          <p className="text-slate-500">单腔气枪在此产生振荡</p>
        </div>
      </div>
    </div>
  )
}
