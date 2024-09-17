import { readBlockConfig } from '../../scripts/aem.js';

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const picture = block.querySelector('picture');
  const head = document.querySelector('head');

  let account = config.account ? config.account : undefined;
  let player = config.player ? config.player : undefined;

  if (!account && head.querySelector('meta[name="brightcove-account-id"]')) {
    account = head.querySelector('meta[name="brightcove-account-id"]').getAttribute('content');
  }

  if (!player && head.querySelector('meta[name="brightcove-player-id"]')) {
    player = head.querySelector('meta[name="brightcove-player-id"]').getAttribute('content');
  }

  if (!account || !player) {
    // eslint-disable-next-line no-console
    console.log('Brightcove video not configured.');
    block.innerHTML = '';
    return;
  }

  block.innerHTML = `
    <div class="placeholder">
        ${picture.outerHTML}
        <button class="play-button" type="button" title="Play Video" aria-disabled="false">
          <span class="arrow" aria-hidden="true"></span>
          <span class="sr-only" aria-live="polite">Play Video</span>
        </button>
    </div>
    <div class="video">
      <video-js autoplay data-video-id="${config.video}" data-account="${account}" data-player="${player}" controls="" data-embed="default" aria-label="Video Player"></video-js>
    </div>
  `;

  const placeholder = block.querySelector('.placeholder');

  const loadBrightcovePlayer = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const script = document.createElement('script');
    script.setAttribute('src', `https://players.brightcove.net/${account}/${player}_default/index.min.js`);
    head.append(script);
    block.classList.add('play-mode');
    placeholder.removeEventListener('click', loadBrightcovePlayer);
  };

  placeholder.addEventListener('click', loadBrightcovePlayer);
}
