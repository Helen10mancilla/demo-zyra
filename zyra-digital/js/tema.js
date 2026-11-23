/* Tema claro/oscuro. Se carga en el <head> para que no parpadee al abrir la página. */
/* Tema: usa lo que el visitante eligió; si nunca eligió, el del dispositivo; si no se sabe, oscuro. */
(function(){
  var r = document.documentElement, dark = true;
  try {
    var t = localStorage.getItem('zyra-theme');
    if (t) dark = (t === 'dark');
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) dark = false;
  } catch (e) {}
  r.classList.toggle('dark', dark);
  window.toggleZyraTheme = function () {
    var d = r.classList.toggle('dark');
    try { localStorage.setItem('zyra-theme', d ? 'dark' : 'light'); } catch (e) {}
    window.dispatchEvent(new Event('zyra-themechange'));
  };
})();
