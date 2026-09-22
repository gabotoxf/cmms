import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'landing-hero',
  standalone: true,
  imports: [RouterLink],
  template: `
  <section class="relative overflow-hidden bg-[#052e2b] text-white">
    <div class="absolute inset-0 bg-[radial-gradient(900px_600px_at_78%_-10%,#0a645a_0%,transparent_62%),radial-gradient(700px_500px_at_0%_100%,#b08d57_0%,transparent_72%)] opacity-30"></div>
    <div class="absolute -right-20 -top-20 w-[680px] h-[680px] rounded-full border border-white/10"></div>
    <div class="absolute -right-20 -top-20 w-[520px] h-[520px] rounded-full border border-white/5 translate-x-8 translate-y-8"></div>

    <div class="relative max-w-7xl mx-auto px-6 py-10 lg:py-12 grid lg:grid-cols-12 gap-8 items-center">
      <div class="lg:col-span-6 flex flex-col gap-6">
        <div class="inline-flex items-center gap-2.5 bg-white text-[#052e2b] rounded-full pl-1.5 pr-3 py-1 w-fit shadow-lg animate-in">
          <span class="inline-flex items-center gap-1.5 bg-[#052e2b] text-white rounded-full px-2.5 py-1 text-xs font-bold" style="font-family:'Montserrat',sans-serif">NUEVO</span>
          <span class="text-xs font-medium text-slate-600" style="font-family:'Roboto',sans-serif">Auditoría Res.3100 2026 — lista en 30s</span>
          <span class="w-5 h-5 rounded-full bg-[#b08d57] text-white flex items-center justify-center"><span class="material-symbols-outlined text-[14px]">arrow_forward</span></span>
        </div>
        <h1 class="text-[2.55rem] sm:text-[3.3rem] lg:text-[4.1rem] font-bold leading-[0.88] tracking-tight animate-in d1" style="font-family:'Montserrat',sans-serif">
          Si te<br>
          <span class="text-[#7ff0e0]">auditan mañana,</span><br>
          estás cubierto.
        </h1>
        <p class="text-[15px] lg:text-[16px] text-white/70 leading-relaxed max-w-[30rem] animate-in d2" style="font-family:'Roboto',sans-serif">
          No es otro inventario. Es <span class="text-white font-semibold">custodia legal</span>: cada mantenimiento nace foliado, firmado y con SHA-256. INVIMA y Secretaría ven el libro, no tu Excel.
        </p>
        <ul class="grid gap-2 text-sm text-white/80 max-w-[30rem] animate-in d3" style="font-family:'Roboto',sans-serif">
          <li class="flex items-center gap-2.5"><span class="w-6 h-6 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-[14px] text-[#7ff0e0]">check</span></span> Hoja de vida 28 campos + QR al equipo</li>
          <li class="flex items-center gap-2.5"><span class="w-6 h-6 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-[14px] text-[#7ff0e0]">check</span></span> Alertas 15 días antes — 0 vencidos por olvido</li>
          <li class="flex items-center gap-2.5"><span class="w-6 h-6 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-[14px] text-[#7ff0e0]">check</span></span> OT con firma COPNIA y recepción asistencial</li>
        </ul>
        <div class="flex flex-wrap items-center gap-3 pt-1 animate-in d4">
          <a routerLink="/dashboard" class="group inline-flex items-center gap-2 bg-white text-[#052e2b] text-sm font-bold pl-6 pr-1.5 py-1.5 rounded-full shadow-[0_12px_30px_rgba(0,0,0,0.25)] hover:bg-[#f4f1ea] transition-all hover:scale-[1.02]" style="font-family:'Montserrat',sans-serif">
            Ver mi riesgo gratis
            <span class="w-9 h-9 rounded-full bg-[#052e2b] text-white flex items-center justify-center group-hover:rotate-45 transition-transform duration-300">
              <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
            </span>
          </a>
          <a href="#caso" class="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white px-4 py-2" style="font-family:'Montserrat',sans-serif">
            Ver caso San Rafael <span class="material-symbols-outlined text-[16px]">play_circle</span>
          </a>
        </div>
        <div class="flex flex-wrap items-center gap-4 pt-4 border-t border-white/10 animate-in d5">
          <div class="flex -space-x-2">
            <img src="https://i.pravatar.cc/100?img=12" class="w-8 h-8 rounded-full border-2 border-[#052e2b] object-cover">
            <img src="https://i.pravatar.cc/100?img=33" class="w-8 h-8 rounded-full border-2 border-[#052e2b] object-cover">
            <img src="https://i.pravatar.cc/100?img=15" class="w-8 h-8 rounded-full border-2 border-[#052e2b] object-cover">
            <div class="w-8 h-8 rounded-full border-2 border-[#052e2b] bg-[#b08d57] text-white flex items-center justify-center text-[11px] font-bold">+42</div>
          </div>
          <div class="leading-tight">
            <div class="flex items-center gap-1 text-amber-300"><span class="material-symbols-outlined text-[14px]">star</span><span class="material-symbols-outlined text-[14px]">star</span><span class="material-symbols-outlined text-[14px]">star</span><span class="material-symbols-outlined text-[14px]">star</span><span class="material-symbols-outlined text-[14px]">star</span><span class="text-xs font-bold text-white ml-1">4.9/5</span></div>
            <div class="text-xs text-white/60" style="font-family:'Roboto',sans-serif">45+ IPS · 99.8% aprobación</div>
          </div>
        </div>
      </div>

      <!-- MOCKUPS ULTRA ANIMADOS -->
      <div class="lg:col-span-6 relative">
        <div class="relative w-full max-w-[600px] mx-auto h-[500px] sm:h-[520px] [perspective:1600px]">

          <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[380px] bg-[#00C9A7]/12 blur-[70px] rounded-full pointer-events-none animate-pulse-slow"></div>

          <!-- BACK: inventario -->
          <div class="absolute top-10 right-0 w-[80%] bg-[#f4f1ea] rounded-2xl border border-white/30 shadow-[0_24px_60px_rgba(0,0,0,0.35)] overflow-hidden hidden sm:block mock-enter mock-enter-d1 animate-float-slow hover:!pause" style="transform: rotateY(-10deg) rotateX(4deg);">
            <div class="h-8 bg-[#0a3a34] flex items-center gap-1.5 px-3">
              <span class="w-2.5 h-2.5 rounded-full bg-white/20 animate-dot"></span><span class="w-2.5 h-2.5 rounded-full bg-white/20 animate-dot d1"></span><span class="w-2.5 h-2.5 rounded-full bg-white/20 animate-dot d2"></span>
              <span class="ml-3 text-[11px] text-white/60" style="font-family:'JetBrains Mono',monospace">inventario · 348 equipos</span>
              <span class="ml-auto text-[10px] bg-[#b08d57] text-white font-bold px-2 py-0.5 rounded-full animate-shimmer">FOLIO ONAC</span>
            </div>
            <div class="flex h-[220px]">
              <div class="hidden sm:flex w-14 bg-white border-r border-slate-200 flex-col items-center gap-3 py-3">
                <span class="w-7 h-7 rounded-lg bg-[#052e2b] text-white flex items-center justify-center"><span class="material-symbols-outlined text-[16px]">dashboard</span></span>
                <span class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center animate-icon-pulse"><span class="material-symbols-outlined text-[16px]">inventory_2</span></span>
                <span class="w-7 h-7 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center"><span class="material-symbols-outlined text-[16px]">calendar_month</span></span>
                <span class="w-7 h-7 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center"><span class="material-symbols-outlined text-[16px]">receipt_long</span></span>
              </div>
              <div class="flex-1 p-3 bg-[#f8fafc]">
                <div class="flex items-center gap-2 mb-3">
                  <div class="flex-1 h-7 bg-white border border-slate-200 rounded-full flex items-center gap-2 px-3"><span class="material-symbols-outlined text-[14px] text-slate-400">search</span><span class="text-[11px] text-slate-400" style="font-family:'Roboto',sans-serif">Buscar serie, modelo...</span><span class="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-ping-small"></span></div>
                </div>
                <div class="space-y-1.5">
                  <div class="h-9 bg-white border border-slate-200 rounded-xl flex items-center px-2.5 gap-2 animate-row" style="animation-delay: 0.6s"><span class="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">DR</span><div class="flex-1 min-w-0"><div class="text-xs font-bold text-slate-900 truncate" style="font-family:'Montserrat',sans-serif">Dräger Evita V500</div><div class="text-[11px] text-slate-400" style="font-family:'JetBrains Mono',monospace">840201 · UCI · Riesgo III</div></div><span class="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">OPERATIVO</span></div>
                  <div class="h-9 bg-white border border-slate-200 rounded-xl flex items-center px-2.5 gap-2 animate-row" style="animation-delay: 0.8s"><span class="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center"><span class="material-symbols-outlined text-[14px]">warning</span></span><div class="flex-1 min-w-0"><div class="text-xs font-bold text-slate-900 truncate" style="font-family:'Montserrat',sans-serif">Philips IntelliVue MP50</div><div class="text-[11px] text-amber-600">Vence en 8d · MP-114</div></div><span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span></div>
                  <div class="h-9 bg-white border border-slate-200 rounded-xl flex items-center px-2.5 gap-2 animate-row" style="animation-delay: 1s"><span class="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center"><span class="material-symbols-outlined text-[14px]">error</span></span><div class="flex-1 min-w-0"><div class="text-xs font-bold text-slate-900 truncate" style="font-family:'Montserrat',sans-serif">ZOLL R Series</div><div class="text-[11px] text-rose-600">Vencido hace 3d</div></div><span class="text-[10px] font-bold px-2 py-1 rounded-full bg-rose-500 text-white animate-bounce-subtle">CRÍTICO</span></div>
                </div>
              </div>
            </div>
          </div>

          <!-- FRONT: dashboard laptop -->
          <div class="absolute top-0 left-0 w-[94%] sm:w-[84%] bg-white rounded-[1.4rem] border-[5px] border-white shadow-[0_28px_80px_rgba(0,0,0,0.45)] overflow-hidden mock-enter mock-enter-d2 animate-float hover:!pause">
            <div class="h-9 bg-[#f4f1ea] border-b border-slate-200 flex items-center gap-2 px-3">
              <span class="w-3 h-3 rounded-full bg-[#ff5f56] border border-black/10 animate-dot"></span><span class="w-3 h-3 rounded-full bg-[#ffbd2e] border border-black/10 animate-dot d1"></span><span class="w-3 h-3 rounded-full bg-[#27c93f] border border-black/10 animate-dot d2"></span>
              <div class="ml-2 flex-1 max-w-[200px] h-6 bg-white border border-slate-200 rounded-full flex items-center gap-1.5 px-2.5"><span class="material-symbols-outlined text-[12px] text-emerald-600">lock</span><span class="text-[11px] text-slate-600 truncate" style="font-family:'Roboto',sans-serif">panel.biocmms.co</span><span class="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span></div>
              <span class="ml-auto inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow animate-pulse-ring"><span class="w-1.5 h-1.5 rounded-full bg-white"></span> En vivo</span>
            </div>
            <div class="h-9 bg-[#052e2b] flex items-center gap-2 px-3 text-white">
              <span class="text-xs font-bold" style="font-family:'Montserrat',sans-serif">BIOCMMS</span>
              <span class="text-[10px] bg-white/15 px-1.5 py-0.5 rounded animate-shimmer">Res.3100</span>
              <span class="ml-auto w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#052e2b] text-xs font-bold animate-icon-pulse">CM</span>
            </div>
            <div class="p-3 bg-[#f8fafc]">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold text-slate-900" style="font-family:'Montserrat',sans-serif">Riesgo de vencimientos</span>
                <span class="text-[11px] font-bold px-2 py-1 rounded-full bg-rose-500 text-white shadow animate-bounce-subtle">12 VENCIDOS</span>
              </div>
              <div class="grid grid-cols-3 gap-2 mb-3">
                <div class="bg-white rounded-xl border border-slate-200 p-2.5 relative overflow-hidden animate-kpi" style="animation-delay: 0.3s">
                  <div class="absolute top-0 left-0 w-full h-0.5 bg-rose-500 animate-bar" style="animation-delay: 0.8s"></div>
                  <div class="text-[10px] uppercase tracking-wider text-slate-400" style="font-family:'Roboto',sans-serif">Vencidos</div>
                  <div class="text-xl font-bold text-rose-600" style="font-family:'Montserrat',sans-serif">12</div>
                  <div class="text-[11px] font-bold text-rose-600">Urgente</div>
                </div>
                <div class="bg-white rounded-xl border border-slate-200 p-2.5 animate-kpi" style="animation-delay: 0.45s">
                  <div class="text-[10px] uppercase tracking-wider text-slate-400" style="font-family:'Roboto',sans-serif">Próximos</div>
                  <div class="text-xl font-bold text-amber-600" style="font-family:'Montserrat',sans-serif">28</div>
                  <div class="text-[11px] text-amber-700">≤15d</div>
                </div>
                <div class="bg-[#052e2b] rounded-xl p-2.5 text-white relative overflow-hidden animate-kpi" style="animation-delay: 0.6s">
                  <div class="absolute -right-3 -top-3 w-10 h-10 bg-white/10 rounded-full animate-pulse-slow"></div>
                  <div class="text-[10px] uppercase tracking-wider text-white/60" style="font-family:'Roboto',sans-serif">Al día</div>
                  <div class="text-xl font-bold" style="font-family:'Montserrat',sans-serif">308</div>
                  <div class="text-[11px] text-white/60">Custodia</div>
                </div>
              </div>
              <div class="bg-white rounded-xl border border-slate-200 p-3 mb-3">
                <div class="flex items-center justify-between mb-2"><span class="text-[11px] font-bold text-slate-700" style="font-family:'Montserrat',sans-serif">Cumplimiento 94.2%</span><span class="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full font-bold animate-shimmer">Meta >90%</span></div>
                <div class="flex items-end gap-1 h-10">
                  <div class="flex-1 bg-slate-100 rounded-t animate-bar-grow" style="height: 40%; animation-delay: 0.9s"></div><div class="flex-1 bg-slate-200 rounded-t animate-bar-grow" style="height: 65%; animation-delay: 1s"></div><div class="flex-1 bg-amber-200 rounded-t animate-bar-grow" style="height: 55%; animation-delay: 1.1s"></div><div class="flex-1 bg-emerald-500 rounded-t shadow animate-bar-grow" style="height: 92%; animation-delay: 1.2s"></div><div class="flex-1 bg-[#052e2b] rounded-t animate-bar-grow" style="height: 78%; animation-delay: 1.3s"></div>
                </div>
              </div>
              <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div class="px-3 py-2 border-b border-slate-100 flex items-center justify-between"><span class="text-xs font-bold text-slate-900" style="font-family:'Montserrat',sans-serif">Atención prioritaria</span><span class="text-[10px] font-bold text-slate-500 animate-pulse">HOY • 3</span></div>
                <div class="divide-y divide-slate-100">
                  <div class="px-3 py-2.5 flex items-center gap-2.5 animate-row" style="animation-delay: 1.4s">
                    <span class="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center animate-wiggle"><span class="material-symbols-outlined text-[14px]">warning</span></span>
                    <div class="flex-1 min-w-0"><div class="text-xs font-bold text-slate-900 truncate" style="font-family:'Montserrat',sans-serif">Ventilador — HACE 12 DÍAS</div><div class="text-[11px] text-slate-400" style="font-family:'JetBrains Mono',monospace">PL-042 · SHA 9f3a…c02e</div></div>
                    <span class="shrink-0 bg-[#052e2b] text-white text-[11px] font-bold px-2.5 py-1 rounded-full animate-bounce-subtle">OT</span>
                  </div>
                  <div class="px-3 py-2.5 flex items-center gap-2.5 bg-amber-50/50 animate-row" style="animation-delay: 1.6s">
                    <span class="w-7 h-7 rounded-lg bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center"><span class="material-symbols-outlined text-[14px]">schedule</span></span>
                    <div class="flex-1 min-w-0"><div class="text-xs font-bold text-slate-900 truncate" style="font-family:'Montserrat',sans-serif">Desfibrilador — vence en 8d</div><div class="h-1.5 w-full bg-slate-200 rounded-full mt-1 overflow-hidden"><div class="h-full w-[75%] bg-amber-500 rounded-full animate-bar" style="animation-delay: 1.8s"></div></div></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="h-2 bg-slate-200 border-t border-slate-300"></div>
          </div>

          <!-- floating auditoría -->
          <div class="absolute -bottom-2 -left-2 sm:bottom-2 sm:-left-4 bg-white text-[#052e2b] rounded-2xl p-3 shadow-[0_16px_40px_rgba(0,0,0,0.35)] border border-slate-200 flex items-center gap-3 animate-float-delayed mock-enter mock-enter-d3">
            <div class="w-10 h-10 rounded-full bg-[#052e2b] text-white flex items-center justify-center animate-icon-pulse"><span class="material-symbols-outlined">verified</span></div>
            <div class="leading-tight">
              <div class="text-xs font-bold" style="font-family:'Montserrat',sans-serif">Libro listo en 30s</div>
              <div class="text-[11px] text-slate-500" style="font-family:'JetBrains Mono',monospace">Foliado SHA-256 · ONAC</div>
            </div>
            <span class="hidden sm:inline-flex w-6 h-6 rounded-full bg-emerald-500 text-white items-center justify-center animate-ping-small"><span class="material-symbols-outlined text-[12px]">check</span></span>
          </div>

          <div class="absolute -top-2 right-2 sm:right-0 bg-[#b08d57] text-white rounded-full px-3 py-1.5 shadow-lg border border-white/20 flex items-center gap-2 animate-float-slow mock-enter mock-enter-d1 hidden sm:flex">
            <span class="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <span class="text-[11px] font-bold" style="font-family:'JetBrains Mono',monospace">99.8% APROBACIÓN</span>
          </div>

          <div class="absolute top-[42%] -right-3 bg-[#052e2b] text-white rounded-2xl px-3 py-2.5 shadow-2xl border border-white/10 hidden lg:flex items-center gap-2.5 animate-float mock-enter mock-enter-d2" style="transform: rotate(1.5deg);">
            <span class="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 animate-icon-pulse"><span class="material-symbols-outlined text-[14px]">check</span></span>
            <div class="leading-tight"><div class="text-xs font-bold">OT #0891 foliada</div><div class="text-[11px] text-white/60">COPNIA verificada</div></div>
          </div>
        </div>
      </div>
    </div>
  </section>
  `,
  styles: [`
    @keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
    @keyframes floatSlow { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
    @keyframes in { from { opacity:0; transform: translateY(12px) } to { opacity:1; transform: translateY(0) } }
    @keyframes mockIn { from { opacity:0; transform: translateY(24px) rotateY(-10deg) } to { opacity:1; transform: translateY(0) rotateY(-10deg) } }
    @keyframes bar { from { width:0 } to { width:100% } }
    @keyframes barGrow { from { height:0 } to { height: var(--h) } }
    @keyframes shimmer { 0%,100% { opacity:0.85 } 50% { opacity:1 } }
    @keyframes wiggle { 0%,100% { transform: rotate(0) } 25% { transform: rotate(-6deg) } 75% { transform: rotate(6deg) } }
    @keyframes pingSmall { 0% { transform: scale(1); opacity:1 } 50% { transform: scale(1.15); opacity:0.8 } 100% { transform: scale(1); opacity:1 } }
    @keyframes pulseSlow { 0%,100% { opacity:0.9 } 50% { opacity:0.6 } }
    .animate-float { animation: float 5s ease-in-out infinite; }
    .animate-float-slow { animation: floatSlow 6.5s ease-in-out infinite; }
    .animate-float-delayed { animation: float 5s ease-in-out 1.3s infinite; }
    .animate-in { animation: in 0.6s ease-out both; }
    .d1 { animation-delay: 0.08s } .d2 { animation-delay: 0.16s } .d3 { animation-delay: 0.24s } .d4 { animation-delay: 0.32s } .d5 { animation-delay: 0.4s }
    .mock-enter { animation: mockIn 0.7s cubic-bezier(0.21,1.02,0.73,1) both; }
    .mock-enter-d1 { animation-delay: 0.15s } .mock-enter-d2 { animation-delay: 0.35s } .mock-enter-d3 { animation-delay: 0.55s }
    .animate-row { animation: in 0.5s ease-out both; }
    .animate-kpi { animation: in 0.5s ease-out both; }
    .animate-bar { animation: bar 1s ease-out both; }
    .animate-bar-grow { animation: barGrow 0.8s ease-out both; }
    .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
    .animate-wiggle { animation: wiggle 2.5s ease-in-out infinite; }
    .animate-icon-pulse { animation: pingSmall 2s ease-in-out infinite; }
    .animate-pulse-slow { animation: pulseSlow 3s ease-in-out infinite; }
    .animate-dot { animation: shimmer 1.8s ease-in-out infinite; }
    .animate-bounce-subtle { animation: float 2.2s ease-in-out infinite; }
    .animate-pulse-ring { animation: pulseSlow 1.8s ease-in-out infinite; }
    .animate-ping-small { animation: pingSmall 1.6s ease-in-out infinite; }
    .hover\\:\\!pause:hover { animation-play-state: paused !important; }
  `],
})
export class LandingHero {}
