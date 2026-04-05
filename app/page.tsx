"use client"

import { useState, useEffect, useCallback } from "react"
import { SurveyScene } from "@/components/seismic/survey-scene"
import { GIAirgunDetail } from "@/components/seismic/gi-airgun-detail"
import { BubbleDynamics } from "@/components/seismic/bubble-dynamics"
import { WaveformDisplay } from "@/components/seismic/waveform-display"
import { ControlPanel } from "@/components/seismic/control-panel"

export default function SeismicSurveySimulation() {
  const [phase, setPhase] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [time, setTime] = useState(0)

  // 动画循环
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setPhase((prev) => {
        const newPhase = prev + 0.5 * speed
        return newPhase >= 100 ? 0 : newPhase
      })
      setTime((prev) => prev + 16)
    }, 16)

    return () => clearInterval(interval)
  }, [isPlaying, speed])

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev)
  }, [])

  const handleReset = useCallback(() => {
    setPhase(0)
    setTime(0)
  }, [])

  const handlePhaseChange = useCallback((newPhase: number) => {
    setPhase(newPhase)
  }, [])

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* 标题区域 */}
      <header className="py-6 px-4 border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            海上浅水多通道拖缆地震勘探
          </h1>
          <h2 className="text-lg md:text-xl text-center text-cyan-300/80 mt-2">
            GI Mini Airgun 双腔气枪震源工作原理动态演示
          </h2>
          <p className="text-center text-slate-400 text-sm mt-2 max-w-2xl mx-auto">
            Generator-Injector (GI) 气枪通过双腔协同工作，有效抑制气泡振荡效应，
            产生锐利、高分辨率的地震子波，提高浅水勘探的分辨能力
          </p>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {/* 整体勘探场景 */}
        <section>
          <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
            海上浅水勘探整体示意图
          </h3>
          <SurveyScene phase={phase} time={time} />
        </section>

        {/* 详细视图网格 */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：气枪结构与气泡动态 */}
          <div className="space-y-6">
            <GIAirgunDetail phase={phase} />
            <BubbleDynamics phase={phase} />
          </div>

          {/* 右侧：波形与控制 */}
          <div className="space-y-6">
            <WaveformDisplay phase={phase} />
            <ControlPanel
              phase={phase}
              isPlaying={isPlaying}
              speed={speed}
              onPhaseChange={handlePhaseChange}
              onPlayPause={handlePlayPause}
              onReset={handleReset}
              onSpeedChange={handleSpeedChange}
            />
            
            {/* 技术说明卡片 */}
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
              <h4 className="text-cyan-400 font-semibold mb-3">GI 双腔气枪工作原理与气泡振荡</h4>
              
              {/* 参数显示 */}
              <div className="flex gap-4 mb-3 text-xs">
                <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded">工作压力: 1800 PSI</span>
                <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded">水深: 60m</span>
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">气泡周期T ≈ 50ms</span>
              </div>
              
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex gap-3">
                  <span className="text-green-400 font-bold">1.</span>
                  <p><strong className="text-green-400">主脉冲 (t=0):</strong> Generator放气，气泡急速膨胀，产生主地震脉冲</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-yellow-400 font-bold">2.</span>
                  <p><strong className="text-yellow-400">气泡膨胀 (0-25ms):</strong> 气泡在约T/2时达到最大半径，此期间Injector注入气体</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-red-400 font-bold">3.</span>
                  <p><strong className="text-red-400">振荡脉冲 (t≈50ms):</strong> 单腔气枪气泡坍缩到最小时急剧反弹，产生振荡脉冲</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-purple-400 font-bold">4.</span>
                  <p><strong className="text-purple-400">GI抑制机制:</strong> Injector注入阻止气泡剧烈坍缩，消除t=50ms, 100ms, 150ms处的振荡</p>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-700">
                <h5 className="text-cyan-300 text-sm font-medium mb-2">关键优势</h5>
                <ul className="text-xs text-slate-400 space-y-1">
                  <li>• 消除气泡振荡脉冲，获得锐利地震子波</li>
                  <li>• 提高浅层分辨率，减少多次波干扰</li>
                  <li>• 适合浅水环境勘探（水深{60}m级别）</li>
                  <li>• 体积小巧，便于多枪组合使用</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 底部工作流程时间线 - 基于50ms气泡周期 */}
        <section className="bg-slate-800/40 rounded-xl p-4 border border-slate-700">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4 text-center">
            气泡振荡周期时间线 (T ≈ 50ms, 显示200ms过程)
          </h3>
          
          <div className="relative">
            {/* 时间线 */}
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 via-purple-500 to-cyan-500 transition-all duration-100"
                style={{ width: `${phase}%` }}
              />
            </div>
            
            {/* 阶段标记 - 基于50ms气泡周期 */}
            <div className="flex justify-between mt-4 text-xs">
              <div className={`text-center ${phase >= 0 ? 'text-green-400' : 'text-slate-500'}`}>
                <div className="w-3 h-3 rounded-full bg-green-500 mx-auto mb-1" />
                <p className="font-medium">0ms</p>
                <p>主脉冲</p>
                <p className="text-slate-500">G放气</p>
              </div>
              <div className={`text-center ${phase >= 12 ? 'text-yellow-400' : 'text-slate-500'}`}>
                <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${phase >= 12 ? 'bg-yellow-500' : 'bg-slate-600'}`} />
                <p className="font-medium">~25ms</p>
                <p>气泡最大</p>
                <p className="text-slate-500">I注气</p>
              </div>
              <div className={`text-center ${phase >= 25 ? 'text-red-400' : 'text-slate-500'}`}>
                <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${phase >= 25 ? 'bg-red-500' : 'bg-slate-600'}`} />
                <p className="font-medium">~50ms</p>
                <p>振荡1</p>
                <p className="text-slate-500">坍缩反弹</p>
              </div>
              <div className={`text-center ${phase >= 50 ? 'text-orange-400' : 'text-slate-500'}`}>
                <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${phase >= 50 ? 'bg-orange-500' : 'bg-slate-600'}`} />
                <p className="font-medium">~100ms</p>
                <p>振荡2</p>
                <p className="text-slate-500">第2周期</p>
              </div>
              <div className={`text-center ${phase >= 75 ? 'text-purple-400' : 'text-slate-500'}`}>
                <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${phase >= 75 ? 'bg-purple-500' : 'bg-slate-600'}`} />
                <p className="font-medium">~150ms</p>
                <p>振荡3</p>
                <p className="text-slate-500">第3周期</p>
              </div>
              <div className={`text-center ${phase >= 95 ? 'text-cyan-400' : 'text-slate-500'}`}>
                <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${phase >= 95 ? 'bg-cyan-500' : 'bg-slate-600'}`} />
                <p className="font-medium">~200ms</p>
                <p>衰减</p>
                <p className="text-slate-500">能量耗散</p>
              </div>
            </div>
          </div>
          
          {/* 说明 */}
          <div className="mt-4 flex justify-center gap-6 text-xs text-slate-500">
            <span><span className="text-green-400">绿色</span>: 主脉冲产生</span>
            <span><span className="text-red-400">红/橙/紫</span>: 单腔气枪振荡脉冲位置</span>
            <span><span className="text-cyan-400">GI气枪</span>: 振荡被Injector有效抑制</span>
          </div>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="py-6 px-4 mt-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto text-center text-slate-500 text-sm">
          <p>海上浅水多通道拖缆地震勘探 - GI Mini Airgun 双腔气枪震源工作原理演示</p>
          <p className="mt-1 text-xs text-slate-600">
            本动画仅供教学演示，实际参数可能因设备型号和工作环境而异
          </p>
        </div>
      </footer>
    </div>
  )
}
