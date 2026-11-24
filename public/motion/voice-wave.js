(() => {
  const page = document.getElementById('voicePage');
  const host = document.getElementById('voiceWave');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const day = ['#11634a','#19865e','#65a960','#164d3e','#268e77','#3f9d65','#10785c'];
  const night = ['#51bb8e','#71d4aa','#b4e4a4','#3e9f79','#58ccad','#97daa7','#58bfa3'];
  let runtime, source, player, theme, request = 0, frame = 20, speed = 0, velocity = 0, previous = 0, generation = 0;
  function loadRuntime() {
    if (window.lottie) return Promise.resolve(window.lottie);
    if (!runtime) runtime = new Promise((resolve,reject) => {
      const path = '/motion/lottie_light.min.js';
      const existing = document.querySelector('script[src="'+path+'"]');
      const script = existing || document.createElement('script');
      script.addEventListener('load', () => resolve(window.lottie), {once:true});
      script.addEventListener('error', () => {runtime = null; reject(new Error('Wave player unavailable'))}, {once:true});
      if (!existing) { script.src = path; document.head.append(script); }
    });
    return runtime;
  }
  function tick(time) {
    request = 0;
    if (!player || !page.open) return;
    const dt = Math.min((time - (previous || time)) / 1000, 1/30);
    previous = time;
    const target = reduced.matches ? 0 : page.dataset.speaking === 'true' ? 1 : page.dataset.listening === 'true' ? .23 : 0;
    velocity += ((target - speed) * 95 - 17 * velocity) * dt;
    speed += velocity * dt;
    frame = (frame + Math.max(0,speed) * 30 * dt) % 97;
    player.goToAndStop(frame,true);
    if (!reduced.matches && (target || Math.abs(speed) + Math.abs(velocity) > .005)) request = requestAnimationFrame(tick);
    else {speed = velocity = previous = 0}
  }
  function wake() { if (player && !request) {previous = 0; request = requestAnimationFrame(tick)} }
  async function sync() {
    const nextTheme = document.documentElement.dataset.theme || 'light';
    if (page.open && nextTheme === theme) {wake(); return}
    const token = ++generation;
    cancelAnimationFrame(request); request = previous = velocity = speed = 0;
    player?.destroy(); player = null; theme = null;
    if (!page.open) return;
    theme = nextTheme;
    try {
      source ||= fetch('/motion/voice-wave.json').then(r => {if (!r.ok) throw new Error('Missing wave');return r.json()}).catch(e=>{source=null;throw e});
      const [lib, original] = await Promise.all([loadRuntime(),source]);
      if (generation !== token || !page.open) return;
      const palette = nextTheme === 'dark' ? night : day;
      const data = JSON.parse(JSON.stringify(original),(key,value) => {
        if (value?.cl?.startsWith('wave-ink-')) {
          const hex = palette[Number(value.cl.slice(9))];
          value.c.k = [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).concat(1);
        }
        return value;
      });
      player = lib.loadAnimation({container:host,renderer:'svg',autoplay:false,loop:false,animationData:data});
      player.addEventListener('DOMLoaded',wake);
      wake();
    } catch { if (generation === token) theme = null; }
  }
  new MutationObserver(sync).observe(page,{attributes:true,attributeFilter:['open','data-listening','data-speaking']});
  new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  reduced.addEventListener('change',wake);
  sync();
})();