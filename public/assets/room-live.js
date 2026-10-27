(() => {
  const room = document.querySelector('[data-live-room]');
  const tools = document.querySelector('[data-live-notifications]');
  if (!room || !tools) return;

  const bell = tools.querySelector('.live-bell');
  const badge = tools.querySelector('.live-badge');
  const panel = tools.querySelector('.live-notification-panel');
  const list = panel.querySelector('ol');
  const toastStack = tools.querySelector('.live-toast-stack');
  const code = room.dataset.liveRoom;
  const storageKey = `xw-room-notifications:${code}`;
  let notifications = [];
  try { notifications = JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch {}
  let unread = 0;
  let status = room.querySelector('.room-status')?.className.match(/status-([\w-]+)/)?.[1] || '';
  let cursor = room.dataset.lastMessageId || '';
  let failures = 0;
  let busy = false;

  const renderList = () => {
    list.replaceChildren();
    if (!notifications.length) {
      const empty = document.createElement('li');
      empty.className = 'live-notification-empty';
      empty.textContent = 'Room updates will appear here.';
      list.append(empty);
    } else {
      notifications.forEach(item => {
        const row = document.createElement('li');
        const message = document.createElement('span');
        message.textContent = item.text;
        const time = document.createElement('small');
        time.textContent = new Date(item.at).toLocaleString();
        row.append(message, time);
        list.append(row);
      });
    }
    badge.textContent = unread > 9 ? '9+' : String(unread);
    badge.hidden = unread === 0;
  };

  const notify = text => {
    const item = { text, at: new Date().toISOString() };
    notifications.unshift(item);
    notifications = notifications.slice(0, 30);
    try { localStorage.setItem(storageKey, JSON.stringify(notifications)); } catch {}
    unread += 1;
    renderList();
    const toast = document.createElement('div');
    toast.className = 'live-toast';
    toast.textContent = text;
    toastStack.append(toast);
    window.setTimeout(() => toast.remove(), 5000);
  };

  bell.addEventListener('click', () => {
    const open = panel.hidden;
    panel.hidden = !open;
    bell.setAttribute('aria-expanded', String(open));
    if (open) { unread = 0; renderList(); }
  });
  tools.querySelector('[data-clear-notifications]').addEventListener('click', () => {
    notifications = [];
    unread = 0;
    try { localStorage.removeItem(storageKey); } catch {}
    renderList();
  });
  document.addEventListener('click', event => {
    if (!tools.contains(event.target)) {
      panel.hidden = true;
      bell.setAttribute('aria-expanded', 'false');
    }
  });
  renderList();

  const preserveFocus = (oldNode, newNode) => {
    if (!oldNode || !newNode) return;
    const active = oldNode.contains(document.activeElement) ? document.activeElement : null;
    const selector = active?.matches('input,textarea,select') ? `${active.tagName.toLowerCase()}[name="${CSS.escape(active.name)}"]` : '';
    const value = active && 'value' in active ? active.value : null;
    oldNode.replaceWith(newNode);
    if (selector) {
      const restored = newNode.querySelector(selector);
      if (restored) { restored.value = value; restored.focus({ preventScroll: true }); }
    }
  };

  const poll = async () => {
    if (busy || document.visibilityState !== 'visible') return;
    busy = true;
    try {
      const url = `/api/deal/${encodeURIComponent(code)}/updates${cursor ? `?after=${encodeURIComponent(cursor)}` : ''}`;
      const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store', headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`Updates unavailable (${response.status})`);
      const data = await response.json();
      if (!data.ok) return;
      failures = 0;
      const documentFragment = new DOMParser().parseFromString(data.html, 'text/html');
      const fresh = documentFragment.querySelector('[data-live-room]');
      if (!fresh) return;

      const nextStatus = fresh.querySelector('.room-status')?.className.match(/status-([\w-]+)/)?.[1] || '';
      if (nextStatus && nextStatus !== status) {
        const label = fresh.querySelector('.room-status')?.textContent.trim() || nextStatus.replaceAll('_', ' ');
        notify(`Deal status: ${label}`);
        status = nextStatus;
      }

      const oldStatus = room.querySelector('.room-status');
      const newStatus = fresh.querySelector('.room-status');
      if (oldStatus && newStatus) {
        oldStatus.className = newStatus.className;
        oldStatus.textContent = newStatus.textContent;
      }
      const oldSummary = room.querySelector('.room-summary');
      const newSummary = fresh.querySelector('.room-summary');
      if (oldSummary && newSummary) oldSummary.replaceChildren(...Array.from(newSummary.children, child => child.cloneNode(true)));
      preserveFocus(room.querySelector('.party-list'), fresh.querySelector('.party-list'));
      preserveFocus(room.querySelector('.room-controls'), fresh.querySelector('.room-controls'));

      const currentList = room.querySelector('.message-list');
      const freshMessages = fresh.querySelectorAll('.message-list [data-message-id]');
      const currentIds = new Set(Array.from(currentList.querySelectorAll('[data-message-id]'), item => item.dataset.messageId));
      const unseen = Array.from(freshMessages).filter(item => item.dataset.messageId && !currentIds.has(item.dataset.messageId));
      const nearBottom = currentList.scrollHeight - currentList.scrollTop - currentList.clientHeight < 100;
      unseen.forEach(message => {
        const copy = message.cloneNode(true);
        currentList.append(copy);
        const author = copy.querySelector('b')?.textContent || 'A participant';
        const body = copy.querySelector('p')?.textContent || 'New room activity';
        notify(`${author}: ${body}`);
      });
      if (unseen.length && nearBottom) currentList.scrollTop = currentList.scrollHeight;
      if (unseen.length) currentList.querySelector('.empty-chat')?.remove();
      if (data.latestMessageId) cursor = data.latestMessageId;
      room.dataset.lastMessageId = cursor;
    } catch {
      failures = Math.min(failures + 1, 5);
    } finally {
      busy = false;
    }
  };
  window.setInterval(poll, 5000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) poll(); });
})();
