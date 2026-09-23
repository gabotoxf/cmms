import { Component } from '@angular/core';
import { LandingHeader } from './sections/header';
import { LandingHero } from './sections/hero';
import { LandingBenefits } from './sections/benefits';
// import { LandingModules } from './sections/modules';
import { LandingFooter } from './sections/footer';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [LandingHeader, LandingHero, LandingBenefits, LandingFooter],
  template: `
  <div class="bg-[#f8fafc] text-slate-800">
    <landing-header />
    <landing-hero />
    <landing-benefits />
    <landing-footer />
  </div>
  `,
})
export class Landing {}
