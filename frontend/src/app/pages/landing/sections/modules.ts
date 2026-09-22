import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'landing-modules',
  standalone: true,
  imports: [RouterLink],
  template: `
  <section id="modulos" class="relative overflow-hidden bg-[#031F1C] text-white py-12">
    <div class="absolute inset-0 bg-gradient-to-br from-[#0a645a]/30 to-transparent"></div>
    <div class="absolute -right-20 top-10 w-96 h-96 rounded-full bg-white/5 blur-3xl"></div>
    <div class="relative max-w-7xl mx-auto px-6">
      <div class="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div class="text-xs font-semibold tracking-[0.14em] uppercase text-[#7ff0e0]" style="font-family:'Roboto',sans-serif">Módulos que ya usas en el panel</div>
          <h2 class="text-2xl lg:text-3xl font-bold tracking-tight mt-1" style="font-family:'Montserrat',sans-serif">4 pilares. 0 curva de aprendizaje.</h2>
        </div>
        <p class="text-sm text-white/60 max-w-md" style="font-family:'Roboto',sans-serif">Misma tabla, mismos filtros, mismas acciones del dash. Lo ves en la landing, lo usas idéntico dentro.</p>
      </div>
      <div class="grid md:grid-cols-2 gap-5">
        <div class="rounded-[1.25rem] bg-white/10 backdrop-blur border border-white/10 p-6 hover:bg-white/[0.14] transition-colors">
          <div class="flex items-center justify-between"><span class="text-xs font-semibold text-[#7ff0e0] bg-white/10 px-2.5 py-1 rounded-full" style="font-family:'JetBrains Mono',monospace">01 · INVENTARIO</span><span class="material-symbols-outlined text-white/50">inventory_2</span></div>
          <h3 class="text-lg font-bold mt-4" style="font-family:'Montserrat',sans-serif">Equipos &amp; parque biomédico</h3>
          <p class="text-sm text-white/70 mt-2 leading-relaxed" style="font-family:'Roboto',sans-serif">Ficha Res.3100, riesgo INVIMA, estado y próxima calibración. Carga masiva 2.000 filas.</p>
          <div class="mt-4 text-xs font-semibold text-white flex items-center gap-1" style="font-family:'Roboto',sans-serif"><span class="w-1.5 h-1.5 rounded-full bg-emerald-300"></span> KPI operativos / en taller / fuera de servicio</div>
        </div>
        <div class="rounded-[1.25rem] bg-white/10 backdrop-blur border border-white/10 p-6 hover:bg-white/[0.14] transition-colors">
          <div class="flex items-center justify-between"><span class="text-xs font-semibold text-[#7ff0e0] bg-white/10 px-2.5 py-1 rounded-full" style="font-family:'JetBrains Mono',monospace">02 · CRONOGRAMA</span><span class="material-symbols-outlined text-white/50">calendar_month</span></div>
          <h3 class="text-lg font-bold mt-4" style="font-family:'Montserrat',sans-serif">Planes preventivos ONAC</h3>
          <p class="text-sm text-white/70 mt-2 leading-relaxed" style="font-family:'Roboto',sans-serif">Vencidos / próximos ≤15d / al día, sincronización y acta de ejecución.</p>
          <div class="mt-4 text-xs font-semibold text-white flex items-center gap-1" style="font-family:'Roboto',sans-serif"><span class="w-1.5 h-1.5 rounded-full bg-amber-300"></span> Alertas automáticas</div>
        </div>
        <div class="rounded-[1.25rem] bg-white/10 backdrop-blur border border-white/10 p-6 hover:bg-white/[0.14] transition-colors">
          <div class="flex items-center justify-between"><span class="text-xs font-semibold text-[#7ff0e0] bg-white/10 px-2.5 py-1 rounded-full" style="font-family:'JetBrains Mono',monospace">03 · OPERACIÓN</span><span class="material-symbols-outlined text-white/50">receipt_long</span></div>
          <h3 class="text-lg font-bold mt-4" style="font-family:'Montserrat',sans-serif">Órdenes de trabajo foliadas</h3>
          <p class="text-sm text-white/70 mt-2 leading-relaxed" style="font-family:'Roboto',sans-serif">Preventivas/correctivas, asignación, inicio y cierre con resultado. Libro radicador.</p>
          <div class="mt-4 text-xs font-semibold text-white" style="font-family:'Roboto',sans-serif">Flujo PENDIENTE → COMPLETADA</div>
        </div>
        <div class="rounded-[1.25rem] bg-white/10 backdrop-blur border border-white/10 p-6 hover:bg-white/[0.14] transition-colors">
          <div class="flex items-center justify-between"><span class="text-xs font-semibold text-[#7ff0e0] bg-white/10 px-2.5 py-1 rounded-full" style="font-family:'JetBrains Mono',monospace">04 · TRAZABILIDAD</span><span class="material-symbols-outlined text-white/50">verified</span></div>
          <h3 class="text-lg font-bold mt-4" style="font-family:'Montserrat',sans-serif">Reportes regulatorios</h3>
          <p class="text-sm text-white/70 mt-2 leading-relaxed" style="font-family:'Roboto',sans-serif">Hoja de vida y certificado de cumplimiento por equipo o parque, PDF SHA-256 + ECDSA.</p>
          <div class="mt-4 text-xs font-semibold text-white" style="font-family:'Roboto',sans-serif">Auditoría 1-clic</div>
        </div>
      </div>
      <div class="mt-6 flex justify-center">
        <a routerLink="/dashboard" class="inline-flex items-center gap-2 bg-white text-[#042B26] hover:bg-slate-50 text-sm font-bold px-7 py-3 rounded-full shadow-xl hover:scale-[1.02] transition-all" style="font-family:'Montserrat',sans-serif">Abrir panel ahora <span class="material-symbols-outlined">open_in_new</span></a>
      </div>
    </div>
  </section>
  `,
})
export class LandingModules {}
