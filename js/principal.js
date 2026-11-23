/* Interacciones: filtros de servicios, chips y envío del formulario, hubs del mapa y menú móvil. */

    (function() {
      // 1. Selector interactivo de chips de servicios en el formulario
      const chips = document.querySelectorAll('.scope-chip');
      chips.forEach(chip => {
        chip.addEventListener('click', () => {
          chip.classList.toggle('bg-[#AA50F2]');
          chip.classList.toggle('border-[#AA50F2]');
          chip.classList.toggle('text-white');
          chip.classList.toggle('shadow-[0_0_15px_rgba(170,80,242,0.4)]');
        });
      });

      // 2. Filtro interactivo de la grilla de servicios
      const filterBtns = document.querySelectorAll('.service-tab-btn');
      const serviceCards = document.querySelectorAll('.service-card');

      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          filterBtns.forEach(b => {
            b.classList.remove('bg-[#AA50F2]', 'text-white', 'shadow-[0_0_15px_rgba(170,80,242,0.5)]');
            b.classList.add('text-zinc-400');
          });
          btn.classList.add('bg-[#AA50F2]', 'text-white', 'shadow-[0_0_15px_rgba(170,80,242,0.5)]');
          btn.classList.remove('text-zinc-400');

          const filter = btn.getAttribute('data-filter');

          serviceCards.forEach(card => {
            const cat = card.getAttribute('data-category');
            if (filter === 'all' || cat === filter) {
              card.style.display = 'flex';
            } else {
              card.style.display = 'none';
            }
          });
        });
      });

      // 3. Selector de Hubs en el Mapa 3D
      const hubBtns = document.querySelectorAll('.hub-btn');
      const activeHubName = document.getElementById('active-hub-name');
      const activeHubCoords = document.getElementById('active-hub-coords');

      hubBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          hubBtns.forEach(b => {
            b.classList.remove('bg-[#AA50F2]', 'text-white', 'shadow-[0_0_15px_rgba(170,80,242,0.4)]');
            b.classList.add('text-zinc-400');
          });
          btn.classList.add('bg-[#AA50F2]', 'text-white', 'shadow-[0_0_15px_rgba(170,80,242,0.4)]');
          btn.classList.remove('text-zinc-400');

          if (activeHubName && activeHubCoords) {
            activeHubName.textContent = btn.getAttribute('data-name');
            activeHubCoords.textContent = btn.getAttribute('data-coords');
          }
        });
      });

      // 4. Manejo del Envío del Formulario
      window.handleFormSubmit = function() {
        const btn = document.getElementById('submit-btn');
        const feedback = document.getElementById('form-success-feedback');
        
        if (btn) {
          btn.disabled = true;
          btn.innerHTML = `
            <span class="material-symbols-outlined animate-spin text-[20px]">sync</span>
            <span>Transmitiendo requerimientos...</span>
          `;
        }

        setTimeout(() => {
          if (btn) {
            btn.innerHTML = `<span>¡Solicitud Enviada con Éxito!</span>`;
            btn.classList.replace('from-[#AA50F2]', 'from-[#141418]');
            btn.classList.replace('via-[#943FE0]', 'via-[#141418]');
            btn.classList.replace('to-[#7C22C9]', 'to-[#141418]');
            btn.classList.add('border', 'border-[#AA50F2]');
          }
          if (feedback) {
            feedback.classList.remove('hidden');
            feedback.classList.add('flex');
          }
        }, 800);
      };

      // 5. Menú móvil (hamburguesa)
      const menuBtn = document.getElementById('menu-btn');
      const menuPanel = document.getElementById('mobile-menu');
      if (menuBtn && menuPanel) {
        const icon = menuBtn.querySelector('.material-symbols-outlined');
        const setOpen = (open) => {
          menuPanel.classList.toggle('hidden', !open);
          menuBtn.setAttribute('aria-expanded', String(open));
          menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
          if (icon) icon.textContent = open ? 'close' : 'menu';
        };
        menuBtn.addEventListener('click', () => setOpen(menuPanel.classList.contains('hidden')));
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
        window.addEventListener('resize', () => { if (window.innerWidth >= 1280) setOpen(false); });
      }
    })();
  
