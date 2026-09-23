import { AfterViewInit, Component, ElementRef } from '@angular/core';

@Component({
  selector: 'landing-benefits',
  standalone: true,
  template: `
  <section id="dolor" class="relative bg-white py-16 lg:py-24 overflow-hidden">
    <div class="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:48px_48px] opacity-60 pointer-events-none"></div>
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-[#0a645a]/[0.03] blur-[80px] rounded-full pointer-events-none"></div>

    <div class="relative max-w-7xl mx-auto px-6">
      <div data-reveal class="max-w-3xl mx-auto text-center">
        <div class="inline-flex items-center text-[11px] font-bold tracking-[0.14em] uppercase bg-gradient-to-r from-[#044e46] to-[#0a645a] bg-clip-text text-transparent" style="font-family:'Roboto',sans-serif">
           El costo de seguir en <span class="bg-[#0a645a] px-1.5 rounded ms-1 text-white font-bold">Excel</span> 
        </div>
        <h2 class="text-[2.1rem] lg:text-[2.8rem] font-bold tracking-[-0.02em] text-slate-900 mt-2 leading-[0.95]" style="font-family:'Montserrat',sans-serif">
          La auditoría no avisa.<br>
          <span class="bg-gradient-to-r from-[#044e46] to-[#0a645a] bg-clip-text text-transparent">Tu Excel sí falla.</span>
        </h2>
        <p class="text-[14px] leading-relaxed text-slate-500 mt-4 max-w-xl mx-auto" style="font-family:'Roboto',sans-serif">
          Res.3100 exige folio, trazabilidad y firma por cada mantenimiento. Con Excel lo descubres el día de la visita — con BIOCMMS lo ves <span class="font-semibold text-slate-700">15 días antes</span>.
        </p>
      </div>

      <div class="relative mt-12 max-w-5xl mx-auto">
        <div data-reveal data-delay="1" class="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-slate-900 text-white border-4 border-white shadow-xl items-center justify-center text-[11px] font-bold tracking-widest" style="font-family:'Montserrat',sans-serif">VS</div>

        <div class="grid lg:grid-cols-2 gap-6 lg:gap-0 lg:rounded-[1.75rem] lg:border lg:border-slate-200 lg:shadow-[0_20px_60px_rgba(0,0,0,0.08)] lg:overflow-hidden bg-white lg:bg-transparent">
          <div data-reveal data-delay="2" class="rounded-[1.5rem] lg:rounded-none bg-[#f8fafc] border border-slate-200 lg:border-0 lg:border-r p-7 lg:p-8">
            <div class="flex items-center gap-3">
              <span class="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center"><span class="material-symbols-outlined text-[18px]">folder_open</span></span>
              <div>
                <div class="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400" style="font-family:'Montserrat',sans-serif">Sin BIOCMMS</div>
                <div class="text-[13px] font-bold text-slate-900" style="font-family:'Montserrat',sans-serif">Excel + carpeta física</div>
              </div>
              <span class="ml-auto hidden sm:inline-flex text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600">Riesgo alto</span>
            </div>
            <div class="mt-7 space-y-3">
              <div class="flex gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                <span class="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-[16px]">warning</span></span>
                <div class="min-w-0">
                  <div class="text-[13px] font-bold text-slate-900" style="font-family:'Montserrat',sans-serif">12 vencidos invisibles</div>
                  <div class="text-xs text-slate-500 leading-relaxed" style="font-family:'Roboto',sans-serif">Solo te enteras cuando el auditor los lista en sala</div>
                  <div class="mt-1.5 inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700" style="font-family:'JetBrains Mono',monospace">hallazgo crítico</div>
                </div>
              </div>
              <div class="flex gap-3 p-3.5 rounded-xl bg-white/60 border border-slate-200/60">
                <span class="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-[16px]">description</span></span>
                <div><div class="text-[13px] font-semibold text-slate-700">Excel sin folio ni SHA</div><div class="text-xs text-slate-400" style="font-family:'Roboto',sans-serif">Cualquiera lo edita — sin valor probatorio</div></div>
              </div>
              <div class="flex gap-3 p-3.5 rounded-xl bg-white/60 border border-slate-200/60">
                <span class="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-[16px]">edit</span></span>
                <div><div class="text-[13px] font-semibold text-slate-700">Firma suelta</div><div class="text-xs text-slate-400">Sin COPNIA, sin recepción asistencial</div></div>
              </div>
            </div>
          </div>

          <div data-reveal data-delay="3" class="rounded-[1.5rem] lg:rounded-none bg-[#052e2b] p-7 lg:p-8 relative overflow-hidden border border-[#052e2b] lg:border-0">
            <div class="absolute inset-0 bg-[radial-gradient(500px_300px_at_90%_0%,#0a645a_0%,transparent_60%)] opacity-40 pointer-events-none"></div>
            <div class="absolute -right-12 -bottom-12 w-48 h-48 rounded-full border border-white/5 pointer-events-none"></div>
            <div class="relative flex items-center gap-3">
              <span class="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg"><span class="material-symbols-outlined text-[18px]">verified</span></span>
              <div>
                <div class="text-[11px] font-bold tracking-[0.12em] uppercase text-[#7ff0e0]" style="font-family:'Montserrat',sans-serif">Con BIOCMMS</div>
                <div class="text-[13px] font-bold text-white" style="font-family:'Montserrat',sans-serif">Custodia legal</div>
              </div>
              <span class="ml-auto inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow"><span class="w-1.5 h-1.5 rounded-full bg-white"></span> 0 vencidos</span>
            </div>
            <div class="relative mt-7 space-y-3">
              <div class="flex gap-3 p-3.5 rounded-xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
                <span class="w-8 h-8 rounded-lg bg-[#052e2b] text-white flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-[16px]">visibility</span></span>
                <div class="min-w-0">
                  <div class="text-[13px] font-bold text-slate-900" style="font-family:'Montserrat',sans-serif">12 vencidos · 28 próximos · 308 al día</div>
                  <div class="text-xs text-slate-500" style="font-family:'Roboto',sans-serif">Semáforo 15 días antes — <strong class="text-emerald-700">0 por olvido</strong></div>
                </div>
              </div>
              <div class="flex gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
                <span class="w-8 h-8 rounded-lg bg-white/10 border border-white/10 text-[#7ff0e0] flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-[16px]">fingerprint</span></span>
                <div><div class="text-[13px] font-semibold text-white">Folio ONAC + SHA-256</div><div class="text-xs text-white/50" style="font-family:'JetBrains Mono',monospace">9f3a…c02e · inmutable</div></div>
              </div>
              <div class="flex gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
                <span class="w-8 h-8 rounded-lg bg-white/10 border border-white/10 text-[#7ff0e0] flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-[16px]">approval</span></span>
                <div><div class="text-[13px] font-semibold text-white">Firma COPNIA + recepción</div><div class="text-xs text-white/50">Cada OT con responsable real</div></div>
              </div>
            </div>
            <div class="relative mt-6 flex items-center gap-2 text-xs font-bold text-[#7ff0e0]" style="font-family:'JetBrains Mono',monospace"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> libro listo en 30s · 99.8% aprobación</div>
          </div>
        </div>
        <div data-reveal class="lg:hidden flex justify-center -my-3 relative z-10"><span class="w-10 h-10 rounded-full bg-slate-900 text-white border-4 border-white shadow-lg flex items-center justify-center text-[11px] font-bold">VS</span></div>
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
export class LandingBenefits implements AfterViewInit {
  constructor(private el: ElementRef) {}
  ngAfterViewInit() {
    const obs = new IntersectionObserver(ents => ents.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); obs.unobserve(e.target); }}), {threshold: 0.14});
    this.el.nativeElement.querySelectorAll('[data-reveal]').forEach((n: Element) => obs.observe(n));
  }
}
