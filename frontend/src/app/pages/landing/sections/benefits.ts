import { Component } from '@angular/core';

@Component({
  selector: 'landing-benefits',
  standalone: true,
  template: `
  <section id="beneficios" class="max-w-7xl mx-auto px-6 py-12">
    <div class="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <div class="text-xs font-semibold tracking-[0.14em] uppercase text-teal-700" style="font-family:'Roboto',sans-serif">Rigor sin fricción</div>
        <h2 class="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 mt-1" style="font-family:'Montserrat',sans-serif">Diseñado para quien firma.</h2>
      </div>
      <span class="text-xs text-slate-500 bg-white border border-slate-200 rounded-full px-3 py-1.5" style="font-family:'Roboto',sans-serif">Mismo sistema de diseño del panel</span>
    </div>
    <div class="grid md:grid-cols-3 gap-5">
      <div class="group bg-white rounded-[1.25rem] p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
        <div class="w-12 h-12 rounded-2xl bg-[#044e46] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><span class="material-symbols-outlined">inventory_2</span></div>
        <h3 class="text-sm font-bold text-slate-900 mt-4" style="font-family:'Montserrat',sans-serif">Hojas de vida que pasan</h3>
        <p class="text-sm text-slate-500 leading-relaxed mt-2" style="font-family:'Roboto',sans-serif">28 campos Res.3100, INVIMA I-III, UMDNS y QR al pie de cama. Sin Excel disperso.</p>
        <div class="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#044e46]" style="font-family:'Roboto',sans-serif">Auditoría inmediata <span class="material-symbols-outlined text-[16px]">arrow_forward</span></div>
      </div>
      <div class="group bg-white rounded-[1.25rem] p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
        <div class="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><span class="material-symbols-outlined">tune</span></div>
        <h3 class="text-sm font-bold text-slate-900 mt-4" style="font-family:'Montserrat',sans-serif">Calibración sin desfases</h3>
        <p class="text-sm text-slate-500 leading-relaxed mt-2" style="font-family:'Roboto',sans-serif">Periodicidad por criticidad, patrones ONAC/NIST y semáforo vencido/próximo/al día.</p>
        <div class="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-amber-700" style="font-family:'Roboto',sans-serif">0 calibraciones vencidas <span class="material-symbols-outlined text-[16px]">arrow_forward</span></div>
      </div>
      <div class="group bg-white rounded-[1.25rem] p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
        <div class="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><span class="material-symbols-outlined">verified_user</span></div>
        <h3 class="text-sm font-bold text-slate-900 mt-4" style="font-family:'Montserrat',sans-serif">Firma con valor probatorio</h3>
        <p class="text-sm text-slate-500 leading-relaxed mt-2" style="font-family:'Roboto',sans-serif">OT foliadas, inmutables, con verificación COPNIA/CONALTEL y recepción asistencial.</p>
        <div class="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-slate-900" style="font-family:'Roboto',sans-serif">Custodia SHA-256 <span class="material-symbols-outlined text-[16px]">arrow_forward</span></div>
      </div>
    </div>
  </section>
  `,
})
export class LandingBenefits {}
