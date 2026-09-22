import { Component } from '@angular/core';
import { LandingHeader } from './sections/header';
import { LandingHero } from './sections/hero';
import { LandingTrust } from './sections/trust';
import { LandingFooter } from './sections/footer';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [LandingHeader, LandingHero, LandingTrust, LandingFooter],
  template: `
  <div class="bg-[#f8fafc] text-slate-800">
    <landing-header />
    <landing-hero />
    <landing-trust />
    <landing-footer />
  </div>
  `,
})
export class Landing {}
