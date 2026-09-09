/* ============================================================
 * 麦抢 · 交互逻辑（模拟抢票流程演示，不产生真实交易）
 * ============================================================ */
(function () {
  'use strict';

  /* ---------- 工具 ---------- */
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const maskId = id => id.length >= 10 ? id.slice(0, 4) + '**********' + id.slice(-4) : id;
  const maskPhone = p => p.length === 11 ? p.slice(0, 3) + '****' + p.slice(-4) : p;
  const money = n => '¥' + n;

  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
  };

  let toastTimer = null;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2200);
  }

  /* ---------- 本地数据 ---------- */
  let viewers = store.get('mai_viewers', [
    { id: 1, name: '张小麦', idCard: '310101199505056666', phone: '13800008888' }
  ]);
  let orders = store.get('mai_orders', []);
  const saveViewers = () => store.set('mai_viewers', viewers);
  const saveOrders = () => store.set('mai_orders', orders);

  /* ---------- 路由 ---------- */
  const navStack = ['home'];
  const TAB_PAGES = ['home', 'mine'];
  function go(pageId) {
    if (pageId !== 'grab') cancelGrab(); // 离开抢票页时停止倒计时与后台抢购
    $$('.page').forEach(p => p.classList.remove('active'));
    $('#page-' + pageId).classList.add('active');
    if (navStack[navStack.length - 1] !== pageId) navStack.push(pageId);
    $('#tabbar').style.display = TAB_PAGES.includes(pageId) ? 'flex' : 'none';
    $('#page-' + pageId).scrollTop = 0;
  }
  function back() {
    if (navStack.length > 1) navStack.pop();
    go(navStack[navStack.length - 1]);
  }
  document.addEventListener('click', e => {
    if (e.target.closest('[data-back]')) { cancelGrab(); back(); }
  });

  /* ---------- 首页 ---------- */
  function renderHome() {
    // Banner
    const track = $('#bannerTrack');
    const dots = $('#bannerDots');
    track.innerHTML = BANNERS.map(b =>
      `<div class="b-slide"><img src="${b.img}" alt=""/><div class="b-cap">${esc(b.title)}</div></div>`
    ).join('');
    dots.innerHTML = BANNERS.map((_, i) => `<i class="${i === 0 ? 'on' : ''}"></i>`).join('');
    let bi = 0;
    setInterval(() => {
      bi = (bi + 1) % BANNERS.length;
      track.style.transform = `translateX(-${bi * 100}%)`;
      $$('i', dots).forEach((d, i) => d.classList.toggle('on', i === bi));
    }, 3200);

    // 分类
    $('#cateNav').innerHTML = CATEGORIES.map(c =>
      `<div class="cate"><div class="c-ico">${c.icon}</div>${c.name}</div>`
    ).join('');
    $('#cateNav').addEventListener('click', e => {
      const cate = e.target.closest('.cate');
      if (cate) toast('演示版暂未开放分类筛选');
    });

    // 演出卡片
    const cardHTML = ev => `
      <div class="event-card" data-id="${ev.id}">
        <img class="ec-cover" src="${ev.cover}" alt="" />
        <div class="ec-info">
          <div class="ec-title">${esc(ev.title)}</div>
          <div class="ec-meta">${esc(ev.venue.replace('上海 · ', ''))} · ${esc(ev.date.split(' ')[0])}</div>
          <div class="ec-bottom">
            <span class="ec-price"><small>${ev.status === 'upcoming' ? '预售' : '起'}</small> ¥${Math.min(...ev.prices.map(p => p.price))}</span>
            ${ev.status === 'upcoming'
              ? '<span class="tag tag--soon">即将开售</span>'
              : '<span class="tag tag--hot">热销中</span>'}
          </div>
        </div>
      </div>`;
    const hot = EVENTS.filter(e => e.status === 'onsale');
    const soon = EVENTS.filter(e => e.status === 'upcoming');
    $('#eventList').innerHTML = hot.map(cardHTML).join('');
    $('#upcomingList').innerHTML = soon.map(cardHTML).join('');
    $$('.event-list').forEach(list => list.addEventListener('click', e => {
      const card = e.target.closest('.event-card');
      if (card) renderDetail(card.dataset.id);
    }));
  }

  /* ---------- 详情页 ---------- */
  let cur = null; // 当前选票状态
  function renderDetail(id) {
    const ev = EVENTS.find(e => e.id === id);
    if (!ev) return;
    cur = {
      ev,
      session: null,
      price: null,
      finalPrice: null, // 调剂后的实际票档
      viewerIds: [],
      fallback: true
    };

    $('#dPoster').src = ev.poster;
    $('#dTitle').textContent = ev.title;
    $('#dScore').textContent = ev.score;
    $('#dWant').textContent = ev.want;
    $('#dDate').textContent = ev.date;
    $('#dVenue').textContent = ev.venue;
    $('#dNotice').textContent = ev.notice;

    $('#dSessions').innerHTML = ev.sessions.map(s =>
      `<div class="chip" data-sid="${s.id}">${esc(s.name)}<small>${esc(s.sub)}</small></div>`
    ).join('');

    const stockText = { lots: '票量充足', few: '仅剩少量', none: '已售罄' };
    $('#dPrices').innerHTML = ev.prices.map(p =>
      `<div class="pcell ${p.stock === 'none' ? 'soldout' : ''} ${p.stock === 'few' ? 'few' : ''}" data-pid="${p.id}">
        <b>¥${p.price}</b><small>${esc(p.label)} · ${stockText[p.stock]}</small>
      </div>`
    ).join('');

    renderViewerChips();
    updateBar();
    $('#dFallback').checked = true;
    $('#dGrabBtn').textContent = ev.status === 'upcoming' ? '预约抢票' : '立即抢购';
    go('detail');
  }

  function renderViewerChips() {
    $('#dViewers').innerHTML = viewers.map(v => `
      <div class="vchip ${cur.viewerIds.includes(v.id) ? 'on' : ''}" data-vid="${v.id}">
        ${esc(v.name)} <span class="v-mask">${maskId(v.idCard)}</span>
      </div>`).join('') +
      '<div class="vchip vchip-add" id="vAddChip">＋ 添加观演人</div>';
  }

  function updateBar() {
    const n = cur.viewerIds.length;
    $('#dBarPrice').textContent = cur.price ? money(cur.price.price * n) : '¥ --';
  }

  // 详情页交互
  $('#dSessions').addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    $$('.chip', $('#dSessions')).forEach(c => c.classList.remove('on'));
    chip.classList.add('on');
    cur.session = cur.ev.sessions.find(s => s.id === chip.dataset.sid);
  });
  $('#dPrices').addEventListener('click', e => {
    const cell = e.target.closest('.pcell');
    if (!cell || cell.classList.contains('soldout')) return;
    $$('.pcell', $('#dPrices')).forEach(c => c.classList.remove('on'));
    cell.classList.add('on');
    cur.price = cur.ev.prices.find(p => p.id === cell.dataset.pid);
    cur.finalPrice = null;
    updateBar();
  });
  $('#dViewers').addEventListener('click', e => {
    if (e.target.closest('#vAddChip')) { openViewerModal(); return; }
    const chip = e.target.closest('.vchip');
    if (!chip) return;
    const vid = Number(chip.dataset.vid);
    const idx = cur.viewerIds.indexOf(vid);
    if (idx >= 0) cur.viewerIds.splice(idx, 1);
    else {
      if (cur.viewerIds.length >= 4) return toast('每单最多购买 4 张票');
      cur.viewerIds.push(vid);
    }
    renderViewerChips();
    updateBar();
  });
  $('#dFallback').addEventListener('change', e => { cur.fallback = e.target.checked; });

  $('#dGrabBtn').addEventListener('click', () => {
    if (!cur.session) return toast('请选择演出场次');
    if (!cur.price) return toast('请选择票档');
    if (cur.viewerIds.length === 0) return toast('请至少选择 1 位观演人');
    openGrab();
  });

  /* ---------- 抢票页 ---------- */
  const MAX_RETRY = 5;
  let cdTimer = null;
  let grabToken = 0;

  function cancelGrab() {
    grabToken++;          // 使进行中的异步链失效
    clearInterval(cdTimer);
    cdTimer = null;
  }

  function openGrab() {
    cancelGrab();
    const { ev } = cur;
    $('#gPoster').src = ev.poster;
    $('#gTitle').textContent = ev.title;
    $('#gSession').textContent = `${cur.session.name} · ${cur.price.label} ¥${cur.price.price} × ${cur.viewerIds.length} 张`;
    $('#retryNum').textContent = MAX_RETRY;
    $('#grabRunning').hidden = true;
    $('#grabCountdown').hidden = false;
    go('grab');

    const btn = $('#cdBtn');
    if (ev.status === 'upcoming' && ev.saleAt > Date.now()) {
      btn.disabled = true;
      btn.textContent = '等待开售';
      $('.cd-label').textContent = '距离开售还有';
      $('#cdTimer').style.display = 'flex';
      $('#autoGrab').checked = true;
      $('#autoRetry').checked = true;
      tickCountdown(ev.saleAt, btn);
    } else {
      clearInterval(cdTimer);
      $('.cd-label').textContent = '本场次已开售，拼手速！';
      $('#cdTimer').style.display = 'none';
      btn.disabled = false;
      btn.textContent = '立即抢购 🔥';
    }
  }

  function tickCountdown(saleAt, btn) {
    const fmt = n => String(n).padStart(2, '0');
    const update = () => {
      const diff = saleAt - Date.now();
      if (diff <= 0) {
        clearInterval(cdTimer);
        $('#cdH').textContent = '00';
        $('#cdM').textContent = '00';
        $('#cdS').textContent = '00.0';
        if ($('#autoGrab').checked) {
          toast('开售！自动抢票已启动');
          startGrab();
        } else {
          btn.disabled = false;
          btn.textContent = '立即抢购 🔥';
        }
        return;
      }
      const h = Math.floor(diff / 3.6e6);
      const m = Math.floor(diff % 3.6e6 / 6e4);
      const s = (diff % 6e4) / 1000;
      $('#cdH').textContent = fmt(h);
      $('#cdM').textContent = fmt(m);
      $('#cdS').textContent = s.toFixed(1).padStart(4, '0');
    };
    update();
    cdTimer = setInterval(update, 100);
  }

  $('#cdBtn').addEventListener('click', () => { startGrab(); });

  // 抢票引擎（模拟）
  async function startGrab() {
    const token = ++grabToken;
    clearInterval(cdTimer);
    $('#grabCountdown').hidden = true;
    $('#grabRunning').hidden = false;
    $('#queueBox').hidden = true;
    $('#retryTip').hidden = true;

    const rate = { lots: 0.55, few: 0.28, none: 0 };
    let usedFallback = false;

    for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
      if (token !== grabToken) return;

      // 阶段1：提交
      $('#runStage').textContent = attempt === 0 ? '正在提交订单请求…' : `第 ${attempt} 次重试，重新提交…`;
      $('#runDetail').textContent = '已预选观演人，极速通道已建立';
      await sleep(500 + Math.random() * 500);
      if (token !== grabToken) return;

      // 阶段2：排队
      $('#runStage').textContent = '排队进入选座系统…';
      const qBox = $('#queueBox');
      qBox.hidden = false;
      let pos = 200 + Math.floor(Math.random() * 400);
      const start = pos;
      $('#queuePos').textContent = pos;
      $('#queueBar').style.width = '4%';
      const qDuration = attempt === 0 ? 2200 : 1200;
      const qStart = Date.now();
      while (Date.now() - qStart < qDuration) {
        if (token !== grabToken) return;
        await sleep(120);
        pos = Math.max(1, pos - Math.ceil(pos * 0.12) - Math.floor(Math.random() * 20));
        $('#queuePos').textContent = pos;
        $('#queueBar').style.width = Math.min(96, (1 - pos / start) * 100) + '%';
      }
      $('#queueBar').style.width = '100%';
      await sleep(300);
      if (token !== grabToken) return;

      // 阶段3：判定
      let tier = cur.price;
      let ok = Math.random() < rate[tier.stock];

      // 目标票档失败 → 自动调剂相邻票档
      if (!ok && cur.fallback) {
        const alt = cur.ev.prices
          .filter(p => p.stock !== 'none' && p.id !== tier.id)
          .sort((a, b) => Math.abs(a.price - tier.price) - Math.abs(b.price - tier.price))[0];
        if (alt) {
          $('#runStage').textContent = '目标票档已满，自动调剂相邻票档…';
          $('#runDetail').textContent = `正在尝试 ${alt.label} ¥${alt.price}`;
          await sleep(700);
          if (token !== grabToken) return;
          if (Math.random() < rate[alt.stock] * 0.9) {
            ok = true;
            tier = alt;
            usedFallback = true;
          }
        }
      }

      if (ok) {
        cur.finalPrice = tier;
        $('#runStage').textContent = '锁票成功，正在生成订单…';
        $('#runDetail').textContent = '出票中，请稍候';
        await sleep(800);
        if (token !== grabToken) return;
        return finishGrab(true, tier, usedFallback);
      }

      // 失败：重试 or 结束
      if (attempt < MAX_RETRY && $('#autoRetry').checked) {
        const tip = $('#retryTip');
        tip.hidden = false;
        tip.textContent = `余票紧张，第 ${attempt + 1} 次重试未成功，系统将自动继续抢票（剩余 ${MAX_RETRY - attempt} 次）`;
        $('#runStage').textContent = '抢票重试中…';
        qBox.hidden = true;
        await sleep(600 + Math.random() * 500);
      } else {
        qBox.hidden = true;
        return finishGrab(false, null, false);
      }
    }
  }

  function finishGrab(success, tier, usedFallback) {
    const wrap = $('#resultWrap');
    if (success) {
      const vs = viewers.filter(v => cur.viewerIds.includes(v.id));
      const order = {
        id: 'MQ' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 90 + 10),
        eventId: cur.ev.id,
        title: cur.ev.title,
        venue: cur.ev.venue,
        session: cur.session.name,
        priceLabel: tier.label,
        price: tier.price,
        count: vs.length,
        viewerNames: vs.map(v => v.name),
        total: tier.price * vs.length,
        createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
        fallback: usedFallback,
        status: '待支付'
      };
      orders.unshift(order);
      saveOrders();

      wrap.innerHTML = `
        <div class="r-ico">🎉</div>
        <div class="r-title ok">抢票成功！</div>
        <div class="r-desc">座位已为你锁定，请在 15 分钟内完成支付<br/>（演示环境，不会产生真实交易）</div>
        <div class="r-order">
          <div class="ro-row"><span class="ro-label">演出</span><span>${esc(order.title)}</span></div>
          <div class="ro-row"><span class="ro-label">场次</span><span>${esc(order.session)}</span></div>
          <div class="ro-row"><span class="ro-label">票档</span><span>${esc(order.priceLabel)} ¥${order.price}${order.fallback ? '（调剂）' : ''}</span></div>
          <div class="ro-row"><span class="ro-label">数量</span><span>${order.count} 张</span></div>
          <div class="ro-row"><span class="ro-label">观演人</span><span>${esc(order.viewerNames.join('、'))}</span></div>
          <div class="ro-row"><span class="ro-label">订单号</span><span>${order.id}</span></div>
          <div class="ro-row ro-total"><span class="ro-label">合计</span><b>¥${order.total}</b></div>
        </div>
        <div class="r-actions">
          <button class="btn-ghost" id="rHome">返回首页</button>
          <button class="btn-primary" id="rOrders">查看订单</button>
        </div>`;
      $('#rHome').onclick = () => go('home');
      $('#rOrders').onclick = () => { renderMine(); go('mine'); };
    } else {
      wrap.innerHTML = `
        <div class="r-ico">😢</div>
        <div class="r-title fail">很遗憾，没抢到</div>
        <div class="r-desc">本场次购票人数过多，余票已被抢空<br/>别灰心，以下方式能提高成功率：</div>
        <div class="r-order" style="text-align:left">
          <div class="ro-row"><span class="ro-label">①</span><span>开售前进入抢票页，开启「自动抢票」</span></div>
          <div class="ro-row"><span class="ro-label">②</span><span>勾选「接受相邻票档调剂」</span></div>
          <div class="ro-row"><span class="ro-label">③</span><span>提前添加多位观演人，保持网络通畅</span></div>
          <div class="ro-row"><span class="ro-label">④</span><span>关注回流票（开票后 15 分钟内常有未支付订单释放）</span></div>
        </div>
        <div class="r-actions">
          <button class="btn-ghost" id="rBack">返回详情</button>
          <button class="btn-primary" id="rRetry">再抢一次</button>
        </div>`;
      $('#rBack').onclick = () => go('detail');
      $('#rRetry').onclick = () => openGrab();
    }
    go('result');
  }

  /* ---------- 我的 ---------- */
  function renderMine() {
    $('#statOrders').textContent = orders.length;
    $('#statViewers').textContent = viewers.length;
    const list = $('#orderList');
    if (orders.length === 0) {
      list.innerHTML = '<div class="oc-empty">还没有订单，去首页抢一张吧～</div>';
    } else {
      list.innerHTML = orders.map(o => `
        <div class="order-card">
          <div class="oc-top"><span class="oc-status ${o.status === '已支付' ? 'paid' : ''}">${o.status}</span><span style="color:#bbb;font-size:11px">${esc(o.createdAt)}</span></div>
          <div class="oc-title">${esc(o.title)}</div>
          <div class="oc-meta">
            ${esc(o.session)}<br/>
            ${esc(o.priceLabel)} ¥${o.price} × ${o.count} 张 · ${esc(o.viewerNames.join('、'))}<br/>
            订单号：${o.id}
          </div>
          ${o.status === '待支付'
            ? `<button class="btn-primary" style="width:100%;padding:10px;border-radius:18px;margin-top:10px;font-size:14px" data-pay="${o.id}">立即支付 ¥${o.total}（模拟）</button>`
            : ''}
        </div>`).join('');
    }
  }

  $('#orderList').addEventListener('click', e => {
    const btn = e.target.closest('[data-pay]');
    if (!btn) return;
    const o = orders.find(x => x.id === btn.dataset.pay);
    if (o) { o.status = '已支付'; saveOrders(); renderMine(); toast('支付成功！演出前将推送取票通知（模拟）'); }
  });

  $('#mineViewersRow').onclick = () => { renderViewerManage(); go('viewers'); };
  $('#mineOrdersRow').onclick = () => { renderMine(); toast('订单列表见下方'); $('#page-mine').scrollTop = 400; };
  $('#mineTipRow').onclick = () => {
    $('#tipTitle').textContent = '抢票技巧';
    $('#tipBody').innerHTML = `
      <li>提前在「观演人管理」添加好实名信息，开票时不用临时填写</li>
      <li>开售前 1-2 分钟进入抢票页，保持屏幕常亮，开启「开售自动抢票」</li>
      <li>勾选「接受相邻票档调剂」，成功率可提升数倍</li>
      <li>确保网络通畅，优先使用 5G 或稳定 Wi-Fi</li>
      <li>开票后 10-15 分钟关注回流票（未支付订单会被释放）</li>
      <li><b>本应用为模拟演示，所有演出、订单均为虚构，不产生真实交易</b></li>`;
    $('#tipModal').hidden = false;
  };
  $('#tipOk').onclick = () => { $('#tipModal').hidden = true; };

  /* ---------- 观演人管理 ---------- */
  function renderViewerManage() {
    const list = $('#viewerManageList');
    list.innerHTML = viewers.length ? viewers.map(v => `
      <div class="vm-card">
        <div class="vm-info">
          <b>${esc(v.name)}</b><span class="vm-tag">已实名</span>
          <p>${maskId(v.idCard)} · ${maskPhone(v.phone)}</p>
        </div>
        <button class="vm-del" data-del="${v.id}">删除</button>
      </div>`).join('')
      : '<div class="oc-empty">还没有观演人，请添加</div>';
  }
  $('#viewerManageList').addEventListener('click', e => {
    const btn = e.target.closest('[data-del]');
    if (!btn) return;
    const id = Number(btn.dataset.del);
    viewers = viewers.filter(v => v.id !== id);
    saveViewers();
    renderViewerManage();
    toast('已删除');
  });
  $('#addViewerBtn').onclick = openViewerModal;

  function openViewerModal() {
    $('#vName').value = '';
    $('#vIdCard').value = '';
    $('#vPhone').value = '';
    $('#viewerModal').hidden = false;
  }
  $('#vCancel').onclick = () => { $('#viewerModal').hidden = true; };
  $('#vSave').onclick = () => {
    const name = $('#vName').value.trim();
    const idCard = $('#vIdCard').value.trim().toUpperCase();
    const phone = $('#vPhone').value.trim();
    if (name.length < 2) return toast('请输入真实姓名（至少 2 个字）');
    if (!/^\d{17}[\dX]$/.test(idCard)) return toast('请输入正确的 18 位身份证号');
    if (!/^1\d{10}$/.test(phone)) return toast('请输入正确的 11 位手机号');
    if (viewers.some(v => v.idCard === idCard)) return toast('该观演人已存在');
    viewers.push({ id: Date.now(), name, idCard, phone });
    saveViewers();
    $('#viewerModal').hidden = true;
    toast('观演人添加成功');
    if ($('#page-viewers').classList.contains('active')) renderViewerManage();
    if (cur) renderViewerChips();
  };

  /* ---------- Tab ---------- */
  $$('.tab').forEach(t => t.addEventListener('click', () => {
    $$('.tab').forEach(x => x.classList.remove('on'));
    t.classList.add('on');
    const name = t.dataset.tab;
    if (name === 'mine') renderMine();
    navStack.length = 0;
    navStack.push(name);
    go(name);
  }));

  /* ---------- 启动 ---------- */
  // 海报加载失败时显示兜底样式
  document.addEventListener('error', e => {
    if (e.target.tagName === 'IMG' && e.target.parentElement) {
      e.target.parentElement.classList.add('img-fallback');
    }
  }, true);

  renderHome();
})();
