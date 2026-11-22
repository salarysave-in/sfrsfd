(() => {
  const gate = document.getElementById('accountGate');
  const status = document.getElementById('accountLoading');
  const overlay = document.getElementById('budget-loader');
  const motion = overlay.querySelector('.motion');
  let timer, player, runtime;
  function update() {
    clearTimeout(timer);
    const busy = !gate.hidden && !status.hidden && status.getAttribute('aria-busy') === 'true';
    if (!busy) {
      overlay.hidden = true;
      player?.stop();
      return;
    }
    timer = setTimeout(async () => {
      overlay.hidden = false;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      runtime ??= new Promise(resolve => {
        const script = document.createElement('script');
        script.src = '/motion/lottie_light.min.js';
        script.onload = () => resolve(window.lottie);
        script.onerror = () => resolve(null);
        document.head.append(script);
      });
      const lottie = await runtime;
      if (!lottie || overlay.hidden) return;
      player ??= lottie.loadAnimation({container:motion, renderer:'svg', loop:true, autoplay:false, path:'/motion/basketball.json'});
      player.play();
    }, 180);
  }
  const observer = new MutationObserver(update);
  for (const el of [gate,status]) observer.observe(el,{attributes:true,attributeFilter:['hidden','aria-busy']});
  update();
})();
