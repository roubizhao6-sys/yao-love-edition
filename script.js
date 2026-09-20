(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const header = document.getElementById('topbar');
  const progress = document.getElementById('scroll-progress');
  const feedback = document.getElementById('copy-feedback');
  const pageUrl = () => window.location.href.split('#')[0].split('?')[0];

  document.getElementById('year').textContent = new Date().getFullYear();

  const updateScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
    header.classList.toggle('dark', window.scrollY > window.innerHeight * 1.35 && window.scrollY < document.documentElement.scrollHeight - window.innerHeight * 2.2);
  };
  updateScroll();
  window.addEventListener('scroll', updateScroll, { passive: true });
  window.addEventListener('resize', updateScroll);

  const revealItems = [...document.querySelectorAll('.reveal')];
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('visible'));
    document.querySelectorAll('.ability-row i b').forEach((bar) => { bar.style.width = bar.style.getPropertyValue('--score'); });
  } else {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        entry.target.querySelectorAll('.ability-row i b, .ability-row i b').forEach((bar) => {
          const score = bar.style.getPropertyValue('--score') || '100%';
          window.setTimeout(() => { bar.style.width = score; }, 140);
        });
        obs.unobserve(entry.target);
      });
    }, { threshold: .14, rootMargin: '0px 0px -35px' });
    revealItems.forEach((item) => observer.observe(item));
  }

  if (finePointer && !reduceMotion) {
    const cursor = document.querySelector('.heart-cursor');
    let targetX = innerWidth / 2;
    let targetY = innerHeight / 2;
    let x = targetX;
    let y = targetY;
    window.addEventListener('pointermove', (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      cursor.classList.add('active');
    }, { passive: true });
    document.addEventListener('pointerdown', () => cursor.classList.add('down'));
    document.addEventListener('pointerup', () => cursor.classList.remove('down'));
    document.addEventListener('pointerleave', () => cursor.classList.remove('active'));
    const renderCursor = () => {
      x += (targetX - x) * .22;
      y += (targetY - y) * .22;
      cursor.style.translate = `${x}px ${y}px`;
      requestAnimationFrame(renderCursor);
    };
    renderCursor();
    document.querySelectorAll('a, button').forEach((element) => {
      element.addEventListener('pointerenter', () => { cursor.style.scale = '1.5'; });
      element.addEventListener('pointerleave', () => { cursor.style.scale = '1'; });
    });
  }

  if (finePointer && !reduceMotion) {
    document.querySelectorAll('[data-parallax]').forEach((stage) => {
      stage.addEventListener('pointermove', (event) => {
        const rect = stage.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - .5;
        const py = (event.clientY - rect.top) / rect.height - .5;
        const card = stage.querySelector('.hero-photo-card');
        const minis = stage.querySelectorAll('.mini-photo');
        if (card) card.style.transform = `translateX(-50%) rotate(${2 + px * 6}deg) translateY(${py * -12}px)`;
        minis.forEach((mini, index) => {
          const base = index === 0 ? -8 : 8;
          mini.style.translate = `${px * (index ? -18 : 18)}px ${py * -16}px`;
          mini.style.rotate = `${base + px * 5}deg`;
        });
      });
      stage.addEventListener('pointerleave', () => {
        const card = stage.querySelector('.hero-photo-card');
        if (card) card.style.transform = '';
        stage.querySelectorAll('.mini-photo').forEach((mini) => { mini.style.translate = ''; mini.style.rotate = ''; });
      });
    });
  }

  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const input = document.createElement('textarea');
    input.value = text;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    input.remove();
  };

  const copyButton = document.getElementById('copy-wechat');
  copyButton.addEventListener('click', async () => {
    try {
      await copyText('zzxxyynnaa');
      copyButton.textContent = '已复制微信号 ✓';
      feedback.textContent = '微信号 zzxxyynnaa 已复制，去微信搜索添加吧。';
    } catch {
      feedback.textContent = '复制失败，请手动搜索微信号：zzxxyynnaa';
    }
    window.setTimeout(() => {
      copyButton.textContent = '复制微信号';
      feedback.textContent = '';
    }, 2800);
  });

  const shareButton = document.getElementById('share-page');
  shareButton.addEventListener('click', async () => {
    const data = {
      title: '垚 · 向阳求偶中｜强烈版',
      text: '单身营业中，求偶欲望十分强烈。看看这个网站，再来认识我。',
      url: pageUrl()
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
        feedback.textContent = '分享面板已打开。';
      } else {
        await copyText(data.url);
        feedback.textContent = '网站链接已复制，可以粘贴到微信发送。';
      }
    } catch (error) {
      if (error && error.name === 'AbortError') return;
      await copyText(data.url);
      feedback.textContent = '网站链接已复制，可以粘贴到微信发送。';
    }
    window.setTimeout(() => { feedback.textContent = ''; }, 3200);
  });

  const intensityButton = document.getElementById('intensity-up');
  const intensityValue = document.getElementById('intensity-value');
  const intensityMessage = document.getElementById('intensity-message');
  let intensity = 10;
  const messages = {
    11: '比十分强烈再多一点，十一分强烈。',
    12: '开始溢出屏幕，请谨慎点按。',
    13: '求偶雷达已经全功率开启。',
    14: '已经到了要立刻去加微信的程度。',
    15: '十五分强烈，系统建议直接联系本人。'
  };
  intensityButton.addEventListener('click', () => {
    intensity += 1;
    intensityValue.textContent = `${intensity} / 10`;
    intensityMessage.textContent = messages[intensity] || '非常强烈，已经超过计量范围。';
    for (let i = 0; i < 7; i += 1) {
      const heart = document.createElement('span');
      heart.textContent = '♥';
      heart.style.cssText = `position:fixed;z-index:999;left:${innerWidth * .72 + (Math.random() - .5) * 190}px;top:${innerHeight * .72}px;color:${i % 2 ? '#ffdc2e' : '#ff1748'};font-size:${14 + Math.random() * 20}px;pointer-events:none;transition:transform .9s ease-out,opacity .9s ease-out`;
      document.body.appendChild(heart);
      requestAnimationFrame(() => {
        heart.style.transform = `translate(${(Math.random() - .5) * 220}px, ${-130 - Math.random() * 180}px) rotate(${(Math.random() - .5) * 160}deg)`;
        heart.style.opacity = '0';
      });
      window.setTimeout(() => heart.remove(), 1000);
    }
  });

  const photoItems = [...document.querySelectorAll('.photo-item')];
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxCount = document.getElementById('lightbox-count');
  const closeButton = document.getElementById('lightbox-close');
  const prevButton = document.getElementById('lightbox-prev');
  const nextButton = document.getElementById('lightbox-next');
  let activeIndex = 0;
  let returnFocus = null;

  const updateLightbox = () => {
    const item = photoItems[activeIndex];
    const image = item.querySelector('img');
    lightboxImage.src = item.dataset.full || image.src;
    lightboxImage.alt = image.alt;
    lightboxCount.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(photoItems.length).padStart(2, '0')}`;
  };
  const openLightbox = (index) => {
    activeIndex = index;
    returnFocus = document.activeElement;
    updateLightbox();
    lightbox.hidden = false;
    document.body.classList.add('lightbox-open');
    closeButton.focus();
  };
  const closeLightbox = () => {
    lightbox.hidden = true;
    document.body.classList.remove('lightbox-open');
    lightboxImage.removeAttribute('src');
    if (returnFocus) returnFocus.focus();
  };
  const moveLightbox = (direction) => {
    activeIndex = (activeIndex + direction + photoItems.length) % photoItems.length;
    updateLightbox();
  };

  photoItems.forEach((item, index) => item.addEventListener('click', () => openLightbox(index)));
  closeButton.addEventListener('click', closeLightbox);
  prevButton.addEventListener('click', () => moveLightbox(-1));
  nextButton.addEventListener('click', () => moveLightbox(1));
  lightbox.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
  window.addEventListener('keydown', (event) => {
    if (lightbox.hidden) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') moveLightbox(-1);
    if (event.key === 'ArrowRight') moveLightbox(1);
  });
})();
