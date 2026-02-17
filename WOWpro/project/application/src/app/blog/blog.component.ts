import { Component } from '@angular/core';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent {
  selectedArticle: any = null;

  articles = [
    {
      id: 1,
      title: '10 Signs Your Bike Needs Servicing',
      category: 'Maintenance',
      icon: 'fas fa-wrench',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400',
      excerpt: 'Don\'t ignore these warning signs that your motorcycle is due for a service.',
      readTime: '4 min',
      content: `<h4>1. Strange Engine Noises</h4><p>Unusual knocking, tapping, or grinding sounds could signal worn bearings, loose components, or low oil levels.</p>
<h4>2. Reduced Fuel Efficiency</h4><p>If your bike is consuming more fuel than usual, it may indicate a dirty air filter, clogged fuel injector, or engine tuning issues.</p>
<h4>3. Difficulty Starting</h4><p>Hard starts often point to battery issues, spark plug wear, or carburetor problems.</p>
<h4>4. Brake Squealing</h4><p>Squealing or grinding brakes mean worn brake pads that need immediate replacement for safety.</p>
<h4>5. Chain Noise</h4><p>A noisy or slack chain needs lubrication or adjustment. Neglecting it can cause expensive sprocket damage.</p>
<h4>6. Vibrations</h4><p>Excess vibration while riding could indicate wheel imbalance, loose bolts, or worn engine mounts.</p>
<h4>7. Oil Leaks</h4><p>Any visible oil spots beneath your bike need immediate attention to prevent engine damage.</p>
<h4>8. Dim or Flickering Lights</h4><p>Electrical issues can compromise your safety. Check the battery and wiring.</p>
<h4>9. Clutch Slippage</h4><p>If the engine revs up but the bike doesn't accelerate proportionally, the clutch plates may be worn.</p>
<h4>10. Tire Wear</h4><p>Uneven or excessive tire wear affects handling and braking. Check tire pressure monthly.</p>`
    },
    {
      id: 2,
      title: 'How to Maintain Your Bicycle at Home',
      category: 'DIY Tips',
      icon: 'fas fa-bicycle',
      image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400',
      excerpt: 'Simple maintenance tips to keep your bicycle running smoothly between services.',
      readTime: '5 min',
      content: `<h4>Keep Your Chain Clean & Lubed</h4><p>Wipe your chain with a dry cloth after every ride. Apply bicycle chain lube every 100km or after riding in rain.</p>
<h4>Check Tire Pressure Weekly</h4><p>Proper inflation extends tire life and makes riding easier. Road bikes: 80-130 PSI. Mountain bikes: 30-50 PSI.</p>
<h4>Inspect Brakes Monthly</h4><p>Squeeze brake levers. They should engage firmly without touching the handlebar. Check pad thickness regularly.</p>
<h4>Keep It Clean</h4><p>Wash your bike monthly with mild soap and water. Avoid high-pressure water near bearings and electronics.</p>
<h4>Tighten Bolts Periodically</h4><p>Check handlebar stem, seat post, and wheel quick-releases for tightness before long rides.</p>
<h4>Store Indoors</h4><p>UV exposure and rain accelerate rust and rubber degradation. Store your bicycle in a dry, covered area.</p>`
    },
    {
      id: 3,
      title: 'Monsoon Riding: Safety Tips',
      category: 'Safety',
      icon: 'fas fa-cloud-rain',
      image: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=400',
      excerpt: 'Essential tips for safe two-wheeler riding during the rainy season.',
      readTime: '3 min',
      content: `<h4>Reduce Speed</h4><p>Wet roads reduce tire grip significantly. Ride at 60-70% of your dry-weather speed.</p>
<h4>Increase Following Distance</h4><p>Braking distances double on wet surfaces. Maintain at least 4 seconds gap from the vehicle ahead.</p>
<h4>Avoid Puddles</h4><p>Standing water can hide potholes, open manholes, or debris. Ride around them when safe.</p>
<h4>Use Both Brakes Gently</h4><p>Apply both brakes gradually. Sudden braking on wet roads causes skidding.</p>
<h4>Wear Bright Gear</h4><p>Visibility drops dramatically in rain. Wear reflective or bright-colored rain gear.</p>
<h4>Post-Ride Care</h4><p>Dry your vehicle thoroughly after riding in rain. Apply anti-rust spray to chain and exposed metal parts.</p>`
    },
    {
      id: 4,
      title: 'Electric Motorcycle Maintenance Guide',
      category: 'Electric',
      icon: 'fas fa-bolt',
      image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=400',
      excerpt: 'Keep your Zero, LiveWire, or other electric motorcycle in top condition.',
      readTime: '4 min',
      content: `<h4>Battery Health</h4><p>Avoid fully draining the battery. Keep charge between 20-80% for longest battery life. Charge in shade.</p>
<h4>Tire Care</h4><p>Electric motorcycles are heavier. Check tire pressure every 2 weeks and inspect for wear monthly.</p>
<h4>Brake Maintenance</h4><p>Regenerative braking reduces wear but doesn't eliminate it. Inspect brake pads every 3,000 miles.</p>
<h4>Software Updates</h4><p>Keep your motorcycle's firmware updated. Manufacturers regularly push efficiency and safety improvements.</p>
<h4>Cleaning</h4><p>Avoid high-pressure water near charging port, motor, and electrical connectors. Use a damp cloth.</p>
<h4>Professional Service</h4><p>Schedule professional service every 6 months or 3,000 miles, whichever comes first.</p>`
    },
    {
      id: 5,
      title: 'Understanding Service Plans: Standard vs Premium vs Pro',
      category: 'Guide',
      icon: 'fas fa-layer-group',
      image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400',
      excerpt: 'Which service plan is right for your vehicle? Our comprehensive comparison.',
      readTime: '3 min',
      content: `<h4>Standard Service ($49)</h4><p>Ideal for regular maintenance every 3-4 months. Includes oil change, air filter cleaning, chain lubrication, and basic inspection. Best for daily commuters.</p>
<h4>Premium Service ($99)</h4><p>Our most popular plan. Includes everything in Standard plus brake inspection, clutch adjustment, carburetor tuning, and spark plug check. Recommended every 6 months.</p>
<h4>Pro Service ($199)</h4><p>The complete package. Everything in Premium plus engine overhaul, full body wash, complete diagnostics, and suspension check. Best for annual deep service or pre-trip preparation.</p>
<h4>Which to Choose?</h4><p>If you ride daily: Standard every 3 months + Premium once a year. Weekend rider: Premium twice a year. Adventure/touring: Pro before every long trip.</p>`
    },
    {
      id: 6,
      title: 'Top 5 Pre-Ride Safety Checks',
      category: 'Safety',
      icon: 'fas fa-shield-alt',
      image: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=400',
      excerpt: 'Quick checks before every ride that could save your life.',
      readTime: '2 min',
      content: `<h4>1. Tires</h4><p>Do a quick squeeze test. Tires should feel firm. Look for cuts, bulges, or embedded objects.</p>
<h4>2. Brakes</h4><p>Pull both brake levers. They should engage smoothly with firm feedback, not mushy or squeaky.</p>
<h4>3. Lights</h4><p>Check headlight, tail light, brake light, and turn indicators. Replace bulbs immediately if any are out.</p>
<h4>4. Mirrors</h4><p>Adjust both mirrors for maximum rear visibility. Clean them if dirty because clear vision saves lives.</p>
<h4>5. Fuel/Charge</h4><p>Ensure adequate fuel or battery charge for your planned trip plus 20% reserve.</p>`
    }
  ];

  openArticle(article: any): void {
    this.selectedArticle = article;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeArticle(): void {
    this.selectedArticle = null;
  }
}
