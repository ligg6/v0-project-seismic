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
              <h4 className="text-cyan-400 font-semibold mb-3">GI 双腔气枪工作原理</h4>
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex gap-3">
                  <span className="text-green-400 font-bold">1.</span>
                  <p><strong className="text-green-400">充气阶段:</strong> 高压空气同时充入Generator和Injector两个腔体</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-yellow-400 font-bold">2.</span>
                  <p><strong className="text-yellow-400">Generator放气:</strong> 发生器腔首先释放高压气体，产生主地震脉冲，同时形成气泡</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-purple-400 font-bold">3.</span>
                  <p><strong className="text-purple-400">Injector放气:</strong> 在气泡膨胀到最大前，注入器腔延迟释放气体，向气泡内部注入能量</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-blue-400 font-bold">4.</span>
                  <p><strong className="text-blue-400">振荡抑制:</strong> Injector注入的气体有效抑制气泡的二次振荡，使波形更加锐利</p>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-700">
                <h5 className="text-cyan-300 text-sm font-medium mb-2">关键优势</h5>
                <ul className="text-xs text-slate-400 space-y-1">
                  <li>• 更锐利的地震子波，提高垂向分辨率</li>
                  <li>• 减少气泡效应造成的多次反射干扰</li>
                  <li>• 适合浅水环境勘探（水深10-100m）</li>
                  <li>• 体积小巧，便于多枪组合使用</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 底部工作流程时间线 */}
        <section className="bg-slate-800/40 rounded-xl p-4 border border-slate-700">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4 text-center">单次激发工作周期时间线</h3>
          
          <div className="relative">
            {/* 时间线 */}
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 via-purple-500 to-cyan-500 transition-all duration-100"
                style={{ width: `${phase}%` }}
              />
            </div>
            
            {/* 阶段标记 */}
            <div className="flex justify-between mt-4 text-xs">
              <div className={`text-center ${phase >= 0 ? 'text-green-400' : 'text-slate-500'}`}>
                <div className="w-3 h-3 rounded-full bg-green-500 mx-auto mb-1" />
                <p className="font-medium">0ms</p>
                <p>充气完成</p>
              </div>
              <div className={`text-center ${phase >= 20 ? 'text-yellow-400' : 'text-slate-500'}`}>
                <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${phase >= 20 ? 'bg-yellow-500' : 'bg-slate-600'}`} />
                <p className="font-medium">~2ms</p>
                <p>G放气</p>
              </div>
              <div className={`text-center ${phase >= 35 ? 'text-orange-400' : 'text-slate-500'}`}>
                <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${phase >= 35 ? 'bg-orange-500' : 'bg-slate-600'}`} />
                <p className="font-medium">~5ms</p>
                <p>气泡最大</p>
              </div>
              <div className={`text-center ${phase >= 50 ? 'text-purple-400' : 'text-slate-500'}`}>
                <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${phase >= 50 ? 'bg-purple-500' : 'bg-slate-600'}`} />
                <p className="font-medium">~8ms</p>
                <p>I放气</p>
              </div>
              <div className={`text-center ${phase >= 70 ? 'text-blue-400' : 'text-slate-500'}`}>
                <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${phase >= 70 ? 'bg-blue-500' : 'bg-slate-600'}`} />
                <p className="font-medium">~15ms</p>
                <p>坍缩稳定</p>
              </div>
              <div className={`text-center ${phase >= 90 ? 'text-cyan-400' : 'text-slate-500'}`}>
                <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${phase >= 90 ? 'bg-cyan-500' : 'bg-slate-600'}`} />
                <p className="font-medium">~20ms</p>
                <p>周期结束</p>
              </div>
            </div>
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
