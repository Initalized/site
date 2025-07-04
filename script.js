// Existing canvas setup
const bgCanvas = document.getElementById('background');
const bgCtx = bgCanvas.getContext('2d');

const charCanvas = document.getElementById('character');
const charCtx = charCanvas.getContext('2d');

const video = document.createElement('video');
video.src = 'char.mp4';
video.autoplay = true;
video.loop = true;
video.muted = true;
video.playsInline = true;

const offCanvas = document.createElement('canvas');
const offCtx = offCanvas.getContext('2d');

const tempCanvas = document.createElement('canvas');
const tempCtx = tempCanvas.getContext('2d');

const maskCanvas = document.createElement('canvas');
const maskCtx = maskCanvas.getContext('2d');

const outlineCanvas = document.createElement('canvas');
const outlineCtx = outlineCanvas.getContext('2d');

// Tooltip for character
const tooltip = document.createElement('div');
const messages = [
  "Cute fursona :3", "Adorable character!", "Nice tail fluff!",
  "Those ears are precious.", "Such a vibrant design!",
  "Love the color palette.", "Charming expression :)",
  "Very huggable!", "Fuzzy and fabulous!"
];
tooltip.textContent = messages[Math.floor(Math.random() * messages.length)];
Object.assign(tooltip.style, {
  position: 'fixed',
  pointerEvents: 'none',
  background: '#111014',
  color: '#fff',
  padding: '2px 5px',
  borderRadius: '4px',
  fontSize: '14px',
  display: 'none'
});
document.body.appendChild(tooltip);

// Yummi donut tooltip
const donutTooltip = document.createElement('div');
donutTooltip.textContent = 'Yummi donut!';
Object.assign(donutTooltip.style, {
  position: 'fixed',
  pointerEvents: 'none',
  background: '#111014',
  color: '#fff',
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: '12px',
  display: 'none',
  zIndex: 1000
});
document.body.appendChild(donutTooltip);

const coffeeTooltip = document.createElement('div');
coffeeTooltip.textContent = 'I ❤️ Кофе';
Object.assign(coffeeTooltip.style, {
  position: 'fixed',
  pointerEvents: 'none',
  background: '#111014',
  color: '#fff',
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: '10px',
  display: 'none',
  zIndex: 90
});
document.body.appendChild(coffeeTooltip);

// Track mouse globally
const currentMousePos = { x: 0, y: 0 };
window.addEventListener('mousemove', (e) => {
  currentMousePos.x = e.clientX;
  currentMousePos.y = e.clientY;
});

// Character hover logic
charCanvas.addEventListener('mousemove', (e) => {
  const rect = charCanvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const scale = 0.5;
  const videoW = video.videoWidth;
  const videoH = video.videoHeight;
  const targetHeight = window.innerHeight * scale;
  const targetWidth = (targetHeight * videoW) / videoH;
  const drawX = 0;
  const drawY = window.innerHeight - targetHeight;

  if (mouseX >= drawX && mouseX < drawX + targetWidth &&
      mouseY >= drawY && mouseY < drawY + targetHeight) {
    const relativeX = ((mouseX - drawX) / targetWidth) * videoW;
    const relativeY = ((mouseY - drawY) / targetHeight) * videoH;
    const pixel = tempCtx.getImageData(Math.floor(relativeX), Math.floor(relativeY), 1, 1).data;
    if (pixel[3] > 0) {
      tooltip.style.left = `${e.clientX + 10}px`;
      tooltip.style.top = `${e.clientY + 10}px`;
      tooltip.style.display = 'block';
      return;
    }
  }
  tooltip.style.display = 'none';
});
charCanvas.addEventListener('mouseleave', () => {
  tooltip.style.display = 'none';
});

function resizeCanvas() {
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
  charCanvas.width = window.innerWidth;
  charCanvas.height = window.innerHeight;
  drawCheckerboard();
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function drawCheckerboard(tileSize = 40) {
  const cols = Math.ceil(bgCanvas.width / tileSize);
  const rows = Math.ceil(bgCanvas.height / tileSize);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      bgCtx.fillStyle = (x + y) % 2 === 0 ? '#1e2022' : '#202224';
      bgCtx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }
}

video.addEventListener('canplay', () => {
  video.play();

  const vw = video.videoWidth;
  const vh = video.videoHeight;

  [offCanvas, tempCanvas, maskCanvas, outlineCanvas].forEach(c => {
    c.width = vw;
    c.height = vh;
  });

  renderCharacter();
});

let frameCounter = 0;
let processedFrame = null;

