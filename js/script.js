/* =========================================================
   TODAY DATE — Project Landing Page Script
   ※ 이 파일의 시간표/흐름/계산기는 모두 "시연용"입니다.
     실제 예약·결제 API와 연결되어 있지 않습니다.
   ========================================================= */
(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Header: scroll state ---------- */
  var header = $('#siteHeader');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile navigation ---------- */
  var nav = $('#siteNav');
  var toggle = $('#navToggle');

  function setNav(open) {
    if (!nav || !toggle) return;
    if (open) {
      var bottom = header.getBoundingClientRect().bottom;
      nav.style.setProperty('--nav-top', Math.max(0, bottom) + 'px');
    }
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      setNav(toggle.getAttribute('aria-expanded') !== 'true');
    });
  }
  $$('#siteNav a').forEach(function (a) {
    a.addEventListener('click', function () { setNav(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav && nav.classList.contains('is-open')) {
      setNav(false);
      toggle.focus();
    }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900 && nav && nav.classList.contains('is-open')) setNav(false);
  });

  /* ---------- Active nav link on scroll ---------- */
  var navLinks = $$('.nav__link');
  var sectionMap = {};
  navLinks.forEach(function (link) {
    var id = link.getAttribute('href').slice(1);
    var sec = document.getElementById(id);
    if (sec) sectionMap[id] = link;
  });
  // 예약 시연 섹션은 '서비스 소개' 흐름에 포함, 그 외 섹션은 가장 가까운 메뉴로 매핑
  var aliasMap = { problem: null, booking: 'solution', after: 'deposit', trust: 'business', cta: null };

  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        var key = Object.prototype.hasOwnProperty.call(aliasMap, id) ? aliasMap[id] : id;
        navLinks.forEach(function (l) { l.classList.remove('is-active'); l.removeAttribute('aria-current'); });
        if (key && sectionMap[key]) {
          sectionMap[key].classList.add('is-active');
          sectionMap[key].setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = $$('.reveal');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el, i) {
      // 같은 그리드 내 카드에 약간의 순차 지연
      var parent = el.parentElement;
      var siblings = parent ? Array.prototype.filter.call(parent.children, function (c) { return c.classList.contains('reveal'); }) : [];
      var idx = siblings.indexOf(el);
      if (idx > 0) el.style.transitionDelay = Math.min(idx * 80, 400) + 'ms';
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* =========================================================
     DEMO — Time-based booking table (시연용 데이터)
     ========================================================= */
  var STATUS = {
    available: { label: '예약 가능', badge: 'available' },
    progress:  { label: '매칭 진행 중', badge: 'progress' },
    matched:   { label: '매칭 완료', badge: 'matched' },
    closed:    { label: '예약 마감', badge: 'closed' }
  };

  // 시연용 예시 데이터 — 실제 예약 현황이 아닙니다.
  var DEMO_DATA = {
    seongsu: { name: '성수', slots: ['closed', 'matched', 'available', 'progress', 'available', 'matched'] },
    gangnam: { name: '강남', slots: ['matched', 'progress', 'matched', 'available', 'closed', 'available'] },
    hongdae: { name: '홍대', slots: ['available', 'matched', 'closed', 'closed', 'progress', 'available'] }
  };
  var TIMES = ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

  var FLOW_STEPS = [
    { title: '시간대 신청 접수', desc: '선택한 시간대로 신청이 접수됩니다. 이 단계에서는 결제를 요청하지 않습니다.' },
    { title: '매칭 진행 중', desc: '운영자가 상대방의 일정과 만남 의사를 확인합니다. 결제 요청 없음.' },
    { title: '매칭 확정 안내', desc: '양쪽 참가자의 의사가 모두 확인되어 매칭이 확정되었다는 안내를 받습니다.' },
    { title: '예약금 결제 안내', desc: '매칭이 확정된 참가자에게만 예약금 결제 안내가 제공됩니다. (본 페이지에는 결제 기능이 연결되어 있지 않습니다.)' },
    { title: '최종 예약 확정 · 장소 안내', desc: '예약금 결제가 완료된 경우에만 최종 예약이 확정되고 장소가 안내됩니다. (시연 예시)' }
  ];

  var region = 'seongsu';
  var selected = null;
  var flowIndex = -1;

  var slotGrid = $('#slotGrid');
  var detail = $('#slotDetail');
  var dateEl = $('#bookingDate');

  if (dateEl) {
    try {
      var d = new Date();
      var days = ['일', '월', '화', '수', '목', '금', '토'];
      dateEl.textContent = (d.getMonth() + 1) + '월 ' + d.getDate() + '일 (' + days[d.getDay()] + ') · 오늘 예시';
    } catch (e) { /* noop */ }
  }

  function addMinutes(time, min) {
    var p = time.split(':');
    var total = parseInt(p[0], 10) * 60 + parseInt(p[1], 10) + min;
    var h = Math.floor(total / 60), m = total % 60;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }

  function renderSlots() {
    if (!slotGrid) return;
    var data = DEMO_DATA[region];
    slotGrid.innerHTML = '';
    TIMES.forEach(function (t, i) {
      var st = data.slots[i];
      var info = STATUS[st];
      var wrap = document.createElement('div');
      wrap.setAttribute('role', 'listitem');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'slot slot--' + st;
      btn.dataset.index = String(i);
      btn.setAttribute('aria-pressed', selected === i ? 'true' : 'false');
      btn.setAttribute('aria-label', t + ', ' + info.label + ' (시연용)');
      btn.innerHTML =
        '<span><span class="slot__time">' + t + '</span>' +
        '<span class="slot__range">대화 ' + t + '–' + addMinutes(t, 40) + '</span></span>' +
        '<span class="slot__status">' + info.label + '</span>';
      btn.addEventListener('click', function () { selectSlot(i); });
      wrap.appendChild(btn);
      slotGrid.appendChild(wrap);
    });
  }

  function selectSlot(i) {
    selected = i;
    flowIndex = -1;
    $$('.slot', slotGrid).forEach(function (b) {
      b.setAttribute('aria-pressed', b.dataset.index === String(i) ? 'true' : 'false');
    });
    renderDetail();
  }

  function renderDetail() {
    if (!detail) return;
    if (selected === null) {
      detail.innerHTML = '<p class="slot-detail__placeholder">시간대를 선택하면 해당 상태의 의미와 다음 진행 단계를 확인할 수 있습니다.</p>';
      return;
    }
    var t = TIMES[selected];
    var st = DEMO_DATA[region].slots[selected];
    var info = STATUS[st];
    var regionName = DEMO_DATA[region].name;

    var desc = '', pay = '', action = '';

    if (st === 'available') {
      desc = '상대방 확보가 확인된 시간대입니다. 신청하면 양쪽 참가자의 만남 의사를 확인한 뒤 매칭이 진행됩니다.';
      pay = '<strong>현재 단계:</strong> 결제 요청 없음 — 예약금은 매칭이 확정된 후에만 안내됩니다.';
      if (flowIndex < 0) {
        action = '<button type="button" class="btn btn--primary" data-flow="start">신청 흐름 시연하기</button>';
      }
    } else if (st === 'progress') {
      desc = '다른 참가자가 신청하여 양측의 일정과 만남 의사를 확인하고 있는 시간대입니다.';
      pay = '<strong>결제 상태:</strong> 매칭 확정 전이므로 결제 요청 없음.';
      action = '<button type="button" class="btn" disabled>매칭 확인 중인 시간대</button>';
    } else if (st === 'matched') {
      desc = '양쪽 참가자의 의사가 확인되어 매칭이 확정된 시간대입니다.';
      pay = '<strong>결제 단계:</strong> 매칭 확정 이후 참가자에게 예약금 결제 안내가 제공됩니다.';
      action = '<button type="button" class="btn" disabled>이미 매칭된 시간대</button>';
    } else {
      desc = '예약이 마감된 시간대입니다. 다른 시간대나 지역을 확인해 주세요.';
      pay = '<strong>안내:</strong> 마감된 시간대에는 신청 및 결제가 진행되지 않습니다.';
      action = '<button type="button" class="btn" disabled>예약 마감</button>';
    }

    var flowHtml = '';
    if (st === 'available' && flowIndex >= 0) {
      flowHtml = '<div class="flow"><ol class="flow__list">' +
        FLOW_STEPS.map(function (s, i) {
          var cls = i < flowIndex ? 'is-done' : (i === flowIndex ? 'is-current' : '');
          return '<li class="flow__item ' + cls + '"><span><strong>' + (i + 1) + '. ' + s.title + '</strong>' +
            (i === flowIndex ? '<br>' + s.desc : '') + '</span></li>';
        }).join('') +
        '</ol><p class="flow__note">시연용 흐름입니다. 실제 신청·결제는 이루어지지 않습니다.</p></div>';

      if (flowIndex < FLOW_STEPS.length - 1) {
        action = '<button type="button" class="btn btn--primary" data-flow="next">다음 단계 보기 (' + (flowIndex + 2) + '/' + FLOW_STEPS.length + ')</button>';
      } else {
        action = '<button type="button" class="btn btn--ghost" data-flow="reset">처음부터 다시 보기</button>';
      }
      pay = flowIndex >= 3
        ? '<strong>결제 단계:</strong> 매칭이 확정된 이후에만 도달하는 단계입니다. 본 시연에서는 실제 결제가 진행되지 않습니다.'
        : '<strong>현재 단계:</strong> 결제 요청 없음 — 매칭 확정 전입니다.';
    }

    detail.innerHTML =
      '<div class="slot-detail__top">' +
        '<span class="slot-detail__time">' + t + '</span>' +
        '<span class="slot-detail__badge slot-detail__badge--' + info.badge + '">' + info.label + '</span>' +
      '</div>' +
      '<p class="slot-detail__meta">' + regionName + ' · 1:1 대화 ' + t + '–' + addMinutes(t, 40) + ' · 시연용 예시</p>' +
      (flowHtml || '<p class="slot-detail__desc">' + desc + '</p>') +
      '<p class="slot-detail__pay">' + pay + '</p>' +
      '<div class="slot-detail__actions">' + action + '</div>';
  }

  if (detail) {
    detail.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-flow]');
      if (!btn) return;
      var type = btn.getAttribute('data-flow');
      if (type === 'start') flowIndex = 0;
      else if (type === 'next') flowIndex = Math.min(flowIndex + 1, FLOW_STEPS.length - 1);
      else if (type === 'reset') flowIndex = 0;
      renderDetail();
      var next = detail.querySelector('[data-flow]');
      if (next) next.focus();
    });
  }

  $$('#regionChips .chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      region = chip.getAttribute('data-region');
      $$('#regionChips .chip').forEach(function (c) {
        var on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', String(on));
      });
      selected = null;
      flowIndex = -1;
      renderSlots();
      renderDetail();
    });
  });

  renderSlots();
  // 발표 시 바로 보여줄 수 있도록 첫 '예약 가능' 시간대를 기본 선택
  var firstAvailable = DEMO_DATA[region].slots.indexOf('available');
  if (firstAvailable > -1) selectSlot(firstAvailable);

  /* =========================================================
     DEMO — Assumption calculator (가정치)
     ========================================================= */
  var calcIds = ['calcPrice', 'calcSlots', 'calcTables', 'calcRate', 'calcDays'];
  var calcInputs = calcIds.map(function (id) { return document.getElementById(id); });
  var outMeet = $('#calcMeetings');
  var outRev = $('#calcRevenue');

  function num(el) {
    var v = parseFloat(el && el.value);
    if (!isFinite(v) || v < 0) return 0;
    var max = el.max ? parseFloat(el.max) : Infinity;
    return Math.min(v, max);
  }

  function calc() {
    if (!outMeet || !outRev || calcInputs.some(function (x) { return !x; })) return;
    var price = num(calcInputs[0]);
    var slots = num(calcInputs[1]);
    var tables = num(calcInputs[2]);
    var rate = num(calcInputs[3]) / 100;
    var daysN = num(calcInputs[4]);
    var meetings = Math.round(slots * tables * rate * daysN);
    var revenue = meetings * 2 * price;
    outMeet.textContent = meetings.toLocaleString('ko-KR') + '회';
    outRev.textContent = revenue.toLocaleString('ko-KR') + '원';
  }
  calcInputs.forEach(function (el) { if (el) el.addEventListener('input', calc); });
  calc();

  /* ---------- Footer year ---------- */
  var y = $('#year');
  if (y) y.textContent = String(new Date().getFullYear());

  /* =========================================================
     PRESENTER ASSISTANT & FULLSCREEN ENGINE
     ========================================================= */

  // 1. All 10 Presentation Sections Data & Speaker Notes
  var PRESENTER_SCRIPTS = [
    {
      id: 'hero',
      num: '01',
      name: 'HERO',
      label: '서비스 개요 & 슬로건',
      keyPoints: [
        '“오늘 예약하고, 오늘 만나는 새로운 인연” 슬로건을 명확히 전달',
        '3대 핵심 요약: 당일 시간대 선택, 1:1 약 40분 대화, 매칭 확정 후 결제',
        '미용실 예약처럼 당일 빈 시간을 고르는 직관적 콘셉트 강조'
      ],
      script: '안녕하십니까. 당일 예약형 오프라인 1:1 소개팅 서비스, "TODAY DATE"의 발표를 시작하겠습니다. 저희 서비스의 핵심 슬로건은 "오늘 예약하고, 오늘 만나는 새로운 인연"입니다. 기존 소개팅의 번거로운 일정 조율과 오랜 기다림을 줄이고, 미용실을 예약하듯 원하는 시간에 새로운 인연을 만날 수 있도록 돕는 혁신적인 당일 예약 플랫폼 아이디어입니다.',
      qa: '<strong>Q. 왜 당일 예약인가요?</strong><br>A. 20대 대학생과 사회초년생은 일정이 유동적입니다. 며칠 전부터 약속을 잡고 기다리는 번거로움 대신, 당일 비어있는 저녁 시간대에 가볍고 부담 없이 만남을 가질 수 있는 즉각성을 충족하고자 했습니다.'
    },
    {
      id: 'problem',
      num: '02',
      name: 'THE PROBLEM',
      label: '기존 소개팅의 4대 불편함',
      keyPoints: [
        '정해진 행사 일정의 불편함 & 긴 대기 시간',
        '여러 명을 짧게 만나는 방식의 피로감',
        '가장 치명적인 문제: “상대가 정해지지도 않았는데 선결제하는 부담”'
      ],
      script: '새로운 사람을 만나고 싶은 니즈는 언제나 큽니다. 하지만 기존 방식들을 보면 주최 측이 정해둔 날짜에 내 일정을 맞춰야 했고, 매칭까지 며칠에서 몇 주를 기다려야 했습니다. 또한 여러 명을 연달아 만나는 방식은 한 사람에게 집중하기 어려워 극심한 피로감을 줍니다. 무엇보다 "상대가 확정되기도 전에 돈부터 내야 하는 구조"가 참가자들에게 큰 심리적 장벽이었습니다.',
      qa: '<strong>Q. 기존 데이팅 앱들과의 차이는 무엇인가요?</strong><br>A. 기존 앱은 온라인 채팅에 머물다 만남이 흐지부지되거나 허위 프로필 피로감이 큽니다. TODAY DATE는 당일 확정된 오프라인 만남을 목표로 하며, 사전 결제 강요 없이 안전하게 진행됩니다.'
    },
    {
      id: 'solution',
      num: '03',
      name: 'OUR SOLUTION',
      label: '세 가지 핵심 해결 가치',
      keyPoints: [
        'Value 01: 당일 예약 — 오늘 가능한 시간을 골라 신청',
        'Value 02: 1:1 집중 대화 — 단 한 명과 약 40분 동안 온전한 몰입',
        'Value 03: 매칭 완료 후 예약금 — 상대가 실제로 확정된 뒤에만 결제'
      ],
      script: 'TODAY DATE는 이 문제를 세 가지 핵심 가치로 해결합니다. 첫째, 당일 예약입니다. 내가 가능한 시간대를 직접 보고 선택합니다. 둘째, 1:1 집중 대화입니다. 다대다의 소모적인 만남이 아니라, 단 한 사람과 약 40분 동안 진솔하게 대화합니다. 그리고 셋째, 가장 중요한 핵심인 "매칭 완료 후 예약금"입니다. 상대방과의 만남이 실제로 확정된 뒤에만 예약금을 결제합니다. "예약은 간편하게, 결제는 매칭이 완료된 후에"가 저희의 확고한 원칙입니다.',
      qa: '<strong>Q. 40분이라는 시간은 어떻게 정해졌나요?</strong><br>A. 첫 만남에서 상대방과의 기본 호감과 결을 파악하기에 가장 적절하고 피로도가 낮은 황금 시간대입니다. 서로 마음에 들면 함께 나가 자유롭게 연장할 수 있어 부담이 없습니다.'
    },
    {
      id: 'booking',
      num: '04',
      name: 'TIME-BASED BOOKING',
      label: '시간제 소개팅 예약 시연',
      keyPoints: [
        '★ 발표 시연 하이라이트: 성수 16:00 슬롯 클릭 후 "신청 흐름 시연하기" 진행',
        '상대방이 확보된 시간만 "예약 가능"으로 열림',
        '1시간 단위 = 40분 대화 + 20분 운영(입장/퇴장/정리)'
      ],
      script: '지금 보시는 화면이 바로 미용실 예약 시스템에서 영감을 얻은 시간제 예약 UI입니다. (화면의 16:00 슬롯을 클릭하며) 성수, 강남, 홍대 등 지역과 오늘 날짜를 선택하면 시간대별 상태가 나타납니다. 여기서 "신청 흐름 시연하기"를 눌러보겠습니다. 1단계 신청 접수, 2단계 매칭 진행, 3단계 매칭 확정 안내까지 "결제 요청 없음" 상태가 유지됩니다. 상대가 확정된 4단계에 이르러서야 예약금 안내가 제공됩니다. 또한 1시간 슬롯 중 40분은 대화, 나머지 20분은 퇴장 및 환기·안내에 사용하여 쾌적하게 운영됩니다.',
      qa: '<strong>Q. 만약 상대방이 안 모이면 시간표는 어떻게 되나요?</strong><br>A. 상대방이 확보되지 않은 시간은 결코 "예약 가능"으로 열지 않습니다. 매칭 확정 전에는 어떤 결제도 발생하지 않으므로 사용자의 금전적 피해가 원천 차단됩니다.'
    },
    {
      id: 'how',
      num: '05',
      name: 'HOW IT WORKS',
      label: '5단계 서비스 이용 절차',
      keyPoints: [
        'STEP 01 시간 선택 → STEP 02 매칭 진행 → STEP 03 매칭 확정 → STEP 04 예약금 결제 → STEP 05 오프라인 만남',
        '결제 시점이 매칭 확정 "이후"라는 점을 다시 한번 각인',
        '투명하고 정직한 운영 프로세스 강조'
      ],
      script: '전체 이용 절차는 다섯 단계로 명확합니다. 1단계에서 원하는 시간대를 선택하고, 2단계에서 운영자가 조건을 확인해 상대를 연결합니다. 3단계에서 양쪽 참가자의 만남 의사를 최종 확인하여 매칭을 확정합니다. 그리고 4단계에서 매칭 완료된 참가자에게만 예약금 결제를 안내합니다. 결제가 완료되면 장소가 안내되고, 5단계에서 지정된 장소에서 40분간 설레는 오프라인 만남을 가집니다.',
      qa: '<strong>Q. 예약금을 결제하지 않는 노쇼 참가자가 나오면 어떻게 대처하나요?</strong><br>A. 매칭 확정 후 일정 시간 내 예약금 미결제 시 매칭이 자동 취소되며, 차순위 대기자에게 기회가 주어지거나 사전 안내를 통해 상대방 일정을 재조정합니다.'
    },
    {
      id: 'deposit',
      num: '06',
      name: 'MATCH FIRST, PAY LATER',
      label: '예약금 시스템 & 정책',
      keyPoints: [
        '매칭 전: 결제 요청 없음 vs 매칭 후: 예약금 결제 단계',
        '실제 운영 전이므로 금액은 "예약금 정책 준비 중"으로 솔직하게 명시',
        '취소/환불 기준 및 운영자 사정 취소 시 처리 기준 투명 공개'
      ],
      script: '저희 비즈니스의 신뢰 핵심인 "Match First, Pay Later" 정책입니다. 좌측의 매칭 전 단계에서는 일정과 상대 확보, 의사 확인만 진행하며 결제 요청이 전혀 없습니다. 양측 의사가 확인되어 가운데 "매칭 확정" 게이트를 통과한 경우에만 예약금 결제 단계로 진입합니다. 현재 아이디어 단계이므로 확정되지 않은 금액을 임의 표기하지 않고 "예약금 정책 준비 중"으로 투명하게 안내하고 있으며, 추후 전체 이용료 대비 예약금 비중과 환불 규정을 명확히 수립할 것입니다.',
      qa: '<strong>Q. 예약금은 환불이 가능한가요?</strong><br>A. 만남 일정 기준 일정 시간 전 취소 시 전액 환불 규정을 마련할 것이며, 특히 상대방의 노쇼나 운영 측 사정으로 만남이 취소되는 경우 100% 즉시 환불 및 보상 방안을 둘 계획입니다.'
    },
    {
      id: 'after',
      num: '07',
      name: 'AFTER THE DATE',
      label: '소개팅 이후의 두 가지 선택',
      keyPoints: [
        'Case A (호감): 자유로운 2차 데이트 & 동의 하에 연락처 교환',
        'Case B (비호감): 정중한 만남 종료 & 다음 기회 재신청',
        '재예약 시에도 처음과 동일하게 매칭 완료 전 결제 없음'
      ],
      script: '40분의 공식 소개팅이 끝나면 두 사람은 편안하게 다음을 결정합니다. Case A, 서로 마음에 들면 합의하에 자리를 옮겨 자유롭게 데이트를 이어가고 연락처를 교환합니다. 연락처 교환은 반드시 양측 동의가 있을 때만 진행됩니다. Case B, 서로 맞지 않더라도 부담 없이 인사하고 헤어지면 됩니다. 언제든 다시 원하는 시간대를 골라 새로운 매칭을 신청할 수 있습니다. 한 번의 만남이 끝나도 새로운 기회는 항상 열려 있습니다.',
      qa: '<strong>Q. 현장에서 불쾌한 일을 겪거나 억지로 연락처를 요구하면 어떻게 하나요?</strong><br>A. 제9섹션의 안전 수칙에 명시된 바와 같이 상호 동의 없는 연락처 요구는 금지되며, 문제 발생 시 즉각적인 신고 채널과 이용 제한 조치를 취합니다.'
    },
    {
      id: 'business',
      num: '08',
      name: 'BUSINESS MODEL',
      label: '수익·비용 구조 및 시뮬레이션',
      keyPoints: [
        '수익: 1회당 이용료 기반 (매칭 완료 후 예약금 + 잔여 이용료)',
        '비용: 시간제 대관료, 마케팅비, PG수수료, 운영 인건비',
        '가정치 계산기를 직접 조작하며 비즈니스 확장성 증명'
      ],
      script: 'TODAY DATE의 사업 모델은 시간 단위로 운영되는 투명한 구조입니다. 수익은 1회당 이용료를 기반으로 하며, 비용은 시간제 공간 대관료, 홍보비, 결제 수수료 등으로 구성됩니다. 아래 "가정치 시뮬레이션 계산기"를 보시면, 1인 이용료 3만 원, 하루 6개 시간대, 2개 테이블, 매칭 성사율 60%를 가정했을 때 월 약 144회의 만남과 860만 원 상당의 거래액이 도출됩니다. 이는 가정치이며, 회계상 수익 인식은 실제 만남 제공 시점에 맞추어 관리할 것입니다.',
      qa: '<strong>Q. 공간 대관료 부담이 크지 않을까요?</strong><br>A. 상시 고정 임대 대신 비피크 시간대 유휴 카페나 복합 문화공간과의 제휴 대관 모델을 활용하여 고정비 리스크를 최소화할 계획입니다.'
    },
    {
      id: 'trust',
      num: '09',
      name: 'TRUST & SAFETY',
      label: '신뢰와 안전 & 사전 확인 사항',
      keyPoints: [
        '성인 대상, 참가자 의사 확인, 개인정보 보호, 동의 없는 연락처 공유 금지',
        '신고 요건, 청약철회, 대관 계약 등 실제 운영 전 확인 필요 사항 솔직히 기재',
        '신뢰할 수 있는 창업팀의 준비된 자세 어필'
      ],
      script: '처음 만나는 자리일수록 신뢰가 최우선입니다. 만 19세 이상 성인만 이용할 수 있도록 설계하고, 만남 의사 철저 확인, 개인정보 최소 제공, 동의 없는 연락처 공유 금지 등 6대 신뢰 원칙을 세웠습니다. 또한 본 프로젝트는 아이디어 단계이므로, 결혼중개업 법령 신고 요건, 개인정보 수집 동의, 전자상거래 환불 규정 등 사업 개시 전 전문가 검토를 거쳐야 할 항목들을 사전에 충실히 식별해 두고 있습니다.',
      qa: '<strong>Q. 결혼중개업법 등록 대상인가요?</strong><br>A. 소개 형태와 영리성 여부에 따라 국내 법령상 국내결혼중개업 신고 대상이 될 수 있습니다. 이에 관할 지자체 신고 기준과 자본금·보증보험 요건을 면밀히 검토하고 있습니다.'
    },
    {
      id: 'cta',
      num: '10',
      name: 'FINAL CTA',
      label: '마무리 및 질의응답',
      keyPoints: [
        '“오늘의 만남을, 더 간편하게” 브랜드 메시지 재각인',
        '실제 예약은 아직 개설되지 않았음을 다시 안내',
        '심사위원 및 청중을 향한 감사 인사와 Q&A 시작'
      ],
      script: '"오늘의 만남을, 더 간편하게." 원하는 시간을 선택하고, 매칭이 확정되면 설레는 오늘의 만남을 준비하는 서비스, TODAY DATE의 발표를 마칩니다. 심사위원 여러분의 소중한 질문과 조언을 부탁드립니다. 경청해 주셔서 감사합니다.',
      qa: '<strong>Q. 앞으로의 다음 단계 계획은 무엇인가요?</strong><br>A. 소규모 타겟 지역(성수동 인근 20대 대학생 및 직장인)을 중심으로 10쌍 규모의 클로즈드 파일럿 테스트를 진행하여 매칭 만족도와 실제 현장 피드백을 검증할 계획입니다.'
    }
  ];

  // 2. Fullscreen Management
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      var docEl = document.documentElement;
      var requestFs = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.msRequestFullscreen;
      if (requestFs) {
        requestFs.call(docEl).catch(function (err) {
          console.warn('전체화면 전환 실패:', err);
        });
      }
    } else {
      var exitFs = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
      if (exitFs) {
        exitFs.call(document).catch(function (err) {
          console.warn('전체화면 종료 실패:', err);
        });
      }
    }
  }

  function updateFullscreenUI() {
    var isFs = !!document.fullscreenElement;
    var enterIcons = $$('.icon-fs-enter, .dock-icon-fs-enter');
    var exitIcons = $$('.icon-fs-exit, .dock-icon-fs-exit');
    enterIcons.forEach(function (el) { el.style.display = isFs ? 'none' : 'block'; });
    exitIcons.forEach(function (el) { el.style.display = isFs ? 'block' : 'none'; });

    var headerFsText = $('#btnHeaderFullscreen .btn-presenter__text');
    if (headerFsText) headerFsText.textContent = isFs ? '전체화면 종료' : '전체화면';

    var dockFsBtn = $('#dockFullscreenToggle');
    if (dockFsBtn) dockFsBtn.classList.toggle('is-active', isFs);
  }

  document.addEventListener('fullscreenchange', updateFullscreenUI);
  document.addEventListener('webkitfullscreenchange', updateFullscreenUI);

  var btnHeaderFs = $('#btnHeaderFullscreen');
  var dockFsBtn = $('#dockFullscreenToggle');
  if (btnHeaderFs) btnHeaderFs.addEventListener('click', toggleFullscreen);
  if (dockFsBtn) dockFsBtn.addEventListener('click', toggleFullscreen);

  // 3. Presenter Section Navigation
  var currentSectionIndex = 0;

  function getSectionElement(idx) {
    if (idx < 0 || idx >= PRESENTER_SCRIPTS.length) return null;
    return document.getElementById(PRESENTER_SCRIPTS[idx].id);
  }

  function goToSection(idx) {
    if (idx < 0 || idx >= PRESENTER_SCRIPTS.length) return;
    currentSectionIndex = idx;
    var el = getSectionElement(idx);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    updatePresenterAssistantUI(idx);
  }

  function nextSection() {
    if (currentSectionIndex < PRESENTER_SCRIPTS.length - 1) {
      goToSection(currentSectionIndex + 1);
    }
  }

  function prevSection() {
    if (currentSectionIndex > 0) {
      goToSection(currentSectionIndex - 1);
    }
  }

  var btnPrevSection = $('#dockPrevSection');
  var btnNextSection = $('#dockNextSection');
  if (btnPrevSection) btnPrevSection.addEventListener('click', prevSection);
  if (btnNextSection) btnNextSection.addEventListener('click', nextSection);

  // 4. Presenter HUD UI & Synchronizer
  var hudElement = $('#presenterHUD');
  var hudBackdrop = $('#presenterHUDBackdrop');
  var hudCloseBtn = $('#presenterHUDClose');
  var btnHeaderAssistant = $('#btnHeaderAssistant');
  var dockAssistantBtn = $('#dockAssistantToggle');
  var dockIndicatorBtn = $('#dockSectionIndicator');
  var btnHeaderIR = $('#btnHeaderIR');
  var dockIRBtn = $('#dockIRDeckToggle');
  var hudTabScript = $('#hudTabScript');
  var hudTabIR = $('#hudTabIR');
  var hudViewScript = $('#hudViewScript');
  var hudViewIR = $('#hudViewIR');

  function isPresenterHUDOpen() {
    return hudElement && hudElement.classList.contains('is-open');
  }

  function setHUDMode(mode) {
    var isIR = mode === 'ir';
    if (hudTabScript) {
      hudTabScript.classList.toggle('is-active', !isIR);
      hudTabScript.setAttribute('aria-selected', String(!isIR));
    }
    if (hudTabIR) {
      hudTabIR.classList.toggle('is-active', isIR);
      hudTabIR.setAttribute('aria-selected', String(isIR));
    }
    if (hudViewScript) hudViewScript.classList.toggle('is-hidden', isIR);
    if (hudViewIR) hudViewIR.classList.toggle('is-active', isIR);
    if (btnHeaderIR) btnHeaderIR.classList.toggle('is-active', isIR && isPresenterHUDOpen());
    if (dockIRBtn) dockIRBtn.classList.toggle('is-active', isIR && isPresenterHUDOpen());
  }

  function openPresenterHUD(mode) {
    if (!hudElement) return;
    hudElement.classList.add('is-open');
    hudElement.setAttribute('aria-hidden', 'false');
    if (dockAssistantBtn) dockAssistantBtn.classList.add('is-active');
    if (btnHeaderAssistant) btnHeaderAssistant.classList.add('is-active');
    if (mode) setHUDMode(mode);
  }

  function closePresenterHUD() {
    if (!hudElement) return;
    hudElement.classList.remove('is-open');
    hudElement.setAttribute('aria-hidden', 'true');
    if (dockAssistantBtn) dockAssistantBtn.classList.remove('is-active');
    if (btnHeaderAssistant) btnHeaderAssistant.classList.remove('is-active');
    if (btnHeaderIR) btnHeaderIR.classList.remove('is-active');
    if (dockIRBtn) dockIRBtn.classList.remove('is-active');
  }

  function togglePresenterHUD(mode) {
    if (isPresenterHUDOpen()) {
      // If already open with different mode, switch mode instead of closing
      if (mode && hudTabIR) {
        var currentIsIR = hudTabIR.classList.contains('is-active');
        if ((mode === 'ir' && !currentIsIR) || (mode === 'script' && currentIsIR)) {
          setHUDMode(mode);
          return;
        }
      }
      closePresenterHUD();
    } else {
      openPresenterHUD(mode);
    }
  }

  if (hudTabScript) hudTabScript.addEventListener('click', function () { setHUDMode('script'); });
  if (hudTabIR) hudTabIR.addEventListener('click', function () { setHUDMode('ir'); });

  if (btnHeaderAssistant) btnHeaderAssistant.addEventListener('click', function () { togglePresenterHUD('script'); });
  if (dockAssistantBtn) dockAssistantBtn.addEventListener('click', function () { togglePresenterHUD('script'); });
  if (dockIndicatorBtn) dockIndicatorBtn.addEventListener('click', function () { togglePresenterHUD('script'); });
  if (btnHeaderIR) btnHeaderIR.addEventListener('click', function () { togglePresenterHUD('ir'); });
  if (dockIRBtn) {
    dockIRBtn.addEventListener('click', function (e) {
      e.preventDefault();
      window.open('ir-deck.html', '_blank');
    });
  }
  if (hudCloseBtn) hudCloseBtn.addEventListener('click', closePresenterHUD);
  if (hudBackdrop) hudBackdrop.addEventListener('click', closePresenterHUD);

  // Render Section Tabs inside HUD
  var hudSectionTabs = $('#hudSectionTabs');
  if (hudSectionTabs) {
    hudSectionTabs.innerHTML = PRESENTER_SCRIPTS.map(function (item, idx) {
      return '<button type="button" class="hud-section-tab ' + (idx === 0 ? 'is-active' : '') + '" data-section-idx="' + idx + '">' +
        item.num + ' ' + item.name +
      '</button>';
    }).join('');

    hudSectionTabs.addEventListener('click', function (e) {
      var tab = e.target.closest('.hud-section-tab');
      if (!tab) return;
      var idx = parseInt(tab.getAttribute('data-section-idx'), 10);
      goToSection(idx);
    });
  }

  function updatePresenterAssistantUI(idx) {
    var item = PRESENTER_SCRIPTS[idx];
    if (!item) return;

    // Update Dock Indicator
    var dockNum = $('#dockSectionNum');
    var dockTitle = $('#dockSectionTitle');
    if (dockNum) dockNum.textContent = item.num + ' / ' + String(PRESENTER_SCRIPTS.length).padStart(2, '0');
    if (dockTitle) dockTitle.textContent = item.name;

    // Update HUD Tabs
    $$('.hud-section-tab').forEach(function (tab, i) {
      var active = i === idx;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      if (active) {
        tab.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
      }
    });

    // Update HUD Card Content
    var cardNum = $('#hudCardNum');
    var cardTitle = $('#hudCardTitle');
    var keyPointsList = $('#hudKeyPoints');
    var scriptText = $('#hudScriptText');
    var qaContent = $('#hudQaContent');

    if (cardNum) cardNum.textContent = 'SECTION ' + item.num;
    if (cardTitle) cardTitle.textContent = item.name + ' — ' + item.label;
    if (keyPointsList) {
      keyPointsList.innerHTML = item.keyPoints.map(function (p) {
        return '<li>' + p + '</li>';
      }).join('');
    }
    if (scriptText) scriptText.textContent = item.script;
    if (qaContent) qaContent.innerHTML = item.qa;

    // Update On-Screen Teleprompter Bar
    var teleTag = $('#teleSectionTag');
    var teleText = $('#teleprompterText');
    if (teleTag) teleTag.textContent = item.num + ' ' + item.name + ' · 발표 대본 자막';
    if (teleText) teleText.textContent = item.script;
  }

  // Scroll sync observer for presenter notes
  if ('IntersectionObserver' in window) {
    var presenterScrollObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        for (var i = 0; i < PRESENTER_SCRIPTS.length; i++) {
          if (PRESENTER_SCRIPTS[i].id === id) {
            currentSectionIndex = i;
            updatePresenterAssistantUI(i);
            break;
          }
        }
      });
    }, { rootMargin: '-25% 0px -40% 0px', threshold: 0.1 });

    PRESENTER_SCRIPTS.forEach(function (s) {
      var el = document.getElementById(s.id);
      if (el) presenterScrollObserver.observe(el);
    });
  }

  // Initial render of HUD & Dock
  updatePresenterAssistantUI(0);

  // 5. Presenter Pitch Timer
  var timerInterval = null;
  var timerSeconds = 0;
  var timerTargetSeconds = 300; // default 5m preset
  var isTimerRunning = false;

  function formatTime(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function updateTimerUI() {
    var dockDisplay = $('#dockTimerDisplay');
    var hudDisplay = $('#hudTimerDigital');
    var dockBtn = $('#dockTimerToggle');
    var hudPlayBtn = $('#hudTimerPlayBtn');
    var progressBar = $('#hudTimerProgressBar');

    var text = formatTime(timerSeconds);
    if (dockDisplay) dockDisplay.textContent = text;
    if (hudDisplay) hudDisplay.textContent = text;

    if (dockBtn) {
      dockBtn.classList.toggle('is-running', isTimerRunning);
      dockBtn.classList.remove('is-warning', 'is-expired');
      if (timerTargetSeconds > 0) {
        var remain = timerTargetSeconds - timerSeconds;
        if (remain <= 0) {
          dockBtn.classList.add('is-expired');
        } else if (remain <= 60) {
          dockBtn.classList.add('is-warning');
        }
      }
    }

    if (hudPlayBtn) {
      hudPlayBtn.textContent = isTimerRunning ? '일시정지' : '타이머 시작';
      hudPlayBtn.className = isTimerRunning ? 'btn btn--small btn--ghost' : 'btn btn--small btn--primary';
    }

    if (progressBar) {
      var pct = timerTargetSeconds > 0 ? Math.min((timerSeconds / timerTargetSeconds) * 100, 100) : 100;
      progressBar.style.width = pct + '%';
    }
  }

  function toggleTimer() {
    if (isTimerRunning) {
      clearInterval(timerInterval);
      isTimerRunning = false;
    } else {
      isTimerRunning = true;
      timerInterval = setInterval(function () {
        timerSeconds++;
        updateTimerUI();
      }, 1000);
    }
    updateTimerUI();
  }

  function resetTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    timerSeconds = 0;
    updateTimerUI();
  }

  var dockTimerBtn = $('#dockTimerToggle');
  var hudTimerPlayBtn = $('#hudTimerPlayBtn');
  var hudTimerResetBtn = $('#hudTimerResetBtn');
  if (dockTimerBtn) dockTimerBtn.addEventListener('click', toggleTimer);
  if (hudTimerPlayBtn) hudTimerPlayBtn.addEventListener('click', toggleTimer);
  if (hudTimerResetBtn) hudTimerResetBtn.addEventListener('click', resetTimer);

  // Timer presets
  $$('.hud-preset-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      $$('.hud-preset-btn').forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      timerTargetSeconds = parseInt(btn.getAttribute('data-preset'), 10);
      resetTimer();
    });
  });

  // 6. Virtual Laser Pointer Mode
  var isLaserActive = false;
  var laserDot = $('#laserPointer');

  function toggleLaser(force) {
    isLaserActive = typeof force === 'boolean' ? force : !isLaserActive;
    document.body.classList.toggle('laser-active', isLaserActive);
    var dockLaserBtn = $('#dockLaserToggle');
    if (dockLaserBtn) dockLaserBtn.classList.toggle('is-active', isLaserActive);
  }

  var dockLaserBtn = $('#dockLaserToggle');
  if (dockLaserBtn) dockLaserBtn.addEventListener('click', function () { toggleLaser(); });

  window.addEventListener('mousemove', function (e) {
    if (!isLaserActive || !laserDot) return;
    laserDot.style.left = e.clientX + 'px';
    laserDot.style.top = e.clientY + 'px';
  });

  // 7. Dock Collapse/Expand
  var dockEl = $('#presenterDock');
  var dockCollapseBtn = $('#dockCollapseBtn');
  if (dockEl && dockCollapseBtn) {
    dockCollapseBtn.addEventListener('click', function () {
      dockEl.classList.toggle('is-collapsed');
    });
  }

  // 8. Copy Script text
  var copyScriptBtn = $('#hudCopyScriptBtn');
  if (copyScriptBtn) {
    copyScriptBtn.addEventListener('click', function () {
      var text = $('#hudScriptText') ? $('#hudScriptText').textContent : '';
      if (!text) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          copyScriptBtn.textContent = '복사 완료!';
          setTimeout(function () { copyScriptBtn.textContent = '대본 복사'; }, 1800);
        });
      } else {
        alert('대본이 선택되었습니다.');
      }
    });
  }

  // 9. Font size adjustments in HUD
  var hudFontDec = $('#hudFontDec');
  var hudFontInc = $('#hudFontInc');
  var fontLevel = 1; // 0: sm, 1: md, 2: lg
  function updateFontLevel() {
    if (!hudElement) return;
    hudElement.classList.remove('font-sm', 'font-lg');
    if (fontLevel === 0) hudElement.classList.add('font-sm');
    if (fontLevel === 2) hudElement.classList.add('font-lg');
  }
  if (hudFontDec) {
    hudFontDec.addEventListener('click', function () {
      fontLevel = Math.max(0, fontLevel - 1);
      updateFontLevel();
    });
  }
  if (hudFontInc) {
    hudFontInc.addEventListener('click', function () {
      fontLevel = Math.min(2, fontLevel + 1);
      updateFontLevel();
    });
  }

  // 10. On-Screen Teleprompter Bar Logic
  var teleprompterBar = $('#teleprompterBar');
  var dockTeleBtn = $('#dockTeleprompterToggle');
  var headerTeleBtn = $('#btnHeaderTeleprompter');
  var hudLaunchTeleBtn = $('#hudLaunchTeleBtn');
  var teleCloseBtn = $('#teleCloseBtn');
  var teleFontToggle = $('#teleFontToggle');
  var isTeleprompterActive = false;

  function isTeleActive() {
    return teleprompterBar && teleprompterBar.classList.contains('is-active');
  }

  function toggleTeleprompter(force) {
    if (!teleprompterBar) return;
    isTeleprompterActive = typeof force === 'boolean' ? force : !isTeleActive();
    teleprompterBar.classList.toggle('is-active', isTeleprompterActive);
    teleprompterBar.setAttribute('aria-hidden', String(!isTeleprompterActive));
    if (dockTeleBtn) dockTeleBtn.classList.toggle('is-active', isTeleprompterActive);
    if (headerTeleBtn) headerTeleBtn.classList.toggle('is-active', isTeleprompterActive);
  }

  if (dockTeleBtn) dockTeleBtn.addEventListener('click', function () { toggleTeleprompter(); });
  if (headerTeleBtn) headerTeleBtn.addEventListener('click', function () { toggleTeleprompter(); });
  if (hudLaunchTeleBtn) {
    hudLaunchTeleBtn.addEventListener('click', function () {
      toggleTeleprompter(true);
      closePresenterHUD();
    });
  }
  if (teleCloseBtn) teleCloseBtn.addEventListener('click', function () { toggleTeleprompter(false); });
  if (teleFontToggle) {
    teleFontToggle.addEventListener('click', function () {
      if (!teleprompterBar) return;
      var isLarge = teleprompterBar.classList.toggle('is-large');
      teleFontToggle.textContent = isLarge ? '글자 보통' : '글자 크게';
    });
  }

  // 11. Global Keyboard Shortcuts
  document.addEventListener('keydown', function (e) {
    // If typing in input or textarea, don't trigger presenter shortcuts
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    var key = e.key.toLowerCase();
    if (key === 'f') {
      e.preventDefault();
      toggleFullscreen();
    } else if (key === 'n') {
      e.preventDefault();
      togglePresenterHUD('script');
    } else if (key === 'i') {
      e.preventDefault();
      window.open('ir-deck.html', '_blank');
    } else if (key === 's') {
      e.preventDefault();
      toggleTeleprompter();
    } else if (key === 't') {
      e.preventDefault();
      toggleTimer();
    } else if (key === 'r') {
      e.preventDefault();
      resetTimer();
    } else if (key === 'l') {
      e.preventDefault();
      toggleLaser();
    } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      e.preventDefault();
      nextSection();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      prevSection();
    } else if (e.key === 'Escape') {
      if (isPresenterHUDOpen()) {
        closePresenterHUD();
      } else if (isTeleActive()) {
        toggleTeleprompter(false);
      } else if (isLaserActive) {
        toggleLaser(false);
      }
    }
  });

})();

