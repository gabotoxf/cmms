import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'landing-pricing',
  standalone: true,
  imports: [RouterLink],
  template: `
  <section id="planes" class="max-w-7xl mx-auto px-6 pb-12">
    <div class="text-center max-w-2xl mx-auto">
      <div class="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3 py-1 text-xs font-semibold" style="font-family:'Roboto',sans-serif"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> Planes claros por parque</div>
      <h2 class="text-3xl font-bold tracking-tight text-slate-900 mt-3" style="font-family:'Montserrat',sans-serif">Sin cobro por usuario.</h2>
      <p class="text-sm text-slate-500 mt-1" style="font-family:'Roboto',sans-serif">El mismo panel en todos. Sin letra pequeña.</p>
    </div>
    <div class="grid lg:grid-cols-3 gap-5 mt-8">
      <div class="bg-white rounded-[1.5rem] p-6 border border-slate-200 shadow-sm flex flex-col hover:shadow-xl transition-shadow">
        <h3 class="text-sm font-bold text-slate-900" style="font-family:'Montserrat',sans-serif">IPS Básica</h3>
        <p class="text-xs text-slate-500" style="font-family:'Roboto',sans-serif">Hasta 100 equipos</p>
        <div class="mt-4 flex items-baseline gap-1"><span class="text-3xl font-bold tracking-tight text-slate-900" style="font-family:'Montserrat',sans-serif">$480k</span><span class="text-xs text-slate-500" style="font-family:'Roboto',sans-serif">/mes COP</span></div>
        <ul class="mt-5 space-y-2 text-sm text-slate-600" style="font-family:'Roboto',sans-serif">
          <li class="flex gap-2"><span class="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span> Hojas de vida Res.3100</li>
          <li class="flex gap-2"><span class="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span> Cronograma + QR</li>
          <li class="flex gap-2"><span class="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span> OT foliadas</li>
        </ul>
        <a routerLink="/dashboard" class="mt-6 inline-flex justify-center items-center gap-2 border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white text-sm font-bold px-4 py-3 rounded-full transition-colors" style="font-family:'Montserrat',sans-serif">Elegir IPS Básica</a>
      </div>
      <div class="bg-[#042B26] text-white rounded-[1.5rem] p-6 border border-white/10 shadow-2xl flex flex-col relative overflow-hidden">
        <div class="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 blur-2xl"></div>
        <span class="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-[#042B26] text-xs font-bold px-4 py-1 rounded-full shadow" style="font-family:'Montserrat',sans-serif">MÁS ELEGIDO</span>
        <h3 class="text-sm font-bold mt-2" style="font-family:'Montserrat',sans-serif">Hospitalario</h3>
        <p class="text-xs text-white/60" style="font-family:'Roboto',sans-serif">Hasta 500 equipos · UCI y quirófano</p>
        <div class="mt-4 flex items-baseline gap-1"><span class="text-3xl font-bold tracking-tight" style="font-family:'Montserrat',sans-serif">$1.15M</span><span class="text-xs text-white/60" style="font-family:'Roboto',sans-serif">/mes COP</span></div>
        <ul class="mt-5 space-y-2 text-sm text-white/80" style="font-family:'Roboto',sans-serif">
          <li class="flex gap-2"><span class="material-symbols-outlined text-[18px] text-[#7ff0e0]">check_circle</span> Todo IPS Básica</li>
          <li class="flex gap-2"><span class="material-symbols-outlined text-[18px] text-[#7ff0e0]">check_circle</span> Calibración ONAC + incertidumbre</li>
          <li class="flex gap-2"><span class="material-symbols-outlined text-[18px] text-[#7ff0e0]">check_circle</span> Firma SHA-256 + COPNIA</li>
          <li class="flex gap-2"><span class="material-symbols-outlined text-[18px] text-[#7ff0e0]">check_circle</span> Migración incluida</li>
        </ul>
        <a routerLink="/dashboard" class="mt-6 inline-flex justify-center items-center gap-2 bg-white text-[#042B26] hover:bg-slate-50 text-sm font-bold px-4 py-3 rounded-full shadow-lg" style="font-family:'Montserrat',sans-serif">Solicitar Hospitalario</a>
      </div>
      <div class="bg-white rounded-[1.5rem] p-6 border border-slate-200 shadow-sm flex flex-col hover:shadow-xl transition-shadow">
        <h3 class="text-sm font-bold text-slate-900" style="font-family:'Montserrat',sans-serif">Red · Alta complejidad</h3>
        <p class="text-xs text-slate-500" style="font-family:'Roboto',sans-serif">Ilimitado · multisede</p>
        <div class="mt-4 flex items-baseline gap-1"><span class="text-3xl font-bold tracking-tight text-slate-900" style="font-family:'Montserrat',sans-serif">A medida</span><span class="text-xs text-slate-500" style="font-family:'Roboto',sans-serif">/ SLA</span></div>
        <ul class="mt-5 space-y-2 text-sm text-slate-600" style="font-family:'Roboto',sans-serif">
          <li class="flex gap-2"><span class="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span> Todo Hospitalario</li>
          <li class="flex gap-2"><span class="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span> HL7/FHIR + ERP</li>
          <li class="flex gap-2"><span class="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span> Acompañamiento auditoría</li>
        </ul>
        <a routerLink="/dashboard" class="mt-6 inline-flex justify-center items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold px-4 py-3 rounded-full" style="font-family:'Montserrat',sans-serif">Contactar consultoría</a>
      </div>
    </div>
  </section>
  `,
})
export class LandingPricing {}
