import { AfterViewInit, Component, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'landing-modules',
  standalone: true,
  imports: [RouterLink],
  template: `
  <section id="como" class="relative bg-[#f8fafc] py-16 lg:py-24 border-t border-slate-100 overflow-hidden">
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-white blur-[60px] rounded-full pointer-events-none"></div>
    <div class="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:56px_56px] opacity-30 pointer-events-none"></div>

    <div class="relative max-w-7xl mx-auto px-6">
      <div data-reveal class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div class="max-w-xl">
          <div class="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm" style="font-family:'Roboto',sans-serif"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Cómo funciona</div>
          <h2 class="text-[2rem] lg:text-[2.7rem] font-bold tracking-[-0.02em] text-slate-900 mt-4 leading-[0.95]" style="font-family:'Montserrat',sans-serif">De Excel a auditoría<br><span class="text-[#044e46]">en una tarde.</span></h2>
        </div>
        <p class="text-[14px] leading-relaxed text-slate-500 max-w-md lg:text-right" style="font-family:'Roboto',sans-serif">Sin maquetas ni curva. Migramos tu inventario y sigues con el mismo flujo — pero ahora foliado y trazable.</p>
      </div>

      <div class="relative grid lg:grid-cols-3 gap-6 mt-12">
        <div data-reveal class="hidden lg:block absolute top-[44px] left-[18%] right-[18%] h-px bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200"></div>
        <div data-reveal class="hidden lg:block absolute top-[44px] left-[18%] w-2 h-2 rounded-full bg-[#052e2b] -translate-y-1/2"></div>
        <div data-reveal class="hidden lg:block absolute top-[44px] right-[18%] w-2 h-2 rounded-full bg-emerald-500 -translate-y-1/2"></div>

        <div data-reveal data-delay="1" class="group relative bg-white rounded-[1.5rem] border border-slate-200 p-7 shadow-sm hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all">
          <div class="absolute top-6 right-6 text-[42px] font-bold text-slate-100 leading-none select-none" style="font-family:'Montserrat',sans-serif">01</div>
          <div class="relative w-11 h-11 rounded-xl bg-[#052e2b] text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform"><span class="material-symbols-outlined">upload_file</span></div>
          <div class="relative mt-6">
            <div class="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400" style="font-family:'JetBrains Mono',monospace">Minutos</div>
            <h3 class="text-[16px] font-bold text-slate-900 mt-1" style="font-family:'Montserrat',sans-serif">Migra tu Excel</h3>
            <p class="text-[13px] leading-relaxed text-slate-500 mt-2" style="font-family:'Roboto',sans-serif">Carga masiva 2.000 filas. Validamos 28 campos Res.3100, serie y riesgo INVIMA fila a fila con reporte de errores.</p>
          </div>
          <div class="relative mt-5 flex items-center gap-2 text-[11px] font-semibold px-3 py-2 rounded-full bg-slate-900 text-white w-fit" style="font-family:'JetBrains Mono',monospace"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> CSV / XLSX</div>
        </div>

        <div data-reveal data-delay="2" class="group relative bg-white rounded-[1.5rem] border border-slate-200 p-7 shadow-sm hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all">
          <div class="absolute top-6 right-6 text-[42px] font-bold text-slate-100 leading-none select-none" style="font-family:'Montserrat',sans-serif">02</div>
          <div class="relative w-11 h-11 rounded-xl bg-[#b08d57] text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform"><span class="material-symbols-outlined">dashboard</span></div>
          <div class="relative mt-6">
            <div class="text-[11px] font-bold tracking-[0.12em] uppercase text-amber-600" style="font-family:'JetBrains Mono',monospace">Diario</div>
            <h3 class="text-[16px] font-bold text-slate-900 mt-1" style="font-family:'Montserrat',sans-serif">El panel te avisa</h3>
            <p class="text-[13px] leading-relaxed text-slate-500 mt-2" style="font-family:'Roboto',sans-serif">Semáforo 12 vencidos / 28 próximos ≤15d / 308 al día. Cero vencidos por olvido.</p>
          </div>
          <div class="relative mt-5 flex items-center gap-2 text-[11px] font-semibold px-3 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-700 w-fit"><span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Alerta 15d antes</div>
        </div>

        <div data-reveal data-delay="3" class="group relative bg-[#052e2b] rounded-[1.5rem] border border-white/10 p-7 shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden hover:-translate-y-1 transition-all">
          <div class="absolute -right-10 -top-10 w-40 h-40 bg-[#0a645a]/20 rounded-full blur-2xl pointer-events-none"></div>
          <div class="absolute top-6 right-6 text-[42px] font-bold text-white/10 leading-none select-none" style="font-family:'Montserrat',sans-serif">03</div>
          <div class="relative w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform"><span class="material-symbols-outlined">verified</span></div>
          <div class="relative mt-6">
            <div class="text-[11px] font-bold tracking-[0.12em] uppercase text-[#7ff0e0]" style="font-family:'JetBrains Mono',monospace">30 segundos</div>
            <h3 class="text-[16px] font-bold text-white mt-1" style="font-family:'Montserrat',sans-serif">Libro listo para firmar</h3>
            <p class="text-[13px] leading-relaxed text-white/60 mt-2" style="font-family:'Roboto',sans-serif">OT foliada + SHA-256 + firma COPNIA. PDF que el auditor acepta sin preguntas.</p>
          </div>
          <div class="relative mt-5 flex items-center gap-2 text-[11px] font-semibold px-3 py-2 rounded-full bg-emerald-500 text-white w-fit" style="font-family:'JetBrains Mono',monospace"><span class="w-1.5 h-1.5 rounded-full bg-white"></span> Foliado ONAC</div>
        </div>
      </div>

      <div data-reveal class="mt-10 flex justify-center">
        <a routerLink="/dashboard" class="group inline-flex items-center gap-2 bg-[#052e2b] text-white text-sm font-bold pl-7 pr-1.5 py-1.5 rounded-full shadow-[0_12px_30px_rgba(0,0,0,0.2)] hover:bg-[#0a3a34] transition-colors" style="font-family:'Montserrat',sans-serif">
          Ver mi riesgo gratis
          <span class="w-9 h-9 rounded-full bg-white text-[#052e2b] flex items-center justify-center group-hover:rotate-45 transition-transform"><span class="material-symbols-outlined text-[18px]">arrow_forward</span></span>
        </a>
      </div>
    </div>
  </section>
  `,
  styles: [`
    [data-reveal]{opacity:0;transform:translateY(32px) scale(.96);transition:opacity .75s cubic-bezier(.21,1.02,.73,1),transform .75s cubic-bezier(.21,1.02,.73,1)}
    [data-reveal].in{opacity:1;transform:translateY(0) scale(1)}
    [data-reveal][data-delay="1"].in{transition-delay:.12s}
    [data-reveal][data-delay="2"].in{transition-delay:.24s}
    [data-reveal][data-delay="3"].in{transition-delay:.36s}
  `],
})
export class LandingModules implements AfterViewInit {
  constructor(private el: ElementRef) {}
  ngAfterViewInit() {
    const obs = new IntersectionObserver(ents => ents.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); obs.unobserve(e.target); }}), {threshold: 0.15});
    this.el.nativeElement.querySelectorAll('[data-reveal]').forEach((n: Element) => obs.observe(n));
  }
}
