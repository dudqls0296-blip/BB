/**
 * Presentation Website Logic & Slide Deck Controller (app.js)
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // 2. State Management
    let currentSlide = 0;
    let slidesCount = 0;
    let isPresenterMode = false;
    let timerInterval = null;
    let timerSeconds = 0;
    let isTimerRunning = false;

    // Check Local Storage for overridden items (if user added items via UI)
    let presentationData = window.PRESENTATION_DATA;
    try {
        const savedCustomData = localStorage.getItem('custom_presentation_data');
        if (savedCustomData) {
            presentationData = JSON.parse(savedCustomData);
        }
    } catch (e) {
        console.warn("Using default PRESENTATION_DATA", e);
    }

    // 3. Render Content
    renderLandingView(presentationData);
    renderSlidesView(presentationData);
    initMarketChart(presentationData);
    setupEventListeners(presentationData);

    // Re-run Lucide after dynamic rendering
    setTimeout(() => {
        if (window.lucide) window.lucide.createIcons();
    }, 50);

    /**
     * Render the Scroll/Landing Page View
     */
    function renderLandingView(data) {
        // Meta / Hero
        document.getElementById('hero-badge').textContent = data.meta.badge;
        document.getElementById('hero-title').textContent = data.meta.title;
        document.getElementById('hero-subtitle').textContent = data.meta.subtitle;
        document.getElementById('hero-presenter-name').textContent = data.meta.presenter.name;
        document.getElementById('hero-presenter-role').textContent = `${data.meta.presenter.role} · ${data.meta.presenter.affiliation}`;
        document.getElementById('hero-pitch-duration').textContent = `발표 기준: 약 ${data.meta.pitchDurationMinutes}분 세션`;

        // Problems
        const problemContainer = document.getElementById('problems-container');
        problemContainer.innerHTML = data.problems.map((p, idx) => `
            <div class="glass-card rounded-2xl p-7 relative overflow-hidden group">
                <div class="absolute -right-4 -bottom-4 text-7xl font-black text-white/5 pointer-events-none select-none">
                    0${idx + 1}
                </div>
                <div class="flex items-center justify-between mb-4">
                    <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        ${p.tag}
                    </span>
                    <i data-lucide="${p.icon || 'alert-circle'}" class="w-6 h-6 text-rose-400"></i>
                </div>
                <h3 class="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">${p.title}</h3>
                <p class="text-sm text-slate-300 leading-relaxed mb-5">${p.desc}</p>
                <div class="pt-4 border-t border-white/5 flex items-baseline gap-2">
                    <span class="text-3xl font-black text-rose-400 tracking-tight">${p.stat}</span>
                    <span class="text-xs text-slate-400">${p.statLabel}</span>
                </div>
            </div>
        `).join('');

        // Solution
        document.getElementById('solution-headline').textContent = data.solution.headline;
        document.getElementById('solution-subheadline').textContent = data.solution.subheadline;
        const solutionContainer = document.getElementById('solution-points-container');
        solutionContainer.innerHTML = data.solution.points.map(pt => `
            <div class="glass-card rounded-2xl p-6 flex items-start gap-4">
                <div class="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400">
                    <i data-lucide="${pt.icon || 'check-circle'}" class="w-6 h-6"></i>
                </div>
                <div>
                    <h4 class="text-lg font-bold text-white mb-1">${pt.title}</h4>
                    <p class="text-sm text-slate-300 leading-relaxed">${pt.desc}</p>
                </div>
            </div>
        `).join('');

        // Items Showcase (Main Grid)
        renderItemCards(data.items);

        // Business Model
        const bmContainer = document.getElementById('revenue-model-container');
        bmContainer.innerHTML = data.business.revenueModel.map(bm => `
            <div class="glass-card rounded-xl p-5 border-l-4 border-l-indigo-500">
                <div class="flex items-center gap-3 mb-2">
                    <i data-lucide="${bm.icon || 'dollar-sign'}" class="w-5 h-5 text-indigo-400"></i>
                    <h4 class="text-base font-bold text-white">${bm.title}</h4>
                </div>
                <p class="text-xs text-slate-300 leading-relaxed">${bm.desc}</p>
            </div>
        `).join('');

        // Roadmap
        const roadmapContainer = document.getElementById('roadmap-container');
        roadmapContainer.innerHTML = data.business.roadmap.map(rm => {
            const isCompleted = rm.status === 'completed';
            const isCurrent = rm.status === 'current';
            const badgeColor = isCurrent ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : (isCompleted ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400');
            const dotColor = isCurrent ? 'bg-indigo-400 ring-4 ring-indigo-500/30' : (isCompleted ? 'bg-emerald-400' : 'bg-slate-600');

            return `
                <div class="relative pl-8 pb-8 border-l border-white/10 last:pb-0">
                    <div class="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full ${dotColor}"></div>
                    <div class="flex items-center gap-2 mb-1.5">
                        <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full ${badgeColor}">${rm.phase}</span>
                        <span class="text-xs text-slate-400 font-mono">${rm.date}</span>
                    </div>
                    <h4 class="text-base font-bold text-white mb-1">${rm.title}</h4>
                    <p class="text-xs text-slate-300 leading-relaxed">${rm.desc}</p>
                </div>
            `;
        }).join('');

        // Team
        const teamContainer = document.getElementById('team-container');
        teamContainer.innerHTML = data.team.map(member => `
            <div class="glass-card rounded-2xl p-6 text-center group">
                <div class="w-16 h-16 rounded-full mx-auto mb-4 bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                    <i data-lucide="${member.icon || 'user'}" class="w-8 h-8"></i>
                </div>
                <h4 class="text-lg font-bold text-white mb-0.5">${member.name}</h4>
                <p class="text-xs text-indigo-400 font-medium mb-3">${member.role}</p>
                <p class="text-xs text-slate-400">${member.exp}</p>
            </div>
        `).join('');

        // Closing
        document.getElementById('closing-title').textContent = data.closing.title;
        document.getElementById('closing-subtitle').textContent = data.closing.subtitle;
        document.getElementById('closing-email').textContent = data.closing.contactEmail;
        document.getElementById('closing-phone').textContent = data.closing.contactPhone;
    }

    /**
     * Render Item Cards Grid
     */
    function renderItemCards(items) {
        const container = document.getElementById('items-container');
        const countBadge = document.getElementById('items-count-badge');
        if (countBadge) countBadge.textContent = `${items.length}개 아이템 등록됨`;

        container.innerHTML = items.map((item, idx) => `
            <div class="glass-card rounded-2xl p-7 flex flex-col justify-between group hover:border-indigo-400/50 transition-all cursor-pointer" onclick="window.openItemModal('${item.id}')">
                <div>
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            ${item.badge || item.category}
                        </span>
                        <div class="w-10 h-10 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <i data-lucide="${item.icon || 'box'}" class="w-5 h-5"></i>
                        </div>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-2 group-hover:text-indigo-200 transition-colors">${item.name}</h3>
                    <p class="text-sm font-medium text-indigo-300 mb-3">${item.oneLiner}</p>
                    <p class="text-xs text-slate-300 leading-relaxed mb-6 line-clamp-3">${item.description}</p>
                    
                    <div class="space-y-2 mb-6">
                        ${(item.highlights || []).map(hl => `
                            <div class="flex items-center gap-2 text-xs text-slate-300">
                                <i data-lucide="check" class="w-4 h-4 text-emerald-400 shrink-0"></i>
                                <span>${hl}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div>
                        <span class="text-[11px] text-slate-400 block">${item.metrics ? item.metrics.label : '핵심 가치'}</span>
                        <span class="text-lg font-bold text-white text-gradient">${item.metrics ? item.metrics.value : '우수성 검증'}</span>
                    </div>
                    <button class="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-indigo-600/30 text-xs font-semibold text-indigo-300 hover:text-white border border-white/10 hover:border-indigo-400/40 transition-all flex items-center gap-1.5">
                        상세 보기 <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                    </button>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    /**
     * Render the Presentation Slides View (Full-screen Slide Deck)
     */
    function renderSlidesView(data) {
        const slidesContainer = document.getElementById('slide-pages-container');
        slidesContainer.innerHTML = '';

        const slideList = [];

        // Slide 1: Cover
        slideList.push({
            type: 'cover',
            title: data.meta.title,
            subtitle: data.meta.subtitle,
            badge: data.meta.badge,
            presenter: data.meta.presenter,
            note: "도입부: 당당하게 인사하고 발표의 핵심 목표와 해결하려는 비전을 제시합니다."
        });

        // Slide 2: Problem
        slideList.push({
            type: 'problem',
            title: "우리가 주목한 시장의 고통 (Problem)",
            subtitle: "기존 생태계가 겪고 있는 명확한 문제점과 비효율",
            problems: data.problems,
            note: "배경 문제점: 청중이 공감할 수 있도록 데이터와 실제 체감되는 통계를 짚어줍니다."
        });

        // Slide 3: Solution
        slideList.push({
            type: 'solution',
            title: "우리의 해답 (Solution & Value)",
            subtitle: data.solution.subheadline,
            headline: data.solution.headline,
            points: data.solution.points,
            note: "해결책: 기존의 한계를 어떻게 직관적으로 해결하는지 핵심 3가지를 명쾌하게 설명합니다."
        });

        // Slides for Each Item!
        data.items.forEach((item, idx) => {
            slideList.push({
                type: 'item',
                index: idx + 1,
                item: item,
                title: `아이템 #${idx + 1} : ${item.name}`,
                subtitle: item.oneLiner,
                note: item.speakerNote || `아이템 #${idx + 1}의 독창성과 실제 적용 시 혜택을 강조하세요.`
            });
        });

        // Slide: Market & Traction
        slideList.push({
            type: 'market',
            title: "시장 기회 및 성장 잠재력 (Market)",
            subtitle: data.market.subheadline,
            stats: data.market.stats,
            note: "시장성: TAM, SAM, SOM 수치와 가파른 성장세를 제시하여 사업의 매력도를 입증합니다."
        });

        // Slide: Business Model & Roadmap
        slideList.push({
            type: 'business',
            title: "수익 모델 및 추진 로드맵 (Execution)",
            subtitle: "견고한 수익 구조와 단계별 실행 마일스톤",
            revenue: data.business.revenueModel,
            roadmap: data.business.roadmap,
            note: "실행력: 구체적인 수익 창출 방법과 현재 단계 및 향후 분기별 목표를 공유합니다."
        });

        // Slide: Team & Closing
        slideList.push({
            type: 'closing',
            title: data.closing.title,
            subtitle: data.closing.subtitle,
            team: data.team,
            closing: data.closing,
            presenter: data.meta.presenter,
            note: "마무리: 팀 역량에 대한 확신을 심어주고, Q&A 및 파트너십 협의를 자연스럽게 유도합니다."
        });

        slidesCount = slideList.length;

        // Generate HTML for each slide
        slidesContainer.innerHTML = slideList.map((slide, idx) => {
            let innerHTML = '';

            if (slide.type === 'cover') {
                innerHTML = `
                    <div class="max-w-4xl text-center space-y-6">
                        <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-sm font-semibold tracking-wide badge-glow">
                            <i data-lucide="sparkles" class="w-4 h-4"></i> ${slide.badge}
                        </span>
                        <h1 class="text-5xl md:text-7xl font-black text-white tracking-tight leading-tight">
                            ${slide.title}
                        </h1>
                        <p class="text-xl md:text-2xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
                            ${slide.subtitle}
                        </p>
                        <div class="pt-10 flex flex-wrap justify-center items-center gap-6 text-sm text-slate-400">
                            <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/60 border border-white/10">
                                <i data-lucide="user" class="w-4 h-4 text-indigo-400"></i>
                                <span class="text-white font-medium">${slide.presenter.name}</span> (${slide.presenter.role})
                            </div>
                            <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/60 border border-white/10">
                                <i data-lucide="building" class="w-4 h-4 text-indigo-400"></i>
                                <span>${slide.presenter.affiliation}</span>
                            </div>
                            <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/60 border border-white/10">
                                <i data-lucide="calendar" class="w-4 h-4 text-indigo-400"></i>
                                <span>${slide.presenter.date}</span>
                            </div>
                        </div>
                    </div>
                `;
            } else if (slide.type === 'problem') {
                innerHTML = `
                    <div class="max-w-5xl w-full">
                        <div class="mb-10 text-center">
                            <span class="text-xs font-bold text-rose-400 uppercase tracking-widest">Pain Points</span>
                            <h2 class="text-4xl font-extrabold text-white mt-1 mb-2">${slide.title}</h2>
                            <p class="text-slate-400 text-base">${slide.subtitle}</p>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            ${slide.problems.map((p, pidx) => `
                                <div class="glass-card rounded-2xl p-7 flex flex-col justify-between border-t-2 border-t-rose-500">
                                    <div>
                                        <div class="flex justify-between items-center mb-4">
                                            <span class="text-xs font-semibold px-2.5 py-1 rounded bg-rose-500/20 text-rose-300">0${pidx + 1}</span>
                                            <i data-lucide="${p.icon || 'alert-circle'}" class="w-6 h-6 text-rose-400"></i>
                                        </div>
                                        <h3 class="text-xl font-bold text-white mb-3">${p.title}</h3>
                                        <p class="text-sm text-slate-300 leading-relaxed">${p.desc}</p>
                                    </div>
                                    <div class="mt-8 pt-4 border-t border-white/5">
                                        <div class="text-4xl font-black text-rose-400">${p.stat}</div>
                                        <div class="text-xs text-slate-400 mt-1">${p.statLabel}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            } else if (slide.type === 'solution') {
                innerHTML = `
                    <div class="max-w-5xl w-full">
                        <div class="mb-10 text-center">
                            <span class="text-xs font-bold text-indigo-400 uppercase tracking-widest">Core Value</span>
                            <h2 class="text-4xl font-extrabold text-white mt-1 mb-2">${slide.title}</h2>
                            <p class="text-slate-400 text-base">${slide.subtitle}</p>
                        </div>
                        <div class="glass-card rounded-3xl p-8 mb-6 border-indigo-500/30 text-center">
                            <h3 class="text-2xl md:text-3xl font-black text-white text-gradient mb-2">${slide.headline}</h3>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            ${slide.points.map(pt => `
                                <div class="glass-card rounded-2xl p-6">
                                    <div class="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
                                        <i data-lucide="${pt.icon || 'zap'}" class="w-6 h-6"></i>
                                    </div>
                                    <h4 class="text-lg font-bold text-white mb-2">${pt.title}</h4>
                                    <p class="text-sm text-slate-300 leading-relaxed">${pt.desc}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            } else if (slide.type === 'item') {
                const item = slide.item;
                innerHTML = `
                    <div class="max-w-5xl w-full">
                        <div class="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                            <div>
                                <div class="flex items-center gap-3">
                                    <span class="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500 text-white shadow-lg shadow-indigo-500/30">
                                        아이템 0${slide.index}
                                    </span>
                                    <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-indigo-300 border border-indigo-500/20">
                                        ${item.category}
                                    </span>
                                </div>
                                <h2 class="text-3xl md:text-4xl font-black text-white mt-2">${item.name}</h2>
                                <p class="text-lg text-indigo-300 font-medium">${item.oneLiner}</p>
                            </div>
                            <div class="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                                <i data-lucide="${item.icon || 'box'}" class="w-8 h-8"></i>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div class="md:col-span-2 glass-card rounded-2xl p-7 space-y-5">
                                <div>
                                    <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">제품 개요 & 문제 해결</h4>
                                    <p class="text-base text-slate-200 leading-relaxed">${item.description}</p>
                                </div>
                                <div>
                                    <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">핵심 특장점 (Key Highlights)</h4>
                                    <div class="space-y-2.5">
                                        ${(item.highlights || []).map(hl => `
                                            <div class="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-white/5">
                                                <i data-lucide="check-circle-2" class="w-5 h-5 text-emerald-400 shrink-0 mt-0.5"></i>
                                                <span class="text-sm text-slate-200 font-medium">${hl}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>

                            <div class="space-y-6">
                                <div class="glass-card rounded-2xl p-6 border-indigo-500/30">
                                    <span class="text-xs text-indigo-300 font-medium block mb-1">${item.metrics ? item.metrics.label : '성과 지표'}</span>
                                    <div class="text-4xl font-black text-white text-gradient">${item.metrics ? item.metrics.value : '최고 수준'}</div>
                                    <p class="text-xs text-slate-400 mt-2">도입 즉시 기대되는 정량적 개선 효과</p>
                                </div>

                                <div class="glass-card rounded-2xl p-6">
                                    <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">적용 타겟 & 분야</h4>
                                    <div class="flex flex-wrap gap-2">
                                        <span class="px-2.5 py-1 rounded bg-slate-800 text-xs text-slate-300">엔터프라이즈</span>
                                        <span class="px-2.5 py-1 rounded bg-slate-800 text-xs text-slate-300">스타트업</span>
                                        <span class="px-2.5 py-1 rounded bg-slate-800 text-xs text-slate-300">공공/기관</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } else if (slide.type === 'market') {
                innerHTML = `
                    <div class="max-w-5xl w-full">
                        <div class="mb-8 text-center">
                            <span class="text-xs font-bold text-indigo-400 uppercase tracking-widest">Market Size</span>
                            <h2 class="text-4xl font-extrabold text-white mt-1 mb-2">${slide.title}</h2>
                            <p class="text-slate-400 text-base">${slide.subtitle}</p>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            ${slide.stats.map(s => `
                                <div class="glass-card rounded-2xl p-6 text-center">
                                    <span class="text-xs text-slate-400 font-semibold">${s.label}</span>
                                    <div class="text-3xl font-black text-white text-gradient my-2">${s.value}</div>
                                    <span class="text-xs font-medium px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                        ${s.change}
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="glass-card rounded-2xl p-6">
                            <div class="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                <i data-lucide="trending-up" class="w-4 h-4 text-indigo-400"></i>
                                시장 연평균 성장 추이 (단위: 조 원)
                            </div>
                            <div class="h-44 w-full">
                                <canvas id="slide-market-chart"></canvas>
                            </div>
                        </div>
                    </div>
                `;
            } else if (slide.type === 'business') {
                innerHTML = `
                    <div class="max-w-5xl w-full">
                        <div class="mb-8 text-center">
                            <span class="text-xs font-bold text-indigo-400 uppercase tracking-widest">Strategy</span>
                            <h2 class="text-4xl font-extrabold text-white mt-1 mb-2">${slide.title}</h2>
                            <p class="text-slate-400 text-base">${slide.subtitle}</p>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 class="text-base font-bold text-indigo-300 mb-4 flex items-center gap-2">
                                    <i data-lucide="dollar-sign" class="w-5 h-5"></i> 수익 창출 모델 (BM)
                                </h3>
                                <div class="space-y-3">
                                    ${slide.revenue.map(r => `
                                        <div class="glass-card rounded-xl p-4">
                                            <h4 class="text-sm font-bold text-white mb-1">${r.title}</h4>
                                            <p class="text-xs text-slate-300">${r.desc}</p>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            <div>
                                <h3 class="text-base font-bold text-indigo-300 mb-4 flex items-center gap-2">
                                    <i data-lucide="calendar" class="w-5 h-5"></i> 단계별 로드맵 (Milestones)
                                </h3>
                                <div class="space-y-3">
                                    ${slide.roadmap.map(rm => `
                                        <div class="glass-card rounded-xl p-4 flex items-start gap-3">
                                            <span class="text-xs font-bold px-2 py-0.5 rounded ${rm.status === 'current' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'} shrink-0">
                                                ${rm.phase}
                                            </span>
                                            <div>
                                                <div class="text-xs font-bold text-white">${rm.title} (${rm.date})</div>
                                                <div class="text-[11px] text-slate-400">${rm.desc}</div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } else if (slide.type === 'closing') {
                innerHTML = `
                    <div class="max-w-4xl text-center space-y-8">
                        <div>
                            <span class="text-xs font-bold text-indigo-400 uppercase tracking-widest">Thank you</span>
                            <h2 class="text-4xl md:text-5xl font-black text-white mt-2 mb-3">${slide.title}</h2>
                            <p class="text-xl text-slate-300">${slide.subtitle}</p>
                        </div>
                        <div class="flex justify-center gap-6">
                            ${slide.team.map(m => `
                                <div class="glass-card rounded-2xl p-5 w-48 text-center">
                                    <div class="w-12 h-12 rounded-full mx-auto mb-2 bg-indigo-600/50 flex items-center justify-center text-white font-bold">
                                        <i data-lucide="${m.icon || 'user'}" class="w-6 h-6"></i>
                                    </div>
                                    <div class="text-sm font-bold text-white">${m.name}</div>
                                    <div class="text-xs text-indigo-300">${m.role}</div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="pt-6 border-t border-white/10 flex justify-center items-center gap-8 text-sm text-slate-300">
                            <div>📧 ${slide.closing.contactEmail}</div>
                            <div>📞 ${slide.closing.contactPhone}</div>
                        </div>
                        <div class="pt-4">
                            <span class="inline-block px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 text-white font-bold text-base shadow-xl shadow-indigo-500/30">
                                Q & A 질의응답
                            </span>
                        </div>
                    </div>
                `;
            }

            return `
                <div class="slide-page ${idx === 0 ? 'active-slide' : ''}" data-slide-index="${idx}" data-speaker-note="${slide.note || ''}">
                    ${innerHTML}
                </div>
            `;
        }).join('');

        updateSlideUI();
    }

    /**
     * Slide Controls
     */
    function goToSlide(index) {
        if (index < 0 || index >= slidesCount) return;
        currentSlide = index;

        const slides = document.querySelectorAll('.slide-page');
        slides.forEach((s, idx) => {
            if (idx === currentSlide) {
                s.classList.add('active-slide');
            } else {
                s.classList.remove('active-slide');
            }
        });

        updateSlideUI();

        // If market chart slide is active, make sure chart renders
        if (currentSlide === 4) {
            initSlideMarketChart(presentationData);
        }
    }

    function nextSlide() {
        if (currentSlide < slidesCount - 1) {
            goToSlide(currentSlide + 1);
        }
    }

    function prevSlide() {
        if (currentSlide > 0) {
            goToSlide(currentSlide - 1);
        }
    }

    function updateSlideUI() {
        const indicator = document.getElementById('slide-indicator');
        const progressBar = document.getElementById('slide-progress-bar');
        const notesContent = document.getElementById('speaker-note-text');

        if (indicator) {
            indicator.textContent = `${String(currentSlide + 1).padStart(2, '0')} / ${String(slidesCount).padStart(2, '0')}`;
        }
        if (progressBar && slidesCount > 0) {
            const pct = ((currentSlide + 1) / slidesCount) * 100;
            progressBar.style.width = `${pct}%`;
        }

        const activeSlideEl = document.querySelector(`.slide-page[data-slide-index="${currentSlide}"]`);
        if (activeSlideEl && notesContent) {
            notesContent.textContent = activeSlideEl.getAttribute('data-speaker-note') || '등록된 발표자 메모가 없습니다.';
        }
    }

    /**
     * Switch Mode (Presentation vs Landing View)
     */
    function setPresentationMode(enable) {
        isPresenterMode = enable;
        if (enable) {
            document.body.classList.add('mode-slides');
            document.getElementById('toggle-mode-btn-text').textContent = '웹 스크롤 모드로 나가기';
            goToSlide(currentSlide);
            // Request fullscreen if supported and requested
            try {
                if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
                    // document.documentElement.requestFullscreen().catch(() => {});
                }
            } catch (e) {}
        } else {
            document.body.classList.remove('mode-slides');
            document.getElementById('toggle-mode-btn-text').textContent = '📺 슬라이드 발표 모드 시작';
            try {
                if (document.fullscreenElement && document.exitFullscreen) {
                    document.exitFullscreen().catch(() => {});
                }
            } catch (e) {}
        }
    }

    /**
     * Presentation Timer
     */
    function toggleTimer() {
        const timerBtn = document.getElementById('timer-toggle-btn');
        const timerDisplay = document.getElementById('timer-display');

        if (isTimerRunning) {
            clearInterval(timerInterval);
            isTimerRunning = false;
            if (timerBtn) timerBtn.textContent = '재개';
        } else {
            isTimerRunning = true;
            if (timerBtn) timerBtn.textContent = '일시정지';
            timerInterval = setInterval(() => {
                timerSeconds++;
                const mins = Math.floor(timerSeconds / 60);
                const secs = timerSeconds % 60;
                if (timerDisplay) {
                    timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                }
            }, 1000);
        }
    }

    function resetTimer() {
        clearInterval(timerInterval);
        isTimerRunning = false;
        timerSeconds = 0;
        const timerDisplay = document.getElementById('timer-display');
        const timerBtn = document.getElementById('timer-toggle-btn');
        if (timerDisplay) timerDisplay.textContent = '00:00';
        if (timerBtn) timerBtn.textContent = '시작';
    }

    /**
     * Market Chart (Landing View)
     */
    let landingChartInstance = null;
    function initMarketChart(data) {
        const ctx = document.getElementById('market-chart');
        if (!ctx || !window.Chart) return;

        if (landingChartInstance) landingChartInstance.destroy();

        landingChartInstance = new window.Chart(ctx, {
            type: 'line',
            data: {
                labels: data.market.chartData.years,
                datasets: [{
                    label: '시장 규모 (조 원)',
                    data: data.market.chartData.marketSizes,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    fill: true,
                    tension: 0.35,
                    borderWidth: 3,
                    pointBackgroundColor: '#38bdf8',
                    pointBorderColor: '#fff',
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        titleColor: '#fff',
                        bodyColor: '#a5b4fc',
                        padding: 10,
                        borderColor: '#6366f1',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#94a3b8' }
                    },
                    y: {
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    }

    /**
     * Market Chart (Slide View)
     */
    let slideChartInstance = null;
    function initSlideMarketChart(data) {
        const ctx = document.getElementById('slide-market-chart');
        if (!ctx || !window.Chart) return;

        if (slideChartInstance) slideChartInstance.destroy();

        slideChartInstance = new window.Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.market.chartData.years,
                datasets: [{
                    label: '시장 규모 (조 원)',
                    data: data.market.chartData.marketSizes,
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.5)',
                        'rgba(99, 102, 241, 0.65)',
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(56, 189, 248, 0.85)',
                        'rgba(56, 189, 248, 1)'
                    ],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8' }
                    },
                    y: {
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    }

    /**
     * Event Listeners & Keyboard Shortcuts
     */
    function setupEventListeners(data) {
        // Mode toggle button in header
        const toggleBtn = document.getElementById('toggle-mode-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                setPresentationMode(!isPresenterMode);
            });
        }

        // Hero CTA to start presentation
        const heroStartSlideBtn = document.getElementById('hero-start-slide-btn');
        if (heroStartSlideBtn) {
            heroStartSlideBtn.addEventListener('click', () => {
                setPresentationMode(true);
            });
        }

        // Slide navigation buttons
        const prevBtn = document.getElementById('slide-prev-btn');
        const nextBtn = document.getElementById('slide-next-btn');
        const exitSlideBtn = document.getElementById('exit-slide-btn');

        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        if (exitSlideBtn) exitSlideBtn.addEventListener('click', () => setPresentationMode(false));

        // Speaker note toggle button
        const toggleNotesBtn = document.getElementById('toggle-notes-btn');
        const speakerNotesDrawer = document.getElementById('speaker-notes-drawer');
        if (toggleNotesBtn && speakerNotesDrawer) {
            toggleNotesBtn.addEventListener('click', () => {
                speakerNotesDrawer.classList.toggle('hidden');
            });
        }

        // Timer buttons
        const timerToggleBtn = document.getElementById('timer-toggle-btn');
        const timerResetBtn = document.getElementById('timer-reset-btn');
        if (timerToggleBtn) timerToggleBtn.addEventListener('click', toggleTimer);
        if (timerResetBtn) timerResetBtn.addEventListener('click', resetTimer);

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            // If typing in an input or modal, do not intercept keys
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (isPresenterMode) {
                if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
                    e.preventDefault();
                    nextSlide();
                } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
                    e.preventDefault();
                    prevSlide();
                } else if (e.key === 'Escape') {
                    setPresentationMode(false);
                } else if (e.key.toLowerCase() === 'n') {
                    if (speakerNotesDrawer) speakerNotesDrawer.classList.toggle('hidden');
                } else if (e.key.toLowerCase() === 't') {
                    toggleTimer();
                }
            } else {
                if (e.key.toLowerCase() === 'f') {
                    setPresentationMode(true);
                }
            }
        });

        // Quick Item Modal Handlers
        window.openItemModal = function (itemId) {
            const item = data.items.find(i => i.id === itemId);
            if (!item) return;

            const modal = document.getElementById('item-detail-modal');
            const content = document.getElementById('item-modal-content');
            if (!modal || !content) return;

            content.innerHTML = `
                <div class="flex items-start justify-between mb-4">
                    <div>
                        <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            ${item.badge || item.category}
                        </span>
                        <h3 class="text-2xl font-bold text-white mt-2">${item.name}</h3>
                        <p class="text-sm text-indigo-300">${item.oneLiner}</p>
                    </div>
                    <div class="w-12 h-12 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-indigo-400 shrink-0">
                        <i data-lucide="${item.icon || 'box'}" class="w-6 h-6"></i>
                    </div>
                </div>
                <div class="p-4 rounded-xl bg-slate-900/60 border border-white/5 mb-5 text-sm text-slate-200 leading-relaxed">
                    ${item.description}
                </div>
                <div class="space-y-2 mb-6">
                    <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">주요 기능 및 강점</div>
                    ${(item.highlights || []).map(hl => `
                        <div class="flex items-center gap-2 text-xs text-slate-300">
                            <i data-lucide="check-circle" class="w-4 h-4 text-emerald-400"></i>
                            <span>${hl}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-between">
                    <span class="text-xs text-indigo-200 font-medium">${item.metrics ? item.metrics.label : '성과 목표'}</span>
                    <span class="text-lg font-bold text-indigo-400">${item.metrics ? item.metrics.value : '우수성 검증'}</span>
                </div>
            `;
            modal.classList.remove('hidden');
            if (window.lucide) window.lucide.createIcons();
        };

        window.closeItemModal = function () {
            const modal = document.getElementById('item-detail-modal');
            if (modal) modal.classList.add('hidden');
        };

        // Quick Item Adder/Editor Modal
        window.openItemEditorModal = function () {
            const modal = document.getElementById('item-editor-modal');
            if (modal) modal.classList.remove('hidden');
        };

        window.closeItemEditorModal = function () {
            const modal = document.getElementById('item-editor-modal');
            if (modal) modal.classList.add('hidden');
        };

        window.saveQuickItem = function () {
            const name = document.getElementById('edit-item-name').value.trim();
            const oneLiner = document.getElementById('edit-item-oneliner').value.trim();
            const desc = document.getElementById('edit-item-desc').value.trim();
            const category = document.getElementById('edit-item-category').value.trim() || '신규 아이템';
            const hl1 = document.getElementById('edit-item-hl1').value.trim();
            const hl2 = document.getElementById('edit-item-hl2').value.trim();
            const metricVal = document.getElementById('edit-item-metric').value.trim() || '검증 완료';

            if (!name) {
                alert('아이템 이름을 입력해주세요.');
                return;
            }

            const newItem = {
                id: `item-${Date.now()}`,
                category: category,
                badge: "New Item",
                name: name,
                oneLiner: oneLiner || "즉시 제공되는 차세대 혁신 솔루션",
                description: desc || "사용자가 추가한 핵심 아이템 상세 내용입니다.",
                icon: "sparkles",
                highlights: [
                    hl1 || "특징 1: 직관적인 사용자 경험 및 고효율 성능",
                    hl2 || "특징 2: 실시간 데이터 처리 및 커스텀 지원"
                ],
                metrics: { label: "기대 효과", value: metricVal },
                speakerNote: `${name}에 대한 발표를 진행합니다. 핵심 가치와 고객 편의성을 강조하세요.`
            };

            data.items.push(newItem);
            localStorage.setItem('custom_presentation_data', JSON.stringify(data));

            renderLandingView(data);
            renderSlidesView(data);
            window.closeItemEditorModal();
            alert(`"${name}" 아이템이 추가되었습니다! 즉시 슬라이드 및 웹사이트에 반영되었습니다.`);
        };
    }
});
