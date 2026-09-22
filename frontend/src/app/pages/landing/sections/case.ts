import { Component } from '@angular/core';

@Component({
  selector: 'landing-case',
  standalone: true,
  template: `
  <section id="caso" class="max-w-7xl mx-auto px-6 py-12">
    <div class="bg-white rounded-[1.5rem] border border-slate-200 shadow-xl overflow-hidden grid lg:grid-cols-12">
      <div class="lg:col-span-5 bg-slate-50 p-8 flex flex-col justify-center">
        <div class="text-xs font-semibold tracking-widest uppercase text-teal-700" style="font-family:'Roboto',sans-serif">Caso real · Clínica San Rafael</div>
        <blockquote class="text-2xl font-bold tracking-tight text-slate-900 mt-3 leading-tight" style="font-family:'Montserrat',sans-serif">“Redujimos a cero<br>las no conformidades.”</blockquote>
        <p class="text-sm text-slate-500 leading-relaxed mt-3" style="font-family:'Roboto',sans-serif">Libro foliado en 30 segundos ante comisión del Ministerio. UCI y quirófanos sin objeciones.</p>
        <div class="flex items-center gap-3 mt-6">
          <div class="w-10 h-10 rounded-full bg-[#044e46] text-white flex items-center justify-center text-xs font-bold" style="font-family:'Montserrat',sans-serif">CM</div>
          <div><div class="text-sm font-semibold text-slate-900" style="font-family:'Montserrat',sans-serif">Ing. Carlos Mendoza</div><div class="text-xs text-slate-500" style="font-family:'Roboto',sans-serif">Director Ingeniería Clínica</div></div>
        </div>
        <div class="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-200">
          <div><div class="text-2xl font-bold text-[#044e46]" style="font-family:'Montserrat',sans-serif">-78%</div><div class="text-xs text-slate-500" style="font-family:'Roboto',sans-serif">Tiempo documental</div></div>
          <div><div class="text-2xl font-bold text-slate-900" style="font-family:'Montserrat',sans-serif">348</div><div class="text-xs text-slate-500" style="font-family:'Roboto',sans-serif">Equipos críticos</div></div>
        </div>
      </div>
      <div class="lg:col-span-7 p-6 lg:p-8 bg-white">
        <div class="rounded-2xl border border-slate-200 overflow-hidden">
          <div class="px-5 py-3 bg-slate-900 text-white flex items-center justify-between">
            <span class="text-xs font-semibold tracking-wider uppercase" style="font-family:'Roboto',sans-serif">Antes → Después</span>
            <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-slate-900" style="font-family:'Roboto',sans-serif">Migración incluida</span>
          </div>
          <div class="grid grid-cols-2 divide-x divide-slate-200 text-sm" style="font-family:'Roboto',sans-serif">
            <div class="p-5">
              <div class="font-bold text-slate-900" style="font-family:'Montserrat',sans-serif">Planillas dispersas</div>
              <ul class="mt-3 space-y-2 text-slate-500 leading-relaxed text-xs">
                <li class="flex gap-2"><span class="text-rose-500">✕</span> Excel + carpetas + fotos</li>
                <li class="flex gap-2"><span class="text-rose-500">✕</span> Vencimientos sin alerta</li>
                <li class="flex gap-2"><span class="text-rose-500">✕</span> Hallazgos en visita</li>
              </ul>
            </div>
            <div class="p-5 bg-emerald-50/60">
              <div class="font-bold text-emerald-900" style="font-family:'Montserrat',sans-serif">CMMS centralizado</div>
              <ul class="mt-3 space-y-2 text-emerald-800 leading-relaxed text-xs">
                <li class="flex gap-2"><span class="text-emerald-600">✓</span> Inventario + QR único</li>
                <li class="flex gap-2"><span class="text-emerald-600">✓</span> Cronograma auto + avisos</li>
                <li class="flex gap-2"><span class="text-emerald-600">✓</span> Libro foliado SHA-256</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="mt-4 flex items-center gap-2 text-xs text-slate-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5" style="font-family:'Roboto',sans-serif">
          <span class="material-symbols-outlined text-[18px] text-amber-600">info</span> Incluye migración inicial y acompañamiento en tu primera auditoría.
        </div>
      </div>
    </div>
  </section>
  `,
})
export class LandingCase {}