function updateMaskedFrame() {
  const w = offCanvas.width;
  const h = offCanvas.height;

  offCtx.drawImage(video, 0, 0, w, h);
  processedFrame = offCtx.getImageData(0, 0, w, h);
  const data = processedFrame.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (r < 30 && g < 30 && b < 30) data[i + 3] = 0;
  }

  tempCtx.putImageData(processedFrame, 0, 0);
}

function renderCharacter() {
  const w = offCanvas.width;
  const h = offCanvas.height;

  // Only update the frame every 2nd frame to reduce CPU
  if (frameCounter % 2 === 0) {
    updateMaskedFrame();
  }
  frameCounter++;

  charCtx.clearRect(0, 0, charCanvas.width, charCanvas.height);

  const scale = 0.5;
  const targetHeight = window.innerHeight * scale;
  const targetWidth = (targetHeight * w) / h;
  const x = 0;
  const y = window.innerHeight - targetHeight;

  // Skip outline/mask canvas for now
  charCtx.drawImage(tempCanvas, x, y, targetWidth, targetHeight);

  // Coffee rendering
  const drawWidth = 50;
  const drawHeight = 50;
  const padding = 4;
  const cx = window.innerWidth - drawWidth - padding;
  const cy = window.innerHeight - drawHeight - padding;
  charCtx.drawImage(coffeeCanvas, cx, cy, drawWidth, drawHeight);

  const mx = currentMousePos.x;
  const my = currentMousePos.y;
  if (mx >= cx && mx <= cx + drawWidth && my >= cy && my <= cy + drawHeight) {
    coffeeTooltip.style.left = `${mx + 10}px`;
    coffeeTooltip.style.top = `${my + 10}px`;
    coffeeTooltip.style.display = 'block';
  } else {
    coffeeTooltip.style.display = 'none';
  }

  requestAnimationFrame(renderCharacter);
}

// Ultra-fast text type-in
const target = document.getElementById('l_text');
const rawText = `Hello, I'm Initialize. I've been coding for 5 years and doing 3D modeling for about 3.

I like building systems from scratch — sometimes just to see if I can break them again. Most of what I make never gets released, but it's all part of the process.

I'm into low-level stuff, glitchy aesthetics, and anything that feels a little too raw to be finished. This site is part testbed, part personal archive.`;
const styledText = rawText
  .replace(/glitchy/g, `<a class="glitch-link">glitchy</a>`)
  .replace(/\braw\b/g, `<span class="raw-text">raw</span>`)
  .replace(/archive/g, `<span class="archive">archive</span>`);
target.innerHTML = styledText.split('\n').map(l => l.trim()).join('<br>');

// Konami Code
const konamiCode = [38,38,40,40,37,39,37,39,66,65];
let konamiIndex = 0;
window.addEventListener('keydown', e => {
  if (e.keyCode === konamiCode[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === konamiCode.length) {
      konamiActivated();
      konamiIndex = 0;
    }
  } else {
    konamiIndex = 0;
  }
});
function konamiActivated() {
  const box = document.querySelector('.donutBox');
  box.style.display = 'block';
  requestAnimationFrame(() => { box.style.opacity = 1; });
  playDonutVideo();
}
function playDonutVideo() {
  const donutCanvas = document.getElementById('donut');
  const donutCtx = donutCanvas.getContext('2d');
  const donutVideo = document.createElement('video');

  donutVideo.src = 'donut.mp4';
  donutVideo.autoplay = true;
  donutVideo.loop = true;
  donutVideo.muted = true;
  donutVideo.playsInline = true;

  const offCanvas = document.createElement('canvas');
  const offCtx = offCanvas.getContext('2d');

  donutVideo.addEventListener('canplay', () => {
    donutVideo.play();

    const vw = donutVideo.videoWidth;
    const vh = donutVideo.videoHeight;
    donutCanvas.width = vw;
    donutCanvas.height = vh;
    offCanvas.width = vw;
    offCanvas.height = vh;

    function draw() {
      // Draw to offscreen for pixel manipulation
      offCtx.drawImage(donutVideo, 0, 0, vw, vh);
      const frame = offCtx.getImageData(0, 0, vw, vh);
      const data = frame.data;

      // Make dark background pixels transparent
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (r < 30 && g < 30 && b < 30) {
          data[i + 3] = 0;
        }
      }

      // Draw processed frame to visible canvas
      donutCtx.clearRect(0, 0, vw, vh);
      donutCtx.putImageData(frame, 0, 0);

      requestAnimationFrame(draw);
    }

    draw();

    // Tooltip hover logic
    donutCanvas.addEventListener('mousemove', e => {
      const rect = donutCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const pixel = donutCtx.getImageData(x, y, 1, 1).data;

      if (pixel[3] > 0) {
        donutTooltip.style.left = `${e.clientX + 10}px`;
        donutTooltip.style.top = `${e.clientY + 10}px`;
        donutTooltip.style.display = 'block';
      } else {
        donutTooltip.style.display = 'none';
      }
    });

    donutCanvas.addEventListener('mouseleave', () => {
      donutTooltip.style.display = 'none';
    });
  });
}

