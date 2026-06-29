(function () {
  'use strict';

  var CAPABILITIES = {
    reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    coarse: window.matchMedia('(pointer: coarse)').matches,
    finePointer: function () {
      return !this.reduced && !this.coarse;
    },
    sandstorm: function () {
      return !this.reduced && !this.coarse;
    }
  };

  var pointer = { x: 0, y: 0, active: false };

  function throttle(fn, ms) {
    var last = 0;
    var timer = null;
    return function (e) {
      var now = Date.now();
      if (now - last >= ms) {
        last = now;
        fn(e);
      } else if (!timer) {
        timer = setTimeout(function () {
          timer = null;
          last = Date.now();
          fn(e);
        }, ms - (now - last));
      }
    };
  }

  function onPointerMove(e) {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.active = true;
  }

  document.addEventListener('mousemove', throttle(onPointerMove, 16));

  function raf2(fn) {
    requestAnimationFrame(function () {
      requestAnimationFrame(fn);
    });
  }

  /* Surname burst on hold-hover */
  (function () {
    var el = document.getElementById('surname');
    if (!el) return;
    var timer = null;
    el.addEventListener('mouseenter', function () {
      timer = setTimeout(function () {
        el.classList.remove('bursting');
        void el.offsetWidth;
        el.classList.add('bursting');
        timer = null;
      }, 1400);
    });
    el.addEventListener('mouseleave', function () {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    });
    el.addEventListener('animationend', function () {
      el.classList.remove('bursting');
    });
  })();

  /* Letter-by-letter "Karthik" reveal (letters are static in HTML) */
  (function () {
    var el = document.getElementById('hero-name');
    if (!el) return;
    raf2(function () {
      el.querySelectorAll('.ch').forEach(function (c) {
        c.classList.add('in');
      });
    });
  })();

  /* Interest tags (markup is static in HTML) */
  (function () {
    var cluster = document.getElementById('tagcluster');
    if (!cluster) return;
    raf2(function () {
      cluster.querySelectorAll('.tag').forEach(function (c) {
        c.classList.add('in');
      });
    });
  })();

  /* Reveal stagger */
  (function () {
    document.querySelectorAll('.reveal').forEach(function (el) {
      var d = parseInt(el.getAttribute('data-delay') || '0', 10);
      setTimeout(function () {
        el.classList.add('in');
      }, d);
    });
  })();

  /* Scatter beans at Peet's button corners */
  (function () {
    var wrap = document.getElementById('peets-wrap');
    if (!wrap) return;
    var beans = [
      { x: 0, y: 0, r: -22, drift: 'a', flip: '' },
      { x: 100, y: 0, r: 22, drift: 'b', flip: 'scaleX(-1)' },
      { x: 0, y: 100, r: 22, drift: 'c', flip: 'scaleY(-1)' },
      { x: 100, y: 100, r: -22, drift: 'd', flip: 'scale(-1,-1)' }
    ];
    var ns = 'http://www.w3.org/2000/svg';
    beans.forEach(function (b) {
      var sp = document.createElement('span');
      sp.className = 'bean drift-' + b.drift;
      sp.style.left = b.x + '%';
      sp.style.top = b.y + '%';
      sp.style.transform =
        'translate(-50%,-50%) rotate(' + b.r + 'deg) ' + (b.flip || '');
      var svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('viewBox', '0 0 22 20');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      var use = document.createElementNS(ns, 'use');
      use.setAttribute('href', '#bean-svg');
      svg.appendChild(use);
      sp.appendChild(svg);
      wrap.appendChild(sp);
    });
  })();

  /* Resolving percentage counter */
  (function () {
    var el = document.getElementById('pct');
    if (!el) return;
    setTimeout(function () {
      var n = 0;
      el.textContent = '00.0%';
      function tick() {
        var target = 88 - Math.random() * 4;
        n = n + (target - n) * 0.012 + (Math.random() - 0.5) * 0.18;
        n = Math.max(0, Math.min(99, n));
        el.textContent = n.toFixed(1).padStart(4, '0') + '%';
        setTimeout(tick, 90 + Math.random() * 80);
      }
      tick();
    }, 400);
  })();

  /* PST/PDT live clock */
  (function () {
    var el = document.getElementById('pst-time');
    var tzEl = document.getElementById('tz-label');
    if (!el) return;
    var fmt = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Los_Angeles'
    });
    var tzFmt = new Intl.DateTimeFormat('en-US', {
      timeZoneName: 'short',
      timeZone: 'America/Los_Angeles'
    });
    var cachedTZ = '';
    function tick() {
      var now = new Date();
      el.textContent = fmt.format(now);
      if (tzEl) {
        var parts = tzFmt.formatToParts(now);
        var tzPart = parts.find(function (p) {
          return p.type === 'timeZoneName';
        });
        var tz = tzPart ? tzPart.value : 'PST';
        if (tz !== cachedTZ) {
          cachedTZ = tz;
          tzEl.textContent = tz;
        }
      }
    }
    tick();
    var clockInterval = setInterval(tick, 1000);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) tick();
    });
  })();

  /* Karthik letter scatter */
  (function () {
    if (!CAPABILITIES.finePointer()) return;
    var nameEl = document.getElementById('hero-name');
    if (!nameEl) return;
    var scatters = [
      [-18, -12, -3],
      [8, -20, 2],
      [-6, 14, -2],
      [22, -8, 4],
      [-14, 18, -3],
      [10, -14, 2],
      [-20, 8, -4]
    ];
    nameEl.addEventListener('mouseenter', function () {
      nameEl.querySelectorAll('.ch.in').forEach(function (ch, i) {
        var s = scatters[i % scatters.length];
        ch.style.transition =
          'transform .55s cubic-bezier(.2,.7,.2,1), color .4s ease, text-shadow .4s ease';
        ch.style.transform =
          'translate(' +
          s[0] +
          'px,' +
          s[1] +
          'px) rotate(' +
          s[2] +
          'deg) scale(1.06)';
        ch.style.color = 'var(--sand-bright)';
        ch.style.textShadow =
          '0 0 60px color-mix(in oklab, var(--amber) 70%, transparent)';
      });
    });
    nameEl.addEventListener('mouseleave', function () {
      nameEl.querySelectorAll('.ch.in').forEach(function (ch) {
        ch.style.transition =
          'transform .7s cubic-bezier(.2,.7,.2,1), color .5s ease, text-shadow .5s ease';
        ch.style.transform = '';
        ch.style.color = '';
        ch.style.textShadow = '';
      });
    });
  })();

  /* Sandstorm canvas */
  (function () {
    if (!CAPABILITIES.sandstorm()) return;
    var cv = document.getElementById('storm');
    if (!cv) return;
    var ctx = cv.getContext('2d', { alpha: true });
    var W = 0;
    var H = 0;
    var DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    function particleCap() {
      var max = W < 760 ? 120 : 400;
      return Math.min(max, Math.round((W * H) / 6500));
    }

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = W * DPR;
      cv.height = H * DPR;
      cv.style.width = W + 'px';
      cv.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();

    var COUNT = particleCap();
    var layers = [];

    function spawn(p, L) {
      p.x = Math.random() * W;
      p.y = Math.random() * H * 0.95;
      p.vx = (L.windBase + Math.random() * L.windVar) * L.z;
      p.vy = (Math.random() - 0.5) * 0.15 * L.z;
      p.size = L.size * (0.6 + Math.random() * 0.6);
      p.alpha = L.alpha * (0.5 + Math.random() * 0.5);
      p.phase = Math.random() * Math.PI * 2;
      p.tone = Math.random();
    }
    function makeLayer(opts) {
      var arr = [];
      for (var i = 0; i < opts.count; i++) {
        var p = {};
        spawn(p, opts);
        arr.push(p);
      }
      return Object.assign({}, opts, { particles: arr });
    }
    var sizeMul = Math.max(0.7, Math.min(1.2, W / 1280));
    layers.push(
      makeLayer({
        z: 0.4,
        count: Math.round(COUNT * 0.5),
        windBase: 1.6,
        windVar: 1.0,
        size: 0.7 * sizeMul,
        alpha: 0.45
      })
    );
    layers.push(
      makeLayer({
        z: 0.7,
        count: Math.round(COUNT * 0.32),
        windBase: 2.6,
        windVar: 1.6,
        size: 1.1 * sizeMul,
        alpha: 0.55
      })
    );
    layers.push(
      makeLayer({
        z: 1.0,
        count: Math.round(COUNT * 0.18),
        windBase: 4.0,
        windVar: 2.4,
        size: 1.7 * sizeMul,
        alpha: 0.7
      })
    );

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        resizeTimer = null;
        resize();
        COUNT = particleCap();
        layers.forEach(function (L) {
          L.particles.forEach(function (p) { spawn(p, L); });
        });
      }, 150);
    });

    function colorFor(tone, alpha) {
      var r = Math.round(255 * (1 - tone) + 224 * tone);
      var g = Math.round(242 * (1 - tone) + 168 * tone);
      var b = Math.round(212 * (1 - tone) + 90 * tone);
      return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha.toFixed(3) + ')';
    }

    var mono = document.getElementById('monogram');
    var t0 = performance.now();
    var gust = 0;
    var nextGust = 4000 + Math.random() * 6000;
    var lastGust = t0;
    var mouseInfluence = 0;
    var rafId = 0;

    document.addEventListener(
      'mousemove',
      throttle(function () {
        mouseInfluence = Math.min(1, mouseInfluence + 0.06);
      }, 32)
    );

    function frame(now) {
      if (document.hidden) {
        rafId = 0;
        return;
      }
      var dt = Math.min(50, now - t0);
      t0 = now;
      var dts = dt / 16.666;
      if (now - lastGust > nextGust) {
        gust = 1;
        lastGust = now;
        nextGust = 5000 + Math.random() * 8000;
      }
      gust *= 0.985;
      mouseInfluence *= 0.96;
      cv.classList.toggle('boost', gust > 0.3);
      if (mono) mono.style.setProperty('--mglow', gust.toFixed(2));
      ctx.clearRect(0, 0, W, H);

      var mx = pointer.x;
      var my = pointer.y;

      for (var li = 0; li < layers.length; li++) {
        var L = layers[li];
        var ps = L.particles;
        var baseGust = 1 + gust * 1.7;
        for (var i = 0; i < ps.length; i++) {
          var p = ps[i];
          p.phase += 0.02 * dts;
          var bob = Math.sin(p.phase) * 0.25 * L.z;
          var mdx = 0;
          var mdy = 0;
          if (mouseInfluence > 0.02 && pointer.active) {
            var dx = p.x - mx;
            var dy = p.y - my;
            var d2 = dx * dx + dy * dy;
            var rr = 140;
            if (d2 < rr * rr) {
              var d = Math.sqrt(d2) || 1;
              var force = (1 - d / rr) * 1.6 * mouseInfluence;
              mdx = (dx / d) * force;
              mdy = (dy / d) * force;
            }
          }
          p.x += (p.vx * baseGust + mdx) * dts;
          p.y += (p.vy * baseGust + bob + mdy) * dts;
          if (p.x > W + 20) {
            spawn(p, L);
            p.x = -10;
          } else if (p.x < -20) {
            spawn(p, L);
            p.x = W + 10;
          }
          if (p.y > H + 20) p.y = -10;
          else if (p.y < -20) p.y = H + 10;

          var speed = Math.abs(p.vx) * baseGust;
          var a = p.alpha * (0.7 + gust * 0.4);
          ctx.fillStyle = colorFor(p.tone, a);
          if (L.z >= 0.7 && speed > 2.5) {
            var len = Math.min(14, speed * 1.2);
            ctx.strokeStyle = colorFor(p.tone, a * 0.55);
            ctx.lineWidth = p.size * 0.9;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - len, p.y - bob * 4);
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      rafId = requestAnimationFrame(frame);
    }

    function start() {
      if (!rafId) {
        t0 = performance.now();
        rafId = requestAnimationFrame(frame);
      }
    }

    function stop() {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else start();
    });

    window.addEventListener('click', function () {
      gust = Math.min(1, gust + 0.7);
    });

    start();
  })();
})();


(function () {
  /* Obfuscated email: assemble mailto at click time (no literal address in HTML) */
  function deobf(s) { return s.replace(/ \[dot\] /g, '.').replace(/ \[at\] /g, '@'); }
  document.querySelectorAll('.email-open').forEach(function (b) {
    b.addEventListener('click', function () {
      var e = b.getAttribute('data-email');
      if (e) window.location.href = 'mailto:' + deobf(e);
    });
  });
})();
