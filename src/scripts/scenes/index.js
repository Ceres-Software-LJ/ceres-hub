/* Liga cada [data-scene] da página à sua cena Three.js */
import { createStage } from './stage.js';
import { websites, domains, seo, support } from './services.js';
import { uniqueDesign, endToEnd, speed } from './differentials.js';
import { processTrack } from './process.js';
import { teamFrame } from './team.js';

const FACTORIES = {
  websites, domains, seo, support,
  'unique-design': uniqueDesign,
  'end-to-end': endToEnd,
  speed,
};

const stage = createStage();

if (stage) {
  document.querySelectorAll('[data-scene]').forEach(host => {
    const name = host.dataset.scene;
    const card = host.closest('.service-card, .diff-card, .member-card') ?? host;
    if (FACTORIES[name]) {
      stage.mount(host, FACTORIES[name](), card);
    } else if (name === 'team-frame') {
      stage.mount(host, teamFrame(Number(host.dataset.seed) || 0), card);
    } else if (name === 'process') {
      const track = host.closest('.process-track');
      stage.mount(host, processTrack([...track.querySelectorAll('.process-step__num')]), track);
      track.classList.add('has-scene');
    }
  });
}