const coffeeVideo = document.createElement('video');
coffeeVideo.src = 'coffee.mp4';
coffeeVideo.autoplay = true;
coffeeVideo.loop = true;
coffeeVideo.muted = true;
coffeeVideo.playsInline = true;

const coffeeCanvas = document.createElement('canvas');
const coffeeCtx = coffeeCanvas.getContext('2d');
coffeeCanvas.style.zIndex = 90;

coffeeVideo.addEventListener('canplay', () => {
  coffeeVideo.play();

  const vw = coffeeVideo.videoWidth;
  const vh = coffeeVideo.videoHeight;
  coffeeCanvas.width = vw;
  coffeeCanvas.height = vh;

  function drawCoffee() {
    coffeeCtx.drawImage(coffeeVideo, 0, 0, vw, vh);
    const frame = coffeeCtx.getImageData(0, 0, vw, vh);
    const data = frame.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (r < 30 && g < 30 && b < 30) data[i + 3] = 0;
    }
    coffeeCtx.putImageData(frame, 0, 0);
    requestAnimationFrame(drawCoffee);
  }
  drawCoffee();
});

// Tooltip for contact_li
const contactTooltip = document.createElement('div');
contactTooltip.textContent = 'discord: initialized__';
Object.assign(contactTooltip.style, {
  position: 'fixed',
  pointerEvents: 'none',
  background: '#111014',
  color: '#fff',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '12px',
  display: 'none',
  zIndex: 999
});
document.body.appendChild(contactTooltip);

// Track mouse over .contact_li
const contactElement = document.querySelector('.contact_li');
if (contactElement) {
  contactElement.addEventListener('mouseenter', () => {
    contactTooltip.style.display = 'block';
  });

  contactElement.addEventListener('mousemove', (e) => {
    contactTooltip.style.left = `${e.clientX + 10}px`;
    contactTooltip.style.top = `${e.clientY + 10}px`;
  });

  contactElement.addEventListener('mouseleave', () => {
    contactTooltip.style.display = 'none';
  });
}

const archiveTooltip = document.createElement('div');
archiveTooltip.textContent = 'bro look at the main page';
Object.assign(archiveTooltip.style, {
  position: 'fixed',
  pointerEvents: 'none',
  background: '#111014',
  color: '#fff',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '12px',
  display: 'none',
  zIndex: 999
});
document.body.appendChild(archiveTooltip);

const archiveElement = document.querySelector('.archive_li');
if (archiveElement) {
  archiveElement.addEventListener('mouseenter', () => {
    archiveTooltip.style.display = 'block';
  });

  archiveElement.addEventListener('mousemove', (e) => {
    archiveTooltip.style.left = `${e.clientX + 10}px`;
    archiveTooltip.style.top = `${e.clientY + 10}px`;
  });

  archiveElement.addEventListener('mouseleave', () => {
    archiveTooltip.style.display = 'none';
  });
}

const githubTooltip = document.createElement('div');
githubTooltip.textContent = 'https://github.com/Initalized';
Object.assign(githubTooltip.style, {
  position: 'fixed',
  pointerEvents: 'none',
  background: '#111014',
  color: '#fff',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '12px',
  display: 'none',
  zIndex: 999
});
document.body.appendChild(githubTooltip);

// Track mouse over .github_li and add click behavior
const githubElement = document.querySelector('.github_li');
if (githubElement) {
  githubElement.addEventListener('mouseenter', () => {
    githubTooltip.style.display = 'block';
  });

  githubElement.addEventListener('mousemove', (e) => {
    githubTooltip.style.left = `${e.clientX + 10}px`;
    githubTooltip.style.top = `${e.clientY + 10}px`;
  });

  githubElement.addEventListener('mouseleave', () => {
    githubTooltip.style.display = 'none';
  });

  githubElement.addEventListener('click', () => {
    window.open('https://github.com/Initalized', '_blank');
  });
}

function visit(url) {
    window.open(url, '_blank');
}

const isFirefox = typeof InstallTrigger !== 'undefined';

  // Get the #firefox element
  const firefoxDiv = document.getElementById('firefox');

  // Remove the element if the browser is Firefox
  if (isFirefox && firefoxDiv) {
    firefoxDiv.remove();
  }