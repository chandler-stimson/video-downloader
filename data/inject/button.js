'use strike';

const download = (filename, href) => {
  const a = document.createElement('a');
  a.setAttribute('href', href);
  a.target = '_blank';
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  a.remove();
};

const attach = e => {
  if (e.attached) {
    return;
  }
  e.attached = true;

  const div = document.createElement('div');
  div.classList.add('download-button');
  div.onclick = () => {
    const f = e.closest('.feed-item-content');
    const v = f.querySelector('video');

    let filename = 'video.mp4';
    try {
      filename = f.querySelector('.author-uniqueId').textContent;
    }
    catch (e) {}

    div.classList.add('working');
    div.textContent = '0%';

    fetch(v.src).then(async r => {
      const reader = r.body.getReader();
      const size = r.headers.get('Content-Length');

      if (isNaN(size)) {
        throw Error('Cannot detect filezie');
      }

      const chunks = [];
      let fetched = 0;
      while (true) {
        const {done, value} = await reader.read();

        if (done) {
          break;
        }
        chunks.push(value);
        fetched += value.byteLength;

        div.textContent = (fetched / size * 100).toFixed(1) + '%';
      }
      const b = new Blob(chunks, {
        type: r.headers.get('Content-Type')
      });
      const href = URL.createObjectURL(b);
      download(filename, href);
      setTimeout(() => URL.revokeObjectURL(href), 1000);
    }).catch(e => {
      console.warn(e);
      download(filename, v.src);
    }).finally(() => {
      div.textContent = '';
      div.classList.remove('working');
    });
  };
  e.appendChild(div);
};

const observer = new MutationObserver(ms => {
  for (const m of ms) {
    const bars = m.target.querySelectorAll('.pc-action-bar');
    if (bars.length) {
      bars.forEach(attach);
    }
  }
});

observer.observe(document, {
  childList: true,
  subtree: true
});
