import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'landing-hero',
  standalone: true,
  imports: [RouterLink],
  template: `
  <section class="relative overflow-hidden bg-[#052e2b] text-white -mt-[80px] pt-[80px]">
    <div class="absolute inset-0 bg-[radial-gradient(900px_600px_at_78%_-10%,#0a645a_0%,transparent_62%),radial-gradient(700px_500px_at_0%_100%,#b08d57_0%,transparent_72%)] opacity-30"></div>
    <div class="absolute -right-20 -top-20 w-[680px] h-[680px] rounded-full border border-white/10"></div>
    <div class="absolute -right-20 -top-20 w-[520px] h-[520px] rounded-full border border-white/5 translate-x-8 translate-y-8"></div>

    <div class="relative max-w-7xl mx-auto px-6 py-10 lg:py-14 grid lg:grid-cols-12 gap-10 items-center">
      <div class="lg:col-span-6 flex flex-col gap-6">
        <div class="inline-flex items-center gap-2.5 bg-white text-[#052e2b] rounded-full pl-1.5 pr-3 py-1 w-fit shadow-lg animate-in">
          <span class="inline-flex items-center gap-1.5 bg-[#052e2b] text-white rounded-full px-2.5 py-1 text-xs font-bold" style="font-family:'Montserrat',sans-serif">NUEVO</span>
          <span class="text-xs font-medium text-slate-600" style="font-family:'Roboto',sans-serif">Auditoría Res.3100 2026 — lista en 30s</span>
          <span class="w-5 h-5 rounded-full bg-[#b08d57] text-white flex items-center justify-center"><span class="material-symbols-outlined text-[14px]">arrow_forward</span></span>
        </div>
        <h1 class="text-[2.55rem] sm:text-[3.3rem] lg:text-[4.1rem] font-bold leading-[0.88] tracking-tight animate-in d1" style="font-family:'Montserrat',sans-serif">
          Si te
          <span class="text-[#7ff0e0]">auditan mañana,</span>
          estás cubierto.
        </h1>
        <p class="text-[15px] lg:text-[16px] text-white/70 leading-relaxed max-w-[30rem] animate-in d2" style="font-family:'Roboto',sans-serif">
          No es otro inventario. Es <span class="text-white font-semibold">custodia legal</span>: cada mantenimiento nace foliado, firmado y con SHA-256. INVIMA y Secretaría ven el libro, no tu Excel.
        </p>
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
      </div>

      <!-- MOCKUPS PREMIUM - bastante rotación -->
      <div class="lg:col-span-6 relative overflow-visible">
        <div class="relative w-full max-w-[640px] mx-auto min-h-[560px] [perspective:1800px] [transform-style:preserve-3d]">

          <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[420px] bg-[#00C9A7]/12 blur-[80px] rounded-full pointer-events-none"></div>

          <!-- BACK: inventario - bastante girado -->
          <div class="absolute top-10 right-0 sm:-right-2 w-[78%] hidden sm:block bg-[#f4f1ea] rounded-2xl border border-white/20 shadow-[0_24px_60px_rgba(0,0,0,0.4)] overflow-hidden animate-float-back" style="opacity:0.7; filter: blur(0.5px);">
            <div class="h-8 bg-[#0a3a34] flex items-center gap-1.5 px-3">
              <span class="w-2.5 h-2.5 rounded-full bg-white/25"></span><span class="w-2.5 h-2.5 rounded-full bg-white/25"></span><span class="w-2.5 h-2.5 rounded-full bg-white/25"></span>
              <span class="ml-3 text-[11px] text-white/50" style="font-family:'JetBrains Mono',monospace">inventario · 348 equipos</span>
              <span class="ml-auto text-[10px] bg-white/15 text-white/80 font-bold px-2 py-0.5 rounded-full border border-white/10">FOLIO ONAC</span>
            </div>
            <div class="flex h-[220px]">
              <div class="hidden sm:flex w-14 bg-white border-r border-slate-200 flex-col items-center gap-3 py-3">
                <span class="w-7 h-7 rounded-lg bg-[#052e2b] text-white flex items-center justify-center"><span class="material-symbols-outlined text-[16px]">dashboard</span></span>
                <span class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center"><span class="material-symbols-outlined text-[16px]">inventory_2</span></span>
                <span class="w-7 h-7 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center"><span class="material-symbols-outlined text-[16px]">calendar_month</span></span>
                <span class="w-7 h-7 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center"><span class="material-symbols-outlined text-[16px]">receipt_long</span></span>
              </div>
              <div class="flex-1 p-3 bg-[#f8fafc]">
                <div class="flex items-center gap-2 mb-3">
                  <div class="flex-1 h-7 bg-white border border-slate-200 rounded-full flex items-center gap-2 px-3"><span class="material-symbols-outlined text-[14px] text-slate-400">search</span><span class="text-[11px] text-slate-400" style="font-family:'Roboto',sans-serif">Buscar serie, modelo...</span></div>
                </div>
                <div class="space-y-1.5">
                  <div class="h-9 bg-white border border-slate-200 rounded-xl flex items-center px-2.5 gap-2"><span class="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">DR</span><div class="flex-1 min-w-0"><div class="text-xs font-bold text-slate-900 truncate" style="font-family:'Montserrat',sans-serif">Dräger Evita V500</div><div class="text-[11px] text-slate-400" style="font-family:'JetBrains Mono',monospace">840201 · UCI · Riesgo III</div></div><span class="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">OPERATIVO</span></div>
                  <div class="h-9 bg-white border border-slate-200 rounded-xl flex items-center px-2.5 gap-2"><span class="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center"><span class="material-symbols-outlined text-[14px]">warning</span></span><div class="flex-1 min-w-0"><div class="text-xs font-bold text-slate-900 truncate" style="font-family:'Montserrat',sans-serif">Philips IntelliVue MP50</div><div class="text-[11px] text-amber-600">Vence en 8d · MP-114</div></div><span class="w-2 h-2 rounded-full bg-amber-500"></span></div>
                  <div class="h-9 bg-white border border-slate-200 rounded-xl flex items-center px-2.5 gap-2"><span class="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center"><span class="material-symbols-outlined text-[14px]">error</span></span><div class="flex-1 min-w-0"><div class="text-xs font-bold text-slate-900 truncate" style="font-family:'Montserrat',sans-serif">ZOLL R Series</div><div class="text-[11px] text-rose-600">Vencido hace 3d</div></div><span class="text-[10px] font-bold px-2 py-1 rounded-full bg-rose-500 text-white">CRÍTICO</span></div>
                </div>
              </div>
            </div>
          </div>

          <!-- FRONT: dashboard - protagonista bastante rotado -->
          <div class="absolute top-0 left-0 sm:left-0 w-[94%] sm:w-[86%] bg-white rounded-[1.6rem] border-[6px] border-white shadow-[0_36px_90px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.9)_inset] overflow-hidden animate-float-front">
            <!-- glare premium -->
            <div class="absolute inset-0 bg-gradient-to-br from-white/[0.09] via-transparent to-transparent pointer-events-none"></div>
            <div class="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none"></div>

            <div class="relative h-9 bg-[#f4f1ea] border-b border-slate-200 flex items-center gap-2 px-3">
              <span class="w-3 h-3 rounded-full bg-[#ff5f56] border border-black/10"></span><span class="w-3 h-3 rounded-full bg-[#ffbd2e] border border-black/10"></span><span class="w-3 h-3 rounded-full bg-[#27c93f] border border-black/10"></span>
              <div class="ml-2 flex-1 max-w-[200px] h-6 bg-white border border-slate-200 rounded-full flex items-center gap-1.5 px-2.5 shadow-sm"><span class="material-symbols-outlined text-[12px] text-emerald-600">lock</span><span class="text-[11px] text-slate-600 truncate" style="font-family:'Roboto',sans-serif">panel.biocmms.co</span><span class="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"></span></div>
              <span class="ml-auto inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow"><span class="w-1.5 h-1.5 rounded-full bg-white"></span> En vivo</span>
            </div>
            <div class="relative h-9 bg-[#052e2b] flex items-center gap-2 px-3 text-white">
              <span class="text-xs font-bold tracking-widest" style="font-family:'Montserrat',sans-serif">BIOCMMS</span>
              <span class="text-[10px] bg-white/15 border border-white/10 px-1.5 py-0.5 rounded font-medium">Res.3100</span>
              <span class="ml-auto w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#052e2b] text-xs font-bold">CM</span>
            </div>
            <div class="relative p-3.5 bg-[#f8fafc]">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold text-slate-900" style="font-family:'Montserrat',sans-serif">Riesgo de vencimientos</span>
                <span class="text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-500 text-white shadow-sm">12 VENCIDOS</span>
              </div>
              <div class="grid grid-cols-3 gap-2.5 mb-3.5">
                <div class="bg-white rounded-xl border border-slate-200 p-2.5 relative overflow-hidden">
                  <div class="absolute top-0 left-0 w-full h-0.5 bg-rose-500"></div>
                  <div class="text-[10px] uppercase tracking-widest text-slate-400 font-semibold" style="font-family:'Roboto',sans-serif">Vencidos</div>
                  <div class="text-[22px] font-bold text-rose-600 leading-none mt-1" style="font-family:'Montserrat',sans-serif">12</div>
                  <div class="text-[11px] font-bold text-rose-600 mt-0.5">Urgente</div>
                </div>
                <div class="bg-white rounded-xl border border-slate-200 p-2.5">
                  <div class="text-[10px] uppercase tracking-widest text-slate-400 font-semibold" style="font-family:'Roboto',sans-serif">Próximos</div>
                  <div class="text-[22px] font-bold text-amber-600 leading-none mt-1" style="font-family:'Montserrat',sans-serif">28</div>
                  <div class="text-[11px] text-amber-700 font-medium mt-0.5">≤15d</div>
                </div>
                <div class="bg-[#052e2b] rounded-xl p-2.5 text-white relative overflow-hidden">
                  <div class="absolute -right-4 -top-4 w-12 h-12 bg-white/[0.07] rounded-full"></div>
                  <div class="relative text-[10px] uppercase tracking-widest text-white/60 font-semibold" style="font-family:'Roboto',sans-serif">Al día</div>
                  <div class="relative text-[22px] font-bold leading-none mt-1" style="font-family:'Montserrat',sans-serif">308</div>
                  <div class="relative text-[11px] text-white/60 mt-0.5">Custodia</div>
                </div>
              </div>
              <div class="bg-white rounded-xl border border-slate-200 p-3 mb-3">
                <div class="flex items-center justify-between mb-2.5"><span class="text-[11px] font-bold text-slate-700" style="font-family:'Montserrat',sans-serif">Cumplimiento 94.2%</span><span class="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">Meta >90%</span></div>
                <div class="flex items-end gap-1.5 h-10">
                  <div class="flex-1 bg-slate-100 rounded-t" style="height: 40%"></div><div class="flex-1 bg-slate-200 rounded-t" style="height: 65%"></div><div class="flex-1 bg-amber-200 rounded-t" style="height: 55%"></div><div class="flex-1 bg-emerald-500 rounded-t shadow-sm" style="height: 92%"></div><div class="flex-1 bg-[#052e2b] rounded-t" style="height: 78%"></div>
                </div>
              </div>
              <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div class="px-3 py-2.5 border-b border-slate-100 flex items-center justify-between"><span class="text-xs font-bold text-slate-900" style="font-family:'Montserrat',sans-serif">Atención prioritaria</span><span class="text-[10px] font-bold tracking-widest text-slate-400">HOY · 3</span></div>
                <div class="divide-y divide-slate-100">
                  <div class="px-3 py-2.5 flex items-center gap-2.5">
                    <span class="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-sm"><span class="material-symbols-outlined text-[16px]">warning</span></span>
                    <div class="flex-1 min-w-0"><div class="text-xs font-bold text-slate-900 truncate" style="font-family:'Montserrat',sans-serif">Ventilador — HACE 12 DÍAS</div><div class="text-[11px] text-slate-400" style="font-family:'JetBrains Mono',monospace">PL-042 · SHA 9f3a…c02e</div></div>
                    <span class="shrink-0 bg-[#052e2b] text-white text-[11px] font-bold px-3 py-1 rounded-full">OT</span>
                  </div>
                  <div class="px-3 py-2.5 flex items-center gap-2.5 bg-amber-50/60">
                    <span class="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center"><span class="material-symbols-outlined text-[14px]">schedule</span></span>
                    <div class="flex-1 min-w-0"><div class="text-xs font-bold text-slate-900 truncate" style="font-family:'Montserrat',sans-serif">Desfibrilador — vence en 8d</div><div class="h-1.5 w-full bg-slate-200 rounded-full mt-1.5 overflow-hidden"><div class="h-full w-[75%] bg-amber-500 rounded-full"></div></div></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="h-2.5 bg-slate-200 border-t border-slate-300"></div>
          </div>

        </div>
      </div>
    </div>
  </section>
  `,
  styles: [`
    @keyframes floatFront { 0%,100% { transform: perspective(1800px) rotateY(-18deg) rotateX(7deg) rotateZ(-0.8deg) translateY(0) } 50% { transform: perspective(1800px) rotateY(-18deg) rotateX(7deg) rotateZ(-0.8deg) translateY(-10px) } }
    @keyframes floatBack { 0%,100% { transform: perspective(1800px) rotateY(-22deg) rotateX(9deg) rotateZ(-0.8deg) translateY(0) } 50% { transform: perspective(1800px) rotateY(-22deg) rotateX(9deg) rotateZ(-0.8deg) translateY(-7px) } }
    @keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
    @keyframes in { from { opacity:0; transform: translateY(10px) } to { opacity:1; transform: translateY(0) } }
    .animate-float-front { animation: floatFront 6s ease-in-out infinite; transform-style: preserve-3d; }
    .animate-float-back { animation: floatBack 6.5s ease-in-out infinite; transform-style: preserve-3d; }
    .animate-in { animation: in 0.55s ease-out both; }
    .d1 { animation-delay: 0.08s } .d2 { animation-delay: 0.16s } .d3 { animation-delay: 0.24s } .d4 { animation-delay: 0.32s } .d5 { animation-delay: 0.4s }
  `],
})
export class LandingHero {}
